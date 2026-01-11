-- ============================================================================
-- CHECK LIMING_REQUEST_ITEMS STRUCTURE
-- Zjištění skutečné struktury tabulky liming_request_items
-- ============================================================================

-- Show all columns in liming_request_items table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
ORDER BY ordinal_position;

-- Show sample data to see actual structure
SELECT * 
FROM public.liming_request_items 
LIMIT 1;


