-- ============================================================================
-- CREATE PUBLIC IMAGES BUCKET
-- ============================================================================
-- Bucket pro obrázky z veřejného prohlížeče (spravované z /admin)
-- Oddělené od portal-images (spravované z /portal/admin)
--
-- Použití:
-- 1. Spusťte tento skript v Supabase SQL Editor
-- 2. Nebo vytvořte bucket ručně v Supabase Dashboard → Storage
-- ============================================================================

-- Vytvoření bucketu pro veřejné obrázky
-- Poznámka: Bucket lze vytvořit také přes Supabase Dashboard → Storage → New bucket
-- Nastavení:
-- - Name: public-images
-- - Public bucket: YES (✓)
-- - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
-- - File size limit: 5 MB

-- Alternativně můžete vytvořit bucket pomocí SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-images',
  'public-images',
  true,  -- public bucket = veřejně čitelný
  5242880,  -- 5 MB v bytech
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Policy 1: Všichni mohou ČÍST obrázky (veřejný přístup)
CREATE POLICY "Public images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-images');

-- Policy 2: Pouze autentizovaní uživatelé mohou NAHRÁVAT obrázky
-- (pro budoucí rozšíření, pokud budete chtít přidat autentizaci do /admin)
CREATE POLICY "Authenticated users can upload public images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-images'
  -- Pro teď bez autentizace, později můžete přidat:
  -- AND auth.role() = 'authenticated'
);

-- Policy 3: Pouze autentizovaní uživatelé mohou MAZAT obrázky
CREATE POLICY "Authenticated users can delete public images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-images'
  -- Pro teď bez autentizace, později můžete přidat:
  -- AND auth.role() = 'authenticated'
);

-- Policy 4: Pouze autentizovaní uživatelé mohou AKTUALIZOVAT obrázky
CREATE POLICY "Authenticated users can update public images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-images'
)
WITH CHECK (
  bucket_id = 'public-images'
);

-- ============================================================================
-- POZNÁMKY
-- ============================================================================

-- DŮLEŽITÉ:
-- - Tento bucket je ODDĚLENÝ od 'portal-images' (pro /portal/admin)
-- - Bucket je PUBLIC = obrázky jsou veřejně přístupné přes URL
-- - Upload policies jsou nastaveny pro autentizované uživatele
--   (pokud chcete upload bez autentizace, odeberte auth kontroly)
-- 
-- STRUKTURA BUCKETŮ:
-- - 'public-images'     → Veřejný web (/admin)
-- - 'portal-images'     → Portál (/portal/admin) - již existuje
-- - 'soil-documents'    → PDF rozbory půdy - již existuje
--
-- OVĚŘENÍ:
-- SELECT * FROM storage.buckets WHERE id = 'public-images';
-- SELECT * FROM storage.objects WHERE bucket_id = 'public-images';

-- ============================================================================
-- MANUAL BUCKET CREATION (Alternative)
-- ============================================================================

-- Pokud INSERT výše nefunguje, vytvořte bucket ručně:
-- 1. Jděte do Supabase Dashboard
-- 2. Storage → New bucket
-- 3. Name: public-images
-- 4. Public bucket: YES (✓)
-- 5. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
-- 6. File size limit: 5 MB (5242880 bytes)

-- Pak spusťte pouze policies:
/*
CREATE POLICY "Public images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-images');

CREATE POLICY "Authenticated users can upload public images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public-images');

CREATE POLICY "Authenticated users can delete public images"
ON storage.objects FOR DELETE
USING (bucket_id = 'public-images');

CREATE POLICY "Authenticated users can update public images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public-images')
WITH CHECK (bucket_id = 'public-images');
*/


