// Synchronizace obrázků mezi localStorage a Supabase
// ============================================================================
// Tento modul zajišťuje, že:
// 1. Obrázky z localStorage se ukládají do Supabase (perzistence)
// 2. Obrázky ze Supabase se načítají do localStorage (sdílení mezi režimy)
// 3. localStorage slouží jako cache pro rychlý přístup
// ============================================================================

import { ImagesDatabase, saveImages, getImages } from './images-manager';

// Flag pro zabránění vícenásobnému volání
let isSyncing = false;
let hasInitialSync = false;

/**
 * Načte obrázky ze Supabase a uloží do localStorage
 * Volá se automaticky při načtení stránky
 */
export async function syncImagesFromSupabase(): Promise<void> {
  if (isSyncing || hasInitialSync) return;
  if (typeof window === 'undefined') return;
  
  isSyncing = true;
  
  try {
    const response = await fetch('/api/site-images');
    
    if (!response.ok) {
      throw new Error('Failed to fetch images from Supabase');
    }
    
    const { images } = await response.json();
    
    if (images && Object.keys(images).length > 0) {
      // Uložit do localStorage
      saveImages(images);
      // Notifikovat všechny komponenty o aktualizaci obrázků
      window.dispatchEvent(new Event('images-updated'));
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Images synced from Supabase:', Object.keys(images).length);
      }
    } else {
      // Pokud je Supabase prázdná, migruj z localStorage do Supabase
      const localImages = getImages();
      if (Object.keys(localImages).length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📤 Migrating images from localStorage to Supabase...');
        }
        await migrateLocalStorageToSupabase(localImages);
      }
    }
    
    hasInitialSync = true;
  } catch (error) {
    console.error('Error syncing images:', error);
    // Pokud se nepodaří načíst ze Supabase, pokračuj s localStorage
  } finally {
    isSyncing = false;
  }
}

/**
 * Uloží obrázek do localStorage a Supabase
 */
export async function saveImageWithSync(key: string, imageData: any): Promise<void> {
  // Nejdřív ulož do localStorage (okamžitá změna)
  const images = getImages();
  images[key] = imageData;
  saveImages(images);
  
  // Pak ulož do Supabase (perzistence)
  try {
    const response = await fetch('/api/site-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, imageData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save image to Supabase');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Image '${key}' saved to Supabase`);
    }
  } catch (error) {
    console.error(`Error saving image '${key}' to Supabase:`, error);
    // I když se nepodaří uložit do Supabase, obrázek je v localStorage
  }
}

/**
 * Smaže obrázek z localStorage a Supabase
 */
export async function deleteImageWithSync(key: string): Promise<void> {
  // Nejdřív smaž z localStorage (okamžitá změna)
  const images = getImages();
  delete images[key];
  saveImages(images);
  
  // Pak smaž ze Supabase
  try {
    const response = await fetch(`/api/site-images?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete image from Supabase');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Image '${key}' deleted from Supabase`);
    }
  } catch (error) {
    console.error(`Error deleting image '${key}' from Supabase:`, error);
  }
}

/**
 * Migruje všechny obrázky z localStorage do Supabase
 * (jednorázová migrace)
 */
async function migrateLocalStorageToSupabase(images: ImagesDatabase): Promise<void> {
  const entries = Object.entries(images);
  let successCount = 0;
  
  for (const [key, imageData] of entries) {
    try {
      const response = await fetch('/api/site-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, imageData }),
      });
      
      if (response.ok) {
        successCount++;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to migrate image '${key}':`, error);
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Migrated ${successCount}/${entries.length} images to Supabase`);
  }
}

/**
 * Hook pro automatickou synchronizaci při načtení stránky
 * Použití: Zavolat na začátku aplikace (např. v layout.tsx nebo _app.tsx)
 */
export function useImageSync() {
  if (typeof window !== 'undefined' && !hasInitialSync) {
    syncImagesFromSupabase();
  }
}

