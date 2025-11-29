// Systém správy obrázků pro Démon agro
// Centralizovaná správa všech obrázků na webu

export type ImageCategory = 'hero' | 'background' | 'section' | 'product' | 'article';
export type PageKey = 'home' | 'ph' | 'sira' | 'k' | 'mg' | 'analyza' | 'onas' | 'radce' | 'kontakt' | 'kalkulacka';

export interface ImageData {
  url: string;
  category: ImageCategory;
  page?: PageKey;
  productId?: string;
  articleId?: string;
  title: string;
  dimensions: string;
  size: number; // bytes
  format: string;
  uploadedAt: string;
}

export interface ImagesDatabase {
  [key: string]: ImageData;
}

// Doporučené parametry pro jednotlivé kategorie
export const IMAGE_SPECS = {
  hero: {
    dimensions: '1920x1080',
    maxSize: 500 * 1024, // 500 KB
    formats: ['jpg', 'webp'],
    description: 'Fullscreen hero pozadí'
  },
  background: {
    dimensions: '1600x900',
    maxSize: 400 * 1024, // 400 KB
    formats: ['jpg', 'webp'],
    description: 'Pozadí sekcí'
  },
  section: {
    dimensions: '800x600',
    maxSize: 300 * 1024, // 300 KB
    formats: ['jpg', 'webp', 'png'],
    description: 'Ilustrační obrázky v sekcích'
  },
  product: {
    dimensions: '600x600',
    maxSize: 200 * 1024, // 200 KB
    formats: ['jpg', 'png', 'webp'],
    description: 'Produktové fotografie'
  },
  article: {
    dimensions: '1200x630',
    maxSize: 300 * 1024, // 300 KB
    formats: ['jpg', 'webp'],
    description: 'Obrázky článků'
  }
};

// Definice všech image keys na webu
export const IMAGE_KEYS = {
  // HERO OBRÁZKY
  home_hero: { category: 'hero' as ImageCategory, page: 'home' as PageKey, title: 'Domů - Hero pozadí' },
  ph_hero: { category: 'hero' as ImageCategory, page: 'ph' as PageKey, title: 'pH půdy - Hero pozadí' },
  sira_hero: { category: 'hero' as ImageCategory, page: 'sira' as PageKey, title: 'Síra - Hero pozadí' },
  k_hero: { category: 'hero' as ImageCategory, page: 'k' as PageKey, title: 'Draslík - Hero pozadí' },
  mg_hero: { category: 'hero' as ImageCategory, page: 'mg' as PageKey, title: 'Hořčík - Hero pozadí' },
  analyza_hero: { category: 'hero' as ImageCategory, page: 'analyza' as PageKey, title: 'Analýza - Hero pozadí' },
  onas_hero: { category: 'hero' as ImageCategory, page: 'onas' as PageKey, title: 'O nás - Hero pozadí' },
  radce_hero: { category: 'hero' as ImageCategory, page: 'radce' as PageKey, title: 'Rádce - Hero pozadí' },
  kontakt_hero: { category: 'hero' as ImageCategory, page: 'kontakt' as PageKey, title: 'Kontakt - Hero pozadí' },
  
  // BACKGROUND OBRÁZKY
  home_kroky_bg: { category: 'background' as ImageCategory, page: 'home' as PageKey, title: 'Domů - Jak pracujeme pozadí' },
  ph_dopad_bg: { category: 'background' as ImageCategory, page: 'ph' as PageKey, title: 'pH - Ekonomický dopad pozadí' },
  sira_dopad_bg: { category: 'background' as ImageCategory, page: 'sira' as PageKey, title: 'Síra - Ekonomický dopad pozadí' },
  k_dopad_bg: { category: 'background' as ImageCategory, page: 'k' as PageKey, title: 'Draslík - Ekonomický dopad pozadí' },
  mg_dopad_bg: { category: 'background' as ImageCategory, page: 'mg' as PageKey, title: 'Hořčík - Ekonomický dopad pozadí' },
  analyza_dopad_bg: { category: 'background' as ImageCategory, page: 'analyza' as PageKey, title: 'Analýza - Ekonomický dopad pozadí' },
  
  // SECTION IMAGES
  ph_problem_img: { category: 'section' as ImageCategory, page: 'ph' as PageKey, title: 'pH - Ilustrace problému' },
  ph_reseni_img: { category: 'section' as ImageCategory, page: 'ph' as PageKey, title: 'pH - Ilustrace řešení' },
  sira_problem_img: { category: 'section' as ImageCategory, page: 'sira' as PageKey, title: 'Síra - Ilustrace problému' },
  sira_reseni_img: { category: 'section' as ImageCategory, page: 'sira' as PageKey, title: 'Síra - Ilustrace řešení' },
  k_problem_img: { category: 'section' as ImageCategory, page: 'k' as PageKey, title: 'Draslík - Ilustrace problému' },
  k_reseni_img: { category: 'section' as ImageCategory, page: 'k' as PageKey, title: 'Draslík - Ilustrace řešení' },
  mg_problem_img: { category: 'section' as ImageCategory, page: 'mg' as PageKey, title: 'Hořčík - Ilustrace problému' },
  mg_reseni_img: { category: 'section' as ImageCategory, page: 'mg' as PageKey, title: 'Hořčík - Ilustrace řešení' },
  analyza_problem_img: { category: 'section' as ImageCategory, page: 'analyza' as PageKey, title: 'Analýza - Ilustrace problému' },
  analyza_reseni_img: { category: 'section' as ImageCategory, page: 'analyza' as PageKey, title: 'Analýza - Ilustrace řešení' },
  onas_kdo_jsme_img: { category: 'section' as ImageCategory, page: 'onas' as PageKey, title: 'O nás - Kdo jsme' },
  onas_mise_img: { category: 'section' as ImageCategory, page: 'onas' as PageKey, title: 'O nás - Naše mise' },
};

// Načtení všech obrázků z localStorage
export function getImages(): ImagesDatabase {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem('images');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing images from localStorage:', e);
      return {};
    }
  }
  return {};
}

// Uložení obrázků do localStorage
export function saveImages(images: ImagesDatabase): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('images', JSON.stringify(images));
}

// Načtení jednoho obrázku
export function getImage(key: string): ImageData | null {
  const images = getImages();
  return images[key] || null;
}

// Uložení jednoho obrázku
export function saveImage(key: string, imageData: ImageData): void {
  const images = getImages();
  images[key] = imageData;
  saveImages(images);
}

// Smazání obrázku
export function deleteImage(key: string): void {
  const images = getImages();
  delete images[key];
  saveImages(images);
}

// Filtrování obrázků podle kategorie
export function getImagesByCategory(category: ImageCategory): [string, ImageData][] {
  const images = getImages();
  return Object.entries(images).filter(([_, data]) => data.category === category);
}

// Filtrování obrázků podle stránky
export function getImagesByPage(page: PageKey): [string, ImageData][] {
  const images = getImages();
  return Object.entries(images).filter(([_, data]) => data.page === page);
}

// Získání URL obrázku s fallbackem
export function getImageUrl(key: string, fallback?: string): string {
  const image = getImage(key);
  if (image && image.url) {
    return image.url;
  }
  
  // Fallback podle kategorie
  if (fallback) return fallback;
  
  const keyData = IMAGE_KEYS[key as keyof typeof IMAGE_KEYS];
  if (keyData) {
    return `/images/placeholders/${keyData.category}-placeholder.jpg`;
  }
  
  return '/images/placeholders/default-placeholder.jpg';
}

// Získání URL produktového obrázku
export function getProductImageUrl(productId: string, fallback?: string): string {
  const key = `product_${productId}`;
  const image = getImage(key);
  
  if (image && image.url) {
    return image.url;
  }
  
  return fallback || '/images/placeholders/product-placeholder.svg';
}

// Uložení produktového obrázku
export function saveProductImage(productId: string, productName: string, imageUrl: string, metadata?: Partial<ImageData>): void {
  const key = `product_${productId}`;
  
  const imageData: ImageData = {
    url: imageUrl,
    category: 'product',
    productId: productId,
    title: `Produkt: ${productName}`,
    dimensions: metadata?.dimensions || '600x600',
    size: metadata?.size || 0,
    format: metadata?.format || 'jpg',
    uploadedAt: new Date().toISOString()
  };
  
  saveImage(key, imageData);
}

// Získání všech produktových obrázků
export function getProductImages(): [string, ImageData][] {
  const images = getImages();
  return Object.entries(images).filter(([key, data]) => 
    data.category === 'product' || key.startsWith('product_')
  );
}

// Inicializace výchozích obrázků (pro development)
export function initializeDefaultImages(): void {
  const images = getImages();
  
  // Pokud už jsou nějaké obrázky, neděláme nic
  if (Object.keys(images).length > 0) return;
  
  // Inicializace s placeholdery
  const defaults: ImagesDatabase = {};
  
  Object.entries(IMAGE_KEYS).forEach(([key, data]) => {
    defaults[key] = {
      url: `/images/placeholders/${data.category}-placeholder.jpg`,
      category: data.category,
      page: data.page,
      title: data.title,
      dimensions: IMAGE_SPECS[data.category].dimensions,
      size: 0,
      format: 'jpg',
      uploadedAt: new Date().toISOString()
    };
  });
  
  saveImages(defaults);
}

// Validace nahraného obrázku
export function validateImage(file: File, category: ImageCategory): { valid: boolean; error?: string } {
  const specs = IMAGE_SPECS[category];
  
  // Kontrola typu
  const validFormats = specs.formats.map(f => `image/${f === 'jpg' ? 'jpeg' : f}`);
  if (!validFormats.includes(file.type)) {
    return { 
      valid: false, 
      error: `Neplatný formát. Podporované formáty: ${specs.formats.join(', ').toUpperCase()}` 
    };
  }
  
  // Kontrola velikosti
  if (file.size > specs.maxSize) {
    const maxMB = (specs.maxSize / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `Soubor je příliš velký. Maximální velikost: ${maxMB} MB` 
    };
  }
  
  return { valid: true };
}

// Formátování velikosti souboru
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
