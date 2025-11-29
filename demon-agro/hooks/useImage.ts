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
 * React hook pro načítání produktového obrázku
 * 
 * @param productId - ID produktu
 * @param fallback - Volitelný fallback URL
 * @returns URL obrázku produktu
 * 
 * @example
 * const productImage = useProductImage('prod-001', product.fotka_url);
 * <img src={productImage} alt="Product" />
 */
export function useProductImage(productId: string, fallback?: string): string {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    return fallback || `/images/placeholders/product-placeholder.svg`;
  });

  useEffect(() => {
    // Client-side: načti skutečnou URL z localStorage
    const key = `product_${productId}`;
    const url = getImageUrl(key, fallback);
    setImageUrl(url);
  }, [productId, fallback]);

  return imageUrl;
}

