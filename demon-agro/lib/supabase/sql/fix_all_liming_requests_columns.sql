-- ============================================================================
-- FIX ALL LIMING_REQUESTS COLUMNS - COMPLETE CLEANUP
-- Vyčištění duplicitních sloupců a přejmenování na správné názvy
-- ============================================================================

DO $$ 
BEGIN
    -- ========================================================================
    -- 1. MERGE DUPLICATE COLUMNS - Copy data from old to new if new is empty
    -- ========================================================================
    
    -- preferred_term → delivery_date
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'preferred_term') THEN
        RAISE NOTICE 'Merging: preferred_term → delivery_date';
        UPDATE public.liming_requests 
        SET delivery_date = preferred_term 
        WHERE delivery_date IS NULL AND preferred_term IS NOT NULL;
    END IF;
    
    -- note → notes
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'note') THEN
        RAISE NOTICE 'Merging: note → notes';
        UPDATE public.liming_requests 
        SET notes = note 
        WHERE notes IS NULL AND note IS NOT NULL;
    END IF;
    
    -- admin_note → admin_notes
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'admin_note') THEN
        RAISE NOTICE 'Merging: admin_note → admin_notes';
        UPDATE public.liming_requests 
        SET admin_notes = admin_note 
        WHERE admin_notes IS NULL AND admin_note IS NOT NULL;
    END IF;
    
    -- quoted_price → quote_amount
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'quoted_price') THEN
        RAISE NOTICE 'Merging: quoted_price → quote_amount';
        UPDATE public.liming_requests 
        SET quote_amount = quoted_price 
        WHERE quote_amount IS NULL AND quoted_price IS NOT NULL;
    END IF;

    -- ========================================================================
    -- 2. DROP OLD DUPLICATE COLUMNS
    -- ========================================================================
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'preferred_term') THEN
        ALTER TABLE public.liming_requests DROP COLUMN preferred_term;
        RAISE NOTICE 'Dropped: preferred_term';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'note') THEN
        ALTER TABLE public.liming_requests DROP COLUMN note;
        RAISE NOTICE 'Dropped: note';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'admin_note') THEN
        ALTER TABLE public.liming_requests DROP COLUMN admin_note;
        RAISE NOTICE 'Dropped: admin_note';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'quoted_price') THEN
        ALTER TABLE public.liming_requests DROP COLUMN quoted_price;
        RAISE NOTICE 'Dropped: quoted_price';
    END IF;

    -- ========================================================================
    -- 3. RENAME REMAINING COLUMNS TO MATCH APPLICATION CODE
    -- ========================================================================
    
    -- total_area_ha → total_area
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'total_area_ha') THEN
        ALTER TABLE public.liming_requests RENAME COLUMN total_area_ha TO total_area;
        RAISE NOTICE 'Renamed: total_area_ha → total_area';
    END IF;
    
    -- total_quantity_t → total_quantity
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'total_quantity_t') THEN
        ALTER TABLE public.liming_requests RENAME COLUMN total_quantity_t TO total_quantity;
        RAISE NOTICE 'Renamed: total_quantity_t → total_quantity';
    END IF;

    RAISE NOTICE '✅ All columns fixed successfully!';
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION - Check final column structure
-- ============================================================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
ORDER BY ordinal_position;

-- Check that all required columns exist with correct names
SELECT 
  CASE 
    WHEN COUNT(*) = 10 THEN '✅ All required columns exist'
    ELSE '❌ Missing columns: ' || (10 - COUNT(*))::text
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
  AND column_name IN (
    'total_area',        -- ✅ renamed from total_area_ha
    'total_quantity',    -- ✅ renamed from total_quantity_t
    'delivery_date',     -- ✅ kept (preferred_term merged and deleted)
    'notes',             -- ✅ kept (note merged and deleted)
    'admin_notes',       -- ✅ kept (admin_note merged and deleted)
    'quote_amount',      -- ✅ kept (quoted_price merged and deleted)
    'delivery_address',
    'contact_person',
    'contact_phone',
    'contact_email'
  );

-- ============================================================================
-- NOTES
-- ============================================================================

/*
TENTO SKRIPT:
1. Zkopíruje data z duplicitních sloupců do správných
2. Smaže staré duplicitní sloupce
3. Přejmenuje zbývající sloupce na správné názvy
4. Obnoví cache

PO SPUŠTĚNÍ:
- Měli byste vidět NOTICE zprávy o každé operaci
- Výsledná tabulka bude mít správné názvy sloupců
- Všechna data budou zachována
*/



