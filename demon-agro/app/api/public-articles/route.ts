import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Načtení všech článků nebo jednoho podle article_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article_id');

    if (articleId) {
      // Načtení jednoho článku podle article_id
      const { data, error } = await supabase
        .from('public_articles')
        .select('*')
        .eq('article_id', articleId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return NextResponse.json({ article: data || null });
    } else {
      // Načtení všech článků
      const { data, error, count } = await supabase
        .from('public_articles')
        .select('*', { count: 'exact' })
        .order('published_date', { ascending: false, nullsFirst: false })
        .order('article_id', { ascending: true });

      if (error) throw error;

      // Převést na objekt { article_id: articleData }
      const articlesObj = (data || []).reduce((acc, article) => {
        acc[article.article_id] = {
          ...article.article_data,
          id: article.article_id,
          publikovano: article.is_published,
        };
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json({ 
        articles: articlesObj,
        count: count || 0,
        success: true
      });
    }
  } catch (error) {
    console.error('Error fetching public articles:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání článků' },
      { status: 500 }
    );
  }
}

// POST - Uložení nebo aktualizace článku
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, articleData } = body;

    if (!articleId || !articleData) {
      return NextResponse.json(
        { error: 'Chybí povinná data (articleId, articleData)' },
        { status: 400 }
      );
    }

    // Připravit data pro upsert
    const dbData = {
      article_id: articleId,
      article_data: articleData,
      category: articleData.kategorie || 'ziviny',
      is_published: articleData.publikovano ?? false,
      slug: articleData.slug || articleId,
      published_date: articleData.publikovano 
        ? (articleData.datum_publikace || new Date().toISOString()) 
        : null,
    };

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('public_articles')
      .upsert(dbData, { onConflict: 'article_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      article: data 
    });
  } catch (error) {
    console.error('Error saving public article:', error);
    return NextResponse.json(
      { error: 'Chyba při ukládání článku' },
      { status: 500 }
    );
  }
}

// DELETE - Smazání článku
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article_id');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Chybí ID článku' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('public_articles')
      .delete()
      .eq('article_id', articleId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting public article:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání článku' },
      { status: 500 }
    );
  }
}

