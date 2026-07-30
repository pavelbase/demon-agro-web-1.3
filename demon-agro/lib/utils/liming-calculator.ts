/**
 * SYSTÉM VÝPOČTU POTŘEBY VÁPNĚNÍ
 * ================================
 * Dle oficiální metodiky ÚKZÚZ (Metodický pokyn 01/AZZP)
 * 
 * KLÍČOVÉ INFORMACE:
 * - Hodnoty v tabulkách jsou ROČNÍ normativ v t CaO/ha/rok
 * - Pro celkovou potřebu násobíme typicky 6 lety (cyklus AZZP)
 * - Maximální jednorázové dávky CaO: L=1.5, S=2.5, T=5.0 t/ha
 * - Interval mezi aplikacemi: 3 roky
 * - Kontrolní rozbory: 1 rok po každé aplikaci
 * - Zdroj: ÚKZÚZ Metodický pokyn č. 01/AZZP
 * - ✅ Implementace roční acidifikace půdy (2025)
 */

import type { SoilType } from './soil-categories'
import { categorizeNutrient, type NutrientCategory } from './soil-categories'
import {
  applyKMgCorrection,
  calculateKMgRatio,
  getKMgRatioRecommendation,
} from './calculations'

// =====================================================
// ENV (EFFECTIVE NEUTRALIZING VALUE) - VARIANT A
// =====================================================
// MgO has 1.39x the neutralizing power of CaO
// This prevents overdosing when using Dolomite

const MGO_NEUTRALIZING_FACTOR = 1.39

/**
 * Calculate Effective Neutralizing Value (ENV)
 * Returns the effective CaO equivalent percentage
 * 
 * @param caoContent - CaO percentage (e.g., 0.30 for 30%)
 * @param mgoContent - MgO percentage (e.g., 0.18 for 18%)
 * @returns Effective CaO equivalent (e.g., 0.55 for Dolomite with 30% CaO + 18% MgO)
 * 
 * Example: Dolomite with 30% CaO and 18% MgO
 *   ENV = 0.30 + (0.18 * 1.39) = 0.30 + 0.25 = 0.55
 *   This means Dolomite is 55% as effective as pure CaO
 */
function getENV(caoContent: number, mgoContent: number): number {
  return caoContent + (mgoContent * MGO_NEUTRALIZING_FACTOR)
}

// =====================================================
// TYPY
// =====================================================

type SoilDetailType = 'piscita' | 'hlinitopiscita' | 'piscitohlinita' | 'hlinita' | 'jilovitohlinita'
type LandUse = 'orna' | 'ttp' | 'chmelnice'

export interface LimingInput {
  currentPh: number
  targetPh: number
  soilType: SoilType | null | undefined
  area: number // ha
  currentMg: number // mg/kg
  landUse: LandUse
}

export interface LimeProduct {
  id: string
  name: string
  type: string
  caoContent: number // %
  mgoContent: number // %
}

// Jedna dávka produktu v aplikaci
export interface ProductDose {
  product: LimeProduct
  dosePerHa: number // t produktu/ha
  totalDose: number // t produktu celkem
  caoPerHa: number // t CaO/ha
  mgoPerHa: number // t MgO/ha
}

export interface LimingApplication {
  year: number
  season: 'jaro' | 'podzim'
  sequenceOrder: number
  product: LimeProduct  // Hlavní produkt (pro backward compatibility)
  products?: ProductDose[]  // NOVÉ: Pole produktů v jedné aplikaci
  dosePerHa: number // t produktu/ha (hlavního produktu)
  totalDose: number // t produktu celkem (hlavního produktu)
  caoPerHa: number // t CaO/ha (celkem za všechny produkty)
  mgoPerHa: number // t MgO/ha (celkem za všechny produkty)
  phBefore: number
  phAfter: number
  mgAfter?: number
  recommendation: string
}

export interface LimingPlan {
  totalCaNeed: number // t Ca celkem
  totalCaoNeed: number // t CaO celkem
  totalCaNeedPerHa: number // t Ca/ha
  totalCaoNeedPerHa: number // t CaO/ha
  applications: LimingApplication[]
  warnings: string[]
}

// =====================================================
// OFICIÁLNÍ TABULKA POTŘEBY VÁPNĚNÍ (t CaO/ha/rok)
// =====================================================
// Zdroj: ÚKZÚZ Metodický pokyn č. 01/AZZP
// POZOR: Hodnoty jsou ROČNÍ normativ v t CaO/ha/rok
// Pro celkovou potřebu se násobí počtem let (typicky 6)

// Tabulka 4: Orná půda a ovocné sady (t CaO/ha/rok)
const LIMING_NEED_CAO_ORNA: Record<SoilDetailType, Record<string, number>> = {
  'piscita': {
    '<4.5': 1.20,
    '5.0': 0.80,
    '5.5': 0.60,
    '6.0': 0.30,
    '6.5': 0,
    '6.7': 0
  },
  'hlinitopiscita': { // LEHKÁ - L
    '<4.5': 1.20,
    '5.0': 0.80,
    '5.5': 0.60,
    '6.0': 0.30,
    '6.5': 0,
    '6.7': 0
  },
  'piscitohlinita': { // STŘEDNÍ lehčí - S
    '<4.5': 1.50,
    '5.0': 1.00,
    '5.5': 0.70,
    '6.0': 0.40,
    '6.5': 0.20,
    '6.7': 0
  },
  'hlinita': { // STŘEDNÍ - S
    '<4.5': 1.50,
    '5.0': 1.00,
    '5.5': 0.70,
    '6.0': 0.40,
    '6.5': 0.20,
    '6.7': 0
  },
  'jilovitohlinita': { // TĚŽKÁ - T
    '<4.5': 1.70,
    '5.0': 1.25,
    '5.5': 0.85,
    '6.0': 0.50,
    '6.5': 0.25,
    '6.7': 0.20
  }
}

// Tabulka 5: TTP - Trvalý travní porost (t CaO/ha/rok)
const LIMING_NEED_CAO_TTP: Record<SoilDetailType, Record<string, number>> = {
  'piscita': {
    '<4.5': 0.50,
    '5.0': 0.30,
    '5.5': 0,
    '6.0': 0
  },
  'hlinitopiscita': { // LEHKÁ - L
    '<4.5': 0.50,
    '5.0': 0.30,
    '5.5': 0,
    '6.0': 0
  },
  'piscitohlinita': { // STŘEDNÍ - S
    '<4.5': 0.70,
    '5.0': 0.50,
    '5.5': 0.25,
    '6.0': 0
  },
  'hlinita': { // STŘEDNÍ - S
    '<4.5': 0.70,
    '5.0': 0.50,
    '5.5': 0.25,
    '6.0': 0
  },
  'jilovitohlinita': { // TĚŽKÁ - T
    '<4.5': 0.90,
    '5.0': 0.70,
    '5.5': 0.35,
    '6.0': 0.20
  }
}

// Tabulka 7: Chmelnice (t CaO/ha/rok)
// Zdroj: ÚKZÚZ Metodický pokyn č. 01/AZZP, tab. 7 (viz zadani-chmelnice-engine.md)
// POZOR: pásmo "do 4,5" se neextrapoluje výše (plochá hodnota první kotvy = klíč '4.5').
// U lehké půdy mají kotvy 6,5 a 6,9 shodnou hodnotu (0,20) - interpolace mezi nimi
// proto přirozeně vyjde plochá, u střední a těžké půdy mezi nimi lineárně klesá.
const LIMING_NEED_CAO_CHMELNICE: Record<SoilDetailType, Record<string, number>> = {
  'piscita': { // LEHKÁ - L
    '<4.5': 0.60, '4.5': 0.60, '5.0': 0.45, '5.5': 0.30, '6.5': 0.20, '6.9': 0.20, '7.0': 0
  },
  'hlinitopiscita': { // LEHKÁ - L
    '<4.5': 0.60, '4.5': 0.60, '5.0': 0.45, '5.5': 0.30, '6.5': 0.20, '6.9': 0.20, '7.0': 0
  },
  'piscitohlinita': { // STŘEDNÍ - S
    '<4.5': 1.00, '4.5': 1.00, '5.0': 0.70, '5.5': 0.50, '6.5': 0.30, '6.9': 0.20, '7.0': 0
  },
  'hlinita': { // STŘEDNÍ - S
    '<4.5': 1.00, '4.5': 1.00, '5.0': 0.70, '5.5': 0.50, '6.5': 0.30, '6.9': 0.20, '7.0': 0
  },
  'jilovitohlinita': { // TĚŽKÁ - T
    '<4.5': 1.30, '4.5': 1.30, '5.0': 0.90, '5.5': 0.60, '6.5': 0.40, '6.9': 0.20, '7.0': 0
  }
}

/**
 * Obecná (datově řízená) lineární interpolace mezi kotvami pH -> hodnota.
 * Kotva leží na horní hranici pásma. Pod první kotvou i nad poslední kotvou
 * se hodnota nepřepočítává (plochá hranice), pouze se interpoluje mezi nimi.
 */
function interpolateAnchorTable(ph: number, row: Record<string, number>): number {
  if (ph < 4.5) return row['<4.5'] ?? 0

  const anchors = Object.keys(row)
    .filter((k) => k !== '<4.5')
    .map((k) => [Number(k), row[k]] as [number, number])
    .sort((a, b) => a[0] - b[0])

  if (anchors.length === 0) return 0

  const [firstPh, firstValue] = anchors[0]
  if (ph <= firstPh) return firstValue

  const [lastPh, lastValue] = anchors[anchors.length - 1]
  if (ph >= lastPh) return lastValue

  for (let i = 0; i < anchors.length - 1; i++) {
    const [lowerPh, lowerValue] = anchors[i]
    const [upperPh, upperValue] = anchors[i + 1]
    if (ph >= lowerPh && ph <= upperPh) {
      const ratio = (ph - lowerPh) / (upperPh - lowerPh)
      return lowerValue + (upperValue - lowerValue) * ratio
    }
  }

  return 0
}

function lookupCaoNeedChmelnice(ph: number, soilDetailType: SoilDetailType): number {
  const row = LIMING_NEED_CAO_CHMELNICE[soilDetailType]
  if (!row) {
    console.error('❌ lookupCaoNeedChmelnice: Neplatný soilDetailType:', soilDetailType)
    return 0
  }
  // Nezaokrouhlovat zde - zaokrouhlení až na finální 4letou potřebu
  // (viz calculateTotalCaoNeedSimple), jinak vznikne chyba zaokrouhlení x4.
  return interpolateAnchorTable(ph, row)
}

// =====================================================
// MAXIMÁLNÍ JEDNORÁZOVÁ DÁVKA (t CaO/ha)
// =====================================================
// Zdroj: ÚKZÚZ Metodický pokyn č. 01/AZZP
// UPRAVENO: Střední půda (hlinita) max 2.0 t CaO/ha (agronomicky šetrné)

const MAX_SINGLE_DOSE_CAO: Record<SoilDetailType, number> = {
  'piscita': 1.0,           // Písčitá
  'hlinitopiscita': 1.5,    // Hlinitopísčitá
  'piscitohlinita': 2.0,    // Písčitohlinitá
  'hlinita': 2.0,           // Hlinitá (OPRAVENO z 3.0 → 2.0)
  'jilovitohlinita': 5.0    // Jílovitohlinitá, jílovitá
}

// =====================================================
// MAPOVÁNÍ PŮDNÍHO TYPU
// =====================================================

function getSoilDetailType(soilType: SoilType | null | undefined): SoilDetailType {
  // Pokud není zadán typ půdy, použijeme defaultní (střední)
  if (!soilType) {
    return 'hlinita' // Default: střední půda
  }
  
  // Prozatím zjednodušené mapování
  // TODO: Rozšířit o detailnější klasifikaci na základě % jílu/písku
  const mapping: Record<SoilType, SoilDetailType> = {
    'L': 'hlinitopiscita',      // Lehká
    'S': 'hlinita',              // Střední
    'T': 'jilovitohlinita'       // Těžká
  }
  return mapping[soilType] || 'hlinita' // Fallback na střední půdu
}

// =====================================================
// NORMALIZACE KULTURY (fallback na ORNA + warning)
// =====================================================
// Chybějící nebo neznámá kultura se v datech dřív tiše degradovala na ORNA,
// což je přesně chyba popsaná v zadani-chmelnice-engine.md. Zde je fallback
// stále na ORNA (zpětná kompatibilita), ale nahlas se zaloguje warning.

function normalizeCulture(landUse: unknown, parcelId?: string): LandUse {
  if (landUse === 'orna' || landUse === 'ttp' || landUse === 'chmelnice') {
    return landUse
  }
  console.warn(
    `⚠️ Neznámá nebo chybějící kultura pozemku${parcelId ? ` (${parcelId})` : ''}: "${String(landUse)}". ` +
    `Použit fallback na ORNA - zkontrolujte zdrojová data (import z LPIS / formulář pozemku).`
  )
  return 'orna'
}

// =====================================================
// JEDNODUCHÝ VÝPOČET CELKOVÉ POTŘEBY CaO (PRO TABULKOVÝ PŘEHLED)
// =====================================================

/**
 * Vypočítá celkovou potřebu vápnění podle ÚKZÚZ metodiky
 * (pro použití v tabulkovém přehledu, bez generování celého plánu)
 * 
 * @returns Celková potřeba CaO v t/ha za 4leté období
 */
export function calculateTotalCaoNeedSimple(
  currentPh: number,
  soilType: SoilType | null | undefined,
  landUse: LandUse = 'orna',
  parcelId?: string
): number {
  landUse = normalizeCulture(landUse, parcelId)

  // Pokud není zadán typ půdy, použijeme defaultní (střední)
  if (!soilType) {
    soilType = 'S' // Default: střední půda
  }
  
  // Převod na detailní typ půdy
  const soilDetailType = getSoilDetailType(soilType)
  
  // Roční potřeba CaO (t CaO/ha/rok)
  const rocniPotrebaCaoPerHa = lookupCaoNeed(currentPh, soilDetailType, landUse)
  
  // Celková potřeba za 4leté období (konzistence s veřejnou kalkulačkou)
  const rokyDoCyklu = 4
  const totalCaoNeedPerHa = rocniPotrebaCaoPerHa * rokyDoCyklu

  // Chmelnice: zaokrouhlit až finální 4letou hodnotu na 2 des. místa (dle
  // zadani-chmelnice-engine.md, bod 2). Orná/TTP beze změny (regresní zámek).
  if (landUse === 'chmelnice') {
    return Math.round(totalCaoNeedPerHa * 100) / 100
  }

  return totalCaoNeedPerHa
}

// =====================================================
// INTERPOLACE POTŘEBY CaO Z TABULKY
// =====================================================

function lookupCaoNeed(
  ph: number, 
  soilDetailType: SoilDetailType,
  landUse: LandUse
): number {
  // Chmelnice mají vlastní tabulku (tab. 7) a vlastní pravidla interpolace
  // (kotva na horní hranici pásma, nula až od pH 7,0) - viz zadani-chmelnice-engine.md.
  // Řešeno samostatnou funkcí, aby zůstala beze změny stávající (a mírně
  // odlišná) logika pro ornou půdu a TTP níže - regresní test to vyžaduje.
  if (landUse === 'chmelnice') {
    return lookupCaoNeedChmelnice(ph, soilDetailType)
  }

  const table = landUse === 'ttp' ? LIMING_NEED_CAO_TTP : LIMING_NEED_CAO_ORNA
  const row = table[soilDetailType]
  
  // Bezpečnostní kontrola - pokud řádek neexistuje, vrátíme 0
  if (!row) {
    console.error('❌ lookupCaoNeed: Neplatný soilDetailType:', soilDetailType)
    return 0
  }
  
  // Extrémně kyselé půdy
  if (ph < 4.5) return row['<4.5'] || 0
  
  // Nad 6.7 není potřeba vápnění
  if (ph >= 6.7) return 0
  
  // Přesná shoda s tabulkovými hodnotami
  const exactMatch = row[ph.toFixed(1)]
  if (exactMatch !== undefined) return exactMatch
  
  // Lineární interpolace mezi tabulkovými hodnotami
  const phKeys = Object.keys(row)
    .filter(k => k !== '<4.5')
    .map(Number)
    .sort((a, b) => a - b)
  
  // OPRAVA: Speciální případ pro pH mezi 4.5 a prvním tabulkovým klíčem (typicky 5.0)
  const minKey = phKeys[0]
  if (ph >= 4.5 && ph < minKey) {
    const lowerValue = row['<4.5'] || 0
    const upperValue = row[minKey.toFixed(1)] || 0
    const ratio = (ph - 4.5) / (minKey - 4.5)
    return lowerValue + (upperValue - lowerValue) * ratio
  }
  
  for (let i = 0; i < phKeys.length - 1; i++) {
    if (ph >= phKeys[i] && ph < phKeys[i + 1]) {
      const lower = phKeys[i]
      const upper = phKeys[i + 1]
      const lowerValue = row[lower.toFixed(1)] || 0
      const upperValue = row[upper.toFixed(1)] || 0
      
      // Lineární interpolace
      const ratio = (ph - lower) / (upper - lower)
      return lowerValue + (upperValue - lowerValue) * ratio
    }
  }
  
  // Fallback
  return 0
}

// =====================================================
// ROČNÍ ACIDIFIKACE PŮDY
// =====================================================
// Přirozené okyselování půdy v čase (bez vápnění)
// Hodnoty vycházejí z průměrných podmínek v ČR

// Roční ztráty CaO potřebné na udržení pH (t CaO/ha/rok)
const ROCNI_ZTRATA_CAO: Record<SoilDetailType, number> = {
  'piscita': 0.30,           // 300 kg/ha - lehká půda, více vyplavování
  'hlinitopiscita': 0.30,    // 300 kg/ha - lehká půda
  'piscitohlinita': 0.22,    // 220 kg/ha - střední půda
  'hlinita': 0.22,           // 220 kg/ha - střední půda (průměr ČR)
  'jilovitohlinita': 0.15    // 150 kg/ha - těžká půda, lepší pufrování
}

// Roční pokles pH (pokud se nevápní)
// Vypočteno z ročních ztrát CaO × pufrační faktor
const ROCNI_POKLES_PH: Record<SoilDetailType, number> = {
  'piscita': 0.09,           // 0.30 t × 0.30 (pufrační faktor) ≈ 0.09
  'hlinitopiscita': 0.09,    // 0.30 t × 0.30 ≈ 0.09
  'piscitohlinita': 0.07,    // 0.22 t × 0.32 ≈ 0.07
  'hlinita': 0.07,           // 0.22 t × 0.30 ≈ 0.07
  'jilovitohlinita': 0.04    // 0.15 t × 0.25 ≈ 0.04
}

// =====================================================
// VÝPOČET ZMĚNY pH PO APLIKACI CaO
// =====================================================

export function calculatePhChange(
  caoAmount: number, // t CaO/ha
  soilDetailType: SoilDetailType,
  currentPh: number
): number {
  // Pufrační kapacita půdy (koeficient odezvy pH)
  // Těžší půda = vyšší pufrační kapacita = MENŠÍ změna pH na jednotku CaO
  // Tyto koeficienty reprezentují ΔpH na 1 t CaO/ha
  const phResponseFactor: Record<SoilDetailType, number> = {
    'piscita': 0.50,           // Lehká - vysoká odezva
    'hlinitopiscita': 0.45,
    'piscitohlinita': 0.35,
    'hlinita': 0.30,           // Střední
    'jilovitohlinita': 0.25    // Těžká - nízká odezva (vysoká pufrační kapacita)
  }
  
  // Efektivita při různém pH
  // Čím kyselejší půda, tím rychlejší reakce vápna
  const phEfficiency = currentPh < 5.0 ? 1.3 : 
                       currentPh < 5.5 ? 1.2 :
                       currentPh < 6.0 ? 1.0 : 
                       0.8
  
  // Základní vzorec: ΔpH = množství × response_factor × efektivita
  const phIncrease = caoAmount * phResponseFactor[soilDetailType] * phEfficiency
  
  // Maximální změna najednou je +1.5 pH (fyzikální limit)
  return Math.min(phIncrease, 1.5)
}

/**
 * Predikce pH po aplikaci s vlivem acidifikace
 * Zohledňuje přirozené okyselování půdy od poslední aplikace
 * 
 * @param phPredAplikaci pH před aplikací (bezprostředně po minulé aplikaci)
 * @param caoAplikovano Množství CaO k aplikaci (t CaO/ha)
 * @param soilDetailType Detailní typ půdy
 * @param currentPhBefore Aktuální pH před aplikací (po acidifikaci)
 * @param rokyOdPosledniAplikace Počet let od poslední aplikace
 * @returns Predikované pH po aplikaci
 */
export function predikujPhSAcidifikaci(
  phPredAplikaci: number,
  caoAplikovano: number,
  soilDetailType: SoilDetailType,
  rokyOdPosledniAplikace: number
): number {
  // 1. Snížení pH kvůli přirozené acidifikaci od minulé aplikace
  const poklesZaRoky = ROCNI_POKLES_PH[soilDetailType] * rokyOdPosledniAplikace
  const phPoAcidifikaci = phPredAplikaci - poklesZaRoky
  
  // 2. Zvýšení pH díky aplikaci CaO
  const zvyseniPh = calculatePhChange(caoAplikovano, soilDetailType, phPoAcidifikaci)
  
  // 3. Výsledné pH (minimálně 4.0)
  return Math.max(phPoAcidifikaci + zvyseniPh, 4.0)
}

/**
 * Výpočet pH po acidifikaci (bez aplikace vápna)
 * 
 * @param phPosledniZname Poslední známé pH
 * @param soilDetailType Detailní typ půdy
 * @param rokyOdPosledniAplikace Počet let od poslední aplikace
 * @returns pH po acidifikaci
 */
export function vypoctiPhPoAcidifikaci(
  phPosledniZname: number,
  soilDetailType: SoilDetailType,
  rokyOdPosledniAplikace: number
): number {
  const poklesZaRoky = ROCNI_POKLES_PH[soilDetailType] * rokyOdPosledniAplikace
  return Math.max(phPosledniZname - poklesZaRoky, 4.0)
}

// =====================================================
// VÝPOČET ZMĚNY Mg PO APLIKACI MgO
// =====================================================

export function calculateMgChange(
  mgoAmount: number, // t MgO/ha
  soilType: SoilType
): number {
  // Výpočet zvýšení Mg v půdě po aplikaci MgO
  // Standard AZZP: 20 cm hloubka odběru pro agrochemické zkoušení
  
  // Konstanty pro převod jednotek
  const MGO_TO_MG_RATIO = 0.603 // Mg tvoří 60.3% molekulové hmotnosti MgO
  const KG_IN_TON = 1000
  const MG_IN_KG = 1e6 // pro převod poměru na mg/kg (ppm)
  
  // KROK 1: Výpočet čistého Mg v kg/ha
  const mgKgPerHa = mgoAmount * KG_IN_TON * MGO_TO_MG_RATIO
  
  // KROK 2: Hmotnost půdy (kg/ha) - AZZP standard 20 cm
  const depth = 0.2 // m (20 cm - standardní hloubka pro agrochemické zkoušení, NE 15 cm!)
  const density = soilType === 'L' ? 1.3 : soilType === 'S' ? 1.4 : 1.5 // t/m³
  const soilMassKgPerHa = 10000 * depth * density * KG_IN_TON
  
  // KROK 3: Účinnost (rozpustnost v prvním roce)
  // Konzervativní odhad: 40% z aplikované dávky je ihned dostupné
  const efficiency = 0.4
  
  // KROK 4: Výsledné zvýšení v mg/kg (ppm)
  // (kg_Mg / kg_Soil) × 1,000,000 = mg/kg
  const rawIncrease = (mgKgPerHa / soilMassKgPerHa) * MG_IN_KG
  const effectiveIncrease = rawIncrease * efficiency
  
  // Zaokrouhlení na 1 des. místo
  return Math.round(effectiveIncrease * 10) / 10
}

// =====================================================
// JEDNORÁZOVÝ ROZPIS DÁVKY: DOLOMIT (Mg) + VÁPENEC (CaO)
// =====================================================
// AGRONOMICKÁ LOGIKA (dle požadavku zákazníka):
// - Vápenec mletý je vždy levnější než Dolomit → použít ho na CaO, kde to jde
// - Pokud je Mg nízké/vyhovující: spočítat jednorázové množství DOLOMITU
//   potřebné k doplnění Mg na cílovou hodnotu (dle typu půdy). Dolomit navíc
//   dodá i část CaO. Zbytek CaO potřeby dorovnáme LEVNĚJŠÍM vápencem.
// - Pokud je Mg dobré/vysoké/velmi vysoké: dolomit se nepoužije vůbec,
//   celá potřeba CaO se pokryje čistým vápencem.
// - Navíc zohledníme poměr K/Mg a doporučíme dopočet doplnění draslíku
//   (draslík není součástí vápenných produktů, jde o informativní údaj).

// Cílová hodnota Mg (mg/kg) po jednorázové aplikaci dolomitu – o něco nad
// hranicí kategorie "vyhovující" (viz soil-categories.ts), abychom se
// jednou aplikací bezpečně dostali do pásma "dobrý".
const MG_TARGET_BY_SOIL: Record<'L' | 'S' | 'T', number> = {
  L: 155, // hranice "vyhovující" je 135
  S: 180, // hranice "vyhovující" je 160
  T: 240, // hranice "vyhovující" je 220
}

// Chmelnice: cíl dosycení = dolní mez kategorie "dobrý" dle ÚKZÚZ tab. 13
// (viz zadani-chmelnice-engine.md, bod 4) - přísnější kritéria než orná půda.
const MG_TARGET_BY_SOIL_CHMELNICE: Record<'L' | 'S' | 'T', number> = {
  L: 211,
  S: 251,
  T: 301,
}

function getMgTarget(soilType: SoilType, culture: LandUse = 'orna'): number {
  const type: 'L' | 'S' | 'T' = soilType || 'S'
  if (culture === 'chmelnice') return MG_TARGET_BY_SOIL_CHMELNICE[type]
  return MG_TARGET_BY_SOIL[type]
}

// Základní doporučená dávka K2O (kg/ha) podle kategorie zásobenosti draslíkem
// (dle stejné metodiky jako zbytek portálu - viz calculations.ts BASE_FERTILIZATION.K,
// zde správně navázáno na kategorie 'nizky'/'vyhovujici'/'dobry'/'vysoky'/'velmi_vysoky')
const K2O_BASE_NEED_BY_CATEGORY: Record<NonNullable<NutrientCategory>, number> = {
  nizky: 120,
  vyhovujici: 90,
  dobry: 60,
  vysoky: 30,
  velmi_vysoky: 0,
}

export interface OneTimeProductSplitInput {
  currentPh: number
  currentMg: number // mg/kg
  currentK: number // mg/kg
  soilType: SoilType
  landUse: LandUse
  area: number // ha
}

export interface OneTimeProductSplitResult {
  // Celková potřeba dle ÚKZÚZ metodiky (stejná jako zbytek portálu)
  totalCaoNeedTHa: number
  totalCaoNeedCelkem: number

  // Rozpis na produkty
  dolomitTHa: number
  dolomitCelkem: number
  vapenecTHa: number
  vapenecCelkem: number
  produktCelkemTHa: number
  produktCelkemTun: number

  // Hořčík
  mgCategory: NutrientCategory
  mgTarget: number
  doplneniMgoTHa: number

  // Draslík (informativní - není součástí vápenných produktů)
  kMgRatio: number | null
  kMgPoznamka: string
  doplnitK2OKgHa: number | null

  warnings: string[]
}

/**
 * Vypočítá jednorázové (jednorázově potřebné) množství produktů Dolomit
 * a Vápenec k nápravě pH na optimum, s ohledem na aktuální stav Mg a K.
 *
 * Používá STEJNOU ÚKZÚZ metodiku pro celkovou potřebu CaO jako zbytek
 * portálu (calculateTotalCaoNeedSimple), pouze ji navíc "rozpočítá" mezi
 * dva produkty podle agronomických pravidel popsaných výše.
 */
export function calculateOneTimeProductSplit(
  input: OneTimeProductSplitInput,
  dolomitProduct: LimeProduct | null,
  vapenecProduct: LimeProduct | null,
  parcelId?: string
): OneTimeProductSplitResult {
  const warnings: string[] = []
  const soilType: SoilType = input.soilType || 'S'
  const soilDetailType = getSoilDetailType(soilType)
  const culture = normalizeCulture(input.landUse, parcelId)

  // 1. Celková potřeba CaO (t/ha) - sjednocená ÚKZÚZ metodika, 4leté období
  const totalCaoNeedTHa = calculateTotalCaoNeedSimple(input.currentPh, soilType, culture)

  if (totalCaoNeedTHa <= 0) {
    return {
      totalCaoNeedTHa: 0,
      totalCaoNeedCelkem: 0,
      dolomitTHa: 0,
      dolomitCelkem: 0,
      vapenecTHa: 0,
      vapenecCelkem: 0,
      produktCelkemTHa: 0,
      produktCelkemTun: 0,
      mgCategory: categorizeNutrient('Mg', input.currentMg, soilType, culture),
      mgTarget: getMgTarget(soilType, culture),
      doplneniMgoTHa: 0,
      kMgRatio: input.currentMg > 0 ? calculateKMgRatio(input.currentK, input.currentMg) : null,
      kMgPoznamka: '',
      doplnitK2OKgHa: null,
      warnings: [],
    }
  }

  // 2. Kategorie hořčíku (dle kultury - chmelnice mají přísnější kritéria, tab. 13)
  const mgCategory = categorizeNutrient('Mg', input.currentMg, soilType, culture)
  const mgDeficient = mgCategory === 'nizky' || mgCategory === 'vyhovujici'

  // 3. Dolomit - pouze tolik, kolik je potřeba na doplnění Mg
  let dolomitTHa = 0
  let doplneniMgoTHa = 0
  let caoSuppliedByDolomit = 0

  if (mgDeficient && dolomitProduct && dolomitProduct.mgoContent > 0) {
    const mgTarget = getMgTarget(soilType, culture)
    const deltaMg = Math.max(0, mgTarget - input.currentMg)
    const mgIncreasePerTonMgo = calculateMgChange(1, soilType) // mg/kg nárůst na 1 t MgO/ha

    doplneniMgoTHa = mgIncreasePerTonMgo > 0 ? deltaMg / mgIncreasePerTonMgo : 0
    dolomitTHa = doplneniMgoTHa / (dolomitProduct.mgoContent / 100)
    caoSuppliedByDolomit = dolomitTHa * (dolomitProduct.caoContent / 100)
  } else if (mgDeficient && !dolomitProduct) {
    warnings.push('Hořčík je nízký/vyhovující, ale v systému chybí aktivní dolomitický produkt pro jeho doplnění.')
  }

  // 4. Zbytek potřeby CaO dorovnáme levnějším vápencem
  const remainingCaoTHa = Math.max(0, totalCaoNeedTHa - caoSuppliedByDolomit)
  let vapenecTHa = 0

  if (remainingCaoTHa > 0.01) {
    if (vapenecProduct && vapenecProduct.caoContent > 0) {
      vapenecTHa = remainingCaoTHa / (vapenecProduct.caoContent / 100)
    } else {
      warnings.push('Chybí aktivní vápenatý produkt pro doplnění zbývající potřeby CaO.')
    }
  } else if (dolomitTHa > 0) {
    warnings.push('Dávka dolomitu potřebná k doplnění hořčíku už sama pokrývá potřebu CaO pro úpravu pH - vápenec navíc není potřeba.')
  }

  // 5. Kontrola vůči maximální jednorázové dávce (agronomický/legislativní limit)
  const maxSingleDoseCao = MAX_SINGLE_DOSE_CAO[soilDetailType]
  if (totalCaoNeedTHa > maxSingleDoseCao) {
    warnings.push(
      `Celková potřeba CaO (${totalCaoNeedTHa.toFixed(2)} t/ha) přesahuje maximální jednorázovou dávku ` +
      `pro tento typ půdy (${maxSingleDoseCao.toFixed(1)} t CaO/ha). Doporučujeme rozdělit aplikaci do více let ` +
      `(viz Plán vápnění pozemku).`
    )
  }

  // 6. Draslík - informativní doplnění s ohledem na poměr K/Mg
  // (draslík není součástí vápenných produktů - jde čistě o doporučující údaj)
  const kMgRatio = input.currentMg > 0 ? calculateKMgRatio(input.currentK, input.currentMg) : null
  const kMgPoznamka = kMgRatio !== null ? getKMgRatioRecommendation(kMgRatio) : ''
  const kCategory = categorizeNutrient('K', input.currentK, soilType, culture)

  let doplnitK2OKgHa: number | null = null
  if (kCategory) {
    const baseNeed = K2O_BASE_NEED_BY_CATEGORY[kCategory]
    // Travní porosty (TTP) mají vyšší potřebu K
    const adjustedBase = culture === 'ttp' ? baseNeed * 1.3 : baseNeed
    doplnitK2OKgHa = kMgRatio !== null
      ? applyKMgCorrection({ K: adjustedBase, Mg: 0 }, kMgRatio).K
      : Math.round(adjustedBase)
  }

  return {
    totalCaoNeedTHa,
    totalCaoNeedCelkem: totalCaoNeedTHa * input.area,
    dolomitTHa,
    dolomitCelkem: dolomitTHa * input.area,
    vapenecTHa,
    vapenecCelkem: vapenecTHa * input.area,
    produktCelkemTHa: dolomitTHa + vapenecTHa,
    produktCelkemTun: (dolomitTHa + vapenecTHa) * input.area,
    mgCategory,
    mgTarget: getMgTarget(soilType, culture),
    doplneniMgoTHa,
    kMgRatio,
    kMgPoznamka,
    doplnitK2OKgHa,
    warnings,
  }
}

// =====================================================
// VÝBĚR VHODNÉHO PRODUKTU - VARIANT A (SMART SWITCHING)
// =====================================================
// KRITICKÁ ZMĚNA: Používáme ENV-based přístup
// - Mg >= 140 mg/kg: FORCE use Calcitic Limestone (0% MgO) - prevents Mg overdose
// - Mg < 140 mg/kg: ALLOW Dolomitic Limestone - we WANT the Mg here

function selectProduct(
  currentMg: number,
  remainingCaoNeed: number,
  products: LimeProduct[]
): LimeProduct {
  // THRESHOLD for "Good" Mg supply (approx 140-150 mg/kg)
  const MG_GOOD_THRESHOLD = 140
  
  // RULE 1: Soil has ENOUGH Magnesium (>= 140 mg/kg)
  // → FORCE USE of Calcitic Limestone (0% MgO) to avoid adding more Mg
  if (currentMg >= MG_GOOD_THRESHOLD) {
    const calcite = products
      .filter(p => p.mgoContent < 2) // Calcitic limestone (< 2% MgO)
      .sort((a, b) => b.caoContent - a.caoContent)[0] // Highest CaO
    
    if (calcite) return calcite
    
    // Fallback: Use product with lowest MgO
    return products.sort((a, b) => a.mgoContent - b.mgoContent)[0]
  }
  
  // RULE 2: Soil is DEFICIENT in Mg (< 140 mg/kg)
  // → ALLOW Dolomitic Limestone - we WANT the Mg here
  const dolomite = products
    .filter(p => p.mgoContent > 10) // Dolomitic limestone (> 10% MgO)
    .sort((a, b) => b.mgoContent - a.mgoContent)[0] // Highest MgO
  
  if (dolomite) return dolomite
  
  // Fallback: Use any available product
  return products[0]
}

// =====================================================
// HLAVNÍ FUNKCE - GENEROVÁNÍ PLÁNU VÁPNĚNÍ
// =====================================================

export function generateLimingPlan(
  input: LimingInput,
  availableProducts: LimeProduct[]
): LimingPlan {
  const warnings: string[] = []
  
  // -------------------------------------------------
  // 1. VALIDACE VSTUPŮ A AGRONOMICKÁ KONTROLA
  // -------------------------------------------------
  
  if (!input.soilType) {
    warnings.push('Typ půdy není zadán - použit default (S - střední)')
    input.soilType = 'S'
  }

  input.landUse = normalizeCulture(input.landUse)
  
  // Kontrola Mg saturace
  if (input.currentMg !== undefined && input.currentMg !== null) {
    if (input.currentMg < 80) {
      warnings.push(
        `🔴 KRITICKY NÍZKÝ HOŘČÍK: ${input.currentMg.toFixed(0)} mg/kg. ` +
        `Agronomické minimum je 80 mg/kg. Nutné použít dolomit!`
      )
    } else if (input.currentMg > 200) {
      warnings.push(
        `⚠️ VYSOKÝ HOŘČÍK: ${input.currentMg.toFixed(0)} mg/kg (optimum 105-200 mg/kg). ` +
        `Preferujte vápenec BEZ MgO, aby nedošlo k antagonismu K-Mg.`
      )
    }
  }
  
  if (input.currentPh >= input.targetPh) {
    warnings.push('Aktuální pH je již na cílové hodnotě nebo vyšší - vápnění není potřeba')
    return {
      totalCaNeed: 0,
      totalCaoNeed: 0,
      totalCaNeedPerHa: 0,
      totalCaoNeedPerHa: 0,
      applications: [],
      warnings
    }
  }
  
  if (availableProducts.length === 0) {
    warnings.push('CHYBA: Žádné produkty k dispozici')
    return {
      totalCaNeed: 0,
      totalCaoNeed: 0,
      totalCaNeedPerHa: 0,
      totalCaoNeedPerHa: 0,
      applications: [],
      warnings
    }
  }
  
  // -------------------------------------------------
  // 2. ZÍSKÁNÍ DETAILNÍHO TYPU PŮDY
  // -------------------------------------------------
  
  const soilDetailType = getSoilDetailType(input.soilType)
  
  // -------------------------------------------------
  // 3. VÝPOČET ROČNÍ POTŘEBY CaO (t CaO/ha/rok)
  // -------------------------------------------------
  
  const rocniPotrebaCaoPerHa = lookupCaoNeed(input.currentPh, soilDetailType, input.landUse)
  
  // -------------------------------------------------
  // 4. CELKOVÁ POTŘEBA CaO (násobeno počtem let)
  // -------------------------------------------------
  // ÚKZÚZ metodika: Počítáme s 4letým cyklem nápravy
  // (konzistence s veřejnou kalkulačkou na webu)
  
  const rokyDoCyklu = 4 // 4leté období nápravy (stejně jako veřejná kalkulačka)
  const totalCaoNeedPerHa = rocniPotrebaCaoPerHa * rokyDoCyklu
  const totalCaoNeed = totalCaoNeedPerHa * input.area
  
  // Pro kompatibilitu s UI zachováme i hodnoty v Ca (zpětný přepočet)
  const totalCaNeedPerHa = totalCaoNeedPerHa / 1.4
  const totalCaNeed = totalCaoNeed / 1.4
  
  // -------------------------------------------------
  // 5. MAXIMÁLNÍ JEDNORÁZOVÁ DÁVKA
  // -------------------------------------------------
  
  const maxDoseCao = MAX_SINGLE_DOSE_CAO[soilDetailType]
  
  // -------------------------------------------------
  // 6. GENEROVÁNÍ APLIKACÍ - SINGLE PRODUCT RULE
  // -------------------------------------------------
  // AGRONOMICKÁ STRATEGIE (opraveno dle požadavků zákazníka):
  // - ❌ NIKDY nemíchat produkty v jedné aplikaci (jeden rok = jeden produkt)
  // - ✅ Pokud Mg < 130 mg/kg: Použít 100% DOLOMIT dokud není Mg nasyceno
  // - ✅ Pokud Mg ≥ 130 mg/kg: Použít čistý VÁPENEC (nejvyšší CaO obsah)
  // - ✅ Max dávka na aplikaci: 2.0 t CaO/ha pro střední půdu
  // - ✅ Interval mezi aplikacemi: 3 roky (běžně), 2 roky (urgentní)
  
  const applications: LimingApplication[] = []
  let remainingCaoPerHa = totalCaoNeedPerHa
  let currentPh = input.currentPh
  let currentMg = input.currentMg || 90 // Default hodnota pokud není zadána
  let year = new Date().getFullYear()
  let sequenceOrder = 1
  
  // Limity - VARIANT A (ENV-based approach)
  const MG_OPTIMAL_LIMIT = 140 // mg/kg - nad touto hodnotou přejdeme na čistý vápenec (THRESHOLD pro "Good" Mg)
  const MG_ANNUAL_DEPLETION = 5 // mg/kg/rok - přirozená ztráta vyplavováním a sklizní
  const maxApplications = 8 // DB constraint year <= 2050
  
  // Najdeme produkty podle typu
  const dolomiteProducts = availableProducts
    .filter(p => p.mgoContent > 15) // Jen vysoký obsah MgO
    .sort((a, b) => b.mgoContent - a.mgoContent) // Seřadit dle MgO (nejvyšší první)
  
  const calciteProducts = availableProducts
    .filter(p => p.mgoContent < 5) // Čistý vápenec (bez MgO)
    .sort((a, b) => b.caoContent - a.caoContent) // Seřadit dle CaO (nejvyšší první)
  
  // HLAVNÍ CYKLUS: Pokračuj dokud zbývá CaO
  let lastApplicationYear = year // Sledování roku poslední aplikace pro acidifikaci
  
  while (remainingCaoPerHa > 0.1 && applications.length < maxApplications) {
    // -----------------------------------------------
    // 6.0 ACIDIFIKACE & Mg DEPLETION - Změny od poslední aplikace
    // -----------------------------------------------
    
    let rokyOdMinule = 0
    if (applications.length > 0) {
      rokyOdMinule = year - lastApplicationYear
      
      // Aplikovat změny za uplynulé roky
      if (rokyOdMinule > 0) {
        // 1) ACIDIFIKACE - Pokles pH
        const phPoAcidifikaci = vypoctiPhPoAcidifikaci(currentPh, soilDetailType, rokyOdMinule)
        currentPh = phPoAcidifikaci
        
        // 2) Mg DEPLETION - Přirozená ztráta hořčíku
        // Příčiny: vyplavování, sklizeň plodin, imobilizace v půdním komplexu
        currentMg -= rokyOdMinule * MG_ANNUAL_DEPLETION
        currentMg = Math.max(currentMg, 30) // Minimální hodnota Mg v půdě
        
        // Varování při dlouhém intervalu a nízkém pH
        if (rokyOdMinule > 4 && currentPh < 5.5) {
          warnings.push(
            `⚠️ Dlouhý interval ${rokyOdMinule} let způsobil pokles pH na ${currentPh.toFixed(1)} ` +
            `(pod optimální hodnotu 5.5). Doporučujeme zkrátit interval mezi aplikacemi.`
          )
        }
        
        // Varování při depleci Mg na kritickou úroveň
        if (currentMg < 80) {
          warnings.push(
            `⚠️ Mg kleslo na kritickou úroveň ${currentMg.toFixed(0)} mg/kg ` +
            `(deplece ${rokyOdMinule * MG_ANNUAL_DEPLETION} mg/kg za ${rokyOdMinule} let). ` +
            `Nutné použít dolomit.`
          )
        }
      }
    }
    
    // ⚠️ CRITICAL: phBefore & mgBefore MUST be AFTER acidification/depletion!
    const phBefore = currentPh
    const mgBefore = currentMg
    
    // -----------------------------------------------
    // 6.1 VÝBĚR PRODUKTU (SINGLE PRODUCT RULE)
    // -----------------------------------------------
    // DŮLEŽITÉ: Používáme currentMg PO depleci (mgBefore), ne původní hodnotu!
    
    let selectedProduct: LimeProduct | null = null
    
    // PRAVIDLO 1: Pokud Mg < 140 mg/kg → 100% DOLOMIT
    if (mgBefore < MG_OPTIMAL_LIMIT) {
      if (dolomiteProducts.length > 0) {
        selectedProduct = dolomiteProducts[0] // Nejvyšší obsah MgO
      } else {
        warnings.push(
          `⚠️ UPOZORNĚNÍ: Mg je nízké (${mgBefore.toFixed(0)} mg/kg), ale dolomit není dostupný. ` +
          `Používám vápenec, což neřeší deficit hořčíku.`
        )
        selectedProduct = calciteProducts.length > 0 ? calciteProducts[0] : availableProducts[0]
      }
    } 
    // PRAVIDLO 2: Pokud Mg ≥ 140 mg/kg → Čistý VÁPENEC (max CaO)
    else {
      if (calciteProducts.length > 0) {
        selectedProduct = calciteProducts[0] // Nejvyšší obsah CaO
      } else {
        // Fallback: vezmeme jakýkoliv produkt
        selectedProduct = availableProducts[0]
      }
    }
    
    // Bezpečnostní kontrola
    if (!selectedProduct) {
      warnings.push(
        `⚠️ CHYBA: Žádný produkt není k dispozici pro aplikaci ${sequenceOrder}. ` +
        `Zkontrolujte databázi produktů.`
      )
      break
    }
    
    // -----------------------------------------------
    // 6.2 VÝPOČET DÁVKY - ENV-BASED (VARIANT A)
    // -----------------------------------------------
    // KRITICKÁ ZMĚNA: Používáme ENV místo pouze CaO obsahu
    // Tím zohledníme "Total Neutralizing Power" MgO (1.39x silnější než CaO)
    
    // Kolik CaO chceme aplikovat v této aplikaci?
    const targetCaoThisApp = Math.min(maxDoseCao, remainingCaoPerHa)
    
    // Calculate ENV (Effective Neutralizing Value)
    const env = getENV(
      selectedProduct.caoContent / 100,  // Convert % to decimal
      selectedProduct.mgoContent / 100   // Convert % to decimal
    )
    
    // NOVÝ VÝPOČET: Dávka produktu založená na ENV
    // Příklad: Pro Dolomit (30% CaO, 18% MgO):
    //   ENV = 0.30 + (0.18 * 1.39) = 0.55
    //   Pokud potřebujeme 2.0 t CaO, dávka = 2.0 / 0.55 = 3.64 t produktu
    //   (místo starého výpočtu: 2.0 / 0.30 = 6.67 t produktu)
    const productDose = targetCaoThisApp / env
    
    // Výsledné množství živin (fyzické, pro legislativu)
    const caoThisApp = productDose * (selectedProduct.caoContent / 100)
    const mgoThisApp = productDose * (selectedProduct.mgoContent / 100)
    
    // -----------------------------------------------
    // 6.3 PREDIKCE ZMĚN - ENV-BASED
    // -----------------------------------------------
    // KRITICKÁ ZMĚNA: pH predikce musí zohlednit ENV (celkovou neutralizační sílu)
    // Predikce vychází z hodnot PO depleci/acidifikaci (phBefore, mgBefore)
    
    // Calculate EFFECTIVE CaO applied (včetně neutralizační síly MgO)
    // Pro Dolomit: effectiveCaoApplied bude vyšší než fyzické caoThisApp
    // Příklad: 3.64 t Dolomitu × 0.55 ENV = 2.0 t CaO-eq
    const effectiveCaoApplied = productDose * env
    
    // Use EFFECTIVE CaO for pH prediction (NOT physical CaO)
    // This ensures the pH graph correctly shows the STRONGER effect of Dolomite
    const phChange = calculatePhChange(effectiveCaoApplied, soilDetailType, phBefore)
    const phAfter = Math.min(phBefore + phChange, input.targetPh)
    
    const mgChange = calculateMgChange(mgoThisApp, input.soilType)
    const mgAfter = mgBefore + mgChange // ✅ CRITICAL: Akumulace Mg od depleted hodnoty!
    
    // -----------------------------------------------
    // 6.4 DOPORUČENÍ
    // -----------------------------------------------
    // DŮLEŽITÉ: Doporučení je založeno na hodnotách PO depleci/acidifikaci
    
    let recommendation = ''
    if (mgBefore < 80) {
      recommendation = `Kriticky nízké Mg (${mgBefore.toFixed(0)} mg/kg) - dolomit NUTNÝ`
    } else if (mgBefore < 140) {
      recommendation = `Nízké Mg (${mgBefore.toFixed(0)} mg/kg) - doporučen dolomitický vápenec`
    } else if (phBefore < 5.0) {
      recommendation = `Urgentní vápnění - pH ${phBefore.toFixed(1)}`
    } else if (phBefore < 5.5) {
      recommendation = `Intenzivní vápnění - pH ${phBefore.toFixed(1)}`
    } else {
      recommendation = `Udržovací vápnění (Mg: ${mgBefore.toFixed(0)} mg/kg dostatečné)`
    }
    
    // -----------------------------------------------
    // 6.5 PŘIDÁNÍ APLIKACE
    // -----------------------------------------------
    
    applications.push({
      year,
      season: 'podzim',
      sequenceOrder,
      product: selectedProduct,
      products: undefined, // ❌ Žádná kombinace produktů!
      dosePerHa: productDose,
      totalDose: productDose * input.area,
      caoPerHa: caoThisApp,
      mgoPerHa: mgoThisApp,
      phBefore,
      phAfter,
      mgAfter,
      recommendation
    })
    
    // -----------------------------------------------
    // 6.6 AKTUALIZACE PRO DALŠÍ ITERACI
    // -----------------------------------------------
    
    remainingCaoPerHa -= caoThisApp
    currentPh = phAfter
    currentMg = mgAfter
    lastApplicationYear = year // Uložit rok pro acidifikaci
    
    // INTERVAL: kratší pro urgentní případy
    const interval = currentPh < 5.5 ? 2 : 3 // 2 roky pokud urgentní, jinak 3 roky
    year += interval
    sequenceOrder++
    
    // Bezpečnostní kontrola: pokud rok přesáhne 2050, ukončit
    if (year > 2050) {
      warnings.push(
        `Plán byl omezen na aplikace do roku 2050. ` +
        `Zbývající potřeba: ${remainingCaoPerHa.toFixed(2)} t CaO/ha.`
      )
      break
    }
  }
  
  // -------------------------------------------------
  // 6.7 AUTOMATICKÁ UDRŽOVACÍ APLIKACE
  // -------------------------------------------------
  // Po dokončení korekční fáze, naplánujeme jednu udržovací aplikaci za 3 roky
  // Spustí se když:
  // 1. Máme alespoň jednu aplikaci
  // 2. Smyčka skončila (buď zbývající CaO < 0.1 nebo dosaženo targetPh)
  // 3. Rok pro udržovací aplikaci je před 2050
  
  if (applications.length > 0 && remainingCaoPerHa <= 0.1 && year <= 2047) {
    // Použijeme rok poslední aplikace jako výchozí bod
    const lastApp = applications[applications.length - 1]
    const maintenanceYear = lastApp.year + 3 // Udržovací aplikace za 3 roky
    
    // Simulace acidifikace za 3 roky od poslední aplikace
    const phAfterDegradation = vypoctiPhPoAcidifikaci(lastApp.phAfter, soilDetailType, 3)
    
    // Pokles pH za tyto 3 roky
    const phDropDueToDegradation = lastApp.phAfter - phAfterDegradation
    
    // Cílové pH pro udržovací aplikaci (vrátit na targetPh)
    const phGapToTarget = input.targetPh - phAfterDegradation
    
    // Pokud už je pH dostatečně blízko targetPh, použij jen kompenzaci acidifikace
    // Jinak se snaž dostat na targetPh
    const desiredPhIncrease = Math.max(phDropDueToDegradation, phGapToTarget)
    
    // Potřeba CaO k dosažení požadovaného zvýšení pH
    // Velmi konzervativní odhad: 1 t CaO/ha ≈ 0.3-0.5 pH jednotky pro střední půdu
    const phResponseFactor = soilDetailType === 'hlinitopiscita' ? 0.45 :
                             soilDetailType === 'hlinita' ? 0.30 :
                             soilDetailType === 'jilovitohlinita' ? 0.25 : 0.30
    
    const caoNeededForMaintenance = desiredPhIncrease / phResponseFactor
    
    // Použijeme Mg stav po poslední aplikaci
    const mgBeforeMaintenance = lastApp.mgAfter || currentMg
    
    // DŮLEŽITÉ: Výběr produktu podle stavu Mg po poslední aplikaci
    let maintenanceProduct: LimeProduct | null = null
    
    // **PRAVIDLO PRO UDRŽOVACÍ APLIKACI:**
    // Pokud Mg > 150 mg/kg (dostatečné), VŽDY použij čistý vápenec (bez MgO)
    // aby nedošlo k přesycení hořčíkem
    if (mgBeforeMaintenance > 150) {
      // Priorita: Čistý vápenec (calcitic)
      if (calciteProducts.length > 0) {
        maintenanceProduct = calciteProducts[0]
      } else {
        // Fallback: jakýkoliv produkt, ale preferujeme nízký MgO
        maintenanceProduct = availableProducts
          .sort((a, b) => a.mgoContent - b.mgoContent)[0]
      }
    } else if (mgBeforeMaintenance < 105) {
      // Mg stále nízké → použij dolomit
      if (dolomiteProducts.length > 0) {
        maintenanceProduct = dolomiteProducts[0]
      } else {
        maintenanceProduct = calciteProducts.length > 0 ? calciteProducts[0] : availableProducts[0]
      }
    } else {
      // Mg v optimálním rozmezí (105-150) → čistý vápenec je vhodnější
      maintenanceProduct = calciteProducts.length > 0 ? calciteProducts[0] : availableProducts[0]
    }
    
    // Přidáme udržovací aplikaci pokud:
    // 1. Máme vybraný produkt
    // 2. Potřeba CaO je alespoň 0.05 t/ha (50 kg/ha) - i malá dávka má smysl
    // 3. Rok je v rozumném rozmezí
    if (maintenanceProduct && caoNeededForMaintenance > 0.05 && maintenanceYear <= 2050) {
      // Výpočet dávky produktu - ENV-BASED
      const maintenanceEnv = getENV(
        maintenanceProduct.caoContent / 100,
        maintenanceProduct.mgoContent / 100
      )
      const maintenanceDose = caoNeededForMaintenance / maintenanceEnv
      const maintenanceCao = maintenanceDose * (maintenanceProduct.caoContent / 100)
      const maintenanceMgo = maintenanceDose * (maintenanceProduct.mgoContent / 100)
      
      // Predikce pH po aplikaci - použij EFFECTIVE CaO
      const effectiveMaintenanceCao = maintenanceDose * maintenanceEnv
      const phChangeFromMaintenance = calculatePhChange(effectiveMaintenanceCao, soilDetailType, phAfterDegradation)
      const finalPhAfterMaintenance = Math.min(phAfterDegradation + phChangeFromMaintenance, input.targetPh + 0.2)
      
      // Predikce Mg po aplikaci
      const mgChangeFromMaintenance = calculateMgChange(maintenanceMgo, input.soilType)
      const finalMgAfterMaintenance = mgBeforeMaintenance + mgChangeFromMaintenance
      
      // Přidání udržovací aplikace
      applications.push({
        year: maintenanceYear,
        season: 'podzim',
        sequenceOrder: sequenceOrder,
        product: maintenanceProduct,
        products: undefined,
        dosePerHa: maintenanceDose,
        totalDose: maintenanceDose * input.area,
        caoPerHa: maintenanceCao,
        mgoPerHa: maintenanceMgo,
        phBefore: phAfterDegradation,
        phAfter: finalPhAfterMaintenance,
        mgAfter: finalMgAfterMaintenance,
        recommendation: 'Udržovací vápnění (automaticky naplánováno)'
      })
      
      // Info pro uživatele
      warnings.push(
        `ℹ️ Automaticky naplánována udržovací aplikace v roce ${maintenanceYear} ` +
        `(${maintenanceCao.toFixed(2)} t CaO/ha) k udržení cílového pH ${input.targetPh.toFixed(1)}.`
      )
      
      // Pokud bylo použito čisté vápno místo dolomitu kvůli vysokému Mg
      if (mgBeforeMaintenance > 150 && maintenanceProduct.mgoContent < 5) {
        warnings.push(
          `ℹ️ Pro udržovací aplikaci byl vybrán čistý vápenec (bez MgO) ` +
          `z důvodu dostatečného obsahu hořčíku v půdě (${mgBeforeMaintenance.toFixed(0)} mg/kg).`
        )
      }
      
      // Pokud bylo použito čisté vápno i při optimálním Mg
      if (mgBeforeMaintenance >= 105 && mgBeforeMaintenance <= 150 && maintenanceProduct.mgoContent < 5) {
        warnings.push(
          `ℹ️ Pro udržovací aplikaci byl vybrán čistý vápenec, protože hořčík je v optimálním rozmezí ` +
          `(${mgBeforeMaintenance.toFixed(0)} mg/kg).`
        )
      }
    }
  }
  
  // -------------------------------------------------
  // 7. UPOZORNĚNÍ A KONTROLY
  // -------------------------------------------------
  
  if (applications.length > 1) {
    warnings.push('Doporučeny kontrolní rozbory 1 rok po každé aplikaci')
  }
  
  if (remainingCaoPerHa > 0.1) {
    warnings.push(
      `⚠️ POZOR: Plán nedosahuje plné potřeby CaO! ` +
      `Zbývá ${remainingCaoPerHa.toFixed(2)} t CaO/ha (celkem ${(remainingCaoPerHa * input.area).toFixed(1)} t). ` +
      `Důvod může být: limit počtu aplikací (max ${maxApplications}), rok > 2050, nebo nedosažitelné cílové pH.`
    )
  }
  
  if (applications.length === 0) {
    warnings.push('Nepodařilo se vygenerovat žádnou aplikaci')
  }
  
  if (input.currentMg < 80 && !applications.some(a => a.product.mgoContent > 15)) {
    warnings.push('KRITICKÉ: Mg pod 80 mg/kg, ale nebyl vybrán dolomit s vysokým obsahem MgO!')
  }
  
  // -------------------------------------------------
  // 8. VRÁCENÍ VÝSLEDKU
  // -------------------------------------------------
  
  return {
    totalCaNeed,
    totalCaoNeed,
    totalCaNeedPerHa,
    totalCaoNeedPerHa,
    applications,
    warnings
  }
}

// =====================================================
// FORMÁTOVÁNÍ PRO EXCEL EXPORT
// =====================================================

export function formatLimingPlanForExport(
  plan: LimingPlan,
  parcelName: string,
  area: number
) {
  return {
    summary: {
      pozemek: parcelName,
      vymera: `${area.toFixed(2)} ha`,
      celkova_potreba_cao: `${plan.totalCaoNeed.toFixed(2)} t`,
      potreba_cao_ha: `${plan.totalCaoNeedPerHa.toFixed(2)} t/ha`,
      celkova_potreba_ca: `${plan.totalCaNeed.toFixed(2)} t Ca`,
      potreba_ca_ha: `${plan.totalCaNeedPerHa.toFixed(2)} t Ca/ha`,
      pocet_aplikaci: plan.applications.length,
      generovano: new Date().toLocaleDateString('cs-CZ')
    },
    applications: plan.applications.map(app => ({
      rok: app.year,
      obdobi: app.season === 'jaro' ? 'jaro' : 
              app.season === 'leto' ? 'léto' : 'podzim',
      produkt: app.product.name,
      cao_obsah: `${app.product.caoContent} %`,
      mgo_obsah: `${app.product.mgoContent} %`,
      davka_ha: `${app.dosePerHa.toFixed(2)} t/ha`,
      davka_celkem: `${app.totalDose.toFixed(1)} t`,
      cao_ha: `${app.caoPerHa.toFixed(2)} t/ha`,
      mgo_ha: app.mgoPerHa ? `${app.mgoPerHa.toFixed(2)} t/ha` : '-',
      ph_pred: app.phBefore.toFixed(1),
      ph_po: app.phAfter.toFixed(1),
      mg_po: app.mgAfter ? `${Math.round(app.mgAfter)} mg/kg` : '-',
      doporuceni: app.recommendation
    })),
    warnings: plan.warnings
  }
}

