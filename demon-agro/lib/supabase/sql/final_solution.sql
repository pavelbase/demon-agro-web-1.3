-- =====================================================
-- FINÁLNÍ ŘEŠENÍ - Smaž base@demonagro.cz a přejmenuj test účet
-- =====================================================

-- Krok 1: Smaž starý problémový účet base@demonagro.cz
DELETE FROM public.profiles WHERE email = 'base@demonagro.cz';
DELETE FROM auth.users WHERE email = 'base@demonagro.cz';

-- Krok 2: Přejmenuj test@demonagro.cz na base@demonagro.cz
UPDATE auth.users 
SET 
  email = 'base@demonagro.cz',
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
  ),
  updated_at = now()
WHERE email = 'test@demonagro.cz';

UPDATE public.profiles
SET 
  email = 'base@demonagro.cz',
  updated_at = now()
WHERE email = 'test@demonagro.cz';

-- Krok 3: Kontrola
SELECT 
  u.id,
  u.email,
  p.role,
  p.is_active,
  p.onboarding_completed,
  p.must_change_password
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- =====================================================
-- VÝSLEDEK:
-- Teď se můžeš přihlásit jako:
-- Email: base@demonagro.cz
-- Heslo: test123456
-- =====================================================



