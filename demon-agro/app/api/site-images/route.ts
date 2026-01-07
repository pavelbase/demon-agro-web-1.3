import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Načtení všech obrázků nebo jednoho podle klíče
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Načtení jednoho obrázku podle klíče
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return NextResponse.json({ image: data || null });
    } else {
      // Načtení všech obrázků
      const { data, error, count } = await supabase
        .from('site_images')
        .select('*', { count: 'exact' })
        .order('key', { ascending: true });

      if (error) throw error;

      // Převést na objekt { key: imageData }
      const imagesObj = (data || []).reduce((acc, img) => {
        acc[img.key] = {
          url: img.url,
          category: img.category,
          page: img.page,
          productId: img.product_id,
          articleId: img.article_id,
          title: img.title,
          dimensions: img.dimensions || '',
          size: img.size_bytes || 0,
          format: img.format || '',
          uploadedAt: img.uploaded_at
        };
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json({ 
        images: imagesObj,
        count: count || 0,
        success: true
      });
    }
  } catch (error) {
    console.error('Error fetching site images:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání obrázků' },
      { status: 500 }
    );
  }
}

// POST - Uložení nebo aktualizace obrázku
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, imageData } = body;

    if (!key || !imageData) {
      return NextResponse.json(
        { error: 'Chybí povinná data (key, imageData)' },
        { status: 400 }
      );
    }

    // Připravit data pro upsert
    const dbData = {
      key,
      url: imageData.url,
      category: imageData.category,
      page: imageData.page || null,
      product_id: imageData.productId || null,
      article_id: imageData.articleId || null,
      title: imageData.title,
      dimensions: imageData.dimensions || null,
      size_bytes: imageData.size || 0,
      format: imageData.format || null,
      uploaded_at: imageData.uploadedAt || new Date().toISOString()
    };

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('site_images')
      .upsert(dbData, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      image: data 
    });
  } catch (error) {
    console.error('Error saving site image:', error);
    return NextResponse.json(
      { error: 'Chyba při ukládání obrázku' },
      { status: 500 }
    );
  }
}

// DELETE - Smazání obrázku
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Chybí klíč obrázku' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('site_images')
      .delete()
      .eq('key', key);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site image:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání obrázku' },
      { status: 500 }
    );
  }
}

