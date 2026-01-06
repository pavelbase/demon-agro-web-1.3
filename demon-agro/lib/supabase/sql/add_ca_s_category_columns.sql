-- ============================================================================
-- ADD Ca and S Category Columns to soil_analyses
-- Date: 2026-01-02
-- Description: Adds missing ca_category and s_category columns with constraints
-- ============================================================================

-- Add ca_category column
ALTER TABLE soil_analyses 
ADD COLUMN IF NOT EXISTS ca_category VARCHAR(20);

-- Add s_category column  
ALTER TABLE soil_analyses 
ADD COLUMN IF NOT EXISTS s_category VARCHAR(20);

-- Drop existing constraints if they exist
ALTER TABLE soil_analyses 
DROP CONSTRAINT IF EXISTS soil_analyses_ca_category_check;

ALTER TABLE soil_analyses 
DROP CONSTRAINT IF EXISTS soil_analyses_s_category_check;

-- Add constraints
ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_ca_category_check 
CHECK (ca_category IN ('nizky', 'vyhovujici', 'dobry', 'vysoky', 'velmi_vysoky'));

ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_s_category_check 
CHECK (s_category IN ('nizky', 'vyhovujici', 'dobry', 'vysoky', 'velmi_vysoky'));

-- Add comments
COMMENT ON COLUMN soil_analyses.ca_category IS 
'Kategorie vápníku: nizky (<1500), dobry (1500-4000), vysoky (>4000) mg/kg';

COMMENT ON COLUMN soil_analyses.s_category IS 
'Kategorie síry: nizky (<10), vyhovujici (10-15), dobry (15-25), vysoky (25-40), velmi_vysoky (>40) mg/kg';

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'soil_analyses' 
AND column_name IN ('ca_category', 's_category');

