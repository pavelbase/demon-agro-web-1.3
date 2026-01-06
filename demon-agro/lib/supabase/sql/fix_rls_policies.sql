-- =====================================================
-- DIAGNOSTIKA A OPRAVA RLS POLITIK PRO base@demonagro.cz
-- =====================================================

-- KROK 1: Zkontroluj existující RLS politiky na profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- KROK 2: Zobraz profil pro base@demonagro.cz
SELECT 
  u.id as user_id,
  u.email,
  p.role,
  p.created_at,
  CASE 
    WHEN p.id IS NOT NULL THEN '✓ Profil existuje'
    ELSE '✗ Profil neexistuje'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- =====================================================
-- KROK 3: DOČASNĚ ZAKÁZAT RLS (pro test)
-- =====================================================
-- Toto je POUZE pro testování, co je problém
-- NEZAPOMEŇ to vrátit zpět!

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ALTERNATIVA - OPRAVA RLS POLITIK
-- =====================================================
-- Místo zakázání RLS, můžeme opravit politiky

-- Smaž všechny existující politiky
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- Vytvoř nové jednoduché politiky
-- Politika pro čtení vlastního profilu
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Politika pro aktualizaci vlastního profilu
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politika pro adminy - mohou číst všechny profily
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politika pro adminy - mohou aktualizovat všechny profily
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politika pro vložení (pouze pokud ID odpovídá auth.uid)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- KROK 4: POVOLIT RLS (pokud jsi ho zakázal)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- KROK 5: Test - zobraz profil (bez RLS context)
-- =====================================================
-- Tento SELECT používá plné oprávnění pro zobrazení
SELECT * FROM public.profiles WHERE email = 'base@demonagro.cz';

-- =====================================================
-- KROK 6: Finální kontrola
-- =====================================================
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT 
  policyname,
  cmd as "Command",
  permissive as "Type"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- VÝSLEDEK:
-- 
-- Po spuštění tohoto skriptu:
-- 1. RLS politiky budou přestavěny
-- 2. Měl bys se moct přihlásit
-- 
-- Pokud stále nefunguje, DOČASNĚ vypni RLS:
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- 
-- A pak se přihlaš. Po přihlášení to můžeš vrátit:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- =====================================================

