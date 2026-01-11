-- =====================================================
-- KOMPLETNÍ DIAGNOSTIKA PRO base@demonagro.cz
-- =====================================================

-- 1. Zkontroluj strukturu tabulky profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Zobraz auth účet
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✓ Má heslo'
    ELSE '✗ Nemá heslo'
  END as password_status
FROM auth.users
WHERE email = 'base@demonagro.cz';

-- 3. Zobraz profil (pokud existuje)
SELECT * FROM public.profiles WHERE email = 'base@demonagro.cz';

-- =====================================================
-- VÝSLEDEK:
-- Po spuštění tohoto skriptu:
-- - První SELECT ukáže, jaké sloupce SKUTEČNĚ máš
-- - Pošli mi výstup a já ti řeknu, co chybí
-- =====================================================



