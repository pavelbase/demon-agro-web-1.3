-- =====================================================
-- MIGRACE: Přidání období "léto" pro vápnění
-- =====================================================
-- Datum: 2026-01-03
-- Účel: Rozšíření období aplikace z jaro/podzim na jaro/léto/podzim
-- Důvod: Praktická aplikace vápence je možná únor-listopad
-- =====================================================

-- Dočasně odstraníme CHECK constraint
ALTER TABLE liming_applications 
DROP CONSTRAINT IF EXISTS liming_applications_season_check;

-- Přidáme nový CHECK constraint s létem
ALTER TABLE liming_applications 
ADD CONSTRAINT liming_applications_season_check 
CHECK (season IN ('jaro', 'leto', 'podzim'));

-- Informace
SELECT 
  'Migration completed: season can now be jaro, leto, or podzim' AS status,
  COUNT(*) AS existing_applications
FROM liming_applications;


