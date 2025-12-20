-- Migration: Add AI extraction fields to soil_analyses table
-- Date: 2025-12-20
-- Description: Adds fields to track AI extraction, validation status, and additional analysis data

-- Add AI extraction tracking fields
ALTER TABLE soil_analyses
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT true;

COMMENT ON COLUMN soil_analyses.ai_extracted IS 'Indicates if the analysis was extracted by AI from PDF';
COMMENT ON COLUMN soil_analyses.user_validated IS 'Indicates if the user has reviewed and validated the AI-extracted data';
COMMENT ON COLUMN soil_analyses.is_current IS 'Indicates if this is the current/active analysis for the parcel (only one per parcel)';

-- Add analysis methodology and additional fields
ALTER TABLE soil_analyses
ADD COLUMN IF NOT EXISTS methodology VARCHAR(100),
ADD COLUMN IF NOT EXISTS k_mg_ratio DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS kvk DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS sulfur DECIMAL(6,2);

COMMENT ON COLUMN soil_analyses.methodology IS 'Extraction methodology used (e.g., Mehlich 3, CAL, Egner)';
COMMENT ON COLUMN soil_analyses.k_mg_ratio IS 'Calculated K:Mg ratio for balance assessment';
COMMENT ON COLUMN soil_analyses.kvk DECIMAL(6,2) IS 'Kationtová výměnná kapacita (Cation Exchange Capacity) in mmol/kg';
COMMENT ON COLUMN soil_analyses.sulfur IS 'Sulfur (S) content in mg/kg';

-- Create function to ensure only one current analysis per parcel
CREATE OR REPLACE FUNCTION ensure_single_current_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated analysis is marked as current
  IF NEW.is_current = true THEN
    -- Set all other analyses for this parcel to not current
    UPDATE soil_analyses
    SET is_current = false
    WHERE parcel_id = NEW.parcel_id
      AND id != NEW.id
      AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION ensure_single_current_analysis() IS 'Ensures only one analysis per parcel is marked as current';

-- Create trigger to enforce single current analysis
DROP TRIGGER IF EXISTS trigger_ensure_single_current_analysis ON soil_analyses;

CREATE TRIGGER trigger_ensure_single_current_analysis
  BEFORE INSERT OR UPDATE OF is_current ON soil_analyses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_current_analysis();

COMMENT ON TRIGGER trigger_ensure_single_current_analysis ON soil_analyses IS 'Automatically sets is_current=false for other analyses when one is marked as current';

-- Create index for faster queries on current analyses
CREATE INDEX IF NOT EXISTS idx_soil_analyses_parcel_current 
ON soil_analyses(parcel_id, is_current) 
WHERE is_current = true;

COMMENT ON INDEX idx_soil_analyses_parcel_current IS 'Optimizes queries for finding the current analysis of a parcel';

-- Create index for AI-extracted analyses
CREATE INDEX IF NOT EXISTS idx_soil_analyses_ai_extracted 
ON soil_analyses(ai_extracted, user_validated) 
WHERE ai_extracted = true;

COMMENT ON INDEX idx_soil_analyses_ai_extracted IS 'Optimizes queries for AI-extracted analyses awaiting validation';

-- Update existing analyses to mark the latest as current for each parcel
WITH latest_analyses AS (
  SELECT DISTINCT ON (parcel_id) 
    id, 
    parcel_id
  FROM soil_analyses
  ORDER BY parcel_id, date DESC, created_at DESC
)
UPDATE soil_analyses
SET is_current = true
WHERE id IN (SELECT id FROM latest_analyses);

-- Calculate and populate k_mg_ratio for existing analyses
UPDATE soil_analyses
SET k_mg_ratio = ROUND((potassium::numeric / NULLIF(magnesium, 0)), 2)
WHERE magnesium > 0 AND k_mg_ratio IS NULL;

COMMENT ON COLUMN soil_analyses.k_mg_ratio IS 'Automatically calculated from potassium/magnesium ratio';
