-- ============================================================================
-- ADMIN ROLE SETUP - Démon Agro Portál
-- ============================================================================
-- Tento skript slouží k nastavení admin role pro uživatele
-- a k testování admin funkcionality v portálu.
-- ============================================================================

-- ============================================================================
-- 1. NASTAVIT ADMIN ROLI PRO UŽIVATELE
-- ============================================================================

-- DŮLEŽITÉ: Nahraďte 'vas-email@example.com' skutečným emailem

-- Krok A: Nastavit roli v profiles tabulce (pro aplikační logiku)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'vas-email@example.com';

-- Krok B: Nastavit roli v auth.users metadata (pro middleware)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'vas-email@example.com';

-- Ověření změny
SELECT 
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.full_name,
  p.is_active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'vas-email@example.com';

-- ============================================================================
-- 2. ZOBRAZIT VŠECHNY ADMIN UŽIVATELE
-- ============================================================================

SELECT 
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.full_name,
  p.company_name,
  p.is_active,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- ============================================================================
-- 3. ZOBRAZIT VŠECHNY UŽIVATELE S JEJICH ROLEMI
-- ============================================================================

SELECT 
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.full_name,
  p.company_name,
  p.is_active,
  p.onboarding_completed,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY 
  p.role DESC,  -- Admin users first
  p.created_at DESC;

-- ============================================================================
-- 4. VRÁTIT UŽIVATELE ZPĚT NA BĚŽNOU ROLI
-- ============================================================================

-- DŮLEŽITÉ: Nahraďte 'vas-email@example.com' skutečným emailem

-- Krok A: Změnit roli v profiles na 'user'
UPDATE public.profiles
SET role = 'user'
WHERE email = 'vas-email@example.com';

-- Krok B: Změnit roli v auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "user"}'::jsonb
WHERE email = 'vas-email@example.com';

-- Ověření změny
SELECT 
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'vas-email@example.com';

-- ============================================================================
-- 5. STATISTIKY UŽIVATELŮ PODLE ROLE
-- ============================================================================

SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
  COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as completed_onboarding
FROM public.profiles
GROUP BY role
ORDER BY role;

-- ============================================================================
-- 6. NAJÍT UŽIVATELE BEZ SYNCHRONIZOVANÉ ROLE
-- ============================================================================
-- (role v profiles neodpovídá roli v auth.users)

SELECT 
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE 
  p.role IS NOT NULL 
  AND (
    u.raw_user_meta_data->>'role' IS NULL 
    OR u.raw_user_meta_data->>'role' != p.role
  );

-- ============================================================================
-- 7. SYNCHRONIZOVAT ROLE (opravit nesynchronizované záznamy)
-- ============================================================================

-- Synchronizovat z profiles do auth.users
UPDATE auth.users u
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE u.id = p.id
  AND p.role IS NOT NULL
  AND (
    u.raw_user_meta_data->>'role' IS NULL 
    OR u.raw_user_meta_data->>'role' != p.role
  );

-- Ověření synchronizace
SELECT 
  COUNT(*) as synchronized_users
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE p.role = u.raw_user_meta_data->>'role';

-- ============================================================================
-- 8. VYTVOŘIT NOVÉHO ADMIN UŽIVATELE (pomocí existujícího účtu)
-- ============================================================================

-- Pokud máte existujícího uživatele a chcete ho povýšit na admina
-- DŮLEŽITÉ: Nahraďte 'novy-admin@example.com' skutečným emailem

DO $$
DECLARE
  target_email TEXT := 'novy-admin@example.com';
  user_exists BOOLEAN;
BEGIN
  -- Zkontrolovat, zda uživatel existuje
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = target_email
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Nastavit admin roli
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = target_email;
    
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
    WHERE email = target_email;
    
    RAISE NOTICE 'Admin role byla nastavena pro: %', target_email;
  ELSE
    RAISE NOTICE 'Uživatel s emailem % neexistuje', target_email;
  END IF;
END $$;

-- ============================================================================
-- 9. AUDIT LOG - Zobrazit admin aktivity
-- ============================================================================

SELECT 
  al.action,
  al.table_name,
  u.email as admin_email,
  p.full_name as admin_name,
  al.created_at
FROM audit_logs al
JOIN auth.users u ON al.user_id = u.id
JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY al.created_at DESC
LIMIT 50;

-- ============================================================================
-- 10. TEST PŘIPOJENÍ - Ověřit, že můžete číst data
-- ============================================================================

-- Test 1: Počet profilů
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Test 2: Počet admin uživatelů
SELECT COUNT(*) as total_admins FROM public.profiles WHERE role = 'admin';

-- Test 3: Počet běžných uživatelů
SELECT COUNT(*) as total_users FROM public.profiles WHERE role = 'user';

-- Test 4: Poslední registrace
SELECT 
  email, 
  full_name, 
  role, 
  created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================================================
-- KONEC SKRIPTU
-- ============================================================================

/*
POZNÁMKY:

1. Pro zobrazení Admin Zóny v sidebaru je potřeba nastavit role='admin' 
   v OBOU místech:
   - public.profiles.role (pro aplikační logiku)
   - auth.users.raw_user_meta_data (pro middleware)

2. Po změně role v databázi je potřeba:
   - Odhlásit se a znovu se přihlásit
   - NEBO obnovit stránku (F5)

3. Admin Zóna se zobrazí pouze když:
   - profile?.role === 'admin'
   - Uživatel je autentizovaný
   - Middleware povolí přístup

4. Zabezpečení:
   - UI vrstva: {isAdmin && ...}
   - Layout vrstva: redirect('/portal/dashboard')
   - Middleware: NextResponse.redirect(...)

5. Admin stránky:
   - /portal/admin - Dashboard
   - /portal/admin/uzivatele - Správa uživatelů
   - /portal/admin/produkty - Produkty hnojení
   - /portal/admin/produkty-vapneni - Produkty vápnění
   - /portal/admin/poptavky - Správa poptávek
   - /portal/admin/obrazky-portalu - Správa obrázků
   - /portal/admin/audit-log - Audit záznamy
   - /portal/admin/statistiky - Statistiky
*/
