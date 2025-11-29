import { ImageUrls } from "./types";

export const defaultImages: ImageUrls = {
  home_hero: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80",
  home_kroky_bg: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80",
  ph_hero: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80",
  ph_problem_img: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80",
  ph_dopad_bg: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=80",
  sira_hero: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80",
  sira_problem_img: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800&q=80",
  sira_dopad_bg: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80",
  k_hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
  k_problem_img: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80",
  k_dopad_bg: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80",
  mg_hero: "https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?w=1920&q=80",
  mg_problem_img: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800&q=80",
  mg_dopad_bg: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80",
  analyza_hero: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80",
  analyza_problem_img: "https://images.unsplash.com/photo-1582719366876-5c1c8f921f2d?w=800&q=80",
  analyza_dopad_bg: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1920&q=80",
  onas_hero: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80",
  onas_kdo_jsme_img: "https://images.unsplash.com/photo-1581093458791-9d42e4d6f4c3?w=800&q=80",
};

export function getImageUrl(key: keyof ImageUrls): string {
  if (typeof window === 'undefined') return defaultImages[key];
  
  const stored = localStorage.getItem('images');
  if (stored) {
    try {
      const images = JSON.parse(stored);
      return images[key] || defaultImages[key];
    } catch (e) {
      console.error('Error parsing images:', e);
      return defaultImages[key];
    }
  }
  return defaultImages[key];
}

export function getImages(): ImageUrls {
  if (typeof window === 'undefined') return defaultImages;
  
  const stored = localStorage.getItem('images');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing images:', e);
      return defaultImages;
    }
  }
  return defaultImages;
}

export function saveImages(images: ImageUrls): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('images', JSON.stringify(images));
}

export function resetImages(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('images', JSON.stringify(defaultImages));
}
