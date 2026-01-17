-- Migration: Add full calculator results to calculator_usage table
-- Date: 2026-01-06
-- Description: Adds a column to store complete calculation results for admin review

-- Add results column to store the full calculation output
ALTER TABLE public.calculator_usage
ADD COLUMN IF NOT EXISTS calculation_results JSONB;

COMMENT ON COLUMN public.calculator_usage.calculation_results IS 'Complete calculation results including soil data, nutrient analysis, and liming recommendations';

-- Create index for querying by marketing consent
CREATE INDEX IF NOT EXISTS idx_calculator_usage_marketing_consent
ON public.calculator_usage((calculation_data->>'marketing_consent'))
WHERE (calculation_data->>'marketing_consent') = 'true';

-- Create index for quick filtering by calculation date
CREATE INDEX IF NOT EXISTS idx_calculator_usage_created_desc
ON public.calculator_usage(created_at DESC);

-- Add viewed_by_admin flag for tracking
ALTER TABLE public.calculator_usage
ADD COLUMN IF NOT EXISTS viewed_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

COMMENT ON COLUMN public.calculator_usage.viewed_by_admin IS 'Flag indicating if admin has reviewed this calculation';
COMMENT ON COLUMN public.calculator_usage.admin_notes IS 'Admin notes about this calculation submission';

-- Create index for unviewed calculations
CREATE INDEX IF NOT EXISTS idx_calculator_usage_unviewed
ON public.calculator_usage(viewed_by_admin)
WHERE viewed_by_admin = false;



