-- =====================================================
-- Check User Consistency Between Auth and Profiles
-- =====================================================
-- Tento skript kontroluje konzistenci mezi auth.users
-- a profiles tabulkami
-- =====================================================

-- 1. Uživatelé v auth.users BEZ profilu (osiřelí)
SELECT 
  'ORPHANED AUTH USER' as issue_type,
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. Profily BEZ uživatele v auth.users (osiřelé profily)
SELECT 
  'ORPHANED PROFILE' as issue_type,
  p.id,
  p.email,
  p.company_name,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- 3. Nesrovnalosti v emailech
SELECT 
  'EMAIL MISMATCH' as issue_type,
  u.id,
  u.email as auth_email,
  p.email as profile_email,
  p.company_name
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
WHERE u.email != p.email;

-- 4. Celkový přehled
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL) as orphaned_auth_users,
  (SELECT COUNT(*) FROM public.profiles p LEFT JOIN auth.users u ON p.id = u.id WHERE u.id IS NULL) as orphaned_profiles,
  (SELECT COUNT(*) FROM auth.users u INNER JOIN public.profiles p ON u.id = p.id WHERE u.email != p.email) as email_mismatches;

