/**
 * Kategorizace pH a živin podle typu půdy
 * Dle české metodiky Mehlich 3 (ÚKZÚZ, vyhláška 335/2017 Sb.)
 */

export type SoilType = 'L' | 'S' | 'T' | null
export type PhCategory = 'extremne_kysela' | 'silne_kysela' | 'slabe_kysela' | 'neutralni' | 'slabe_alkalicka' | 'alkalicka' | null
export type NutrientCategory = 'nizky' | 'vyhovujici' | 'dobry' | 'vysoky' | 'velmi_vysoky' | null

/**
 * Kategorizace pH (stejná pro všechny půdy)
 * 
 * @param ph - Hodnota pH (CaCl₂)
 * @returns Kategorie pH
 */
export function categorizePh(ph: number): PhCategory {
  if (ph < 4.5) return 'extremne_kysela'
  if (ph < 5.6) return 'silne_kysela'
  if (ph < 6.6) return 'slabe_kysela'
  if (ph < 7.3) return 'neutralni'
  if (ph < 8.1) return 'slabe_alkalicka'
  return 'alkalicka'
}

/**
 * Kategorizace živin podle typu půdy - Mehlich 3 metodika
 * 
 * @param nutrient - Typ živiny (P, K, Mg, Ca, S)
 * @param value - Hodnota v mg/kg
 * @param soilType - Typ půdy (L=lehká, S=střední, T=těžká)
 * @returns Kategorie živiny
 */
export function categorizeNutrient(
  nutrient: 'P' | 'K' | 'Mg' | 'Ca' | 'S',
  value: number,
  soilType: SoilType
): NutrientCategory {
  const type = soilType || 'S'
  
  switch (nutrient) {
    case 'P':
      if (type === 'L') {
        if (value <= 50) return 'nizky'
        if (value <= 80) return 'vyhovujici'
        if (value <= 125) return 'dobry'
        if (value <= 170) return 'vysoky'
        return 'velmi_vysoky'
      }
      if (type === 'S') {
        if (value <= 100) return 'nizky'
        if (value <= 160) return 'vyhovujici'
        if (value <= 250) return 'dobry'
        if (value <= 350) return 'vysoky'
        return 'velmi_vysoky'
      }
      // type === 'T'
      if (value <= 105) return 'nizky'
      if (value <= 170) return 'vyhovujici'
      if (value <= 300) return 'dobry'
      if (value <= 450) return 'vysoky'
      return 'velmi_vysoky'
      
    case 'K':
      if (type === 'L') {
        if (value <= 80) return 'nizky'
        if (value <= 135) return 'vyhovujici'
        if (value <= 200) return 'dobry'
        if (value <= 300) return 'vysoky'
        return 'velmi_vysoky'
      }
      if (type === 'S') {
        if (value <= 105) return 'nizky'
        if (value <= 160) return 'vyhovujici'
        if (value <= 250) return 'dobry'
        if (value <= 380) return 'vysoky'
        return 'velmi_vysoky'
      }
      // type === 'T'
      if (value <= 170) return 'nizky'
      if (value <= 260) return 'vyhovujici'
      if (value <= 400) return 'dobry'
      if (value <= 600) return 'vysoky'
      return 'velmi_vysoky'
      
    case 'Mg':
      if (type === 'L') {
        if (value <= 80) return 'nizky'
        if (value <= 135) return 'vyhovujici'
        if (value <= 200) return 'dobry'
        if (value <= 300) return 'vysoky'
        return 'velmi_vysoky'
      }
      if (type === 'S') {
        if (value <= 105) return 'nizky'
        if (value <= 160) return 'vyhovujici'
        if (value <= 250) return 'dobry'
        if (value <= 380) return 'vysoky'
        return 'velmi_vysoky'
      }
      // type === 'T'
      if (value <= 120) return 'nizky'
      if (value <= 220) return 'vyhovujici'
      if (value <= 350) return 'dobry'
      if (value <= 550) return 'vysoky'
      return 'velmi_vysoky'
      
    case 'Ca':
      // Vápník nemá rozdíly podle půdního typu
      if (value < 1500) return 'nizky'
      if (value <= 4000) return 'dobry'
      return 'vysoky'
      
    case 'S':
      // Síra nemá rozdíly podle půdního typu
      if (value < 10) return 'nizky'
      if (value < 15) return 'vyhovujici'
      if (value < 25) return 'dobry'
      if (value < 40) return 'vysoky'
      return 'velmi_vysoky'
      
    default:
      return null
  }
}

/**
 * Získání popisného názvu kategorie pH
 */
export function getPhCategoryLabel(category: PhCategory): string {
  const labels: Record<NonNullable<PhCategory>, string> = {
    extremne_kysela: 'Extrémně kyselá',
    silne_kysela: 'Silně kyselá',
    slabe_kysela: 'Slabě kyselá',
    neutralni: 'Neutrální',
    slabe_alkalicka: 'Slabě alkalická',
    alkalicka: 'Alkalická',
  }
  
  return category ? labels[category] : 'Neznámá'
}

/**
 * Získání popisného názvu kategorie živiny
 */
export function getNutrientCategoryLabel(category: NutrientCategory): string {
  const labels: Record<NonNullable<NutrientCategory>, string> = {
    nizky: 'Nízký',
    vyhovujici: 'Vyhovující',
    dobry: 'Dobrý',
    vysoky: 'Vysoký',
    velmi_vysoky: 'Velmi vysoký',
  }
  
  return category ? labels[category] : 'Neznámá'
}

/**
 * Obecná funkce pro získání labelu kategorie
 */
export function getCategoryLabel(category: PhCategory | NutrientCategory): string {
  if (!category) return 'Neznámá'
  
  // pH kategorie
  const phLabels: Record<string, string> = {
    extremne_kysela: 'Extrémně kyselá',
    silne_kysela: 'Silně kyselá',
    slabe_kysela: 'Slabě kyselá',
    neutralni: 'Neutrální',
    slabe_alkalicka: 'Slabě alkalická',
    alkalicka: 'Alkalická',
  }
  
  if (category in phLabels) {
    return phLabels[category]
  }
  
  // Nutrient kategorie
  const nutrientLabels: Record<string, string> = {
    nizky: 'Nízký',
    vyhovujici: 'Vyhovující',
    dobry: 'Dobrý',
    vysoky: 'Vysoký',
    velmi_vysoky: 'Velmi vysoký',
  }
  
  return nutrientLabels[category] || 'Neznámá'
}

/**
 * Získání barvy pro kategorie (Tailwind CSS)
 */
export function getCategoryColor(category: PhCategory | NutrientCategory): string {
  if (!category) return 'gray'
  
  // Červená - špatný stav (nízký obsah, extrémně kyselá)
  if (category === 'nizky' || category === 'extremne_kysela') {
    return 'red'
  }
  
  // Oranžová - podprůměrný stav (vyhovující, silně kyselá)
  if (category === 'vyhovujici' || category === 'silne_kysela' || category === 'slabe_kysela') {
    return 'orange'
  }
  
  // Zelená - optimální stav (dobrý, neutrální)
  if (category === 'dobry' || category === 'neutralni') {
    return 'green'
  }
  
  // Modrá - nadprůměrný stav (vysoký, slabě alkalická)
  if (category === 'vysoky' || category === 'slabe_alkalicka') {
    return 'blue'
  }
  
  // Fialová - extrémní stav (velmi vysoký, alkalická)
  if (category === 'velmi_vysoky' || category === 'alkalicka') {
    return 'purple'
  }
  
  return 'gray'
}

/**
 * Vyhodnocení pH podle typu půdy a způsobu využití
 * 
 * Cílové pH:
 * - Orná půda: L=6.0, S=6.5, T=6.8
 * - TTP: L=5.5, S=6.0, T=6.3
 * 
 * @param ph - Hodnota pH
 * @param soilType - Typ půdy (L/S/T)
 * @param landUse - Způsob využití (orna/ttp)
 * @returns Vyhodnocení pH včetně doporučení
 */
export function evaluatePhForSoilType(
  ph: number, 
  soilType: SoilType,
  landUse: 'orna' | 'ttp' = 'orna'
): {
  category: PhCategory
  isOptimal: boolean
  targetPh: number
  recommendation: string
  status: 'urgentni_vapneni' | 'intenzivni_vapneni' | 'udrzovaci_vapneni' | 'optimalni' | 'nad_optimum'
} {
  const category = categorizePh(ph)
  
  // Cílové pH podle půdního typu a využití
  const targets = {
    orna: {
      L: 6.0,
      S: 6.5,
      T: 6.8,
    },
    ttp: {
      L: 5.5,
      S: 6.0,
      T: 6.3,
    }
  }
  
  const type = soilType || 'S'
  const targetPh = targets[landUse][type]
  
  // Tolerance ±0.3 pH jednotky
  const isOptimal = Math.abs(ph - targetPh) <= 0.3
  
  // Určení statusu a doporučení
  let status: 'urgentni_vapneni' | 'intenzivni_vapneni' | 'udrzovaci_vapneni' | 'optimalni' | 'nad_optimum'
  let recommendation: string
  
  if (ph < 5.5) {
    status = 'urgentni_vapneni'
    const diff = (targetPh - ph).toFixed(1)
    recommendation = `Urgentní vápnění! Zvýšit pH o ${diff} jednotky.`
  } else if (ph < targetPh - 0.5) {
    status = 'intenzivni_vapneni'
    const diff = (targetPh - ph).toFixed(1)
    recommendation = `Intenzivní vápnění doporučeno (zvýšit o ${diff} pH).`
  } else if (ph < targetPh - 0.3) {
    status = 'udrzovaci_vapneni'
    const diff = (targetPh - ph).toFixed(1)
    recommendation = `Udržovací vápnění (zvýšit o ${diff} pH).`
  } else if (ph <= targetPh + 0.3) {
    status = 'optimalni'
    recommendation = 'pH je v optimálním rozmezí pro tento typ půdy.'
  } else {
    status = 'nad_optimum'
    recommendation = 'pH je nad optimum - omezit nebo vynechat vápnění.'
  }
  
  return {
    category,
    isOptimal,
    targetPh,
    recommendation,
    status
  }
}

/**
 * Získání labelu pro status vápnění
 */
export function getLimingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    urgentni_vapneni: 'Urgentní vápnění',
    intenzivni_vapneni: 'Intenzivní vápnění',
    udrzovaci_vapneni: 'Udržovací vápnění',
    optimalni: 'Optimální pH',
    nad_optimum: 'Nad optimum',
  }
  
  return labels[status] || 'Neznámý'
}

/**
 * ZDROJE:
 * - Metodika AZZP (Agrochemické zkoušení zemědělských půd)
 * - Vyhláška č. 335/2017 Sb. o agrochemickém zkoušení zemědělských půd
 * - ÚKZÚZ - Ústřední kontrolní a zkušební ústav zemědělský
 * - VFU Brno - Metodika stanovení přístupných živin Mehlich 3
 * 
 * Hodnoty jsou platné pro ornou půdu s metodikou Mehlich 3.
 */
