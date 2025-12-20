-- Update profiles table to add authentication fields
-- Run this in Supabase SQL Editor

-- 1. Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false NOT NULL;

-- 2. Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- 3. Update existing users to have is_active = true
UPDATE public.profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- 4. Update existing users to have onboarding_completed = true (they're already in system)
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE onboarding_completed = false;

-- 5. Update handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    is_active,
    must_change_password,
    onboarding_completed
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE((new.raw_user_meta_data->>'is_active')::boolean, true),
    COALESCE((new.raw_user_meta_data->>'must_change_password')::boolean, false),
    COALESCE((new.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add RLS policy for is_active check
-- Users can only read their own profile if active
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Note: We check is_active in application code during login
-- RLS policies don't need to check is_active as we sign out inactive users

-- 7. Add comment for documentation
COMMENT ON COLUMN public.profiles.is_active IS 'Whether the user account is active. Inactive users cannot login.';
COMMENT ON COLUMN public.profiles.must_change_password IS 'Whether the user must change their password on next login.';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether the user has completed the onboarding process.';

-- 8. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('is_active', 'must_change_password', 'onboarding_completed')
ORDER BY column_name;
