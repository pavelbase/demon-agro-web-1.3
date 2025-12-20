-- Create test users for development and testing
-- Run this in Supabase SQL Editor

-- ============================================================================
-- Test User 1: Regular Active User
-- ============================================================================
-- Email: user@test.cz
-- Password: testuser123

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'user@test.cz';
  
  IF user_id IS NULL THEN
    -- Insert into auth.users (this will trigger profile creation)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'user@test.cz',
      crypt('testuser123', gen_salt('bf')),
      now(),
      '{"full_name": "Test User", "role": "user"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO user_id;

    -- Insert profile (if trigger didn't create it)
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
    ) VALUES (
      user_id,
      'user@test.cz',
      'Test User',
      'Test Company',
      '+420 123 456 789',
      'user',
      true,
      false,
      true
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      company_name = EXCLUDED.company_name,
      phone = EXCLUDED.phone,
      is_active = true,
      must_change_password = false,
      onboarding_completed = true;

    RAISE NOTICE 'Created test user: user@test.cz / testuser123';
  ELSE
    RAISE NOTICE 'User user@test.cz already exists';
  END IF;
END $$;

-- ============================================================================
-- Test User 2: Admin User
-- ============================================================================
-- Email: admin@test.cz
-- Password: admin123

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@test.cz';
  
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@test.cz',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"full_name": "Test Admin", "role": "admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_id;

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
    ) VALUES (
      admin_id,
      'admin@test.cz',
      'Test Admin',
      'Démon Agro',
      '+420 987 654 321',
      'admin',
      true,
      false,
      true
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = 'admin',
      is_active = true,
      must_change_password = false,
      onboarding_completed = true;

    RAISE NOTICE 'Created admin user: admin@test.cz / admin123';
  ELSE
    RAISE NOTICE 'User admin@test.cz already exists';
  END IF;
END $$;

-- ============================================================================
-- Test User 3: Inactive User
-- ============================================================================
-- Email: inactive@test.cz
-- Password: inactive123

DO $$
DECLARE
  inactive_id uuid;
BEGIN
  SELECT id INTO inactive_id FROM auth.users WHERE email = 'inactive@test.cz';
  
  IF inactive_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'inactive@test.cz',
      crypt('inactive123', gen_salt('bf')),
      now(),
      '{"full_name": "Inactive User", "role": "user"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO inactive_id;

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      is_active,
      must_change_password,
      onboarding_completed
    ) VALUES (
      inactive_id,
      'inactive@test.cz',
      'Inactive User',
      'user',
      false,  -- Inactive!
      false,
      true
    ) ON CONFLICT (id) DO UPDATE SET
      is_active = false;

    RAISE NOTICE 'Created inactive user: inactive@test.cz / inactive123';
  ELSE
    RAISE NOTICE 'User inactive@test.cz already exists';
  END IF;
END $$;

-- ============================================================================
-- Test User 4: Must Change Password
-- ============================================================================
-- Email: changepass@test.cz
-- Password: changepass123

DO $$
DECLARE
  change_id uuid;
BEGIN
  SELECT id INTO change_id FROM auth.users WHERE email = 'changepass@test.cz';
  
  IF change_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'changepass@test.cz',
      crypt('changepass123', gen_salt('bf')),
      now(),
      '{"full_name": "Change Password User", "role": "user"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO change_id;

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      is_active,
      must_change_password,  -- Must change!
      onboarding_completed
    ) VALUES (
      change_id,
      'changepass@test.cz',
      'Change Password User',
      'user',
      true,
      true,  -- Must change password!
      true
    ) ON CONFLICT (id) DO UPDATE SET
      must_change_password = true;

    RAISE NOTICE 'Created user with password change required: changepass@test.cz / changepass123';
  ELSE
    RAISE NOTICE 'User changepass@test.cz already exists';
  END IF;
END $$;

-- ============================================================================
-- Test User 5: Onboarding Not Completed
-- ============================================================================
-- Email: onboarding@test.cz
-- Password: onboarding123

DO $$
DECLARE
  onboard_id uuid;
BEGIN
  SELECT id INTO onboard_id FROM auth.users WHERE email = 'onboarding@test.cz';
  
  IF onboard_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'onboarding@test.cz',
      crypt('onboarding123', gen_salt('bf')),
      now(),
      '{"full_name": "Onboarding User", "role": "user"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO onboard_id;

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      is_active,
      must_change_password,
      onboarding_completed  -- Not completed!
    ) VALUES (
      onboard_id,
      'onboarding@test.cz',
      'Onboarding User',
      'user',
      true,
      false,
      false  -- Onboarding not completed!
    ) ON CONFLICT (id) DO UPDATE SET
      onboarding_completed = false;

    RAISE NOTICE 'Created user with onboarding incomplete: onboarding@test.cz / onboarding123';
  ELSE
    RAISE NOTICE 'User onboarding@test.cz already exists';
  END IF;
END $$;

-- ============================================================================
-- Summary
-- ============================================================================

SELECT 
  email,
  role,
  is_active,
  must_change_password,
  onboarding_completed,
  created_at
FROM public.profiles
WHERE email LIKE '%@test.cz'
ORDER BY email;

-- ============================================================================
-- Test Users Summary
-- ============================================================================
-- 1. user@test.cz / testuser123
--    - Regular active user with onboarding completed
--    - Should login successfully → Dashboard
--
-- 2. admin@test.cz / admin123
--    - Admin user with full access
--    - Should login successfully → Dashboard (can access /admin)
--
-- 3. inactive@test.cz / inactive123
--    - Inactive user
--    - Should show error: "Účet je deaktivován"
--
-- 4. changepass@test.cz / changepass123
--    - User must change password
--    - Should redirect → /portal/nastaveni?change_password=true
--
-- 5. onboarding@test.cz / onboarding123
--    - Onboarding not completed
--    - Should redirect → /portal/onboarding
