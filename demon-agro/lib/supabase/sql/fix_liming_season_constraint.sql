-- =====================================================
-- OPRAVA: Aktualizace CHECK constraint pro období vápnění
-- =====================================================
-- Problém: Constraint dovoluje pouze 'jaro' a 'podzim'
-- Řešení: Přidáme 'leto' (únor-listopad = praktická aplikace)
-- =====================================================

-- KROK 1: Najdeme a smažeme VŠECHNY existující season constrainty
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Najdi všechny constrainty na sloupci season
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'liming_applications' 
        AND column_name = 'season'
    LOOP
        -- Smaž constraint
        EXECUTE 'ALTER TABLE liming_applications DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- KROK 2: Přidáme nový CHECK constraint s létem
ALTER TABLE liming_applications 
ADD CONSTRAINT liming_applications_season_check 
CHECK (season IN ('jaro', 'leto', 'podzim'));

-- KROK 3: Ověření
SELECT 
  'SUCCESS: Season constraint updated!' AS status,
  'Values allowed: jaro, leto, podzim' AS allowed_values,
  COUNT(*) AS existing_applications
FROM liming_applications;

-- KROK 4: Test (nepovinné - zakomentováno)
-- INSERT INTO liming_applications (liming_plan_id, year, season, sequence_order, product_name, cao_content, dose_per_ha, total_dose, cao_per_ha, ph_before, ph_after, status)
-- VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 2027, 'leto', 999, 'Test', 50, 1, 1, 0.5, 5.0, 5.1, 'planned');
-- DELETE FROM liming_applications WHERE sequence_order = 999;



