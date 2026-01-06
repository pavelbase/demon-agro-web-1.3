-- ============================================================================
-- FIX LIMING_REQUEST_ITEMS - COMPLETE STRUCTURE UPDATE
-- Oprava a doplnění chybějících sloupců v tabulce liming_request_items
-- ============================================================================

DO $$ 
BEGIN
    -- ========================================================================
    -- 1. ENSURE product_id EXISTS
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'product_id'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN product_id UUID REFERENCES public.liming_products(id) ON DELETE SET NULL;
        
        CREATE INDEX IF NOT EXISTS idx_liming_request_items_product_id 
          ON public.liming_request_items(product_id) 
          WHERE product_id IS NOT NULL;
        
        RAISE NOTICE '✅ Column product_id added';
    ELSE
        RAISE NOTICE 'ℹ️  Column product_id already exists';
    END IF;

    -- ========================================================================
    -- 2. ENSURE product_name EXISTS
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'product_name'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN product_name VARCHAR(255) NOT NULL DEFAULT 'Vápencový produkt';
        
        -- Remove default after adding
        ALTER TABLE public.liming_request_items 
        ALTER COLUMN product_name DROP DEFAULT;
        
        RAISE NOTICE '✅ Column product_name added';
    ELSE
        RAISE NOTICE 'ℹ️  Column product_name already exists';
    END IF;

    -- ========================================================================
    -- 3. ENSURE quantity EXISTS
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN quantity DECIMAL(10,2) NOT NULL DEFAULT 0;
        
        -- Remove default after adding
        ALTER TABLE public.liming_request_items 
        ALTER COLUMN quantity DROP DEFAULT;
        
        RAISE NOTICE '✅ Column quantity added';
    ELSE
        RAISE NOTICE 'ℹ️  Column quantity already exists';
    END IF;

    -- ========================================================================
    -- 4. ENSURE unit EXISTS
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'unit'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN unit VARCHAR(20) DEFAULT 't';
        
        RAISE NOTICE '✅ Column unit added';
    ELSE
        RAISE NOTICE 'ℹ️  Column unit already exists';
    END IF;

    -- ========================================================================
    -- 5. ENSURE notes EXISTS
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN notes TEXT;
        
        RAISE NOTICE '✅ Column notes added';
    ELSE
        RAISE NOTICE 'ℹ️  Column notes already exists';
    END IF;

    -- ========================================================================
    -- 6. ADD liming_plan_id IF NOT EXISTS
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'liming_plan_id'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN liming_plan_id UUID REFERENCES public.liming_plans(id) ON DELETE SET NULL;
        
        RAISE NOTICE '✅ Column liming_plan_id added';
    ELSE
        RAISE NOTICE 'ℹ️  Column liming_plan_id already exists';
    END IF;

    -- ========================================================================
    -- 7. ADD liming_application_id IF NOT EXISTS
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'liming_application_id'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN liming_application_id UUID REFERENCES public.liming_applications(id) ON DELETE SET NULL;
        
        RAISE NOTICE '✅ Column liming_application_id added';
    ELSE
        RAISE NOTICE 'ℹ️  Column liming_application_id already exists';
    END IF;

    -- ========================================================================
    -- 8. ADD application_year IF NOT EXISTS (NEW!)
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'application_year'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN application_year INTEGER;
        
        RAISE NOTICE '✅ Column application_year added';
    ELSE
        RAISE NOTICE 'ℹ️  Column application_year already exists';
    END IF;

    -- ========================================================================
    -- 9. ADD application_season IF NOT EXISTS (NEW!)
    -- ========================================================================
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'application_season'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN application_season VARCHAR(20) CHECK (application_season IN ('jaro', 'leto', 'podzim'));
        
        RAISE NOTICE '✅ Column application_season added';
    ELSE
        RAISE NOTICE 'ℹ️  Column application_season already exists';
    END IF;

    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ All columns verified/added successfully!';
    RAISE NOTICE '====================================';
END $$;

-- ============================================================================
-- REFRESH SCHEMA CACHE (IMPORTANT!)
-- ============================================================================
-- This notifies PostgREST (Supabase API) to reload the schema
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION - Check final column structure
-- ============================================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK ALL REQUIRED COLUMNS EXIST
-- ============================================================================

SELECT 
  CASE 
    WHEN COUNT(*) = 12 THEN '✅ All 12 required columns exist'
    ELSE '❌ Missing columns: ' || (12 - COUNT(*))::text || ' of 12'
  END as status,
  COUNT(*) as existing_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
  AND column_name IN (
    'id',
    'request_id',
    'parcel_id',
    'product_id',
    'product_name',
    'quantity',
    'unit',
    'notes',
    'liming_plan_id',
    'liming_application_id',
    'application_year',
    'application_season'
  );

-- ============================================================================
-- SHOW SAMPLE DATA
-- ============================================================================

SELECT 
  COUNT(*) as total_items,
  COUNT(product_id) as items_with_product,
  COUNT(liming_plan_id) as items_with_plan,
  COUNT(application_year) as items_with_year
FROM public.liming_request_items;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
TENTO SKRIPT:
1. ✅ Zkontroluje a přidá všechny základní sloupce (product_id, product_name, quantity, unit, notes)
2. ✅ Přidá vazby na plány vápnění (liming_plan_id, liming_application_id)
3. ✅ Přidá nové sloupce pro aplikace (application_year, application_season)
4. ✅ Obnoví schema cache v Supabase
5. ✅ Ověří finální strukturu

OPROTI PŘEDCHOZÍM VERZÍM:
- Přidává application_year a application_season (chyběly v databázi)
- Obnovuje schema cache pomocí NOTIFY
- Kompletní kontrola všech 12 sloupců

PO SPUŠTĚNÍ:
- Všechny sloupce budou existovat v databázi
- Schema cache bude aktuální
- Aplikace by měla fungovat bez chyb PGRST204
*/

