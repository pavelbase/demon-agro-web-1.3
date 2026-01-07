"use client";

import { useEffect } from 'react';
import { syncImagesFromSupabase } from '@/lib/images-sync';

/**
 * Komponenta pro automatickou synchronizaci obrázků při načtení stránky
 * Načte obrázky ze Supabase do localStorage, aby byly dostupné i v inkognito režimu
 */
export default function ImageSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Synchronizuj obrázky při prvním načtení
    syncImagesFromSupabase().catch((error) => {
      console.error('Image sync failed:', error);
    });
  }, []);

  return <>{children}</>;
}

