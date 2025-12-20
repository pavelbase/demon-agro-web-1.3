-- Add company information fields to profiles table
-- Run this migration if you don't have these columns yet

-- Add ICO (Czech business identification number)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ico VARCHAR(20);

-- Add address
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add district (for shipping zones)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS district VARCHAR(100);

COMMENT ON COLUMN public.profiles.ico IS 'IČO - Czech business identification number';
COMMENT ON COLUMN public.profiles.address IS 'Company address';
COMMENT ON COLUMN public.profiles.district IS 'District for shipping zone calculation';
