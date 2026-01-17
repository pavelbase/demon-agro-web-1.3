-- =====================================================
-- VYTVOŘ NOVÝ TESTOVACÍ ADMIN ÚČET
-- =====================================================
-- Email: admin@test.cz
-- Heslo: test123456
-- =====================================================

-- Krok 1: Vytvoř auth uživatele (POUZE POKUD NEMÁŠ ADMIN PANEL)
-- POZNÁMKA: Toto je HACK - normálně se uživatel vytváří přes Supabase Auth API
-- Tento příkaz NEFUNGUJE - uživatele musíš vytvořit přes Supabase Dashboard

-- ALTERNATIVA: Vytvoř uživatele přes Supabase Dashboard:
-- 1. Jdi na: https://supabase.com/dashboard/project/ppsldvsodvcbxecxjssf/auth/users
-- 2. Klikni "Add user" → "Create new user"
-- 3. Email: admin@test.cz
-- 4. Password: test123456
-- 5. Confirm email: ON (zaškrtnuto)
-- 6. Klikni "Create user"

-- Krok 2: Po vytvoření uživatele přes Dashboard, spusť tento SQL:

-- Získej ID nově vytvořeného uživatele
SELECT id, email FROM auth.users WHERE email = 'admin@test.cz';

-- Krok 3: Vytvoř profil (NAHRAĎ 'USER_ID_ZDE' za skutečné ID z předchozího SELECT)
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
VALUES (
  'USER_ID_ZDE',  -- NAHRAĎ tímto ID z předchozího SELECT
  'admin@test.cz',
  'admin',
  true,
  true,
  false,
  'Test Company',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  onboarding_completed = true,
  must_change_password = false;

-- Krok 4: Kontrola
SELECT 
  u.id,
  u.email,
  p.role,
  p.is_active,
  p.onboarding_completed,
  p.must_change_password
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@test.cz';

-- =====================================================
-- POTOM ZKUS PŘIHLÁŠENÍ:
-- Email: admin@test.cz
-- Heslo: test123456
-- =====================================================




