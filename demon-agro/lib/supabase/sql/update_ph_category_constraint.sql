-- Migration: Update pH category constraint
-- Date: 2026-01-01
-- Description: Updates the ph_category check constraint to match the correct enum values
-- Previous values: 'EK', 'SK', 'K', 'N', 'A', 'SA'
-- New values: 'EK', 'SK', 'N', 'SZ', 'EZ'

-- First, drop the existing constraint if it exists
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_ph_category_check;

-- Add the updated constraint with the correct pH category values
ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_ph_category_check 
CHECK (ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ'));

-- Update comment
COMMENT ON COLUMN soil_analyses.ph_category IS 'pH kategorie: EK=extrémně kyselá (<5.0), SK=silně kyselá (5.0-6.5), N=neutrální (6.5-7.2), SZ=slabě zásaditá (7.2-8.0), EZ=extrémně zásaditá (≥8.0)';



