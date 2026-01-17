-- =====================================================
-- KROK 1: SMAZAT STARÝ base@demonagro.cz ÚČET
-- =====================================================

-- Smaž profil
DELETE FROM public.profiles WHERE email = 'base@demonagro.cz';

-- Smaž auth uživatele
DELETE FROM auth.users WHERE email = 'base@demonagro.cz';

-- Kontrola - mělo by být prázdné
SELECT * FROM auth.users WHERE email = 'base@demonagro.cz';
SELECT * FROM public.profiles WHERE email = 'base@demonagro.cz';

-- =====================================================
-- KROK 2: VYTVOŘ NOVÉHO UŽIVATELE PŘES DASHBOARD
-- =====================================================
-- 1. Jdi na: https://supabase.com/dashboard/project/ppsldvsodvcbxecxjssf/auth/users
-- 2. Klikni "Add user" → "Create new user"
-- 3. Zadej:
--    - Email: base@demonagro.cz
--    - Password: (tvoje heslo)
--    - ✅ Auto Confirm User: ON (zaškrtnout!)
-- 4. Klikni "Create user"
-- 5. Pokračuj KROKEM 3 níže

-- =====================================================
-- KROK 3: VYTVOŘ PROFIL PRO NOVÉHO UŽIVATELE
-- =====================================================
-- Spusť tento SQL PO vytvoření uživatele v Dashboard:

INSERT INTO public.profiles (
  id,
  email,
  role,
  is_active,
  onboarding_completed,
  must_change_password,
  company_name,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  'admin',
  true,
  true,
  false,
  'Demon Agro',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'base@demonagro.cz'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  onboarding_completed = true,
  must_change_password = false,
  company_name = COALESCE(profiles.company_name, 'Demon Agro');

-- Aktualizuj metadata v auth.users
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
  ),
  updated_at = now()
WHERE email = 'base@demonagro.cz';

-- =====================================================
-- KROK 4: FINÁLNÍ KONTROLA
-- =====================================================

SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.is_active,
  p.onboarding_completed,
  p.must_change_password,
  p.company_name,
  CASE 
    WHEN u.encrypted_password IS NOT NULL THEN '✓ Heslo nastaveno'
    ELSE '✗ Heslo NENÍ nastaveno'
  END as password_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- =====================================================
-- HOTOVO! Teď by mělo přihlášení fungovat:
-- Email: base@demonagro.cz
-- Heslo: (heslo, které jsi zadal v Dashboard)
-- =====================================================




