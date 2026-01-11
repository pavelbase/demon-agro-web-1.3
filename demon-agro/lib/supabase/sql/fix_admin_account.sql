-- =====================================================
-- DIAGNOSTIKA A OPRAVA ADMIN ÚČTU base@demonagro.cz
-- =====================================================
-- Tento skript nejprve zjistí strukturu tabulky profiles
-- a pak podle toho vytvoří/aktualizuje profil
-- =====================================================

-- KROK 1: Zjisti, jaké sloupce má tabulka profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- KROK 2: Zkontroluj existující auth účet
-- =====================================================
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

-- =====================================================
-- KROK 3: Zkontroluj existující profil
-- =====================================================
SELECT *
FROM public.profiles
WHERE email = 'base@demonagro.cz';

-- =====================================================
-- KROK 4: Vytvoř nebo aktualizuj profil (MINIMÁLNÍ verze)
-- =====================================================
-- Tato verze používá pouze základní sloupce
INSERT INTO public.profiles (
  id,
  email,
  role,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  'admin',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'base@demonagro.cz'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = now();

-- =====================================================
-- KROK 5: Pokud existují volitelné sloupce, aktualizuj je
-- =====================================================
-- Tento blok se pokusí aktualizovat i volitelné sloupce
-- Pokud některý sloupec neexistuje, chyba se ignoruje

-- Nastavení is_active (pokud existuje)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'is_active'
  ) THEN
    UPDATE public.profiles
    SET is_active = true
    WHERE email = 'base@demonagro.cz';
  END IF;
END $$;

-- Nastavení onboarding_completed (pokud existuje)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'onboarding_completed'
  ) THEN
    UPDATE public.profiles
    SET onboarding_completed = true
    WHERE email = 'base@demonagro.cz';
  END IF;
END $$;

-- Nastavení full_name (pokud existuje)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'full_name'
  ) THEN
    UPDATE public.profiles
    SET full_name = COALESCE(full_name, 'Base Admin')
    WHERE email = 'base@demonagro.cz';
  END IF;
END $$;

-- Nastavení company_name (pokud existuje)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'company_name'
  ) THEN
    UPDATE public.profiles
    SET company_name = COALESCE(company_name, 'Demon Agro')
    WHERE email = 'base@demonagro.cz';
  END IF;
END $$;

-- =====================================================
-- KROK 6: Aktualizuj metadata v auth.users
-- =====================================================
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
-- KROK 7: Finální kontrola
-- =====================================================
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  CASE 
    WHEN p.id IS NOT NULL THEN '✓ Profil existuje'
    ELSE '✗ Profil neexistuje'
  END as profile_status,
  CASE 
    WHEN u.encrypted_password IS NOT NULL THEN '✓ Heslo nastaveno'
    ELSE '✗ Heslo NENÍ nastaveno'
  END as password_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- =====================================================
-- VÝSLEDEK:
-- 
-- Pokud poslední SELECT vrátil řádek s:
-- - profile_status = '✓ Profil existuje'
-- - profile_role = 'admin'
-- - password_status = '✓ Heslo nastaveno'
-- 
-- Můžeš se přihlásit:
-- Email: base@demonagro.cz
-- Heslo: DemonAgro2026!
-- =====================================================



