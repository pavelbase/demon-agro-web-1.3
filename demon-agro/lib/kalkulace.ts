import {
  KalkulackaInputs,
  VysledekKalkulace,
  VysledekVapneni,
  VysledekZiviny,
  TypPudy,
  PhTrida,
  TridaZasobenosti,
  UlozenaKalkulace
} from './kalkulace-types';

export type { UlozenaKalkulace };

// ============================================
// TYPY PŮD - ČESKÁ METODIKA (ÚKZÚZ)
// ============================================
// Standardní české označení půd (sjednoceno s portálem):
// L = Lehká (písčitá)
// S = Střední (hlinitá)
// T = Těžká (jílovitá)

const typyPudy = {
  'L': {
    nazev: 'Lehká (písčitá)',
    popis: 'Lehké půdy s nízkým obsahem jílu',
    targetPhOrna: 6.0,
    targetPhTTP: 5.5
  },
  'S': {
    nazev: 'Střední (hlinitá)',
    popis: 'Střední půdy, nejběžnější typ v ČR',
    targetPhOrna: 6.5,
    targetPhTTP: 6.0
  },
  'T': {
    nazev: 'Těžká (jílovitá)',
    popis: 'Těžké půdy s vysokým obsahem jílu',
    targetPhOrna: 6.8,
    targetPhTTP: 6.3
  }
};

// ============================================
// pH KATEGORIE - ČESKÁ METODIKA (ÚKZÚZ)
// ============================================

const phTridyPopis = {
  A: { nazev: 'extrémně nízké', popis: 'Urgentní vápnění nutné' },
  B: { nazev: 'velmi nízké', popis: 'Intenzivní vápnění doporučeno' },
  C: { nazev: 'optimální', popis: 'Udržovací vápnění' },
  D: { nazev: 'mírně vysoké', popis: 'Vápnění není nutné' },
  E: { nazev: 'vysoké', popis: 'Bez vápnění' }
};

// Jednotná kategorizace pH pro všechny půdy (česká metodika)
function urcitPhTridu(pH: number, typPudy: TypPudy): PhTrida {
  const targetPh = typyPudy[typPudy].targetPhOrna;
  
  // A: extrémně kyselá (< 4.5) - urgentní vápnění
  if (pH < 4.5) return 'A';
  
  // B: silně kyselá - intenzivní vápnění nutné
  // Buď absolutně nízké pH (< 5.5) NEBO více než 0.5 pod cílovým pH
  if (pH < 5.5 || pH < targetPh - 0.5) return 'B';
  
  // C: optimální (v rozmezí cíl ± 0.3)
  if (pH >= targetPh - 0.3 && pH <= targetPh + 0.3) return 'C';
  
  // D: mírně nad optimem (0.3 - 0.8 nad cílem)
  if (pH > targetPh + 0.3 && pH <= targetPh + 0.8) return 'D';
  
  // E: nad optimem (více než 0.8 nad cílem)
  if (pH > targetPh + 0.8) return 'E';
  
  // Fallback: pokud jsme mezi B a C (targetPh - 0.5 až targetPh - 0.3)
  // = udržovací vápnění
  return 'B';
}

// ============================================
// ENV (EFFECTIVE NEUTRALIZING VALUE)
// ============================================
// MgO má 1.39x vyšší neutralizační schopnost než CaO
const MGO_NEUTRALIZING_FACTOR = 1.39;

function getENV(caoContent: number, mgoContent: number): number {
  // Vrací efektivní CaO ekvivalent (např. 0.55 pro Dolomit)
  return caoContent + (mgoContent * MGO_NEUTRALIZING_FACTOR);
}

// Standardní produkty pro kalkulačku
const PRODUKTY = {
  dolomit: {
    nazev: 'Dolomitický vápenec',
    cao: 0.30,   // 30% CaO
    mgo: 0.18,   // 18% MgO
    env: 0.30 + (0.18 * 1.39) // = 0.5502
  },
  vapenec: {
    nazev: 'Vápenec mletý',
    cao: 0.48,   // 48% CaO
    mgo: 0.00,   // 0% MgO
    env: 0.48
  }
};

// Práh pro Smart Product Selection (shodný s portálem)
const MG_OPTIMAL_LIMIT = 140; // mg/kg

// ============================================
// POTŘEBA VÁPNĚNÍ - ČESKÁ METODIKA (ÚKZÚZ)
// ============================================
// Zdroj: ÚKZÚZ Metodický pokyn č. 01/AZZP
// Hodnoty v t CaO/ha/rok (roční normativ)
// Pro celkovou orientační potřebu násobíme období nápravy (typicky 4 roky)

const LIME_NEED_TABLE_CAO_YEARLY: Record<TypPudy, Record<string, number>> = {
  L: { // Lehká půda - Orná
    '4.0': 1.20,  // t CaO/ha/rok
    '4.5': 1.20,
    '5.0': 0.80,
    '5.5': 0.60,
    '6.0': 0.30,
    '6.5': 0,
  },
  S: { // Střední půda - Orná (hlinita)
    '4.0': 1.50,
    '4.5': 1.50,
    '5.0': 1.00,
    '5.5': 0.70,
    '6.0': 0.40,
    '6.5': 0.20,
  },
  T: { // Těžká půda - Orná (jilovitohlinita)
    '4.0': 1.70,
    '4.5': 1.70,
    '5.0': 1.25,
    '5.5': 0.85,
    '6.0': 0.50,
    '6.5': 0.25,
  },
};

// Maximální jednorázová dávka (t CaO/ha) - z portálové metodiky ÚKZÚZ
const MAX_SINGLE_APPLICATION: Record<TypPudy, number> = {
  L: 1.5,   // Lehká půda - max 1.5 t CaO/ha
  S: 3.0,   // Střední půda - max 3.0 t CaO/ha (hlinita)
  T: 5.0,   // Těžká půda - max 5.0 t CaO/ha (jilovitohlinita)
};

function interpolujHodnotu(tabulka: Record<string, number>, pH: number): number {
  const phZaokrouhlene = Math.round(pH * 10) / 10;
  
  // Přímá hodnota v tabulce
  const exactKey = phZaokrouhlene.toFixed(1);
  if (tabulka[exactKey] !== undefined) {
    return tabulka[exactKey];
  }
  
  // Interpolace mezi dvěma nejbližšími hodnotami
  const klice = Object.keys(tabulka).map(Number).sort((a, b) => a - b);
  const nizsi = klice.filter(k => k <= phZaokrouhlene).pop();
  const vyssi = klice.filter(k => k > phZaokrouhlene).shift();
  
  if (nizsi === undefined) return tabulka[klice[0].toFixed(1)];
  if (vyssi === undefined) return tabulka[klice[klice.length - 1].toFixed(1)];
  
  // Lineární interpolace
  const pomer = (phZaokrouhlene - nizsi) / (vyssi - nizsi);
  const hodnota = tabulka[nizsi.toFixed(1)] + pomer * (tabulka[vyssi.toFixed(1)] - tabulka[nizsi.toFixed(1)]);
  return hodnota;
}

function getPotrebaVapneni(typPudy: TypPudy, pH: number): number {
  const tabulka = LIME_NEED_TABLE_CAO_YEARLY[typPudy];
  
  // Pokud je pH nad cílovým, není vápnění potřeba
  const targetPh = typyPudy[typPudy].targetPhOrna;
  if (pH >= targetPh + 0.2) return 0; // Tolerance +0.2
  
  // Získej roční normativ (t CaO/ha/rok)
  const rocniNormativ = interpolujHodnotu(tabulka, pH);
  
  // Pro orientační odhad celkové potřeby násobíme 4 roky
  // (kratší období než portálový 6letý plán, ale dostatečné pro nápravu)
  const rokyNapravy = 4;
  const celkovaPotrebaCaO_t = rocniNormativ * rokyNapravy;
  
  return celkovaPotrebaCaO_t;
}

// Optimální pH rozmezí pro jednotlivé typy půd (orná půda)
const optimalniPhRozmezi: Record<TypPudy, string> = {
  'L': '5.7 - 6.3',
  'S': '6.2 - 6.8',
  'T': '6.5 - 7.1'
};

function vypocetVapneni(pH: number, typPudy: TypPudy, currentMg: number): VysledekVapneni {
  const targetPh = typyPudy[typPudy].targetPhOrna;
  
  // 1. Získej celkovou potřebu CaO (už v t CaO/ha)
  const potrebaCaO_t = getPotrebaVapneni(typPudy, pH);
  
  // 2. Zkontroluj maximální jednorázovou dávku CaO
  const maxDavka_t = MAX_SINGLE_APPLICATION[typPudy];
  
  // 3. Vypočti počet aplikací
  const pocetAplikaci = potrebaCaO_t > 0 ? Math.ceil(potrebaCaO_t / maxDavka_t) : 0;
  const davkaNaAplikaci_t = pocetAplikaci > 1 ? maxDavka_t : potrebaCaO_t;
  
  // 4. Urči pH třídu
  const phTrida = urcitPhTridu(pH, typPudy);
  const phInfo = phTridyPopis[phTrida];
  
  // ============================================
  // 5. SMART PRODUCT SELECTION (podle Mg v půdě)
  // ============================================
  let doporucenyProdukt: 'dolomit' | 'vapenec';
  let duvod: string;
  
  if (currentMg >= MG_OPTIMAL_LIMIT) {
    // Mg je dostatečné → použij čistý vápenec (bez MgO)
    doporucenyProdukt = 'vapenec';
    duvod = `Mg v půdě je dostatečné (${currentMg} mg/kg ≥ ${MG_OPTIMAL_LIMIT} mg/kg). Doporučujeme čistý vápenec bez MgO.`;
  } else {
    // Mg je nedostatečné → použij dolomit (s MgO)
    doporucenyProdukt = 'dolomit';
    duvod = `Mg v půdě je nízké (${currentMg} mg/kg < ${MG_OPTIMAL_LIMIT} mg/kg). Doporučujeme dolomit pro doplnění Mg.`;
  }
  
  // ============================================
  // 6. PŘEPOČET NA PRODUKTY (s ENV)
  // ============================================
  // Dolomit: Dávka = potřeba CaO / ENV(30% CaO + 18% MgO)
  const dolomitDavka_t = potrebaCaO_t / PRODUKTY.dolomit.env;
  
  // Vápenec: Dávka = potřeba CaO / ENV(48% CaO + 0% MgO)
  const vapenecDavka_t = potrebaCaO_t / PRODUKTY.vapenec.env;
  
  return {
    celkovaPotrebaCaO_t: Math.round(potrebaCaO_t * 10) / 10,
    celkovaPotrebaCaO_dt: Math.round(potrebaCaO_t * 100) / 10, // t → dt
    maxJednorazovaDavka_t: Math.round(maxDavka_t * 10) / 10,
    pocetAplikaci,
    davkaNaAplikaci_t: Math.round(davkaNaAplikaci_t * 10) / 10,
    doporucenyInterval: pocetAplikaci > 1 ? '3 roky mezi aplikacemi' : null,
    phTrida,
    phTridaNazev: phInfo.nazev,
    phTridaPopis: phInfo.popis,
    potrebaVapneni: potrebaCaO_t > 0,
    optimalniPhRozmezi: optimalniPhRozmezi[typPudy],
    doporucenyProdukt,
    duvod,
    prepocetyHnojiva: {
      dolomit_t: Math.round(dolomitDavka_t * 100) / 100,
      vapenec_t: Math.round(vapenecDavka_t * 100) / 100,
      mletyVapenec_t: Math.round(vapenecDavka_t * 10) / 10 // DEPRECATED: pro zpětnou kompatibilitu
    }
  };
}

// ============================================
// HODNOCENÍ ŽIVIN - ČESKÁ METODIKA (MEHLICH 3)
// ============================================
// Zdroj: ÚKZÚZ, Vyhláška 335/2017 Sb.

// Sjednoceno s portálem - kategorie živin
const tridyZasobenosti = {
  nizky: { nazev: 'Nízký', barva: '#EF4444', akce: 'vysoká dávka nutná' },
  vyhovujici: { nazev: 'Vyhovující', barva: '#F59E0B', akce: 'zvýšená dávka' },
  dobry: { nazev: 'Dobrý', barva: '#10B981', akce: 'udržovací dávka' },
  vysoky: { nazev: 'Vysoký', barva: '#3B82F6', akce: 'snížená dávka' },
  velmi_vysoky: { nazev: 'Velmi vysoký', barva: '#8B5CF6', akce: 'omezit hnojení' }
};

// Fosfor (P) - podle typu půdy (Mehlich 3)
const hodnoceniFosfor: Record<TypPudy, Array<{ trida: TridaZasobenosti; max?: number; min?: number }>> = {
  'L': [
    { trida: 'nizky', max: 50 },
    { trida: 'vyhovujici', min: 51, max: 80 },
    { trida: 'dobry', min: 81, max: 125 },
    { trida: 'vysoky', min: 126, max: 170 },
    { trida: 'velmi_vysoky', min: 171 }
  ],
  'S': [
    { trida: 'nizky', max: 100 },
    { trida: 'vyhovujici', min: 101, max: 160 },
    { trida: 'dobry', min: 161, max: 250 },
    { trida: 'vysoky', min: 251, max: 350 },
    { trida: 'velmi_vysoky', min: 351 }
  ],
  'T': [
    { trida: 'nizky', max: 105 },
    { trida: 'vyhovujici', min: 106, max: 170 },
    { trida: 'dobry', min: 171, max: 300 },
    { trida: 'vysoky', min: 301, max: 450 },
    { trida: 'velmi_vysoky', min: 451 }
  ]
};

// Draslík (K) - podle typu půdy (Mehlich 3)
const hodnoceniDraslik: Record<TypPudy, Array<{ trida: TridaZasobenosti; max?: number; min?: number }>> = {
  'L': [
    { trida: 'nizky', max: 80 },
    { trida: 'vyhovujici', min: 81, max: 135 },
    { trida: 'dobry', min: 136, max: 200 },
    { trida: 'vysoky', min: 201, max: 300 },
    { trida: 'velmi_vysoky', min: 301 }
  ],
  'S': [
    { trida: 'nizky', max: 105 },
    { trida: 'vyhovujici', min: 106, max: 160 },
    { trida: 'dobry', min: 161, max: 250 },
    { trida: 'vysoky', min: 251, max: 380 },
    { trida: 'velmi_vysoky', min: 381 }
  ],
  'T': [
    { trida: 'nizky', max: 170 },
    { trida: 'vyhovujici', min: 171, max: 260 },
    { trida: 'dobry', min: 261, max: 400 },
    { trida: 'vysoky', min: 401, max: 600 },
    { trida: 'velmi_vysoky', min: 601 }
  ]
};

// Hořčík (Mg) - podle typu půdy (Mehlich 3)
const hodnoceniHorcik: Record<TypPudy, Array<{ trida: TridaZasobenosti; max?: number; min?: number }>> = {
  'L': [
    { trida: 'nizky', max: 80 },
    { trida: 'vyhovujici', min: 81, max: 135 },
    { trida: 'dobry', min: 136, max: 200 },
    { trida: 'vysoky', min: 201, max: 300 },
    { trida: 'velmi_vysoky', min: 301 }
  ],
  'S': [
    { trida: 'nizky', max: 105 },
    { trida: 'vyhovujici', min: 106, max: 160 },
    { trida: 'dobry', min: 161, max: 250 },
    { trida: 'vysoky', min: 251, max: 380 },
    { trida: 'velmi_vysoky', min: 381 }
  ],
  'T': [
    { trida: 'nizky', max: 120 },
    { trida: 'vyhovujici', min: 121, max: 220 },
    { trida: 'dobry', min: 221, max: 350 },
    { trida: 'vysoky', min: 351, max: 550 },
    { trida: 'velmi_vysoky', min: 551 }
  ]
};

// Vápník (Ca) - jednotná škála pro všechny půdy (Mehlich 3)
const hodnoceniVapnik = [
  { trida: 'nizky' as TridaZasobenosti, max: 1499 },
  { trida: 'vyhovujici' as TridaZasobenosti, min: 1500, max: 2500 },
  { trida: 'dobry' as TridaZasobenosti, min: 2501, max: 4000 },
  { trida: 'vysoky' as TridaZasobenosti, min: 4001, max: 6000 },
  { trida: 'velmi_vysoky' as TridaZasobenosti, min: 6001 }
];

// Síra (S) - jednotná škála pro všechny půdy (Mehlich 3)
const hodnoceniSira = [
  { trida: 'nizky' as TridaZasobenosti, max: 9 },
  { trida: 'vyhovujici' as TridaZasobenosti, min: 10, max: 14 },
  { trida: 'dobry' as TridaZasobenosti, min: 15, max: 24 },
  { trida: 'vysoky' as TridaZasobenosti, min: 25, max: 39 },
  { trida: 'velmi_vysoky' as TridaZasobenosti, min: 40 }
];

function hodnotitZivinu(
  hodnota: number, 
  tabulka: Array<{ trida: TridaZasobenosti; min?: number; max?: number }>
): TridaZasobenosti {
  for (const zaznam of tabulka) {
    if (zaznam.max !== undefined && zaznam.min === undefined && hodnota <= zaznam.max) {
      return zaznam.trida;
    }
    if (zaznam.min !== undefined && zaznam.max !== undefined && hodnota >= zaznam.min && hodnota <= zaznam.max) {
      return zaznam.trida;
    }
    if (zaznam.min !== undefined && zaznam.max === undefined && hodnota >= zaznam.min) {
      return zaznam.trida;
    }
  }
  return 'dobry'; // Výchozí hodnota - dobrý stav
}

// Výpočet deficitu - střed třídy C je cíl (česká metodika)
const stredTridyC: Record<string, Record<TypPudy, number>> = {
  'P': { 
    'L': 103,   // střed 81-125
    'S': 205,   // střed 161-250
    'T': 235    // střed 171-300
  },
  'K': { 
    'L': 168,   // střed 136-200
    'S': 205,   // střed 161-250
    'T': 330    // střed 261-400
  },
  'Mg': { 
    'L': 168,   // střed 136-200
    'S': 205,   // střed 161-250
    'T': 285    // střed 221-350
  },
  'Ca': { 
    'L': 3250,  // střed pro všechny půdy
    'S': 3250,
    'T': 3250
  },
  'S': { 
    'L': 20,    // střed 15-24
    'S': 20,
    'T': 20
  }
};

function vypocetDeficitu(aktualni: number, zivina: string, typPudy: TypPudy): number | null {
  const stred = stredTridyC[zivina]?.[typPudy] || 0;
  
  if (aktualni >= stred) return null;
  
  // Deficit v kg/ha: (cíl - aktuální) × koeficient
  // Koeficient 4.2 odpovídá ornici 30 cm, objemové hmotnosti 1.4 g/cm³
  const deficit = (stred - aktualni) * 4.2;
  return Math.round(deficit);
}

// Poměr K:Mg - dle české agronomické praxe
function hodnotitPomerKMg(pomer: number): { kategorie: string; popis: string; barva: string } {
  if (pomer < 1.5) {
    return {
      kategorie: 'nizky',
      popis: 'Poměr K:Mg je příliš nízký - doporučujeme snížit dávky hořčíku',
      barva: '#F59E0B' // oranžová
    };
  }
  if (pomer <= 2.5) {
    return {
      kategorie: 'optimalni',
      popis: 'Poměr K:Mg je v optimálním rozmezí (1.5-2.5)',
      barva: '#10B981' // zelená
    };
  }
  return {
    kategorie: 'vysoky',
    popis: 'Poměr K:Mg je příliš vysoký - doporučujeme dolomitický vápenec nebo zvýšit dávky hořčíku',
    barva: '#EF4444' // červená
  };
}

// ============================================
// HLAVNÍ FUNKCE PRO VÝPOČET
// ============================================

export function vypocetKalkulace(vstup: KalkulackaInputs): VysledekKalkulace {
  const { typPudy, pH, P, K, Mg, Ca, S } = vstup;

  // Výpočet vápnění (s ENV a Smart Product Selection)
  const vapneni = vypocetVapneni(pH, typPudy, Mg);

  // Hodnocení živin podle typu půdy
  const tridaP = hodnotitZivinu(P, hodnoceniFosfor[typPudy]);
  const tridaK = hodnotitZivinu(K, hodnoceniDraslik[typPudy]);
  const tridaMg = hodnotitZivinu(Mg, hodnoceniHorcik[typPudy]);
  const tridaCa = hodnotitZivinu(Ca, hodnoceniVapnik);
  const tridaS = hodnotitZivinu(S, hodnoceniSira);

  // Deficity
  const deficitP = vypocetDeficitu(P, 'P', typPudy);
  const deficitK = vypocetDeficitu(K, 'K', typPudy);
  const deficitMg = vypocetDeficitu(Mg, 'Mg', typPudy);
  const deficitCa = vypocetDeficitu(Ca, 'Ca', typPudy);
  const deficitS = vypocetDeficitu(S, 'S', typPudy);

  // Poměr K:Mg
  const pomerKMg = Mg > 0 ? Math.round((K / Mg) * 100) / 100 : 0;
  const hodnoceniKMg = hodnotitPomerKMg(pomerKMg);

  const vysledek: VysledekKalkulace = {
    vstup,
    humus: 'dle metodiky ÚKZÚZ', // informativní text
    vapneni,
    ziviny: {
      P: {
        aktualni: P,
        trida: tridaP,
        tridaNazev: tridyZasobenosti[tridaP].nazev,
        tridaBarva: tridyZasobenosti[tridaP].barva,
        tridaAkce: tridyZasobenosti[tridaP].akce,
        deficit_kg_ha: deficitP
      },
      K: {
        aktualni: K,
        trida: tridaK,
        tridaNazev: tridyZasobenosti[tridaK].nazev,
        tridaBarva: tridyZasobenosti[tridaK].barva,
        tridaAkce: tridyZasobenosti[tridaK].akce,
        deficit_kg_ha: deficitK
      },
      Mg: {
        aktualni: Mg,
        trida: tridaMg,
        tridaNazev: tridyZasobenosti[tridaMg].nazev,
        tridaBarva: tridyZasobenosti[tridaMg].barva,
        tridaAkce: tridyZasobenosti[tridaMg].akce,
        deficit_kg_ha: deficitMg
      },
      Ca: {
        aktualni: Ca,
        trida: tridaCa,
        tridaNazev: tridyZasobenosti[tridaCa].nazev,
        tridaBarva: tridyZasobenosti[tridaCa].barva,
        tridaAkce: tridyZasobenosti[tridaCa].akce,
        deficit_kg_ha: deficitCa
      },
      S: {
        aktualni: S,
        trida: tridaS,
        tridaNazev: tridyZasobenosti[tridaS].nazev,
        tridaBarva: tridyZasobenosti[tridaS].barva,
        tridaAkce: tridyZasobenosti[tridaS].akce,
        deficit_kg_ha: deficitS
      }
    },
    pomerKMg,
    hodnoceniPomeru: hodnoceniKMg.popis,
    pomerKMgKategorie: hodnoceniKMg.kategorie,
    pomerKMgBarva: hodnoceniKMg.barva,
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
    typPudy: vysledek.vstup.typPudy,
    vysledek,
    kontaktovan: false,
    marketing_consent: vysledek.vstup.souhlas
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

export function zkontrolujDuplicitniEmail(email: string): boolean {
  const kalkulace = getKalkulace();
  return kalkulace.some(k => k.email.toLowerCase() === email.toLowerCase());
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
