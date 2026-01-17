-- ============================================================================
-- FIX: Přepočítání pH kategorií podle opravené logiky
-- ============================================================================
-- 
-- PROBLÉM:
-- Původní logika kategorizovala pH takto:
--   SK (Silně kyselý): < 6.5  ❌ ŠPATNĚ!
-- 
-- To znamenalo, že pH 6.5 bylo kategorizováno jako SK místo N
--
-- NOVÁ LOGIKA (podle AZZP metodiky):
--   EK (Extrémně kyselý): < 5.0
--   SK (Silně kyselý): 5.0 - 5.5
--   N (Neutrální): 5.5 - 7.0  ✅ SPRÁVNĚ!
--   SZ (Slabě zásaditý): 7.0 - 8.0
--   EZ (Extrémně zásaditý): >= 8.0
--
-- Tento skript přepočítá ph_category pro všechny existující rozbory
-- ============================================================================

-- Přepočítání pH kategorií
UPDATE soil_analyses
SET ph_category = CASE
  WHEN ph < 5.0 THEN 'EK'::ph_category
  WHEN ph < 5.5 THEN 'SK'::ph_category
  WHEN ph < 7.0 THEN 'N'::ph_category
  WHEN ph < 8.0 THEN 'SZ'::ph_category
  ELSE 'EZ'::ph_category
END;

-- Zobrazení počtu změn podle kategorie
SELECT 
  ph_category,
  COUNT(*) as pocet,
  ROUND(AVG(ph), 2) as prumerne_ph,
  MIN(ph) as min_ph,
  MAX(ph) as max_ph
FROM soil_analyses
GROUP BY ph_category
ORDER BY 
  CASE ph_category
    WHEN 'EK' THEN 1
    WHEN 'SK' THEN 2
    WHEN 'N' THEN 3
    WHEN 'SZ' THEN 4
    WHEN 'EZ' THEN 5
  END;





