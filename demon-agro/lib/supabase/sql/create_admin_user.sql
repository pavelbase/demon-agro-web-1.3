-- Create admin user in Supabase
-- Replace email and password with your desired values

-- Method 1: Update existing user to admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@demonagro.cz';

-- Also update in profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@demonagro.cz';

-- Method 2: Create new admin user (use Admin Client in code)
-- This should be done via API using Service Role Key
/*
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@demonagro.cz',
  password: 'secure-admin-password',
  email_confirm: true,
  user_metadata: {
    role: 'admin',
    full_name: 'Admin Demon Agro'
  }
})
*/

-- Method 3: List all users and their roles
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  p.role as profile_role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
