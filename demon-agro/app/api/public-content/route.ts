import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Načtení všech obsahů stránek nebo jednoho podle page_key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');

    if (pageKey) {
      // Načtení jednoho obsahu podle page_key
      const { data, error } = await supabase
        .from('public_content')
        .select('*')
        .eq('page_key', pageKey)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return NextResponse.json({ content: data || null });
    } else {
      // Načtení všech obsahů stránek
      const { data, error, count } = await supabase
        .from('public_content')
        .select('*', { count: 'exact' })
        .order('page_key', { ascending: true });

      if (error) throw error;

      // Převést na objekt { page_key: contentData }
      const contentObj = (data || []).reduce((acc, content) => {
        acc[content.page_key] = content.content_data;
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json({ 
        content: contentObj,
        count: count || 0,
        success: true
      });
    }
  } catch (error) {
    console.error('Error fetching public content:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání obsahu' },
      { status: 500 }
    );
  }
}

// POST - Uložení nebo aktualizace obsahu stránky
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageKey, contentData, pageTitle } = body;

    if (!pageKey || !contentData) {
      return NextResponse.json(
        { error: 'Chybí povinná data (pageKey, contentData)' },
        { status: 400 }
      );
    }

    // Připravit data pro upsert
    const dbData = {
      page_key: pageKey,
      content_data: contentData,
      page_title: pageTitle || pageKey,
    };

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('public_content')
      .upsert(dbData, { onConflict: 'page_key' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      content: data 
    });
  } catch (error) {
    console.error('Error saving public content:', error);
    return NextResponse.json(
      { error: 'Chyba při ukládání obsahu' },
      { status: 500 }
    );
  }
}

// DELETE - Smazání obsahu stránky
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');

    if (!pageKey) {
      return NextResponse.json(
        { error: 'Chybí klíč stránky' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('public_content')
      .delete()
      .eq('page_key', pageKey);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting public content:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání obsahu' },
      { status: 500 }
    );
  }
}



