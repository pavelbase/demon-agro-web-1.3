/**
 * Databázové dotazy pro kalkulačku ekonomických ztrát
 * 
 * ⚠️ DŮLEŽITÉ: Všechny dotazy používají DB_SCHEMA konstanty pro dynamické mapování
 * na skutečná jména tabulek a sloupců v Supabase.
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// DATABÁZOVÉ MAPOVÁNÍ - KONFIGURACE
// ============================================================================

/**
 * Mapování databázového schématu
 * Tento objekt obsahuje skutečné názvy tabulek a sloupců z Supabase.
 * 
 * Pokud by se v budoucnu změnily názvy v databázi, stačí upravit pouze tento objekt.
 */
export const DB_SCHEMA = {
  // Tabulka s pozemky
  POZEMKY_TABLE: 'parcels' as const,
  POZEMKY_COLUMNS: {
    ID: 'id' as const,
    NAZEV: 'name' as const,
    KOD: 'code' as const,
    VYMERA: 'area' as const,
    TYP_PUDY: 'soil_type' as const, // hodnoty: 'L', 'S', 'T'
    USER_ID: 'user_id' as const,
    STATUS: 'status' as const,
  },

  // Tabulka se zdravotní kartou / rozbory
  SOIL_ANALYSES_TABLE: 'soil_analyses' as const,
  SOIL_ANALYSES_COLUMNS: {
    ID: 'id' as const,
    PARCEL_ID: 'parcel_id' as const,
    PH: 'ph' as const,
    CREATED_AT: 'created_at' as const,
    ANALYSIS_DATE: 'analysis_date' as const,
    IS_CURRENT: 'is_current' as const,
  },

  // Vztah mezi tabulkami
  RELATION: {
    // Jeden pozemek má více rozborů (1:N)
    MULTIPLE_ANALYSES: true,
    // Jak vybrat správný rozbor: 'LATEST' = nejnovější podle data
    SELECT_STRATEGY: 'LATEST' as const,
  },
} as const

// ============================================================================
// TYPY PRO VÝSLEDKY DOTAZŮ
// ============================================================================

export interface PozemekProKalkulacku {
  id: string
  nazev: string
  kod: string | null
  vymera_ha: number
  typ_pudy: string // 'L' | 'S' | 'T'
  ph: number
}

// ============================================================================
// DATABÁZOVÉ FUNKCE
// ============================================================================

/**
 * Načte všechny aktivní pozemky uživatele včetně pH z nejnovějšího rozboru
 * 
 * @param userId - ID uživatele
 * @returns Seznam pozemků s pH hodnotami
 * 
 * ⚠️ POUŽÍVÁ POUZE DB_SCHEMA KONSTANTY - žádné hard-coded názvy!
 */
export async function getPozemkyProKalkulacku(
  userId: string
): Promise<PozemekProKalkulacku[]> {
  const supabase = await createClient()
  const { POZEMKY_TABLE, POZEMKY_COLUMNS, SOIL_ANALYSES_TABLE, SOIL_ANALYSES_COLUMNS } =
    DB_SCHEMA

  try {
    // 1. Načteme pozemky s jejich rozbory
    const { data: parcels, error: parcelsError } = await supabase
      .from(POZEMKY_TABLE)
      .select(
        `
        ${POZEMKY_COLUMNS.ID},
        ${POZEMKY_COLUMNS.NAZEV},
        ${POZEMKY_COLUMNS.KOD},
        ${POZEMKY_COLUMNS.VYMERA},
        ${POZEMKY_COLUMNS.TYP_PUDY},
        ${SOIL_ANALYSES_TABLE}!inner (
          ${SOIL_ANALYSES_COLUMNS.PH},
          ${SOIL_ANALYSES_COLUMNS.ANALYSIS_DATE},
          ${SOIL_ANALYSES_COLUMNS.IS_CURRENT}
        )
      `
      )
      .eq(POZEMKY_COLUMNS.USER_ID, userId)
      .eq(POZEMKY_COLUMNS.STATUS, 'active')

    if (parcelsError) {
      console.error('Chyba při načítání pozemků:', parcelsError)
      return []
    }

    if (!parcels || parcels.length === 0) {
      return []
    }

    // 2. Zpracování dat - výběr správného pH podle strategie
    const result: PozemekProKalkulacku[] = []

    for (const parcel of parcels) {
      const analyses = parcel[SOIL_ANALYSES_TABLE]

      if (!analyses || (Array.isArray(analyses) && analyses.length === 0)) {
        // Pozemek nemá žádný rozbor - přeskočíme
        continue
      }

      let selectedPh = 6.0 // Výchozí hodnota

      if (Array.isArray(analyses)) {
        // Máme více rozborů - vybereme podle strategie
        if (DB_SCHEMA.RELATION.SELECT_STRATEGY === 'LATEST') {
          // Seřadíme podle data (nejnovější první)
          const sortedAnalyses = [...analyses].sort((a, b) => {
            const dateA = new Date(a[SOIL_ANALYSES_COLUMNS.ANALYSIS_DATE]).getTime()
            const dateB = new Date(b[SOIL_ANALYSES_COLUMNS.ANALYSIS_DATE]).getTime()
            return dateB - dateA
          })

          selectedPh = sortedAnalyses[0]?.[SOIL_ANALYSES_COLUMNS.PH] || 6.0
        } else {
          // Jiná strategie (první v pořadí)
          selectedPh = analyses[0]?.[SOIL_ANALYSES_COLUMNS.PH] || 6.0
        }
      } else {
        // 1:1 vztah (jeden rozbor)
        selectedPh = analyses[SOIL_ANALYSES_COLUMNS.PH] || 6.0
      }

      // Přidáme pozemek do výsledku
      result.push({
        id: parcel[POZEMKY_COLUMNS.ID],
        nazev: parcel[POZEMKY_COLUMNS.NAZEV],
        kod: parcel[POZEMKY_COLUMNS.KOD],
        vymera_ha: parcel[POZEMKY_COLUMNS.VYMERA],
        typ_pudy: parcel[POZEMKY_COLUMNS.TYP_PUDY],
        ph: selectedPh,
      })
    }

    return result
  } catch (error) {
    console.error('Neočekávaná chyba při načítání pozemků:', error)
    return []
  }
}

/**
 * Načte základní statistiky o pozemcích uživatele
 * (Používá se pro kontrolu, kolik pozemků má uživatel)
 */
export async function getPozemkyStats(userId: string) {
  const supabase = await createClient()
  const { POZEMKY_TABLE, POZEMKY_COLUMNS } = DB_SCHEMA

  try {
    const { count, error } = await supabase
      .from(POZEMKY_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq(POZEMKY_COLUMNS.USER_ID, userId)
      .eq(POZEMKY_COLUMNS.STATUS, 'active')

    if (error) {
      console.error('Chyba při načítání statistik:', error)
      return { totalParcels: 0 }
    }

    return {
      totalParcels: count || 0,
    }
  } catch (error) {
    console.error('Neočekávaná chyba při načítání statistik:', error)
    return { totalParcels: 0 }
  }
}

