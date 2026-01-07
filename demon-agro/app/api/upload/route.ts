import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE STORAGE UPLOAD
// ============================================================================
// Upload endpoint pro veřejné obrázky (spravované z /admin)
// Ukládá do Supabase Storage bucketu 'public-images'
// Oddělené od portal-images (spravované z /portal/admin)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Žádný soubor nebyl nahrán' },
        { status: 400 }
      );
    }

    // Kontrola typu souboru
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Povolené jsou pouze obrázky (JPG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Kontrola velikosti (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Soubor je příliš velký. Maximum je 5MB.' },
        { status: 400 }
      );
    }

    // Získat produktový název z formData (pokud existuje)
    const productName = formData.get('productName') as string;
    
    // Vytvořit bezpečný název souboru
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    let filename: string;
    if (productName) {
      // Sanitizace názvu produktu pro název souboru
      const sanitizedName = productName
        .toLowerCase()
        .normalize('NFD') // Rozložit diakritiku
        .replace(/[\u0300-\u036f]/g, '') // Odstranit diakritiku
        .replace(/[^a-z0-9]+/g, '-') // Nahradit nealfanumerické znaky pomlčkou
        .replace(/^-+|-+$/g, ''); // Odstranit pomlčky ze začátku/konce
      
      filename = `${sanitizedName}-${timestamp}.${fileExtension}`;
    } else {
      // Fallback na původní název
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      filename = `${timestamp}-${originalName}`;
    }

    // ========================================================================
    // UPLOAD DO SUPABASE STORAGE
    // ========================================================================
    
    // Inicializace Supabase klienta
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Konverze File na Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload do bucketu 'public-images'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public-images')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false, // Nepřepisovat existující soubory
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Chyba při nahrávání do úložiště: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Získat veřejnou URL
    const { data: urlData } = supabase.storage
      .from('public-images')
      .getPublicUrl(filename);

    // Vrátit URL (kompatibilní s předchozí verzí API)
    return NextResponse.json({
      success: true,
      url: urlData.publicUrl, // Supabase Storage URL
      filename: filename,
      // Pro zpětnou kompatibilitu a debugging:
      storage: 'supabase',
      bucket: 'public-images'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Chyba při nahrávání souboru' },
      { status: 500 }
    );
  }
}
