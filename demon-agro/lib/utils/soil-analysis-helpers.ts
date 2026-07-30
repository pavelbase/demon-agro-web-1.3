import type { PhCategory, NutrientCategory } from './soil-categories'
import { categorizePh, categorizeNutrient } from './soil-categories'
import type { SoilType, Culture } from '@/lib/types/database'

export interface GroupedAnalysis {
  id: string
  analysis_date: string
  count: number
  ids: string[]
  originalAnalyses: any[]
  ph: number
  p: number
  k: number
  mg: number
  ca: number | null
  s: number | null
  k_mg_ratio: number | null
  ph_category: PhCategory | null
  p_category: NutrientCategory | null
  k_category: NutrientCategory | null
  mg_category: NutrientCategory | null
  ca_category: NutrientCategory | null
  s_category: NutrientCategory | null
  source_documents: string[]
  source_document: string | null  // For compatibility - first document
  lab_name: string | null
  notes: string | null
}

/**
 * Aritmetický průměr z hodnot, které skutečně existují.
 * Nully se do průměru nepočítají (ani do jmenovatele) - jinak by jeden chybějící
 * rozbor síry stáhl průměr celého pozemku dolů. Vrací null, pokud nemá z čeho počítat.
 */
function averageOf(values: any[]): number | null {
  const numbers = values
    .map(v => (typeof v === 'number' ? v : parseFloat(v)))
    .filter(v => typeof v === 'number' && Number.isFinite(v))

  if (numbers.length === 0) return null

  const mean = numbers.reduce((sum, v) => sum + v, 0) / numbers.length
  return Math.round(mean * 100) / 100
}

/**
 * Seskupí rozbory podle data a spočítá aritmetický průměr.
 *
 * Metodika ÚKZÚZ: pokud má pozemek víc vzorků z jednoho odběru, hodnotí se
 * VŽDY jejich aritmetický průměr, nikdy jeden vybraný vzorek. Vzorky uvnitř
 * pozemku se běžně liší i o víc než 1 pH (viz pozemek 9701/5: 5,7 / 4,0 / 4,4),
 * takže výběr jednoho vzorku dá úplně jiné doporučení než průměr.
 *
 * Funkce je záměrně DETERMINISTICKÁ a nezávislá na pořadí vstupu:
 * - průměr je z definice nezávislý na pořadí,
 * - reprezentativní údaje (id, laboratoř, zdrojový dokument) se berou ze vzorku
 *   s nejmenším id, ne z toho, který zrovna přišel z databáze první.
 * Bez toho dva běhy nad stejnými daty vrátí jiný výsledek.
 *
 * Vrací jeden záznam na datum, seřazeno od nejnovějšího.
 */
export function groupAndAverageAnalyses(analyses: any[], soilType?: SoilType, culture?: Culture): GroupedAnalysis[] {
  if (!analyses || analyses.length === 0) return []
  
  // Group by date
  const grouped = new Map<string, any[]>()
  
  analyses.forEach(analysis => {
    const date = analysis.analysis_date
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(analysis)
  })
  
  // Calculate averages for each date group
  const result: GroupedAnalysis[] = []
  
  grouped.forEach((unorderedGroup, date) => {
    // Stabilní pořadí uvnitř skupiny - determinuje, ze kterého vzorku se
    // převezmou needěditelné údaje (id, lab_name, source_document).
    const group = [...unorderedGroup].sort((a, b) => String(a.id).localeCompare(String(b.id)))
    const count = group.length
    const ids = group.map(a => a.id)
    
    // Aritmetický průměr pozemku (zaokrouhleno na 2 desetinná místa)
    const avgPh = averageOf(group.map(a => a.ph)) ?? 0
    const avgP = averageOf(group.map(a => a.p)) ?? 0
    const avgK = averageOf(group.map(a => a.k)) ?? 0
    const avgMg = averageOf(group.map(a => a.mg)) ?? 0
    const avgCa = averageOf(group.map(a => a.ca))
    const avgS = averageOf(group.map(a => a.s))
    
    // Get soil_type from parameter, or try to get from analysis data, fallback to 'S'
    // @ts-ignore - parcels might not be loaded in all contexts
    const effectiveSoilType: SoilType = soilType || group[0].parcels?.soil_type || group[0].soil_type || 'S'
    
    // Recalculate categories based on averaged values (dle kultury - chmelnice
    // mají vlastní kritéria zásobenosti, tab. 13)
    const ph_category = categorizePh(avgPh)
    const p_category = categorizeNutrient('P', avgP, effectiveSoilType, culture)
    const k_category = categorizeNutrient('K', avgK, effectiveSoilType, culture)
    const mg_category = categorizeNutrient('Mg', avgMg, effectiveSoilType, culture)
    const ca_category = avgCa ? categorizeNutrient('Ca', avgCa, effectiveSoilType) : null
    const s_category = avgS ? categorizeNutrient('S', avgS, effectiveSoilType) : null
    
    const avg: GroupedAnalysis = {
      id: group[0].id,
      analysis_date: date,
      count,
      ids,
      originalAnalyses: group,
      ph: avgPh,
      p: avgP,
      k: avgK,
      mg: avgMg,
      ca: avgCa,
      s: avgS,
      // K/Mg počítáme z průměrů pozemku, ne jako průměr poměrů - průměr podílů
      // není podíl průměrů a u pozemků s rozdílnými vzorky se rozchází.
      k_mg_ratio: avgMg > 0 ? Math.round((avgK / avgMg) * 100) / 100 : null,
      ph_category,
      p_category,
      k_category,
      mg_category,
      ca_category,
      s_category,
      source_documents: group.map(a => a.source_document).filter(Boolean),
      source_document: group[0].source_document,
      lab_name: group[0].lab_name,
      notes: count > 1 ? `Aritmetický průměr z ${count} rozborů` : group[0].notes,
    }
    
    result.push(avg)
  })
  
  // Sort by date descending (newest first)
  return result.sort((a, b) => new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime())
}

