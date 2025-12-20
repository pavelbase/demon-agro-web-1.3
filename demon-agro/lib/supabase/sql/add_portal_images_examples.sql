-- Add example portal images for landing page gallery
-- These are placeholders - replace URLs with actual screenshots

-- ============================================================================
-- Example Portal Images
-- ============================================================================

-- 1. Dashboard Screenshot
INSERT INTO public.portal_images (
  key,
  url,
  alt,
  title,
  description,
  category,
  display_order,
  is_active
) VALUES (
  'portal_dashboard',
  'https://via.placeholder.com/1920x1080/4A7C59/FFFFFF?text=Dashboard',  -- Replace with actual URL
  'Hlavní dashboard portálu',
  'Dashboard',
  'Přehled všech pozemků a rychlý přístup k funkcím',
  'portal_landing',
  1,
  true
)
ON CONFLICT (key) 
DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 2. Upload Screenshot
INSERT INTO public.portal_images (
  key,
  url,
  alt,
  title,
  description,
  category,
  display_order,
  is_active
) VALUES (
  'portal_upload',
  'https://via.placeholder.com/1920x1080/4A7C59/FFFFFF?text=Upload+Rozboru',  -- Replace with actual URL
  'Upload rozborů půdy',
  'Upload Rozborů',
  'Nahrajte PDF rozbory a AI automaticky extrahuje data',
  'portal_landing',
  2,
  true
)
ON CONFLICT (key) 
DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 3. Soil Health Card Screenshot
INSERT INTO public.portal_images (
  key,
  url,
  alt,
  title,
  description,
  category,
  display_order,
  is_active
) VALUES (
  'portal_health_card',
  'https://via.placeholder.com/1920x1080/4A7C59/FFFFFF?text=Zdravotni+Karta',  -- Replace with actual URL
  'Zdravotní karta půdy',
  'Zdravotní Karta',
  'Barevná vizualizace stavu živin v půdě',
  'portal_landing',
  3,
  true
)
ON CONFLICT (key) 
DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 4. Fertilization Plan Screenshot
INSERT INTO public.portal_images (
  key,
  url,
  alt,
  title,
  description,
  category,
  display_order,
  is_active
) VALUES (
  'portal_fertilization_plan',
  'https://via.placeholder.com/1920x1080/4A7C59/FFFFFF?text=Plan+Hnojeni',  -- Replace with actual URL
  'Plán hnojení',
  'Plán Hnojení',
  'Automaticky generované doporučení hnojení',
  'portal_landing',
  4,
  true
)
ON CONFLICT (key) 
DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- ============================================================================
-- Verify images
-- ============================================================================

SELECT 
  key,
  title,
  description,
  display_order,
  is_active,
  category
FROM public.portal_images
WHERE category = 'portal_landing'
ORDER BY display_order;

-- ============================================================================
-- Update URLs with actual screenshots
-- ============================================================================

/*
-- After uploading real screenshots to Supabase Storage, update URLs:

UPDATE public.portal_images 
SET url = 'https://ppsldvsodvcbxecxjssf.supabase.co/storage/v1/object/public/portal-images/dashboard.png'
WHERE key = 'portal_dashboard';

UPDATE public.portal_images 
SET url = 'https://ppsldvsodvcbxecxjssf.supabase.co/storage/v1/object/public/portal-images/upload.png'
WHERE key = 'portal_upload';

UPDATE public.portal_images 
SET url = 'https://ppsldvsodvcbxecxjssf.supabase.co/storage/v1/object/public/portal-images/health-card.png'
WHERE key = 'portal_health_card';

UPDATE public.portal_images 
SET url = 'https://ppsldvsodvcbxecxjssf.supabase.co/storage/v1/object/public/portal-images/fertilization-plan.png'
WHERE key = 'portal_fertilization_plan';
*/

-- ============================================================================
-- Hide/Show images
-- ============================================================================

/*
-- Hide all images
UPDATE public.portal_images 
SET is_active = false
WHERE category = 'portal_landing';

-- Show all images
UPDATE public.portal_images 
SET is_active = true
WHERE category = 'portal_landing';

-- Hide specific image
UPDATE public.portal_images 
SET is_active = false
WHERE key = 'portal_dashboard';
*/

-- ============================================================================
-- Delete example images (cleanup)
-- ============================================================================

/*
DELETE FROM public.portal_images 
WHERE category = 'portal_landing';
*/
