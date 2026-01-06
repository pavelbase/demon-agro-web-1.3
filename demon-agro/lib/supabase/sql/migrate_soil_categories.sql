-- ============================================================================
-- MIGRATION: Update Soil Categories
-- Date: 2026-01-02
-- Description: Migrates pH and nutrient categories to new naming convention
--              based on Czech Mehlich 3 methodology (ÚKZÚZ, vyhláška 335/2017 Sb.)
-- ============================================================================

-- DŮVOD MIGRACE:
-- Přechod z krátkých zkratek na plné názvy kategorií pro lepší čitelnost
-- a soulad s oficiální českou metodikou
--
-- ZMĚNY:
-- pH kategorie: EK, SK, N, SZ, EZ → extremne_kysela, silne_kysela, slabe_kysela, neutralni, slabe_alkalicka, alkalicka
-- Nutrient kategorie: N, VH, D, V, VV → nizky, vyhovujici, dobry, vysoky, velmi_vysoky

-- ============================================================================
-- STEP 1: Backup existing data (optional, but recommended)
-- ============================================================================

-- Vytvořit backup tabulku (volitelné)
-- CREATE TABLE soil_analyses_backup_20260102 AS SELECT * FROM soil_analyses;

-- ============================================================================
-- STEP 2: Drop existing constraints
-- ============================================================================

-- Drop pH category constraint
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_ph_category_check;

-- Drop nutrient category constraints (if they exist)
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_p_category_check;
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_k_category_check;
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_mg_category_check;
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_ca_category_check;
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_s_category_check;

-- ============================================================================
-- STEP 3: Migrate pH categories
-- ============================================================================

-- Update pH categories to new values
UPDATE soil_analyses SET ph_category = 'extremne_kysela' WHERE ph_category = 'EK';
UPDATE soil_analyses SET ph_category = 'silne_kysela' WHERE ph_category = 'SK';
UPDATE soil_analyses SET ph_category = 'slabe_kysela' WHERE ph_category = 'K';  -- starý název pro slabě kyselá
UPDATE soil_analyses SET ph_category = 'neutralni' WHERE ph_category = 'N';
UPDATE soil_analyses SET ph_category = 'slabe_alkalicka' WHERE ph_category = 'SZ';
UPDATE soil_analyses SET ph_category = 'alkalicka' WHERE ph_category = 'EZ';

-- Pokud existují další varianty (A, SA), upravit i ty:
UPDATE soil_analyses SET ph_category = 'alkalicka' WHERE ph_category = 'A';
UPDATE soil_analyses SET ph_category = 'slabe_alkalicka' WHERE ph_category = 'SA';

-- ============================================================================
-- STEP 4: Migrate nutrient categories (P, K, Mg, Ca, S)
-- ============================================================================

-- Migrate P (phosphorus) categories
UPDATE soil_analyses SET p_category = 'nizky' WHERE p_category = 'N';
UPDATE soil_analyses SET p_category = 'vyhovujici' WHERE p_category = 'VH';
UPDATE soil_analyses SET p_category = 'dobry' WHERE p_category = 'D';
UPDATE soil_analyses SET p_category = 'vysoky' WHERE p_category = 'V';
UPDATE soil_analyses SET p_category = 'velmi_vysoky' WHERE p_category = 'VV';

-- Migrate K (potassium) categories
UPDATE soil_analyses SET k_category = 'nizky' WHERE k_category = 'N';
UPDATE soil_analyses SET k_category = 'vyhovujici' WHERE k_category = 'VH';
UPDATE soil_analyses SET k_category = 'dobry' WHERE k_category = 'D';
UPDATE soil_analyses SET k_category = 'vysoky' WHERE k_category = 'V';
UPDATE soil_analyses SET k_category = 'velmi_vysoky' WHERE k_category = 'VV';

-- Migrate Mg (magnesium) categories
UPDATE soil_analyses SET mg_category = 'nizky' WHERE mg_category = 'N';
UPDATE soil_analyses SET mg_category = 'vyhovujici' WHERE mg_category = 'VH';
UPDATE soil_analyses SET mg_category = 'dobry' WHERE mg_category = 'D';
UPDATE soil_analyses SET mg_category = 'vysoky' WHERE mg_category = 'V';
UPDATE soil_analyses SET mg_category = 'velmi_vysoky' WHERE mg_category = 'VV';

-- Migrate Ca (calcium) categories (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 'ca_category'
  ) THEN
    UPDATE soil_analyses SET ca_category = 'nizky' WHERE ca_category = 'N';
    UPDATE soil_analyses SET ca_category = 'vyhovujici' WHERE ca_category = 'VH';
    UPDATE soil_analyses SET ca_category = 'dobry' WHERE ca_category = 'D';
    UPDATE soil_analyses SET ca_category = 'vysoky' WHERE ca_category = 'V';
    UPDATE soil_analyses SET ca_category = 'velmi_vysoky' WHERE ca_category = 'VV';
    RAISE NOTICE 'Ca category migrated successfully';
  ELSE
    RAISE NOTICE 'Ca category column does not exist - skipping';
  END IF;
END $$;

-- Migrate S (sulfur) categories (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 's_category'
  ) THEN
    UPDATE soil_analyses SET s_category = 'nizky' WHERE s_category = 'N';
    UPDATE soil_analyses SET s_category = 'vyhovujici' WHERE s_category = 'VH';
    UPDATE soil_analyses SET s_category = 'dobry' WHERE s_category = 'D';
    UPDATE soil_analyses SET s_category = 'vysoky' WHERE s_category = 'V';
    UPDATE soil_analyses SET s_category = 'velmi_vysoky' WHERE s_category = 'VV';
    RAISE NOTICE 'S category migrated successfully';
  ELSE
    RAISE NOTICE 'S category column does not exist - skipping';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Add new constraints
-- ============================================================================

-- Add pH category constraint with new values
ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_ph_category_check 
CHECK (ph_category IN (
  'extremne_kysela',
  'silne_kysela', 
  'slabe_kysela',
  'neutralni',
  'slabe_alkalicka',
  'alkalicka'
));

-- Add nutrient category constraints with new values
ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_p_category_check 
CHECK (p_category IN ('nizky', 'vyhovujici', 'dobry', 'vysoky', 'velmi_vysoky'));

ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_k_category_check 
CHECK (k_category IN ('nizky', 'vyhovujici', 'dobry', 'vysoky', 'velmi_vysoky'));

ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_mg_category_check 
CHECK (mg_category IN ('nizky', 'vyhovujici', 'dobry', 'vysoky', 'velmi_vysoky'));

-- Add Ca category constraint (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 'ca_category'
  ) THEN
    ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_ca_category_check;
    ALTER TABLE soil_analyses 
    ADD CONSTRAINT soil_analyses_ca_category_check 
    CHECK (ca_category IN ('nizky', 'vyhovujici', 'dobry', 'vysoky', 'velmi_vysoky'));
    RAISE NOTICE 'Ca category constraint added';
  END IF;
END $$;

-- Add S category constraint (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 's_category'
  ) THEN
    ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_s_category_check;
    ALTER TABLE soil_analyses 
    ADD CONSTRAINT soil_analyses_s_category_check 
    CHECK (s_category IN ('nizky', 'vyhovujici', 'dobry', 'vysoky', 'velmi_vysoky'));
    RAISE NOTICE 'S category constraint added';
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Update column comments
-- ============================================================================

COMMENT ON COLUMN soil_analyses.ph_category IS 
'Kategorie pH: extremne_kysela (<4.5), silne_kysela (4.5-5.6), slabe_kysela (5.6-6.6), neutralni (6.6-7.3), slabe_alkalicka (7.3-8.1), alkalicka (≥8.1)';

COMMENT ON COLUMN soil_analyses.p_category IS 
'Kategorie fosforu: nizky, vyhovujici, dobry, vysoky, velmi_vysoky (dle metodiky Mehlich 3)';

COMMENT ON COLUMN soil_analyses.k_category IS 
'Kategorie draslíku: nizky, vyhovujici, dobry, vysoky, velmi_vysoky (dle metodiky Mehlich 3)';

COMMENT ON COLUMN soil_analyses.mg_category IS 
'Kategorie hořčíku: nizky, vyhovujici, dobry, vysoky, velmi_vysoky (dle metodiky Mehlich 3)';

-- Comment for Ca category (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 'ca_category'
  ) THEN
    COMMENT ON COLUMN soil_analyses.ca_category IS 
    'Kategorie vápníku: nizky, dobry, vysoky (Ca nemá 5 kategorií jako ostatní živiny)';
  END IF;
END $$;

-- Comment for S category (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 's_category'
  ) THEN
    COMMENT ON COLUMN soil_analyses.s_category IS 
    'Kategorie síry: nizky, vyhovujici, dobry, vysoky, velmi_vysoky (dle metodiky Mehlich 3)';
  END IF;
END $$;

-- ============================================================================
-- STEP 7: Verification
-- ============================================================================

-- Zkontrolovat, že všechny kategorie byly správně migrovány
SELECT 
  'pH categories' as check_type,
  ph_category,
  COUNT(*) as count
FROM soil_analyses 
WHERE ph_category IS NOT NULL
GROUP BY ph_category
ORDER BY ph_category;

SELECT 
  'P categories' as check_type,
  p_category,
  COUNT(*) as count
FROM soil_analyses 
WHERE p_category IS NOT NULL
GROUP BY p_category
ORDER BY p_category;

SELECT 
  'K categories' as check_type,
  k_category,
  COUNT(*) as count
FROM soil_analyses 
WHERE k_category IS NOT NULL
GROUP BY k_category
ORDER BY k_category;

SELECT 
  'Mg categories' as check_type,
  mg_category,
  COUNT(*) as count
FROM soil_analyses 
WHERE mg_category IS NOT NULL
GROUP BY mg_category
ORDER BY mg_category;

-- Zkontrolovat, že neexistují žádné staré hodnoty (pouze pro existující sloupce)
DO $$
DECLARE
  old_count INTEGER := 0;
  has_ca BOOLEAN;
  has_s BOOLEAN;
BEGIN
  -- Check if columns exist
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'soil_analyses' AND column_name = 'ca_category') INTO has_ca;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'soil_analyses' AND column_name = 's_category') INTO has_s;
  
  -- Count old values in existing columns
  IF has_ca AND has_s THEN
    SELECT COUNT(*) INTO old_count FROM soil_analyses
    WHERE 
      ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ', 'A', 'SA', 'K')
      OR p_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR k_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR mg_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR ca_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR s_category IN ('N', 'VH', 'D', 'V', 'VV');
  ELSIF has_ca THEN
    SELECT COUNT(*) INTO old_count FROM soil_analyses
    WHERE 
      ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ', 'A', 'SA', 'K')
      OR p_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR k_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR mg_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR ca_category IN ('N', 'VH', 'D', 'V', 'VV');
  ELSIF has_s THEN
    SELECT COUNT(*) INTO old_count FROM soil_analyses
    WHERE 
      ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ', 'A', 'SA', 'K')
      OR p_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR k_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR mg_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR s_category IN ('N', 'VH', 'D', 'V', 'VV');
  ELSE
    SELECT COUNT(*) INTO old_count FROM soil_analyses
    WHERE 
      ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ', 'A', 'SA', 'K')
      OR p_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR k_category IN ('N', 'VH', 'D', 'V', 'VV')
      OR mg_category IN ('N', 'VH', 'D', 'V', 'VV');
  END IF;
  
  RAISE NOTICE 'Old category values found: %', old_count;
  IF old_count = 0 THEN
    RAISE NOTICE '✓ Migration successful - no old values remain';
  ELSE
    RAISE WARNING '✗ Migration incomplete - % old values still exist', old_count;
  END IF;
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
DŮLEŽITÉ:
1. Tento skript provádí DESTRUKTIVNÍ změny - nelze je automaticky vrátit zpět
2. Doporučujeme vytvořit backup před spuštěním
3. Po migraci je nutné aktualizovat:
   - TypeScript typy (database.ts)
   - Validační schémata (validations.ts)
   - Frontend komponenty
   - API endpointy

ROLLBACK:
Pokud potřebujete vrátit zpět, použijte backup:
DROP TABLE soil_analyses;
ALTER TABLE soil_analyses_backup_20260102 RENAME TO soil_analyses;

TESTOVÁNÍ:
Doporučujeme nejdřív otestovat na development/staging databázi!
*/

