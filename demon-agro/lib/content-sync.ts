// Synchronizace obsahu stránek mezi localStorage a Supabase
// ============================================================================
// Tento modul zajišťuje, že:
// 1. Obsah stránek z localStorage se ukládá do Supabase (perzistence)
// 2. Obsah stránek ze Supabase se načítá do localStorage (sdílení mezi režimy)
// 3. localStorage slouží jako cache pro rychlý přístup
// Stejný pattern jako images-sync.ts
// ============================================================================

import { getPageContent, savePageContent, PageContent, PageKey } from './content';

// Flag pro zabránění vícenásobnému volání
let isSyncing = false;
let hasInitialSync = false;

/**
 * Načte obsah stránek ze Supabase a uloží do localStorage
 * Volá se automaticky při načtení stránky
 */
export async function syncContentFromSupabase(): Promise<void> {
  if (isSyncing || hasInitialSync) return;
  if (typeof window === 'undefined') return;
  
  isSyncing = true;
  
  try {
    const response = await fetch('/api/public-content');
    
    if (!response.ok) {
      throw new Error('Failed to fetch content from Supabase');
    }
    
    const { content } = await response.json();
    
    if (content && Object.keys(content).length > 0) {
      // Uložit každou stránku do localStorage
      for (const [pageKey, contentData] of Object.entries(content)) {
        savePageContent(pageKey as PageKey, contentData as PageContent);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Content synced from Supabase:', Object.keys(content).length, 'pages');
      }
    } else {
      // Pokud je Supabase prázdná, migruj z localStorage do Supabase
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Migrating content from localStorage to Supabase...');
      }
      await migrateLocalStorageToSupabase();
    }
    
    hasInitialSync = true;
  } catch (error) {
    console.error('Error syncing content:', error);
    // Pokud se nepodaří načíst ze Supabase, pokračuj s localStorage
  } finally {
    isSyncing = false;
  }
}

/**
 * Uloží obsah stránky do localStorage a Supabase
 */
export async function savePageContentWithSync(pageKey: PageKey, content: PageContent): Promise<void> {
  // Nejdřív ulož do localStorage (okamžitá změna)
  savePageContent(pageKey, content);
  
  // Pak ulož do Supabase (perzistence)
  try {
    const response = await fetch('/api/public-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        pageKey, 
        contentData: content,
        pageTitle: pageKey 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save content to Supabase');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Content for '${pageKey}' saved to Supabase`);
    }
  } catch (error) {
    console.error(`Error saving content for '${pageKey}' to Supabase:`, error);
    // I když se nepodaří uložit do Supabase, obsah je v localStorage
  }
}

/**
 * Migruje veškerý obsah z localStorage do Supabase
 * (jednorázová migrace)
 */
async function migrateLocalStorageToSupabase(): Promise<void> {
  const pageKeys: PageKey[] = ['home', 'ph', 'sira', 'k', 'mg', 'analyza', 'onas', 'kontakt', 'kalkulacka'];
  let successCount = 0;
  
  for (const pageKey of pageKeys) {
    try {
      const content = getPageContent(pageKey);
      
      // Pokud má stránka nějaký obsah v localStorage
      if (content && Object.keys(content).length > 0) {
        const response = await fetch('/api/public-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            pageKey, 
            contentData: content,
            pageTitle: pageKey 
          }),
        });
        
        if (response.ok) {
          successCount++;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to migrate content for '${pageKey}':`, error);
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Migrated ${successCount} pages to Supabase`);
  }
}

/**
 * Hook pro automatickou synchronizaci při načtení stránky
 * Použití: Zavolat na začátku aplikace (např. v layout.tsx)
 */
export function useContentSync() {
  if (typeof window !== 'undefined' && !hasInitialSync) {
    syncContentFromSupabase();
  }
}



