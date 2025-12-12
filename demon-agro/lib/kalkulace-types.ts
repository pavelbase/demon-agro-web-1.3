export type TypPudy = 'piscita' | 'hlinito_piscita' | 'hlinita' | 'jilovita';
export type PhTrida = 'A' | 'B' | 'C' | 'D' | 'E';
export type TridaZasobenosti = 'A' | 'B' | 'C' | 'D' | 'E';

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
  souhlas: boolean;
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
  prepocetyHnojiva: {
    mletyVapenec_t: number;         // 48% CaO
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
  poznamka?: string;
}
