import {
  KalkulackaInputs,
  VysledekKalkulace,
  VysledekZiviny,
  TypPudy,
  Hodnoceni,
  UlozenaKalkulace
} from './kalkulace-types';

export type { UlozenaKalkulace };

// ============================================
// HODNOCENÍ pH
// ============================================

const hodnotenipHData = {
  'EK': { min: 0, max: 4.5, nazev: 'extrémně kyselá' },
  'SK': { min: 4.6, max: 5.0, nazev: 'silně kyselá' },
  'K': { min: 5.1, max: 5.5, nazev: 'kyselá' },
  'sK': { min: 5.6, max: 6.5, nazev: 'slabě kyselá' },
  'N': { min: 6.6, max: 7.2, nazev: 'neutrální' },
  'A': { min: 7.3, max: 7.7, nazev: 'alkalická' },
  'SA': { min: 7.8, max: 14, nazev: 'silně alkalická' }
};

function hodnotitPH(pH: number): string {
  for (const [key, value] of Object.entries(hodnotenipHData)) {
    if (pH >= value.min && pH <= value.max) {
      return value.nazev;
    }
  }
  return 'neutrální';
}

// ============================================
// POTŘEBA VÁPNĚNÍ
// ============================================

const potrebaVapneniData = {
  lehka: {
    'do4.5': [1.2, 1.5],
    '4.6-5.0': [0.8, 1.0],
    '5.1-5.5': [0.6, 0.8],
    '5.6-5.7': [0.3, 0.4],
    '5.8-6.2': [0, 0.2],
    'nad6.2': [0, 0]
  },
  stredni: {
    'do4.5': [1.5, 2.0],
    '4.6-5.0': [1.0, 1.3],
    '5.1-5.5': [0.7, 0.9],
    '5.6-6.0': [0.4, 0.5],
    '6.1-6.5': [0, 0.25],
    'nad6.5': [0, 0]
  },
  tezka: {
    'do4.5': [1.7, 2.5],
    '4.6-5.0': [1.25, 1.6],
    '5.1-5.5': [0.85, 1.1],
    '5.6-6.0': [0.5, 0.65],
    '6.1-6.5': [0, 0.3],
    '6.6-6.7': [0, 0.15],
    'nad6.7': [0, 0]
  }
};

const maxDavkaVapna = {
  lehka: 1.0,
  stredni: 1.5,
  tezka: 2.0
};

function vypocetVapneni(pH: number, typPudy: TypPudy, cilovePH: string): {
  potrebaTha: number;
  maxDavka: number;
  upozorneni: boolean;
} {
  const data: any = potrebaVapneniData[typPudy];
  const index = cilovePH === 'optimalni' ? 1 : 0;
  let potreba = 0;

  if (typPudy === 'lehka') {
    if (pH <= 4.5) potreba = data['do4.5'][index];
    else if (pH <= 5.0) potreba = data['4.6-5.0'][index];
    else if (pH <= 5.5) potreba = data['5.1-5.5'][index];
    else if (pH <= 5.7) potreba = data['5.6-5.7'][index];
    else if (pH <= 6.2) potreba = data['5.8-6.2'][index];
    else potreba = data['nad6.2'][index];
  } else if (typPudy === 'stredni') {
    if (pH <= 4.5) potreba = data['do4.5'][index];
    else if (pH <= 5.0) potreba = data['4.6-5.0'][index];
    else if (pH <= 5.5) potreba = data['5.1-5.5'][index];
    else if (pH <= 6.0) potreba = data['5.6-6.0'][index];
    else if (pH <= 6.5) potreba = data['6.1-6.5'][index];
    else potreba = data['nad6.5'][index];
  } else { // tezka
    if (pH <= 4.5) potreba = data['do4.5'][index];
    else if (pH <= 5.0) potreba = data['4.6-5.0'][index];
    else if (pH <= 5.5) potreba = data['5.1-5.5'][index];
    else if (pH <= 6.0) potreba = data['5.6-6.0'][index];
    else if (pH <= 6.5) potreba = data['6.1-6.5'][index];
    else if (pH <= 6.7) potreba = data['6.6-6.7'][index];
    else potreba = data['nad6.7'][index];
  }

  const maxDavka = maxDavkaVapna[typPudy];
  const upozorneni = potreba > maxDavka;

  return {
    potrebaTha: potreba,
    maxDavka,
    upozorneni
  };
}

// ============================================
// HODNOCENÍ ŽIVIN
// ============================================

const hodnoceniFosfor = {
  lehka: { nizky: 50, vyhovujici: 80, dobry: 115, vysoky: 185 },
  stredni: { nizky: 55, vyhovujici: 85, dobry: 125, vysoky: 200 },
  tezka: { nizky: 60, vyhovujici: 95, dobry: 140, vysoky: 220 }
};

const hodnoceniDraslik = {
  lehka: { nizky: 100, vyhovujici: 160, dobry: 230, vysoky: 350 },
  stredni: { nizky: 105, vyhovujici: 170, dobry: 250, vysoky: 380 },
  tezka: { nizky: 170, vyhovujici: 260, dobry: 370, vysoky: 520 }
};

const hodnoceniHorcik = {
  lehka: { nizky: 80, vyhovujici: 135, dobry: 200, vysoky: 300 },
  stredni: { nizky: 105, vyhovujici: 160, dobry: 240, vysoky: 350 },
  tezka: { nizky: 120, vyhovujici: 220, dobry: 310, vysoky: 400 }
};

const hodnoceniVapnik = {
  lehka: { nizky: 1100, vyhovujici: 1800, dobry: 2800, vysoky: 4500 },
  stredni: { nizky: 1500, vyhovujici: 2500, dobry: 4000, vysoky: 6000 },
  tezka: { nizky: 2000, vyhovujici: 3200, dobry: 5000, vysoky: 7500 }
};

const hodnoceniSira = {
  nizky: 10,
  vyhovujici: 15,
  dobry: 25,
  vysoky: 40
};

function hodnotitZivinuPudu(hodnota: number, limity: any): Hodnoceni {
  if (hodnota <= limity.nizky) return 'nizky';
  if (hodnota <= limity.vyhovujici) return 'vyhovujici';
  if (hodnota <= limity.dobry) return 'dobry';
  if (hodnota <= limity.vysoky) return 'vysoky';
  return 'velmiVysoky';
}

function hodnotitSiru(hodnota: number): Hodnoceni {
  if (hodnota <= hodnoceniSira.nizky) return 'nizky';
  if (hodnota <= hodnoceniSira.vyhovujici) return 'vyhovujici';
  if (hodnota <= hodnoceniSira.dobry) return 'dobry';
  if (hodnota <= hodnoceniSira.vysoky) return 'vysoky';
  return 'velmiVysoky';
}

const hodnoceniTexty: Record<Hodnoceni, string> = {
  nizky: 'Nízký - doporučeno hnojení',
  vyhovujici: 'Vyhovující',
  dobry: 'Dobrý - optimální',
  vysoky: 'Vysoký',
  velmiVysoky: 'Velmi vysoký'
};

// ============================================
// OPTIMÁLNÍ HODNOTY
// ============================================

const optimalniHodnoty = {
  lehka: { P: 95, K: 195, Mg: 165, Ca: 2300, S: 20 },
  stredni: { P: 105, K: 210, Mg: 200, Ca: 3250, S: 20 },
  tezka: { P: 115, K: 315, Mg: 265, Ca: 4100, S: 20 }
};

function vypocetDeficitu(aktualni: number, optimum: number): number {
  const deficit = (optimum - aktualni) * 3;
  return deficit > 0 ? Math.round(deficit) : 0;
}

// ============================================
// POMĚR K:Mg
// ============================================

function hodnotitPomerKMg(pomer: number): string {
  if (pomer < 1.0) return 'Nedostatek draslíku - potřeba hnojení K';
  if (pomer <= 1.6) return 'Dobrý poměr - bez problémů s Mg';
  if (pomer <= 3.2) return 'Opatrně s K u krmných plodin';
  return 'Nevyhovující - riziko blokace Mg';
}

// ============================================
// HLAVNÍ FUNKCE PRO VÝPOČET
// ============================================

export function vypocetKalkulace(vstup: KalkulackaInputs): VysledekKalkulace {
  const { typPudy, pH, P2O5, K2O, CaO, MgO, S, plocha, cilovePH } = vstup;

  // Hodnocení pH
  const hodnocenipH = hodnotitPH(pH);

  // Výpočet vápnění
  const vapneni = vypocetVapneni(pH, typPudy, cilovePH);

  // Optimální hodnoty pro daný typ půdy
  const optim = optimalniHodnoty[typPudy];

  // Hodnocení a deficit jednotlivých živin
  const limityP = hodnoceniFosfor[typPudy];
  const limityK = hodnoceniDraslik[typPudy];
  const limityMg = hodnoceniHorcik[typPudy];
  const limityCa = hodnoceniVapnik[typPudy];

  const hodnoceniP = hodnotitZivinuPudu(P2O5, limityP);
  const hodnoceniK = hodnotitZivinuPudu(K2O, limityK);
  const hodnoceniMg = hodnotitZivinuPudu(MgO, limityMg);
  const hodnoceniCa = hodnotitZivinuPudu(CaO, limityCa);
  const hodnoceniS = hodnotitSiru(S);

  const deficitP = vypocetDeficitu(P2O5, optim.P);
  const deficitK = vypocetDeficitu(K2O, optim.K);
  const deficitMg = vypocetDeficitu(MgO, optim.Mg);
  const deficitCa = vypocetDeficitu(CaO, optim.Ca);
  const deficitS = vypocetDeficitu(S, optim.S);

  // Poměr K:Mg
  const pomerKMg = K2O / MgO;
  const hodnoceniPomeru = hodnotitPomerKMg(pomerKMg);

  const vysledek: VysledekKalkulace = {
    vstup,
    hodnotenipH: hodnocenipH,
    potrebaVapneniTha: vapneni.potrebaTha,
    potrebaVapneniCelkem: Math.round(vapneni.potrebaTha * plocha * 10) / 10,
    upozorneniRozdelitDavku: vapneni.upozorneni,
    maxDavka: vapneni.maxDavka,
    ziviny: {
      P: {
        aktualni: P2O5,
        optimum: optim.P,
        hodnoceni: hodnoceniP,
        hodnoceniText: hodnoceniTexty[hodnoceniP],
        deficit: deficitP,
        deficitCelkem: Math.round(deficitP * plocha)
      },
      K: {
        aktualni: K2O,
        optimum: optim.K,
        hodnoceni: hodnoceniK,
        hodnoceniText: hodnoceniTexty[hodnoceniK],
        deficit: deficitK,
        deficitCelkem: Math.round(deficitK * plocha)
      },
      Mg: {
        aktualni: MgO,
        optimum: optim.Mg,
        hodnoceni: hodnoceniMg,
        hodnoceniText: hodnoceniTexty[hodnoceniMg],
        deficit: deficitMg,
        deficitCelkem: Math.round(deficitMg * plocha)
      },
      Ca: {
        aktualni: CaO,
        optimum: optim.Ca,
        hodnoceni: hodnoceniCa,
        hodnoceniText: hodnoceniTexty[hodnoceniCa],
        deficit: deficitCa,
        deficitCelkem: Math.round(deficitCa * plocha)
      },
      S: {
        aktualni: S,
        optimum: optim.S,
        hodnoceni: hodnoceniS,
        hodnoceniText: hodnoceniTexty[hodnoceniS],
        deficit: deficitS,
        deficitCelkem: Math.round(deficitS * plocha)
      }
    },
    pomerKMg: Math.round(pomerKMg * 100) / 100,
    hodnoceniPomeru,
    id: `kal-${Date.now()}`,
    datum: new Date().toISOString()
  };

  return vysledek;
}

// ============================================
// UKLÁDÁNÍ KALKULACÍ
// ============================================

export function ulozitKalkulaci(vysledek: VysledekKalkulace): void {
  if (typeof window === 'undefined') return;

  const kalkulace: UlozenaKalkulace = {
    id: vysledek.id,
    datum: vysledek.datum,
    jmeno: vysledek.vstup.jmeno,
    firma: vysledek.vstup.firma,
    email: vysledek.vstup.email,
    telefon: vysledek.vstup.telefon,
    plocha: vysledek.vstup.plocha,
    typPudy: vysledek.vstup.typPudy,
    vysledek,
    kontaktovan: false
  };

  const existujici = getKalkulace();
  existujici.unshift(kalkulace);
  localStorage.setItem('kalkulace', JSON.stringify(existujici));
}

export function getKalkulace(): UlozenaKalkulace[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('kalkulace');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function getKalkulaceById(id: string): UlozenaKalkulace | null {
  const kalkulace = getKalkulace();
  return kalkulace.find(k => k.id === id) || null;
}

export function updateKalkulace(id: string, updates: Partial<UlozenaKalkulace>): void {
  if (typeof window === 'undefined') return;

  const kalkulace = getKalkulace();
  const index = kalkulace.findIndex(k => k.id === id);
  
  if (index !== -1) {
    kalkulace[index] = { ...kalkulace[index], ...updates };
    localStorage.setItem('kalkulace', JSON.stringify(kalkulace));
  }
}

export function deleteKalkulace(id: string): void {
  if (typeof window === 'undefined') return;

  const kalkulace = getKalkulace();
  const filtered = kalkulace.filter(k => k.id !== id);
  localStorage.setItem('kalkulace', JSON.stringify(filtered));
}
