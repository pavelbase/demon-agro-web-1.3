-- Create test users for onboarding testing
-- Run these in Supabase SQL Editor

-- ============================================================================
-- Test User 1: No password change required
-- ============================================================================
-- Email: test.onboarding1@demonagro.cz
-- Password: TestPass123
-- Scenario: Regular onboarding (welcome → company info → complete)

-- Insert into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test.onboarding1@demonagro.cz',
  crypt('TestPass123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Insert into public.profiles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  company_name,
  phone,
  role,
  is_active,
  must_change_password,
  onboarding_completed
)
SELECT 
  id,
  email,
  'Test User 1',
  NULL,  -- Will be filled during onboarding
  NULL,
  'user',
  true,
  false,  -- No password change required
  false   -- Onboarding not completed
FROM auth.users
WHERE email = 'test.onboarding1@demonagro.cz'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Test User 2: Must change password
-- ============================================================================
-- Email: test.onboarding2@demonagro.cz
-- Password: TempPass123 (must be changed)
-- Scenario: Full onboarding (welcome → password → company info → complete)

-- Insert into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test.onboarding2@demonagro.cz',
  crypt('TempPass123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Insert into public.profiles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  company_name,
  phone,
  role,
  is_active,
  must_change_password,
  onboarding_completed
)
SELECT 
  id,
  email,
  'Test User 2',
  NULL,
  NULL,
  'user',
  true,
  true,   -- Must change password
  false   -- Onboarding not completed
FROM auth.users
WHERE email = 'test.onboarding2@demonagro.cz'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Test User 3: Already completed onboarding
-- ============================================================================
-- Email: test.onboarding3@demonagro.cz
-- Password: TestPass123
-- Scenario: Should redirect to dashboard immediately

-- Insert into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test.onboarding3@demonagro.cz',
  crypt('TestPass123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Insert into public.profiles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  company_name,
  ico,
  address,
  district,
  phone,
  role,
  is_active,
  must_change_password,
  onboarding_completed
)
SELECT 
  id,
  email,
  'Test User 3',
  'Test Company s.r.o.',
  '12345678',
  'Praha 1, Václavské náměstí 1',
  'praha',
  '+420 123 456 789',
  'user',
  true,
  false,
  true    -- Onboarding already completed
FROM auth.users
WHERE email = 'test.onboarding3@demonagro.cz'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Verify test users
-- ============================================================================

SELECT 
  p.email,
  p.full_name,
  p.company_name,
  p.district,
  p.is_active,
  p.must_change_password,
  p.onboarding_completed
FROM public.profiles p
WHERE p.email LIKE 'test.onboarding%@demonagro.cz'
ORDER BY p.email;

-- ============================================================================
-- Cleanup (run this to remove test users)
-- ============================================================================

/*
-- Delete test users from profiles
DELETE FROM public.profiles 
WHERE email LIKE 'test.onboarding%@demonagro.cz';

-- Delete test users from auth.users
DELETE FROM auth.users 
WHERE email LIKE 'test.onboarding%@demonagro.cz';
*/

-- ============================================================================
-- Reset onboarding status (if you want to re-test)
-- ============================================================================

/*
-- Reset User 1
UPDATE public.profiles 
SET 
  onboarding_completed = false,
  must_change_password = false,
  company_name = NULL,
  ico = NULL,
  address = NULL,
  district = NULL
WHERE email = 'test.onboarding1@demonagro.cz';

-- Reset User 2
UPDATE public.profiles 
SET 
  onboarding_completed = false,
  must_change_password = true,
  company_name = NULL,
  ico = NULL,
  address = NULL,
  district = NULL
WHERE email = 'test.onboarding2@demonagro.cz';

-- Also need to reset password in auth.users for User 2
UPDATE auth.users 
SET encrypted_password = crypt('TempPass123', gen_salt('bf'))
WHERE email = 'test.onboarding2@demonagro.cz';
*/
