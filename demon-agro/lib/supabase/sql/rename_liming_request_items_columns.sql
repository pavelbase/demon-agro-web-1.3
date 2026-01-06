-- ============================================================================
-- RENAME AND CLEANUP LIMING_REQUEST_ITEMS COLUMNS
-- Přejmenování sloupců aby odpovídaly kódu aplikace
-- ============================================================================

DO $$ 
BEGIN
    -- ========================================================================
    -- 1. RENAME recommended_product_id → product_id
    -- ========================================================================
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'recommended_product_id'
    ) THEN
        -- Check if product_id doesn't already exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'liming_request_items'
            AND column_name = 'product_id'
        ) THEN
            ALTER TABLE public.liming_request_items 
            RENAME COLUMN recommended_product_id TO product_id;
            
            RAISE NOTICE '✅ Renamed: recommended_product_id → product_id';
        ELSE
            RAISE NOTICE '⚠️  Both recommended_product_id and product_id exist - manual cleanup needed';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️  Column recommended_product_id does not exist or already renamed';
    END IF;

    -- ========================================================================
    -- 2. DROP OLD UNUSED COLUMNS (if they exist and new ones are populated)
    -- ========================================================================
    
    -- Drop recommended_type (replaced by product type reference)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'recommended_type'
    ) THEN
        ALTER TABLE public.liming_request_items 
        DROP COLUMN recommended_type;
        
        RAISE NOTICE '✅ Dropped: recommended_type';
    END IF;

    -- Drop quantity_cao_t (replaced by quantity + product_name)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'quantity_cao_t'
    ) THEN
        ALTER TABLE public.liming_request_items 
        DROP COLUMN quantity_cao_t;
        
        RAISE NOTICE '✅ Dropped: quantity_cao_t';
    END IF;

    -- Drop quantity_product_t (replaced by quantity)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'quantity_product_t'
    ) THEN
        ALTER TABLE public.liming_request_items 
        DROP COLUMN quantity_product_t;
        
        RAISE NOTICE '✅ Dropped: quantity_product_t';
    END IF;

    -- Drop reason (replaced by notes)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'reason'
    ) THEN
        ALTER TABLE public.liming_request_items 
        DROP COLUMN reason;
        
        RAISE NOTICE '✅ Dropped: reason';
    END IF;

    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ Columns renamed and cleaned up successfully!';
    RAISE NOTICE '====================================';
END $$;

-- ============================================================================
-- REFRESH SCHEMA CACHE (CRITICAL!)
-- ============================================================================
-- This notifies PostgREST (Supabase API) to reload the schema
NOTIFY pgrst, 'reload schema';

-- Wait a moment for cache to refresh
SELECT pg_sleep(1);

-- Refresh again to be sure
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION - Check final column structure
-- ============================================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK ALL REQUIRED COLUMNS EXIST WITH CORRECT NAMES
-- ============================================================================

SELECT 
  CASE 
    WHEN COUNT(*) = 11 THEN '✅ All 11 required columns exist'
    ELSE '❌ Missing columns: ' || (11 - COUNT(*))::text || ' of 11'
  END as status,
  COUNT(*) as existing_columns,
  string_agg(column_name, ', ') as found_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
  AND column_name IN (
    'id',
    'request_id',
    'parcel_id',
    'product_id',           -- ✅ přejmenováno z recommended_product_id
    'product_name',
    'quantity',
    'unit',
    'notes',
    'liming_plan_id',
    'liming_application_id',
    'application_year'
  );

-- ============================================================================
-- CHECK THAT OLD COLUMNS ARE REMOVED
-- ============================================================================

SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All old columns removed'
    ELSE '⚠️  Old columns still exist: ' || string_agg(column_name, ', ')
  END as cleanup_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
  AND column_name IN (
    'recommended_product_id',
    'recommended_type',
    'quantity_cao_t',
    'quantity_product_t',
    'reason'
  );

-- ============================================================================
-- SHOW CURRENT DATA
-- ============================================================================

SELECT 
  COUNT(*) as total_items,
  COUNT(product_id) as items_with_product,
  COUNT(product_name) as items_with_product_name,
  COUNT(liming_plan_id) as items_with_plan
FROM public.liming_request_items;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
TENTO SKRIPT:
1. ✅ Přejmenuje recommended_product_id → product_id
2. ✅ Smaže staré nepoužívané sloupce:
   - recommended_type
   - quantity_cao_t
   - quantity_product_t
   - reason
3. ✅ Obnoví schema cache v Supabase (2x pro jistotu)
4. ✅ Ověří finální strukturu

FINÁLNÍ SLOUPCE:
- id
- request_id
- parcel_id
- product_id (přejmenováno!)
- product_name
- quantity
- unit
- notes
- liming_plan_id
- liming_application_id
- application_year
- application_season
- created_at

PO SPUŠTĚNÍ:
- Kód bude fungovat s product_id místo recommended_product_id
- Staré sloupce budou smazány
- Schema cache bude aktuální
- Chyba PGRST204 by měla zmizet
*/

