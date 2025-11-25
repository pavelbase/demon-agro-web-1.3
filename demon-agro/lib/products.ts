import { Product } from "./types";

export const defaultProducts: Product[] = [
  // pH produkty
  {
    id: "ph-1",
    nazev: "Vápenec mletý",
    popis: "Jemně mletý vápenec pro rychlou úpravu pH půdy. Ideální pro okamžitý efekt.",
    kategorie: "ph",
    dostupnost: true,
    technicke_parametry: {
      granulace: "0-0.5mm",
      obsah_CaO: "52%",
      reaktivita: "vysoká"
    },
    fotka_url: "/images/products/vapenec.jpg"
  },
  {
    id: "ph-2",
    nazev: "Dolomit",
    popis: "Kombinace vápníku a hořčíku pro dlouhodobou stabilizaci pH",
    kategorie: "ph",
    dostupnost: true,
    technicke_parametry: {
      granulace: "0-3mm",
      obsah_CaO: "30%",
      obsah_MgO: "18%"
    },
    fotka_url: "/images/products/dolomit.jpg"
  },
  {
    id: "ph-3",
    nazev: "Granulovaný vápenec",
    popis: "Snadná aplikace, rovnoměrné rozprostření po celém poli",
    kategorie: "ph",
    dostupnost: true,
    technicke_parametry: {
      granulace: "2-5mm",
      obsah_CaO: "50%",
      rozpustnost: "postupná"
    },
    fotka_url: "/images/products/granulat.jpg"
  },
  // Síra
  {
    id: "sira-1",
    nazev: "Síran vápenatý",
    popis: "Rychle dostupná síra pro okamžitý efekt. Obsahuje také vápník.",
    kategorie: "sira",
    dostupnost: true,
    technicke_parametry: {
      obsah_S: "18%",
      obsah_Ca: "24%",
      forma: "síran"
    },
    fotka_url: "/images/products/siran-ca.jpg"
  },
  {
    id: "sira-2",
    nazev: "Elementární síra",
    popis: "Dlouhodobé uvolňování síry. Ekonomické řešení.",
    kategorie: "sira",
    dostupnost: true,
    technicke_parametry: {
      obsah_S: "90%",
      forma: "elementární",
      uvolnovani: "postupné"
    },
    fotka_url: "/images/products/sira-elem.jpg"
  },
  // Draslík
  {
    id: "k-1",
    nazev: "Draselná sůl",
    popis: "Vysoký obsah draslíku pro maximální efekt",
    kategorie: "k",
    dostupnost: true,
    technicke_parametry: {
      obsah_K2O: "60%",
      forma: "chlorid"
    },
    fotka_url: "/images/products/draselna-sul.jpg"
  },
  {
    id: "k-2",
    nazev: "Síran draselný",
    popis: "Draslík + síra v jednom produktu. Ideální kombinace.",
    kategorie: "k",
    dostupnost: true,
    technicke_parametry: {
      obsah_K2O: "50%",
      obsah_S: "18%"
    },
    fotka_url: "/images/products/siran-k.jpg"
  },
  // Hořčík
  {
    id: "mg-1",
    nazev: "Síran hořečnatý",
    popis: "Rychle dostupný hořčík. Obsahuje také síru.",
    kategorie: "mg",
    dostupnost: true,
    technicke_parametry: {
      obsah_MgO: "16%",
      obsah_S: "13%",
      rozpustnost: "vysoká"
    },
    fotka_url: "/images/products/siran-mg.jpg"
  },
  {
    id: "mg-2",
    nazev: "Kieserit",
    popis: "Koncentrovaný hořčík s vysokým obsahem síry",
    kategorie: "mg",
    dostupnost: true,
    technicke_parametry: {
      obsah_MgO: "27%",
      obsah_S: "22%"
    },
    fotka_url: "/images/products/kieserit.jpg"
  },
  // Analýza
  {
    id: "analyza-1",
    nazev: "Komplexní rozbor půdy",
    popis: "Analýza pH, NPK, mikroelementů a organické hmoty. Kompletní přehled stavu půdy.",
    kategorie: "analyza",
    dostupnost: true,
    technicke_parametry: {
      zpracovani: "5-7 dní",
      parametry: "pH, N, P, K, Mg, Ca, S, mikroelementy"
    },
    fotka_url: "/images/products/rozbor.jpg"
  },
  {
    id: "analyza-2",
    nazev: "GPS mapování",
    popis: "Precizní mapa variability pH a živin v celém poli",
    kategorie: "analyza",
    dostupnost: true,
    technicke_parametry: {
      rozliseni: "1 vzorek/ha",
      technologie: "GPS RTK"
    },
    fotka_url: "/images/products/gps.jpg"
  },
  {
    id: "analyza-3",
    nazev: "Odběr vzorků",
    popis: "Odborný odběr půdních vzorků podle standardní metodiky",
    kategorie: "analyza",
    dostupnost: true,
    technicke_parametry: {
      hloubka: "0-30cm",
      metoda: "vrtákem"
    },
    fotka_url: "/images/products/odber.jpg"
  },
];

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return defaultProducts;
  
  const stored = localStorage.getItem('products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing products:', e);
      return defaultProducts;
    }
  }
  return defaultProducts;
}

export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('products', JSON.stringify(products));
}

export function getProductsByCategory(category: string): Product[] {
  const products = getProducts();
  return products.filter(p => p.kategorie === category && p.dostupnost);
}

export function resetProducts(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('products', JSON.stringify(defaultProducts));
}
