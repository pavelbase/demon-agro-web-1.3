-- ============================================================================
-- ADD CONTACT FIELDS TO LIMING_REQUESTS
-- Přidání kontaktních polí do tabulky liming_requests
-- ============================================================================

-- Add contact fields if they don't exist
DO $$ 
BEGIN
    -- Add contact_person column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_requests'
        AND column_name = 'contact_person'
    ) THEN
        ALTER TABLE public.liming_requests 
        ADD COLUMN contact_person VARCHAR(255);
        RAISE NOTICE 'Column contact_person added';
    ELSE
        RAISE NOTICE 'Column contact_person already exists';
    END IF;

    -- Add contact_phone column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_requests'
        AND column_name = 'contact_phone'
    ) THEN
        ALTER TABLE public.liming_requests 
        ADD COLUMN contact_phone VARCHAR(50);
        RAISE NOTICE 'Column contact_phone added';
    ELSE
        RAISE NOTICE 'Column contact_phone already exists';
    END IF;

    -- Add contact_email column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_requests'
        AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE public.liming_requests 
        ADD COLUMN contact_email VARCHAR(255);
        RAISE NOTICE 'Column contact_email added';
    ELSE
        RAISE NOTICE 'Column contact_email already exists';
    END IF;

    -- Add notes column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_requests'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.liming_requests 
        ADD COLUMN notes TEXT;
        RAISE NOTICE 'Column notes added';
    ELSE
        RAISE NOTICE 'Column notes already exists';
    END IF;

    -- Add admin_notes column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_requests'
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE public.liming_requests 
        ADD COLUMN admin_notes TEXT;
        RAISE NOTICE 'Column admin_notes added';
    ELSE
        RAISE NOTICE 'Column admin_notes already exists';
    END IF;

    -- Add quote_amount column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_requests'
        AND column_name = 'quote_amount'
    ) THEN
        ALTER TABLE public.liming_requests 
        ADD COLUMN quote_amount DECIMAL(10,2);
        RAISE NOTICE 'Column quote_amount added';
    ELSE
        RAISE NOTICE 'Column quote_amount already exists';
    END IF;

    -- Add quote_pdf_url column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_requests'
        AND column_name = 'quote_pdf_url'
    ) THEN
        ALTER TABLE public.liming_requests 
        ADD COLUMN quote_pdf_url TEXT;
        RAISE NOTICE 'Column quote_pdf_url added';
    ELSE
        RAISE NOTICE 'Column quote_pdf_url already exists';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all columns in liming_requests table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
ORDER BY ordinal_position;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
PŘIDANÉ SLOUPCE:
- contact_person: Jméno kontaktní osoby
- contact_phone: Telefonní číslo
- contact_email: Email
- notes: Poznámky od uživatele k poptávce
- admin_notes: Interní poznámky administrátora
- quote_amount: Částka nabídky (pro admin)
- quote_pdf_url: URL na PDF s nabídkou (pro admin)

POUŽITÍ:
Tato migrace bezpečně přidá sloupce, které chybí.
Pokud sloupce již existují, nic se nestane.
*/

