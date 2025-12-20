-- ============================================================================
-- FIX ADMIN ROLE pro base@demonagro.cz
-- ============================================================================
-- Tento skript nastaví admin roli pro uživatele base@demonagro.cz
-- ============================================================================

-- KROK 1: Zobrazit současný stav
SELECT 
  u.id,
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.full_name,
  p.is_active,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- KROK 2: Nastavit admin roli v profiles tabulce
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'base@demonagro.cz';

-- KROK 3: Nastavit admin roli v auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'base@demonagro.cz';

-- KROK 4: Ověření změny
SELECT 
  u.id,
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.full_name,
  p.is_active,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- ============================================================================
-- POZNÁMKA:
-- Po spuštění tohoto skriptu:
-- 1. Odhlaste se z aplikace
-- 2. Přihlaste se znovu
-- 3. Admin Zóna by se měla zobrazit v sidebaru
-- ============================================================================
