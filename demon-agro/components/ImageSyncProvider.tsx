"use client";

import { useEffect } from 'react';
import { syncImagesFromSupabase } from '@/lib/images-sync';
import { syncProductsFromSupabase } from '@/lib/products-sync';
import { syncArticlesFromSupabase } from '@/lib/articles-sync';
import { syncContentFromSupabase } from '@/lib/content-sync';

/**
 * Komponenta pro automatickou synchronizaci dat při načtení stránky
 * Načte obrázky, produkty, články a obsah ze Supabase do localStorage,
 * aby byly dostupné i v inkognito režimu a sdíleny mezi uživateli
 */
export default function ImageSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Synchronizuj všechna data při prvním načtení
    Promise.all([
      syncImagesFromSupabase(),
      syncProductsFromSupabase(),
      syncArticlesFromSupabase(),
      syncContentFromSupabase(),
    ]).catch((error) => {
      console.error('Data sync failed:', error);
    });
  }, []);

  return <>{children}</>;
}

