-- ============================================================================
-- ADD NOTES COLUMN TO LIMING_REQUEST_ITEMS
-- Přidání sloupce notes do tabulky liming_request_items
-- ============================================================================

-- Add notes column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN notes TEXT;
        
        RAISE NOTICE 'Column notes added to liming_request_items successfully';
    ELSE
        RAISE NOTICE 'Column notes already exists in liming_request_items, skipping';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check column exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
  AND column_name = 'notes';

-- Show sample data
SELECT 
  id,
  request_id,
  parcel_id,
  product_name,
  quantity,
  notes,
  created_at
FROM public.liming_request_items
LIMIT 5;



