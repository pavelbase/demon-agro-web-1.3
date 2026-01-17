-- ============================================================================
-- CLEANUP DUPLICATE LIMING_REQUESTS COLUMNS
-- Odstranění duplicitních sloupců pokud existují oba
-- ============================================================================

-- Check which columns exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
  AND column_name IN (
    'preferred_term', 'delivery_date',
    'note', 'notes',
    'admin_note', 'admin_notes',
    'quoted_price', 'quote_amount'
  )
ORDER BY column_name;

-- ============================================================================
-- MANUAL CLEANUP INSTRUCTIONS
-- ============================================================================

/*
Pokud vidíte DUPLICITNÍ SLOUPCE (např. 'note' i 'notes'), 
spusťte následující příkazy:

-- Pokud existují preferred_term i delivery_date:
-- 1. Zkopírujte data z preferred_term do delivery_date (pokud je delivery_date prázdný)
UPDATE public.liming_requests 
SET delivery_date = preferred_term 
WHERE delivery_date IS NULL AND preferred_term IS NOT NULL;

-- 2. Smažte preferred_term
ALTER TABLE public.liming_requests DROP COLUMN IF EXISTS preferred_term;

-- Pokud existují note i notes:
UPDATE public.liming_requests 
SET notes = note 
WHERE notes IS NULL AND note IS NOT NULL;

ALTER TABLE public.liming_requests DROP COLUMN IF EXISTS note;

-- Pokud existují admin_note i admin_notes:
UPDATE public.liming_requests 
SET admin_notes = admin_note 
WHERE admin_notes IS NULL AND admin_note IS NOT NULL;

ALTER TABLE public.liming_requests DROP COLUMN IF EXISTS admin_note;

-- Pokud existují quoted_price i quote_amount:
UPDATE public.liming_requests 
SET quote_amount = quoted_price 
WHERE quote_amount IS NULL AND quoted_price IS NOT NULL;

ALTER TABLE public.liming_requests DROP COLUMN IF EXISTS quoted_price;

-- Refresh cache po všech změnách
NOTIFY pgrst, 'reload schema';
*/



