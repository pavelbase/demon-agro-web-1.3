/**
 * Utility pro generování doporučení pro aplikace vápna podle metodiky
 */

/**
 * Generuje doporučení pro aplikaci vápna podle metodiky ÚKZÚZ
 * 
 * @param phBefore - pH před aplikací
 * @param phAfter - pH po aplikaci
 * @param targetPh - Cílové pH (6.5 pro ornou, 6.0 pro TTP)
 * @param mgContent - Obsah Mg v půdě (mg/kg) - nepovinné
 * @param productMgo - Obsah MgO v produktu (t/ha)
 * @returns Textové doporučení
 */
export function generateLimingRecommendation(
  phBefore: number,
  phAfter: number,
  targetPh: number = 6.5,
  mgContent?: number | null,
  productMgo?: number
): string {
  const recommendations: string[] = []
  
  // =====================================================================
  // 1. KLASIFIKACE PODLE pH PŘED APLIKACÍ
  // =====================================================================
  
  if (phBefore < 4.5) {
    recommendations.push('🔴 URGENTNÍ vápnění - extrémně nízké pH')
  } else if (phBefore < 5.0) {
    recommendations.push('⚠️ Urgentní vápnění - velmi nízké pH')
  } else if (phBefore < 5.5) {
    recommendations.push('Intenzivní vápnění - nízké pH')
  } else if (phBefore < 6.0) {
    recommendations.push('Běžné vápnění - mírně nízké pH')
  } else if (phBefore < targetPh) {
    recommendations.push('Udržovací vápnění - pH pod cílem')
  } else if (phBefore >= targetPh && phBefore <= 7.0) {
    recommendations.push('Udržovací vápnění - pH v optimu')
  } else {
    recommendations.push('Preventivní vápnění - vysoké pH')
  }
  
  // =====================================================================
  // 2. HODNOCENÍ pH PO APLIKACI
  // =====================================================================
  
  if (phAfter > 7.5) {
    // Přepíšeme první doporučení - toto je VAROVÁNÍ
    recommendations[0] = '⚠️ POZOR: Dávka příliš vysoká - riziko převápnění!'
  } else if (phAfter > 7.2) {
    recommendations.push('⚠️ pH po aplikaci bude na horní hranici')
  } else if (phAfter >= 6.5 && phAfter <= 7.0) {
    recommendations.push('✓ pH po aplikaci v optimu (6.5-7.0)')
  } else if (phAfter >= targetPh) {
    recommendations.push('✓ Dosáhne cílového pH')
  } else {
    recommendations.push('Částečná korekce pH')
  }
  
  // =====================================================================
  // 3. HODNOCENÍ MAGNEZIA (pokud je dostupné)
  // =====================================================================
  
  if (mgContent !== null && mgContent !== undefined) {
    if (mgContent < 80) {
      recommendations.push('Doplnění Mg - nízká hladina')
    } else if (mgContent < 120) {
      if (productMgo && productMgo > 0.05) {
        recommendations.push('Doplnění Mg - vyhovující hladina')
      }
    } else if (mgContent >= 180) {
      if (productMgo && productMgo > 0.1) {
        recommendations.push('⚠️ Mg již dostatečné - zvažte vápenatý typ')
      }
    }
  } else {
    // Mg obsah není známý, ale produkt obsahuje Mg
    if (productMgo && productMgo > 0.05) {
      recommendations.push('Doplnění Mg (dolomit)')
    }
  }
  
  // =====================================================================
  // 4. VRÁCENÍ VÝSLEDKU
  // =====================================================================
  
  // Vrátit max 2 nejdůležitější doporučení
  // První je vždy hlavní klasifikace, druhé je doplňující info
  return recommendations.slice(0, 2).join('; ')
}

/**
 * Zkrácená verze doporučení pro zobrazení v tabulce
 */
export function generateShortRecommendation(
  phBefore: number,
  phAfter: number,
  targetPh: number = 6.5
): string {
  if (phBefore < 4.5) {
    return '🔴 Urgentní vápnění'
  } else if (phBefore < 5.0) {
    return 'Urgentní vápnění'
  } else if (phBefore < 5.5) {
    return 'Intenzivní vápnění'
  } else if (phBefore < 6.0) {
    return 'Běžné vápnění'
  } else if (phBefore < targetPh) {
    return 'Udržovací vápnění'
  } else {
    return 'Preventivní vápnění'
  }
}

