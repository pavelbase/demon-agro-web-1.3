export type TypPudy = 'lehka' | 'stredni' | 'tezka';
export type CilovePH = 'ekonomicke' | 'optimalni';
export type Hodnoceni = 'nizky' | 'vyhovujici' | 'dobry' | 'vysoky' | 'velmiVysoky';

export interface KalkulackaInputs {
  // Základní údaje
  plocha: number;
  typPudy: TypPudy;
  cilovePH: CilovePH;
  
  // Rozbor půdy
  pH: number;
  P2O5: number;
  K2O: number;
  CaO: number;
  MgO: number;
  S: number;
  
  // Kontaktní údaje
  jmeno: string;
  firma?: string;
  email: string;
  telefon: string;
  souhlas: boolean;
}

export interface VysledekZiviny {
  aktualni: number;
  optimum: number;
  hodnoceni: Hodnoceni;
  hodnoceniText: string;
  deficit: number; // kg/ha
  deficitCelkem: number; // kg celkem
}

export interface VysledekKalkulace {
  // Vstupní data
  vstup: KalkulackaInputs;
  
  // Hodnocení pH
  hodnotenipH: string;
  
  // Vápnění
  potrebaVapneniTha: number; // t CaO/ha
  potrebaVapneniCelkem: number; // t CaO celkem
  upozorneniRozdelitDavku: boolean;
  maxDavka: number;
  
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
  plocha: number;
  typPudy: TypPudy;
  vysledek: VysledekKalkulace;
  kontaktovan: boolean;
  poznamka?: string;
}
