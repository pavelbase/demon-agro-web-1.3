/**
 * MIGRACE OBRÁZKŮ DO SUPABASE STORAGE
 * ====================================
 * 
 * Tento skript migruje existující obrázky z /public/images/ do Supabase Storage
 * Použití:
 * 1. Ujistěte se, že máte bucket 'public-images' vytvořený v Supabase
 * 2. Nastavte .env.local s SUPABASE_URL a SUPABASE_ANON_KEY
 * 3. Spusťte: npx tsx scripts/migrate-images-to-supabase.ts
 * 
 * Co skript dělá:
 * - Najde všechny obrázky v /public/images/ a /public/images/products/
 * - Nahraje je do Supabase Storage bucket 'public-images'
 * - Vytvoří mapování starých URL → nových URL
 * - Uloží mapování do souboru pro případnou aktualizaci localStorage
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ============================================================================
// KONFIGURACE
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = 'public-images';

// Složky k migraci
const FOLDERS_TO_MIGRATE = [
  'public/images',
  'public/images/products',
  'public/images/uploads',
];

// Povolené přípony
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function migrateImages() {
  // Kontrola env variables
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Chyba: NEXT_PUBLIC_SUPABASE_URL nebo NEXT_PUBLIC_SUPABASE_ANON_KEY nejsou nastaveny');
    console.error('   Zkontrolujte .env.local');
    process.exit(1);
  }

  console.log('🚀 Spouštím migraci obrázků do Supabase Storage...\n');
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}\n`);

  // Inicializace Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Kontrola, zda bucket existuje
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Chyba při kontrole bucketů:', bucketsError.message);
    process.exit(1);
  }

  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.error(`❌ Bucket '${BUCKET_NAME}' neexistuje!`);
    console.error('   Vytvořte bucket pomocí SQL skriptu: lib/supabase/sql/create_public_images_bucket.sql');
    console.error('   Nebo ručně v Supabase Dashboard → Storage');
    process.exit(1);
  }

  console.log(`✅ Bucket '${BUCKET_NAME}' nalezen\n`);

  // Statistiky
  let totalFiles = 0;
  let uploadedFiles = 0;
  let skippedFiles = 0;
  let errorFiles = 0;

  // Mapování URL (pro update localStorage)
  const urlMapping: Record<string, string> = {};

  // Procházení složek
  for (const folder of FOLDERS_TO_MIGRATE) {
    const folderPath = path.join(process.cwd(), folder);

    // Kontrola, zda složka existuje
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  Složka ${folder} neexistuje, přeskakuji...`);
      continue;
    }

    console.log(`📁 Zpracovávám složku: ${folder}`);

    // Načtení souborů
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      // Přeskočit složky
      if (stat.isDirectory()) {
        continue;
      }

      // Kontrola přípony
      const ext = path.extname(file).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        console.log(`   ⏭️  Přeskakuji ${file} (není obrázek)`);
        skippedFiles++;
        continue;
      }

      totalFiles++;

      try {
        // Čtení souboru
        const fileBuffer = fs.readFileSync(filePath);

        // Určení MIME typu
        const mimeType = getMimeType(ext);

        // Určení cílového názvu v bucketu
        // Struktura: /products/nazev.jpg nebo /nazev.jpg
        let targetPath = file;
        if (folder.includes('products')) {
          targetPath = `products/${file}`;
        } else if (folder.includes('uploads')) {
          targetPath = `uploads/${file}`;
        }

        // Upload do Supabase
        console.log(`   📤 Nahrávám: ${targetPath}`);
        
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(targetPath, fileBuffer, {
            contentType: mimeType,
            upsert: true, // Přepsat, pokud už existuje
          });

        if (error) {
          console.error(`   ❌ Chyba při nahrávání ${file}:`, error.message);
          errorFiles++;
          continue;
        }

        // Získání veřejné URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(targetPath);

        // Uložení mapování
        const oldUrl = `/images/${targetPath}`;
        const newUrl = urlData.publicUrl;
        urlMapping[oldUrl] = newUrl;

        console.log(`   ✅ Nahráno: ${newUrl}`);
        uploadedFiles++;

      } catch (err) {
        console.error(`   ❌ Chyba při zpracování ${file}:`, err);
        errorFiles++;
      }
    }

    console.log(''); // Prázdný řádek mezi složkami
  }

  // ============================================================================
  // VÝSLEDKY
  // ============================================================================

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 VÝSLEDKY MIGRACE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📁 Celkem souborů:      ${totalFiles}`);
  console.log(`✅ Úspěšně nahráno:     ${uploadedFiles}`);
  console.log(`⏭️  Přeskočeno:          ${skippedFiles}`);
  console.log(`❌ Chyby:               ${errorFiles}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Uložení mapování do JSON
  if (Object.keys(urlMapping).length > 0) {
    const mappingPath = path.join(process.cwd(), 'url-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
    console.log(`💾 Mapování URL uloženo do: url-mapping.json`);
    console.log(`   Tento soubor můžete použít k aktualizaci localStorage\n`);
  }

  console.log('🎉 Migrace dokončena!');
  console.log('\n📝 DALŠÍ KROKY:');
  console.log('1. Zkontrolujte nahrané obrázky v Supabase Dashboard → Storage → public-images');
  console.log('2. Otestujte upload nových obrázků přes /admin');
  console.log('3. Obrázky by se měly zobrazovat všem uživatelům');
  console.log('4. Můžete smazat /public/images/uploads/ (už není potřeba)');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

// ============================================================================
// SPUŠTĚNÍ
// ============================================================================

migrateImages().catch((err) => {
  console.error('❌ Kritická chyba:', err);
  process.exit(1);
});



