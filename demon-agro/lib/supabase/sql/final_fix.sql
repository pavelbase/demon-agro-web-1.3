-- =====================================================
-- FINÁLNÍ OPRAVA pro base@demonagro.cz
-- =====================================================
-- Nastavit must_change_password na FALSE
-- aby se mohl uživatel normálně přihlásit
-- =====================================================

UPDATE public.profiles
SET 
  must_change_password = false,
  is_active = true,
  onboarding_completed = true,
  updated_at = now()
WHERE email = 'base@demonagro.cz';

-- Kontrola
SELECT 
  email,
  role,
  is_active,
  onboarding_completed,
  must_change_password,
  company_name
FROM public.profiles
WHERE email = 'base@demonagro.cz';

-- =====================================================
-- VÝSLEDEK:
-- must_change_password by mělo být FALSE
-- 
-- Teď by mělo přihlášení fungovat:
-- Email: base@demonagro.cz
-- Heslo: DemonAgro2026!
-- =====================================================



