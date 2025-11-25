import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Vytvořit bezpečný název souboru
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;
    
    // Cesta pro uložení
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    const filepath = path.join(uploadDir, filename);

    // Vytvořit složku pokud neexistuje
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Složka už existuje
    }

    // Uložit soubor
    await writeFile(filepath, buffer);

    // Vrátit URL
    const imageUrl = `/images/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Chyba při nahrávání souboru' },
      { status: 500 }
    );
  }
}
