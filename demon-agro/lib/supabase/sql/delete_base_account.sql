-- =====================================================
-- KROK 1: SMAZAT STARÝ base@demonagro.cz ÚČET (SPRÁVNÉ POŘADÍ)
-- =====================================================

-- DŮLEŽITÉ: Nejprve smaž profil (child), pak auth uživatele (parent)

-- 1. Smaž profil
DELETE FROM public.profiles WHERE email = 'base@demonagro.cz';

-- 2. Teď smaž auth uživatele
DELETE FROM auth.users WHERE email = 'base@demonagro.cz';

-- 3. Kontrola - mělo by být prázdné
SELECT 'Auth users:' as check_type, count(*) as count 
FROM auth.users WHERE email = 'base@demonagro.cz'
UNION ALL
SELECT 'Profiles:', count(*) 
FROM public.profiles WHERE email = 'base@demonagro.cz';

-- =====================================================
-- Pokud obě kontroly vrátí count = 0, pokračuj vytvořením
-- nového uživatele v Supabase Dashboard!
-- =====================================================


