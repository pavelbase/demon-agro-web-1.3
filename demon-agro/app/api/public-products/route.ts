import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Načtení všech produktů nebo jednoho podle product_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (productId) {
      // Načtení jednoho produktu podle product_id
      const { data, error } = await supabase
        .from('public_products')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return NextResponse.json({ product: data || null });
    } else {
      // Načtení všech produktů
      const { data, error, count } = await supabase
        .from('public_products')
        .select('*', { count: 'exact' })
        .order('display_order', { ascending: true })
        .order('product_id', { ascending: true });

      if (error) throw error;

      // Převést na objekt { product_id: productData }
      const productsObj = (data || []).reduce((acc, product) => {
        acc[product.product_id] = {
          ...product.product_data,
          id: product.product_id,
        };
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json({ 
        products: productsObj,
        count: count || 0,
        success: true
      });
    }
  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání produktů' },
      { status: 500 }
    );
  }
}

// POST - Uložení nebo aktualizace produktu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productData } = body;

    if (!productId || !productData) {
      return NextResponse.json(
        { error: 'Chybí povinná data (productId, productData)' },
        { status: 400 }
      );
    }

    // Připravit data pro upsert
    const dbData = {
      product_id: productId,
      product_data: productData,
      category: productData.kategorie || 'ph',
      is_available: productData.dostupnost ?? true,
      display_order: 0,
    };

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('public_products')
      .upsert(dbData, { onConflict: 'product_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      product: data 
    });
  } catch (error) {
    console.error('Error saving public product:', error);
    return NextResponse.json(
      { error: 'Chyba při ukládání produktu' },
      { status: 500 }
    );
  }
}

// DELETE - Smazání produktu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Chybí ID produktu' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('public_products')
      .delete()
      .eq('product_id', productId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting public product:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání produktu' },
      { status: 500 }
    );
  }
}


