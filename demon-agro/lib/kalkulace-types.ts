// Sjednocení s portálem - 3 typy půd podle české metodiky ÚKZÚZ
export type TypPudy = 'L' | 'S' | 'T';

// Kategorie pH - zachováváme A/B/C/D/E pro jednoduchost v kalkulačce
export type PhTrida = 'A' | 'B' | 'C' | 'D' | 'E';

// Kategorie živin - sjednoceno s portálem
export type TridaZasobenosti = 'nizky' | 'vyhovujici' | 'dobry' | 'vysoky' | 'velmi_vysoky';

export interface KalkulackaInputs {
  // Základní údaje (BEZ plochy - pouze na hektar)
  typPudy: TypPudy;
  
  // Rozbor půdy (mg/kg - standardní výstup AZZP)
  pH: number;
  P: number;   // fosfor mg/kg
  K: number;   // draslík mg/kg
  Mg: number;  // hořčík mg/kg
  Ca: number;  // vápník mg/kg
  S: number;   // síra mg/kg
  
  // Kontaktní údaje
  jmeno: string;
  firma?: string;
  email: string;
  telefon: string;
  souhlas: boolean; // toto teď bude znamenat marketingový souhlas (newsletter)
}

export interface VysledekVapneni {
  celkovaPotrebaCaO_t: number;      // celková potřeba v t/ha
  celkovaPotrebaCaO_dt: number;     // celková potřeba v dt/ha
  maxJednorazovaDavka_t: number;    // max. jednorázová dávka v t/ha
  pocetAplikaci: number;            // kolikrát je třeba aplikovat
  davkaNaAplikaci_t: number;        // kolik na jednu aplikaci v t/ha
  doporucenyInterval: string | null; // interval mezi aplikacemi
  phTrida: PhTrida;
  phTridaNazev: string;
  phTridaPopis: string;
  potrebaVapneni: boolean;
  optimalniPhRozmezi: string;       // cílové pH rozmezí pro daný typ půdy
  doporucenyProdukt: 'dolomit' | 'vapenec'; // Smart Product Selection podle Mg
  duvod: string;                    // Vysvětlení výběru produktu
  prepocetyHnojiva: {
    dolomit_t: number;              // Dolomit (30% CaO + 18% MgO) - s ENV
    vapenec_t: number;              // Vápenec mletý (48% CaO) - čistý
    mletyVapenec_t: number;         // DEPRECATED: zachováno pro zpětnou kompatibilitu
  };
}

export interface VysledekZiviny {
  aktualni: number;              // mg/kg
  trida: TridaZasobenosti;
  tridaNazev: string;
  tridaBarva: string;
  tridaAkce: string;
  deficit_kg_ha: number | null;  // kg/ha nebo null pokud není deficit
}

export interface VysledekKalkulace {
  // Vstupní data
  vstup: KalkulackaInputs;
  
  // Automaticky určený humus
  humus: string;
  
  // Vápnění
  vapneni: VysledekVapneni;
  
  // Živiny
  ziviny: {
    P: VysledekZiviny;
    K: VysledekZiviny;
    Mg: VysledekZiviny;
    Ca: VysledekZiviny;
    S: VysledekZiviny;
  };
  
  // Poměr K:Mg
  pomerKMg: number;
  hodnoceniPomeru: string;
  pomerKMgKategorie: string;
  pomerKMgBarva: string;
  
  // Metadata
  id: string;
  datum: string;
}

export interface UlozenaKalkulace {
  id: string;
  datum: string;
  jmeno: string;
  firma?: string;
  email: string;
  telefon: string;
  typPudy: TypPudy;
  vysledek: VysledekKalkulace;
  kontaktovan: boolean;
  marketing_consent: boolean;
  poznamka?: string;
}
