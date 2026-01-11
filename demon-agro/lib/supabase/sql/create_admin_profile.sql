-- =====================================================
-- VYTVOŘENÍ ADMIN PROFILU pro base@demonagro.cz
-- =====================================================
-- Tento skript:
-- 1. Zkontroluje existenci uživatele v auth.users
-- 2. Vytvoří nebo aktualizuje záznam v profiles
-- 3. Nastaví admin roli
-- 4. Zkontroluje RLS politiky
-- =====================================================

-- Krok 1: Zobrazit informace o auth účtu
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✓ Má heslo'
    ELSE '✗ Nemá heslo'
  END as password_status
FROM auth.users
WHERE email = 'base@demonagro.cz';

-- Krok 2: Zkontrolovat, zda existuje profil
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  company_name
FROM public.profiles
WHERE email = 'base@demonagro.cz';

-- Krok 3: Vytvoř nebo aktualizuj profil
-- POZOR: Tento příkaz používá ID z auth.users!
-- Nejprve si poznamenej ID z Kroku 1, pak ho dosaď do INSERT

-- Varianta A: Pokud profil NEEXISTUJE (použij ID z Kroku 1)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  company_name,
  is_active,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  'Base Admin',
  'admin',
  'Demon Agro',
  true,
  true,
  now(),
  now()
FROM auth.users u
WHERE u.email = 'base@demonagro.cz'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  onboarding_completed = true,
  full_name = COALESCE(profiles.full_name, 'Base Admin'),
  company_name = COALESCE(profiles.company_name, 'Demon Agro'),
  updated_at = now();

-- Krok 4: Aktualizuj také metadata v auth.users
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
  ),
  updated_at = now()
WHERE email = 'base@demonagro.cz';

-- Krok 5: Finální kontrola - zobraz kompletní info
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.company_name,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.is_active,
  p.onboarding_completed,
  CASE 
    WHEN p.id IS NOT NULL THEN '✓ Profil existuje'
    ELSE '✗ Profil neexistuje'
  END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- =====================================================
-- VÝSLEDEK:
-- Pokud poslední SELECT vrátil řádek s:
-- - profile_status = '✓ Profil existuje'
-- - profile_role = 'admin'
-- - is_active = true
-- - onboarding_completed = true
-- 
-- Můžeš se přihlásit s:
-- Email: base@demonagro.cz
-- Heslo: DemonAgro2026!
-- =====================================================

-- BONUS: Zkontroluj RLS politiky na profiles tabulce
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;



