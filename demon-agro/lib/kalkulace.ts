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
// TYPY PŮD A HUMUS
// ============================================

const typyPudy = {
  'piscita': {
    nazev: 'Písčitá (lehká)',
    popis: 'Lehké půdy s nízkým obsahem jílu',
    vdlufa: 'S',
    typickyHumus: '<4'
  },
  'hlinito_piscita': {
    nazev: 'Hlinito-písčitá',
    popis: 'Přechodné půdy mezi lehkými a středními',
    vdlufa: 'lS',
    typickyHumus: '<4'
  },
  'hlinita': {
    nazev: 'Hlinitá (střední)',
    popis: 'Střední půdy, nejběžnější typ v ČR',
    vdlufa: 'sL_uL',
    typickyHumus: '<4'
  },
  'jilovita': {
    nazev: 'Jílovitá (těžká)',
    popis: 'Těžké půdy s vysokým obsahem jílu',
    vdlufa: 'tL_T',
    typickyHumus: '4-8'
  }
};

function getHumusPodleTypuPudy(typPudy: TypPudy): string {
  return typyPudy[typPudy]?.typickyHumus || '<4';
}

// ============================================
// pH TŘÍDY (VDLUFA)
// ============================================

const phTridyPopis = {
  A: { nazev: 'velmi nízké', popis: 'Urgentní vápnění - ozdravné' },
  B: { nazev: 'nízké', popis: 'Potřeba zvýšit pH' },
  C: { nazev: 'optimální', popis: 'Udržovací vápnění' },
  D: { nazev: 'vysoké', popis: 'Bez vápnění' },
  E: { nazev: 'velmi vysoké', popis: 'Bez vápnění, možné okyselení' }
};

// Tabulka pH tříd pro ornou půdu (humus < 4%)
const phTridyOrna = {
  'piscita': [
    { trida: 'A' as PhTrida, max: 4.5 },
    { trida: 'B' as PhTrida, min: 4.6, max: 5.3 },
    { trida: 'C' as PhTrida, min: 5.4, max: 5.8 },
    { trida: 'D' as PhTrida, min: 5.9, max: 6.2 },
    { trida: 'E' as PhTrida, min: 6.3 }
  ],
  'hlinito_piscita': [
    { trida: 'A' as PhTrida, max: 4.8 },
    { trida: 'B' as PhTrida, min: 4.9, max: 5.7 },
    { trida: 'C' as PhTrida, min: 5.8, max: 6.3 },
    { trida: 'D' as PhTrida, min: 6.4, max: 6.7 },
    { trida: 'E' as PhTrida, min: 6.8 }
  ],
  'hlinita': [
    { trida: 'A' as PhTrida, max: 5.2 },
    { trida: 'B' as PhTrida, min: 5.3, max: 6.2 },
    { trida: 'C' as PhTrida, min: 6.3, max: 7.0 },
    { trida: 'D' as PhTrida, min: 7.1, max: 7.4 },
    { trida: 'E' as PhTrida, min: 7.5 }
  ],
  'jilovita': [
    { trida: 'A' as PhTrida, max: 5.3 },
    { trida: 'B' as PhTrida, min: 5.4, max: 6.3 },
    { trida: 'C' as PhTrida, min: 6.4, max: 7.2 },
    { trida: 'D' as PhTrida, min: 7.3, max: 7.7 },
    { trida: 'E' as PhTrida, min: 7.8 }
  ]
};

function urcitPhTridu(pH: number, typPudy: TypPudy): PhTrida {
  const tabulka = phTridyOrna[typPudy];
  for (const zaznam of tabulka) {
    if (zaznam.max !== undefined && pH <= zaznam.max) return zaznam.trida;
    if (zaznam.min !== undefined && zaznam.max !== undefined && pH >= zaznam.min && pH <= zaznam.max) return zaznam.trida;
    if (zaznam.min !== undefined && zaznam.max === undefined && pH >= zaznam.min) return zaznam.trida;
  }
  return 'C';
}

// ============================================
// POTŘEBA VÁPNĚNÍ (VDLUFA) - dt CaO/ha
// ============================================

// Tabulka pro humus < 4% (písčitá, hlinito-písčitá, hlinitá)
const potrebaVapneni_humusPod4: Record<string, Record<number, number>> = {
  'piscita': {
    3.0: 45, 3.5: 45, 4.0: 45, 4.1: 42, 4.2: 39, 4.3: 36, 4.4: 33, 4.5: 30,
    4.6: 27, 4.7: 24, 4.8: 22, 4.9: 19, 5.0: 16, 5.1: 13, 5.2: 10, 5.3: 7,
    5.4: 6, 5.5: 6, 5.6: 6, 5.7: 6, 5.8: 6,
    5.9: 0, 6.0: 0, 6.1: 0, 6.2: 0, 6.3: 0, 6.4: 0, 6.5: 0
  },
  'hlinito_piscita': {
    3.0: 77, 3.5: 77, 4.0: 77, 4.1: 73, 4.2: 69, 4.3: 65, 4.4: 61, 4.5: 57,
    4.6: 53, 4.7: 49, 4.8: 46, 4.9: 42, 5.0: 38, 5.1: 34, 5.2: 30, 5.3: 26,
    5.4: 22, 5.5: 19, 5.6: 15, 5.7: 11, 5.8: 10, 5.9: 10, 6.0: 10,
    6.1: 10, 6.2: 10, 6.3: 10,
    6.4: 0, 6.5: 0, 6.6: 0, 6.7: 0, 6.8: 0
  },
  'hlinita': {
    3.0: 117, 3.5: 117, 4.0: 117, 4.1: 117, 4.2: 117, 4.3: 117, 4.4: 117, 4.5: 117,
    4.6: 111, 4.7: 105, 4.8: 100, 4.9: 94, 5.0: 88, 5.1: 82, 5.2: 76, 5.3: 70,
    5.4: 65, 5.5: 59, 5.6: 53, 5.7: 47, 5.8: 41, 5.9: 36, 6.0: 30,
    6.1: 24, 6.2: 18, 6.3: 17, 6.4: 17, 6.5: 17, 6.6: 17, 6.7: 17,
    6.8: 17, 6.9: 17, 7.0: 17,
    7.1: 0, 7.2: 0, 7.3: 0, 7.4: 0, 7.5: 0
  }
};

// Tabulka pro humus 4-8% (jílovitá)
const potrebaVapneni_humus4_8: Record<string, Record<number, number>> = {
  'jilovita': {
    3.0: 137, 3.5: 137, 4.0: 137, 4.3: 130, 4.4: 123, 4.5: 115, 4.6: 108, 4.7: 100,
    4.8: 93, 4.9: 86, 5.0: 78, 5.1: 71, 5.2: 69, 5.3: 56, 5.4: 49, 5.5: 41,
    5.6: 34, 5.7: 27, 5.8: 19, 5.9: 18, 6.0: 18, 6.1: 18, 6.2: 18, 6.3: 18,
    6.4: 18, 6.5: 18, 6.6: 18, 6.7: 18,
    6.8: 0, 6.9: 0, 7.0: 0, 7.1: 0, 7.2: 0, 7.3: 0
  }
};

// Maximální jednorázová dávka (dt CaO/ha)
const maxDavkaOrna: Record<string, number> = {
  'piscita': 28,        // 2.8 t/ha
  'hlinito_piscita': 42, // 4.2 t/ha
  'hlinita': 70,        // 7.0 t/ha
  'jilovita': 84        // 8.4 t/ha
};

function interpolujHodnotu(tabulka: Record<number, number>, pH: number): number {
  const phZaokrouhlene = Math.round(pH * 10) / 10;
  
  // Přímá hodnota v tabulce
  if (tabulka[phZaokrouhlene] !== undefined) {
    return tabulka[phZaokrouhlene];
  }
  
  // Interpolace mezi dvěma nejbližšími hodnotami
  const klice = Object.keys(tabulka).map(Number).sort((a, b) => a - b);
  const nizsi = klice.filter(k => k <= phZaokrouhlene).pop();
  const vyssi = klice.filter(k => k > phZaokrouhlene).shift();
  
  if (nizsi === undefined) return tabulka[klice[0]];
  if (vyssi === undefined) return tabulka[klice[klice.length - 1]];
  
  // Lineární interpolace
  const pomer = (phZaokrouhlene - nizsi) / (vyssi - nizsi);
  return Math.round(tabulka[nizsi] + pomer * (tabulka[vyssi] - tabulka[nizsi]));
}

function getPotrebaVapneni(typPudy: TypPudy, pH: number): number {
  // Jílovitá půda používá tabulku pro humus 4-8%
  if (typPudy === 'jilovita') {
    return interpolujHodnotu(potrebaVapneni_humus4_8['jilovita'], pH);
  }
  // Ostatní půdy používají tabulku pro humus < 4%
  const tabulka = potrebaVapneni_humusPod4[typPudy];
  if (!tabulka) return 0;
  return interpolujHodnotu(tabulka, pH);
}

function vypocetVapneni(pH: number, typPudy: TypPudy): VysledekVapneni {
  // 1. Získej potřebu CaO podle typu půdy (humus je určen automaticky)
  const potrebaCaO_dt = getPotrebaVapneni(typPudy, pH);
  
  // 2. Převeď na tuny
  const potrebaCaO_t = potrebaCaO_dt / 10;
  
  // 3. Zkontroluj maximální jednorázovou dávku
  const maxDavka_dt = maxDavkaOrna[typPudy] || 28;
  const maxDavka_t = maxDavka_dt / 10;
  
  // 4. Vypočti počet aplikací
  const pocetAplikaci = potrebaCaO_dt > 0 ? Math.ceil(potrebaCaO_dt / maxDavka_dt) : 0;
  const davkaNaAplikaci_t = pocetAplikaci > 1 ? maxDavka_t : potrebaCaO_t;
  
  // 5. Urči pH třídu
  const phTrida = urcitPhTridu(pH, typPudy);
  const phInfo = phTridyPopis[phTrida];
  
  // 6. Přepočet na Mletý vápenec (48% CaO)
  const VAPENEC_CAO_OBSAH = 0.48;
  const mletyVapenec_t = potrebaCaO_t / VAPENEC_CAO_OBSAH;
  
  return {
    celkovaPotrebaCaO_t: Math.round(potrebaCaO_t * 10) / 10,
    celkovaPotrebaCaO_dt: potrebaCaO_dt,
    maxJednorazovaDavka_t: maxDavka_t,
    pocetAplikaci,
    davkaNaAplikaci_t: Math.round(davkaNaAplikaci_t * 10) / 10,
    doporucenyInterval: pocetAplikaci > 1 ? '1-2 roky mezi aplikacemi' : null,
    phTrida,
    phTridaNazev: phInfo.nazev,
    phTridaPopis: phInfo.popis,
    potrebaVapneni: potrebaCaO_dt > 0,
    prepocetyHnojiva: {
      mletyVapenec_t: Math.round(mletyVapenec_t * 10) / 10
    }
  };
}

// ============================================
// HODNOCENÍ ŽIVIN
// ============================================

const tridyZasobenosti = {
  A: { nazev: 'velmi nízký', barva: '#E17055', akce: 'silně zvýšená dávka' },
  B: { nazev: 'nízký', barva: '#FDCB6E', akce: 'zvýšená dávka' },
  C: { nazev: 'optimální', barva: '#00B894', akce: 'udržovací dávka' },
  D: { nazev: 'vysoký', barva: '#74B9FF', akce: 'snížená dávka' },
  E: { nazev: 'velmi vysoký', barva: '#A29BFE', akce: 'bez hnojení' }
};

// Fosfor (P) - jednotné pro všechny typy půd
const hodnoceniFosfor = [
  { trida: 'A' as TridaZasobenosti, max: 30 },
  { trida: 'B' as TridaZasobenosti, min: 31, max: 55 },
  { trida: 'C' as TridaZasobenosti, min: 56, max: 80 },
  { trida: 'D' as TridaZasobenosti, min: 81, max: 115 },
  { trida: 'E' as TridaZasobenosti, min: 116 }
];

// Draslík (K) - podle typu půdy
const hodnoceniDraslik: Record<TypPudy, Array<{ trida: TridaZasobenosti; min?: number; max?: number }>> = {
  'piscita': [
    { trida: 'A', max: 99 },
    { trida: 'B', min: 100, max: 160 },
    { trida: 'C', min: 161, max: 230 },
    { trida: 'D', min: 231, max: 350 },
    { trida: 'E', min: 351 }
  ],
  'hlinito_piscita': [
    { trida: 'A', max: 104 },
    { trida: 'B', min: 105, max: 170 },
    { trida: 'C', min: 171, max: 250 },
    { trida: 'D', min: 251, max: 380 },
    { trida: 'E', min: 381 }
  ],
  'hlinita': [
    { trida: 'A', max: 134 },
    { trida: 'B', min: 135, max: 210 },
    { trida: 'C', min: 211, max: 300 },
    { trida: 'D', min: 301, max: 450 },
    { trida: 'E', min: 451 }
  ],
  'jilovita': [
    { trida: 'A', max: 169 },
    { trida: 'B', min: 170, max: 260 },
    { trida: 'C', min: 261, max: 370 },
    { trida: 'D', min: 371, max: 520 },
    { trida: 'E', min: 521 }
  ]
};

// Hořčík (Mg) - podle typu půdy
const hodnoceniHorcik: Record<TypPudy, Array<{ trida: TridaZasobenosti; min?: number; max?: number }>> = {
  'piscita': [
    { trida: 'A', max: 79 },
    { trida: 'B', min: 80, max: 135 },
    { trida: 'C', min: 136, max: 200 },
    { trida: 'D', min: 201, max: 300 },
    { trida: 'E', min: 301 }
  ],
  'hlinito_piscita': [
    { trida: 'A', max: 104 },
    { trida: 'B', min: 105, max: 160 },
    { trida: 'C', min: 161, max: 240 },
    { trida: 'D', min: 241, max: 350 },
    { trida: 'E', min: 351 }
  ],
  'hlinita': [
    { trida: 'A', max: 129 },
    { trida: 'B', min: 130, max: 195 },
    { trida: 'C', min: 196, max: 290 },
    { trida: 'D', min: 291, max: 430 },
    { trida: 'E', min: 431 }
  ],
  'jilovita': [
    { trida: 'A', max: 154 },
    { trida: 'B', min: 155, max: 240 },
    { trida: 'C', min: 241, max: 350 },
    { trida: 'D', min: 351, max: 500 },
    { trida: 'E', min: 501 }
  ]
};

// Vápník (Ca) - podle typu půdy
const hodnoceniVapnik: Record<TypPudy, Array<{ trida: TridaZasobenosti; min?: number; max?: number }>> = {
  'piscita': [
    { trida: 'A', max: 1099 },
    { trida: 'B', min: 1100, max: 1800 },
    { trida: 'C', min: 1801, max: 2800 },
    { trida: 'D', min: 2801, max: 4500 },
    { trida: 'E', min: 4501 }
  ],
  'hlinito_piscita': [
    { trida: 'A', max: 1349 },
    { trida: 'B', min: 1350, max: 2200 },
    { trida: 'C', min: 2201, max: 3400 },
    { trida: 'D', min: 3401, max: 5200 },
    { trida: 'E', min: 5201 }
  ],
  'hlinita': [
    { trida: 'A', max: 1699 },
    { trida: 'B', min: 1700, max: 2800 },
    { trida: 'C', min: 2801, max: 4200 },
    { trida: 'D', min: 4201, max: 6500 },
    { trida: 'E', min: 6501 }
  ],
  'jilovita': [
    { trida: 'A', max: 2099 },
    { trida: 'B', min: 2100, max: 3400 },
    { trida: 'C', min: 3401, max: 5200 },
    { trida: 'D', min: 5201, max: 8000 },
    { trida: 'E', min: 8001 }
  ]
};

// Síra (S) - jednotné pro všechny typy půd
const hodnoceniSira = [
  { trida: 'A' as TridaZasobenosti, max: 10 },
  { trida: 'B' as TridaZasobenosti, min: 11, max: 15 },
  { trida: 'C' as TridaZasobenosti, min: 16, max: 25 },
  { trida: 'D' as TridaZasobenosti, min: 26, max: 40 },
  { trida: 'E' as TridaZasobenosti, min: 41 }
];

function hodnotitZivinu(hodnota: number, tabulka: Array<{ trida: TridaZasobenosti; min?: number; max?: number }>): TridaZasobenosti {
  for (const zaznam of tabulka) {
    if (zaznam.max !== undefined && zaznam.min === undefined && hodnota <= zaznam.max) return zaznam.trida;
    if (zaznam.min !== undefined && zaznam.max !== undefined && hodnota >= zaznam.min && hodnota <= zaznam.max) return zaznam.trida;
    if (zaznam.min !== undefined && zaznam.max === undefined && hodnota >= zaznam.min) return zaznam.trida;
  }
  return 'C';
}

// Výpočet deficitu - střed třídy C je cíl
const stredTridyC: Record<string, Record<TypPudy, number>> = {
  'P': { 'piscita': 68, 'hlinito_piscita': 68, 'hlinita': 68, 'jilovita': 68 },
  'K': { 'piscita': 195, 'hlinito_piscita': 210, 'hlinita': 255, 'jilovita': 315 },
  'Mg': { 'piscita': 168, 'hlinito_piscita': 200, 'hlinita': 243, 'jilovita': 295 },
  'Ca': { 'piscita': 2300, 'hlinito_piscita': 2800, 'hlinita': 3500, 'jilovita': 4200 },
  'S': { 'piscita': 20, 'hlinito_piscita': 20, 'hlinita': 20, 'jilovita': 20 }
};

function vypocetDeficitu(aktualni: number, zivina: string, typPudy: TypPudy): number | null {
  const stred = stredTridyC[zivina]?.[typPudy] || 0;
  if (aktualni >= stred) return null;
  
  // Deficit v kg/ha: (cíl - aktuální) × 3.9
  // Koeficient 3.9 odpovídá ornici 30 cm a objemové hmotnosti 1.3 g/cm³
  const deficit = (stred - aktualni) * 3.9;
  return Math.round(deficit);
}

// Poměr K:Mg
function hodnotitPomerKMg(pomer: number): string {
  if (pomer < 1.0) return 'Nedostatek draslíku - potřeba hnojení K';
  if (pomer <= 1.6) return 'Optimální - bez problémů s Mg';
  if (pomer <= 3.2) return 'Opatrně s K u krmných plodin';
  return 'Nevyhovující - riziko blokace Mg';
}

// ============================================
// HLAVNÍ FUNKCE PRO VÝPOČET
// ============================================

export function vypocetKalkulace(vstup: KalkulackaInputs): VysledekKalkulace {
  const { typPudy, pH, P, K, Mg, Ca, S } = vstup;

  // Automaticky určený humus
  const humus = getHumusPodleTypuPudy(typPudy);

  // Výpočet vápnění
  const vapneni = vypocetVapneni(pH, typPudy);

  // Hodnocení živin
  const tridaP = hodnotitZivinu(P, hodnoceniFosfor);
  const tridaK = hodnotitZivinu(K, hodnoceniDraslik[typPudy]);
  const tridaMg = hodnotitZivinu(Mg, hodnoceniHorcik[typPudy]);
  const tridaCa = hodnotitZivinu(Ca, hodnoceniVapnik[typPudy]);
  const tridaS = hodnotitZivinu(S, hodnoceniSira);

  // Deficity
  const deficitP = vypocetDeficitu(P, 'P', typPudy);
  const deficitK = vypocetDeficitu(K, 'K', typPudy);
  const deficitMg = vypocetDeficitu(Mg, 'Mg', typPudy);
  const deficitCa = vypocetDeficitu(Ca, 'Ca', typPudy);
  const deficitS = vypocetDeficitu(S, 'S', typPudy);

  // Poměr K:Mg
  const pomerKMg = Mg > 0 ? Math.round((K / Mg) * 100) / 100 : 0;
  const hodnoceniPomeru = hodnotitPomerKMg(pomerKMg);

  const vysledek: VysledekKalkulace = {
    vstup,
    humus,
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
