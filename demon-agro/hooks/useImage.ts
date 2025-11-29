"use client";

import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/images-manager';

/**
 * React hook pro načítání obrázků z centralizované správy
 * 
 * @param key - Klíč obrázku (např. 'home_hero', 'ph_problem_img')
 * @param fallback - Volitelný fallback URL (výchozí: auto placeholder podle kategorie)
 * @returns URL obrázku
 * 
 * @example
 * const heroUrl = useImage('home_hero');
 * <div style={{ backgroundImage: `url(${heroUrl})` }}>...</div>
 */
export function useImage(key: string, fallback?: string): string {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    // SSR/initial: použij fallback nebo placeholder
    return fallback || `/images/placeholders/default-placeholder.jpg`;
  });

  useEffect(() => {
    // Client-side: načti skutečnou URL z localStorage
    const url = getImageUrl(key, fallback);
    setImageUrl(url);
  }, [key, fallback]);

  return imageUrl;
}

/**
 * React hook pro načítání více obrázků najednou
 * 
 * @param keys - Pole klíčů obrázků
 * @returns Objekt s URL obrázků { key: url }
 * 
 * @example
 * const images = useImages(['home_hero', 'home_kroky_bg']);
 * <div style={{ backgroundImage: `url(${images.home_hero})` }}>...</div>
 */
export function useImages(keys: string[]): Record<string, string> {
  const [images, setImages] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    keys.forEach(key => {
      initial[key] = `/images/placeholders/default-placeholder.jpg`;
    });
    return initial;
  });

  useEffect(() => {
    const loadedImages: Record<string, string> = {};
    keys.forEach(key => {
      loadedImages[key] = getImageUrl(key);
    });
    setImages(loadedImages);
  }, [keys.join(',')]);

  return images;
}
