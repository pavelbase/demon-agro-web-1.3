-- =====================================================
-- Cleanup Orphaned Auth Users
-- =====================================================
-- Tento skript najde a smaže uživatele z auth.users,
-- kteří nemají odpovídající záznam v profiles tabulce.
-- To se může stát, když selže mazání v auth.users,
-- ale profil se už smazal.
-- =====================================================

-- KROK 1: Najít osiřelé uživatele (pro kontrolu)
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  'ORPHANED - no profile' as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- KROK 2: Smazat konkrétního osiřelého uživatele (bezpečné)
-- Odkomentujte a upravte email podle potřeby:
-- DELETE FROM auth.users 
-- WHERE email = 'base.pavel.29@gmail.com'
-- AND id NOT IN (SELECT id FROM public.profiles);

-- KROK 3: Smazat VŠECHNY osiřelé uživatele (NEBEZPEČNÉ!)
-- Používejte pouze pokud jste si jistí!
-- DELETE FROM auth.users 
-- WHERE id NOT IN (SELECT id FROM public.profiles WHERE id IS NOT NULL);

-- KROK 4: Ověření - mělo by vrátit 0 řádků
-- SELECT 
--   u.id,
--   u.email
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON u.id = p.id
-- WHERE p.id IS NULL;


