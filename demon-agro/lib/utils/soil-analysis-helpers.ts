import type { PhCategory, NutrientCategory } from './soil-categories'
import { categorizePh, categorizeNutrient } from './soil-categories'
import type { SoilType } from '@/lib/types/database'

export interface GroupedAnalysis {
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
 * Groups soil analyses by date and calculates arithmetic averages
 * 
 * When multiple analyses exist for the same date, this function:
 * 1. Groups them together
 * 2. Calculates averages for all nutrient values
 * 3. Returns a single record per date with averaged values
 * 
 * This follows AZZP methodology which requires averaging when multiple
 * samples are taken from the same parcel on the same day.
 */
export function groupAndAverageAnalyses(analyses: any[]): GroupedAnalysis[] {
  if (!analyses || analyses.length === 0) return []
  
  // Helper to round to 2 decimal places
  const round2 = (num: number) => Math.round(num * 100) / 100
  
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
  
  grouped.forEach((group, date) => {
    const count = group.length
    const ids = group.map(a => a.id)
    
    // Calculate averaged values (rounded to 2 decimal places)
    const avgPh = round2(group.reduce((sum, a) => sum + a.ph, 0) / count)
    const avgP = round2(group.reduce((sum, a) => sum + a.p, 0) / count)
    const avgK = round2(group.reduce((sum, a) => sum + a.k, 0) / count)
    const avgMg = round2(group.reduce((sum, a) => sum + a.mg, 0) / count)
    const avgCa = group[0].ca ? round2(group.reduce((sum, a) => sum + (a.ca || 0), 0) / count) : null
    const avgS = group[0].s ? round2(group.reduce((sum, a) => sum + (a.s || 0), 0) / count) : null
    
    // Get soil_type from first analysis (assuming all analyses are from same parcel)
    // @ts-ignore - parcels might not be loaded in all contexts
    const soilType: SoilType = group[0].parcels?.soil_type || group[0].soil_type || 'S'
    
    // Recalculate categories based on averaged values
    const ph_category = categorizePh(avgPh)
    const p_category = categorizeNutrient('P', avgP, soilType)
    const k_category = categorizeNutrient('K', avgK, soilType)
    const mg_category = categorizeNutrient('Mg', avgMg, soilType)
    const ca_category = avgCa ? categorizeNutrient('Ca', avgCa, soilType) : null
    const s_category = avgS ? categorizeNutrient('S', avgS, soilType) : null
    
    const avg: GroupedAnalysis = {
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
      k_mg_ratio: group[0].k_mg_ratio ? round2(group.reduce((sum, a) => sum + (a.k_mg_ratio || 0), 0) / count) : null,
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

