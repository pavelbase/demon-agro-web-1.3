// Synchronizace článků mezi localStorage a Supabase
// ============================================================================
// Tento modul zajišťuje, že:
// 1. Články z localStorage se ukládají do Supabase (perzistence)
// 2. Články ze Supabase se načítají do localStorage (sdílení mezi režimy)
// 3. localStorage slouží jako cache pro rychlý přístup
// Stejný pattern jako images-sync.ts
// ============================================================================

import { getArticles, saveArticles, Article } from './articles';

// Flag pro zabránění vícenásobnému volání
let isSyncing = false;
let hasInitialSync = false;

/**
 * Načte články ze Supabase a uloží do localStorage
 * Volá se automaticky při načtení stránky
 */
export async function syncArticlesFromSupabase(): Promise<void> {
  if (isSyncing || hasInitialSync) return;
  if (typeof window === 'undefined') return;
  
  isSyncing = true;
  
  try {
    const response = await fetch('/api/public-articles');
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles from Supabase');
    }
    
    const { articles } = await response.json();
    
    if (articles && Object.keys(articles).length > 0) {
      // Převést objekt na pole
      const articlesArray: Article[] = Object.values(articles);
      
      // Uložit do localStorage
      saveArticles(articlesArray);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Articles synced from Supabase:', articlesArray.length);
      }
    } else {
      // Pokud je Supabase prázdná, migruj z localStorage do Supabase
      const localArticles = getArticles();
      if (localArticles.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📤 Migrating articles from localStorage to Supabase...');
        }
        await migrateLocalStorageToSupabase(localArticles);
      }
    }
    
    hasInitialSync = true;
  } catch (error) {
    console.error('Error syncing articles:', error);
    // Pokud se nepodaří načíst ze Supabase, pokračuj s localStorage
  } finally {
    isSyncing = false;
  }
}

/**
 * Uloží článek do localStorage a Supabase
 */
export async function saveArticleWithSync(article: Article): Promise<void> {
  // Nejdřív ulož do localStorage (okamžitá změna)
  const articles = getArticles();
  const existingIndex = articles.findIndex(a => a.id === article.id);
  
  if (existingIndex >= 0) {
    articles[existingIndex] = article;
  } else {
    articles.push(article);
  }
  
  saveArticles(articles);
  
  // Pak ulož do Supabase (perzistence)
  try {
    const response = await fetch('/api/public-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        articleId: article.id, 
        articleData: article 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save article to Supabase');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Article '${article.id}' saved to Supabase`);
    }
  } catch (error) {
    console.error(`Error saving article '${article.id}' to Supabase:`, error);
    // I když se nepodaří uložit do Supabase, článek je v localStorage
  }
}

/**
 * Smaže článek z localStorage a Supabase
 */
export async function deleteArticleWithSync(articleId: string): Promise<void> {
  // Nejdřív smaž z localStorage (okamžitá změna)
  const articles = getArticles();
  const filteredArticles = articles.filter(a => a.id !== articleId);
  saveArticles(filteredArticles);
  
  // Pak smaž ze Supabase
  try {
    const response = await fetch(`/api/public-articles?article_id=${encodeURIComponent(articleId)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete article from Supabase');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Article '${articleId}' deleted from Supabase`);
    }
  } catch (error) {
    console.error(`Error deleting article '${articleId}' from Supabase:`, error);
  }
}

/**
 * Uloží všechny články do localStorage a Supabase
 */
export async function saveAllArticlesWithSync(articles: Article[]): Promise<void> {
  // Nejdřív ulož do localStorage (okamžitá změna)
  saveArticles(articles);
  
  // Pak ulož do Supabase (perzistence)
  const promises = articles.map(article => 
    fetch('/api/public-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        articleId: article.id, 
        articleData: article 
      }),
    })
  );
  
  try {
    await Promise.all(promises);
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ All ${articles.length} articles saved to Supabase`);
    }
  } catch (error) {
    console.error('Error saving all articles to Supabase:', error);
  }
}

/**
 * Migruje všechny články z localStorage do Supabase
 * (jednorázová migrace)
 */
async function migrateLocalStorageToSupabase(articles: Article[]): Promise<void> {
  let successCount = 0;
  
  for (const article of articles) {
    try {
      const response = await fetch('/api/public-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          articleId: article.id, 
          articleData: article 
        }),
      });
      
      if (response.ok) {
        successCount++;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to migrate article '${article.id}':`, error);
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Migrated ${successCount}/${articles.length} articles to Supabase`);
  }
}

/**
 * Hook pro automatickou synchronizaci při načtení stránky
 * Použití: Zavolat na začátku aplikace (např. v layout.tsx)
 */
export function useArticlesSync() {
  if (typeof window !== 'undefined' && !hasInitialSync) {
    syncArticlesFromSupabase();
  }
}


