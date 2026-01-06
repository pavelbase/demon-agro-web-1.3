-- ============================================================================
-- RENAME LIMING_REQUESTS COLUMNS
-- Přejmenování sloupců aby odpovídaly kódu aplikace
-- ============================================================================

-- Conditionally rename columns to match application code
DO $$ 
BEGIN
    -- Rename total_area_ha to total_area
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'total_area_ha') THEN
        ALTER TABLE public.liming_requests RENAME COLUMN total_area_ha TO total_area;
        RAISE NOTICE 'Renamed: total_area_ha → total_area';
    ELSE
        RAISE NOTICE 'Column total_area_ha does not exist or already renamed';
    END IF;

    -- Rename total_quantity_t to total_quantity
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'total_quantity_t') THEN
        ALTER TABLE public.liming_requests RENAME COLUMN total_quantity_t TO total_quantity;
        RAISE NOTICE 'Renamed: total_quantity_t → total_quantity';
    ELSE
        RAISE NOTICE 'Column total_quantity_t does not exist or already renamed';
    END IF;

    -- Rename preferred_term to delivery_date (only if delivery_date doesn't exist)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'preferred_term') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'liming_requests' AND column_name = 'delivery_date') THEN
            ALTER TABLE public.liming_requests RENAME COLUMN preferred_term TO delivery_date;
            RAISE NOTICE 'Renamed: preferred_term → delivery_date';
        ELSE
            RAISE NOTICE 'Both preferred_term and delivery_date exist - need manual cleanup';
        END IF;
    ELSE
        RAISE NOTICE 'Column preferred_term does not exist or already renamed';
    END IF;

    -- Rename note to notes (only if notes doesn't exist yet)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'note') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'liming_requests' AND column_name = 'notes') THEN
            ALTER TABLE public.liming_requests RENAME COLUMN note TO notes;
            RAISE NOTICE 'Renamed: note → notes';
        ELSE
            RAISE NOTICE 'Both note and notes exist - need manual cleanup';
        END IF;
    ELSE
        RAISE NOTICE 'Column note does not exist or already renamed';
    END IF;

    -- Rename admin_note to admin_notes (only if admin_notes doesn't exist yet)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'admin_note') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'liming_requests' AND column_name = 'admin_notes') THEN
            ALTER TABLE public.liming_requests RENAME COLUMN admin_note TO admin_notes;
            RAISE NOTICE 'Renamed: admin_note → admin_notes';
        ELSE
            RAISE NOTICE 'Both admin_note and admin_notes exist - need manual cleanup';
        END IF;
    ELSE
        RAISE NOTICE 'Column admin_note does not exist or already renamed';
    END IF;

    -- Rename quoted_price to quote_amount (only if quote_amount doesn't exist yet)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'liming_requests' AND column_name = 'quoted_price') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'liming_requests' AND column_name = 'quote_amount') THEN
            ALTER TABLE public.liming_requests RENAME COLUMN quoted_price TO quote_amount;
            RAISE NOTICE 'Renamed: quoted_price → quote_amount';
        ELSE
            RAISE NOTICE 'Both quoted_price and quote_amount exist - need manual cleanup';
        END IF;
    ELSE
        RAISE NOTICE 'Column quoted_price does not exist or already renamed';
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check renamed columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
ORDER BY ordinal_position;

-- Check specific renamed columns
SELECT column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
  AND column_name IN ('total_area', 'total_quantity', 'delivery_date', 'notes', 'admin_notes', 'quote_amount');

-- ============================================================================
-- NOTES
-- ============================================================================

/*
PŘEJMENOVANÉ SLOUPCE:
- total_area_ha → total_area
- total_quantity_t → total_quantity  
- preferred_term → delivery_date
- note → notes
- admin_note → admin_notes
- quoted_price → quote_amount

DŮVOD:
Kód aplikace používá tyto názvy konzistentně a je jednodušší
přejmenovat sloupce v databázi než měnit veškerý kód.

OVĚŘENÍ:
Po spuštění byste měli vidět všechny přejmenované sloupce
ve výsledcích dotazů výše.
*/

