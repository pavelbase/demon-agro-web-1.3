-- ============================================================================
-- FIX PROFILES TABLE STRUCTURE
-- Zajistí, že tabulka profiles má všechny potřebné sloupce
-- ============================================================================

-- 1. Add missing base columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Add company info columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ico VARCHAR(20);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS district VARCHAR(100);

-- 3. Add auth/onboarding columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false NOT NULL;

-- 4. Add role column if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 5. Add timestamps if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 7. Update existing users to have default values
UPDATE public.profiles 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE public.profiles 
SET must_change_password = false 
WHERE must_change_password IS NULL;

UPDATE public.profiles 
SET onboarding_completed = true 
WHERE onboarding_completed IS NULL;

-- 8. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show final structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Count profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Show sample data
SELECT 
  id,
  email,
  full_name,
  company_name,
  role,
  is_active,
  onboarding_completed
FROM public.profiles
LIMIT 3;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
TENTO SKRIPT:
- Přidá všechny chybějící sloupce do tabulky profiles
- Nastaví výchozí hodnoty pro existující záznamy
- Vytvoří indexy pro rychlejší dotazy
- Obnoví cache

BEZPEČNÉ PRO SPUŠTĚNÍ:
- Používá ADD COLUMN IF NOT EXISTS - nespustí se, pokud sloupec už existuje
- Nepřepíše existující data
- Pouze doplní chybějící strukturu

PO SPUŠTĚNÍ:
- Zkontrolujte výstup VERIFICATION sekce
- Měli byste vidět všechny sloupce včetně full_name, company_name, district, atd.
*/


