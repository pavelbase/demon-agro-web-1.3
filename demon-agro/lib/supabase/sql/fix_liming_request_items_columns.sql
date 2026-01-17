-- ============================================================================
-- FIX LIMING_REQUEST_ITEMS COLUMNS
-- Bezpečné přidání chybějících sloupců do tabulky liming_request_items
-- ============================================================================

DO $$ 
BEGIN
    -- Add product_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'product_name'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN product_name VARCHAR(255);
        
        RAISE NOTICE 'Column product_name added';
    ELSE
        RAISE NOTICE 'Column product_name already exists';
    END IF;

    -- Add quantity column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN quantity DECIMAL(10,2);
        
        RAISE NOTICE 'Column quantity added';
    ELSE
        RAISE NOTICE 'Column quantity already exists';
    END IF;

    -- Add unit column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'unit'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN unit VARCHAR(20) DEFAULT 't';
        
        RAISE NOTICE 'Column unit added';
    ELSE
        RAISE NOTICE 'Column unit already exists';
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN notes TEXT;
        
        RAISE NOTICE 'Column notes added';
    ELSE
        RAISE NOTICE 'Column notes already exists';
    END IF;

    -- Add liming_plan_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'liming_plan_id'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN liming_plan_id UUID REFERENCES public.liming_plans(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Column liming_plan_id added';
    ELSE
        RAISE NOTICE 'Column liming_plan_id already exists';
    END IF;

    -- Add liming_application_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
        AND column_name = 'liming_application_id'
    ) THEN
        ALTER TABLE public.liming_request_items 
        ADD COLUMN liming_application_id UUID REFERENCES public.liming_applications(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Column liming_application_id added';
    ELSE
        RAISE NOTICE 'Column liming_application_id already exists';
    END IF;

END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all columns
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
-- NOTES
-- ============================================================================
/*
Tento skript bezpečně přidá všechny chybějící sloupce do tabulky liming_request_items:

SLOUPCE:
- product_name: VARCHAR(255) - název produktu
- quantity: DECIMAL(10,2) - množství
- unit: VARCHAR(20) DEFAULT 't' - jednotka
- notes: TEXT - poznámky
- liming_plan_id: UUID - reference na plán vápnění
- liming_application_id: UUID - reference na aplikaci z plánu

BEZPEČNOST:
- Kontroluje existenci každého sloupce před přidáním
- Nemodifikuje existující sloupce
- Nemazže žádná data
- Lze bezpečně spustit opakovaně
*/



