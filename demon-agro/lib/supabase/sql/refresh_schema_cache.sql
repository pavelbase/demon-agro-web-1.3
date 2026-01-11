-- ============================================================================
-- REFRESH SUPABASE SCHEMA CACHE
-- Obnovení cache PostgREST API po změnách ve schématu databáze
-- ============================================================================

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Alternatively, you can use this function if available:
SELECT pg_notify('pgrst', 'reload schema');

-- ============================================================================
-- VERIFICATION - Check if liming_requests table is properly visible
-- ============================================================================

-- 1. Check table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests';

-- 2. Check all columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
ORDER BY ordinal_position;

-- 3. Check specific columns that were causing errors
SELECT 
  column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
  AND column_name IN ('delivery_address', 'contact_email', 'contact_person', 'contact_phone');

-- ============================================================================
-- NOTES
-- ============================================================================

/*
DŮVOD POUŽITÍ:
Když vytvoříte nebo změníte tabulku v Supabase, PostgREST API může mít
zastaralou cache schématu. Toto oznámení vynutí reload cache.

ALTERNATIVNÍ ŘEŠENÍ:
Pokud NOTIFY nefunguje, můžete také:
1. Restartovat PostgREST službu v Supabase Dashboardu (Settings > API)
2. Počkat 1-2 minuty a zkusit znovu
3. Kontaktovat Supabase support

OVĚŘENÍ:
Po spuštění tohoto SQL byste měli vidět:
- Tabulku liming_requests v prvním výsledku
- Všech 16 sloupců v druhém výsledku
- 4 kontaktní sloupce v třetím výsledku
*/


