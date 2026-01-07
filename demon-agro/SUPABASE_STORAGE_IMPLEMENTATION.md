# 📦 Supabase Storage - Implementace pro veřejné obrázky

## 🎯 Přehled řešení

Obrázky z veřejného prohlížeče (spravované z `/admin`) jsou nyní ukládány do **Supabase Storage** místo lokálního file systému.

### ✅ Výhody:
- **Perzistentní úložiště** - obrázky nepřijdete při redeploy
- **Veřejně přístupné** - zobrazí se všem uživatelům
- **Oddělené správy** - zachováno rozdělení admin panelů
- **Bezplatné** - Supabase Free Tier (1 GB storage)

---

## 📋 Implementační kroky

### KROK 1: Vytvoření Supabase bucketu

**Možnost A: SQL skript (doporučeno)**

1. Otevřete Supabase Dashboard → SQL Editor
2. Spusťte skript:
   ```bash
   demon-agro/lib/supabase/sql/create_public_images_bucket.sql
   ```

**Možnost B: Ruční vytvoření**

1. Supabase Dashboard → Storage → New bucket
2. Nastavení:
   - **Name:** `public-images`
   - **Public bucket:** ✅ YES
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`

### KROK 2: Ověření bucketu

V Supabase SQL Editor spusťte:

```sql
-- Kontrola, zda bucket existuje
SELECT * FROM storage.buckets WHERE id = 'public-images';

-- Kontrola policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%public%';
```

**Očekávaný výsledek:**
- Bucket `public-images` existuje
- `public = true`
- 4 policies (SELECT, INSERT, DELETE, UPDATE)

---

### KROK 3: Test uploadu (DŮLEŽITÉ!)

#### A. Test přes admin panel

1. Otevřete: `http://localhost:3000/admin`
2. Heslo: `demonagro2024`
3. Záložka: **Správa obrázků**
4. Vyberte jakýkoliv obrázek → **Změnit URL**
5. Nahrajte testovací obrázek (JPG/PNG, < 5 MB)

**Očekávaný výsledek:**
- ✅ Upload proběhne úspěšně
- ✅ URL začíná: `https://[PROJECT].supabase.co/storage/v1/object/public/public-images/...`
- ✅ Obrázek se zobrazí v náhledu

#### B. Kontrola v Supabase Dashboard

1. Supabase Dashboard → Storage → `public-images`
2. Měli byste vidět nahraný soubor
3. Klikněte na soubor → **Copy URL**
4. Vložte URL do prohlížeče → obrázek se zobrazí

#### C. Test zobrazení uživatelům

1. Otevřete web v **inkognito režimu** (nebo jiném prohlížeči)
2. Přejděte na stránku s nahraným obrázkem
3. **Očekávaný výsledek:** Obrázek se zobrazí správně

---

### KROK 4: Migrace existujících obrázků (volitelné)

Pokud máte obrázky v `/public/images/uploads/`, migrujte je:

```bash
# 1. Ujistěte se, že máte .env.local s Supabase credentials
#    (už by měly být nastaveny)

# 2. Spusťte migrační skript
npx tsx scripts/migrate-images-to-supabase.ts
```

**Co skript dělá:**
- Najde všechny obrázky v `/public/images/`, `/public/images/products/`, `/public/images/uploads/`
- Nahraje je do Supabase Storage
- Vytvoří `url-mapping.json` s mapováním starých URL → nových URL
- Zobrazí statistiky

**Po migraci:**
1. Zkontrolujte nahrané soubory v Supabase Dashboard → Storage → public-images
2. Můžete smazat `/public/images/uploads/` (už není potřeba)

---

## 🧪 Testovací checklist

### ✅ Před nasazením na produkci

- [ ] **Bucket vytvořen**
  - Supabase Dashboard → Storage → `public-images` existuje
  - Public bucket = YES

- [ ] **Policies nastaveny**
  - SELECT policy (veřejné čtení)
  - INSERT policy (upload)
  - DELETE policy (mazání)
  - UPDATE policy (aktualizace)

- [ ] **Test upload - Admin panel**
  - Otevřít `/admin` (heslo: `demonagro2024`)
  - Nahrát testovací obrázek
  - URL začíná `https://...supabase.co/storage/...`
  - Obrázek se zobrazí v admin panelu

- [ ] **Test zobrazení - Veřejný uživatel**
  - Otevřít web v inkognito režimu
  - Obrázek se zobrazí správně
  - Žádné 404 chyby

- [ ] **Test produktových obrázků**
  - Přidat/upravit produkt v admin panelu
  - Nahrát obrázek produktu
  - Produkt se zobrazí správně na stránce

- [ ] **Test různých formátů**
  - JPG ✅
  - PNG ✅
  - WebP ✅
  - GIF ✅

- [ ] **Test limitů**
  - Soubor > 5 MB → chybová hláška
  - Nepovolený typ (PDF, TXT) → chybová hláška

- [ ] **Produkční test**
  - Deploy na Vercel/Netlify
  - Upload obrázku na produkci
  - Redeploy aplikace
  - **Obrázek stále existuje** ✅ (nejdůležitější test!)

---

## 🔧 Řešení problémů

### ❌ Chyba: "Bucket not found"

**Řešení:**
1. Zkontrolujte, zda bucket `public-images` existuje v Supabase Dashboard → Storage
2. Pokud ne, vytvořte ho ručně nebo spusťte SQL skript

### ❌ Chyba: "Access denied" nebo "Unauthorized"

**Řešení:**
1. Zkontrolujte, zda bucket je **public** (✅ YES)
2. Ověřte policies v Supabase Dashboard → Storage → public-images → Policies
3. Spusťte znovu SQL skript pro vytvoření policies

### ❌ Obrázek se nahraje, ale nezobrazí (404)

**Možné příčiny:**
1. Bucket není public
2. URL je špatně uložena v localStorage
3. CORS issue (vzácné)

**Řešení:**
1. Otevřete Developer Tools (F12) → Network tab
2. Zkontrolujte URL obrázku
3. Zkopírujte URL a otevřete v novém okně
4. Pokud se obrázek nezobrazí, problém je v Supabase nastavení

### ❌ Upload funguje lokálně, ale ne na produkci

**Řešení:**
1. Zkontrolujte environment variables na Vercel/Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Musí být nastaveny v produkčním prostředí
3. Po přidání env vars restartujte/redeployujte

---

## 📊 Struktura bucketů

Máte nyní **3 oddělené buckety**:

| Bucket | Účel | Správa z | Public |
|--------|------|----------|--------|
| `public-images` | Veřejné obrázky (web) | `/admin` | ✅ ANO |
| `portal-images` | Portálové obrázky | `/portal/admin` | ✅ ANO |
| `soil-documents` | PDF rozbory půdy | `/portal` | ❌ NE |

---

## 📁 Soubory změněné v této implementaci

### Nové soubory:
1. `lib/supabase/sql/create_public_images_bucket.sql` - SQL skript pro vytvoření bucketu
2. `scripts/migrate-images-to-supabase.ts` - Migrační skript
3. `scripts/README.md` - Dokumentace skriptů
4. `SUPABASE_STORAGE_IMPLEMENTATION.md` - Tento dokument

### Upravené soubory:
1. `app/api/upload/route.ts` - Změna z lokálního file systému na Supabase Storage
2. `OBRAZKY_NAVOD.md` - Aktualizace dokumentace

### Zachované funkčnosti:
- ✅ Admin panel `/admin` funguje stejně
- ✅ LocalStorage pro konfiguraci zachována
- ✅ API interface kompatibilní (žádné breaking changes)
- ✅ Produkty stále v localStorage (oddělené od portálu)

---

## 🎉 Výsledek

### Před implementací:
- ❌ Obrázky v `/public/images/uploads/`
- ❌ Ztráta při redeploy
- ❌ Nezobrazují se uživatelům mimo lokální disk

### Po implementaci:
- ✅ Obrázky v Supabase Storage
- ✅ Perzistentní (nepřijdete o ně)
- ✅ Zobrazují se všem uživatelům
- ✅ Oddělené správy portálu a veřejné části zachovány
- ✅ Bezplatné (Free Tier)

---

## 📞 Potřebujete pomoc?

- 📧 Email: base@demonagro.cz
- 📞 Telefon: +420 731 734 907

---

**🚀 Připraveno k nasazení!**

