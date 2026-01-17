-- ============================================================================
-- ADD Moisture and Particle Content Columns to liming_products
-- Date: 2026-01-03
-- Description: Adds moisture (vlhkost) and particle content (obsah částic) fields
-- ============================================================================

-- Add moisture column (Vlhkost v %)
ALTER TABLE liming_products 
ADD COLUMN IF NOT EXISTS moisture_content DECIMAL(5,2);

-- Add particle content fields
-- Částice nad 1 mm (%)
ALTER TABLE liming_products 
ADD COLUMN IF NOT EXISTS particles_over_1mm DECIMAL(5,2);

-- Částice pod 0,5 mm (%)
ALTER TABLE liming_products 
ADD COLUMN IF NOT EXISTS particles_under_05mm DECIMAL(5,2);

-- Částice 0,09-0,5 mm (%)
ALTER TABLE liming_products 
ADD COLUMN IF NOT EXISTS particles_009_05mm DECIMAL(5,2);

-- Add comments
COMMENT ON COLUMN liming_products.moisture_content IS 
'Vlhkost v % (např. 3.0 pro Dolomit, 15.0-20.0 pro Vápenec)';

COMMENT ON COLUMN liming_products.particles_over_1mm IS 
'Obsah částic nad 1 mm v % (např. max. 18.0 pro Dolomit)';

COMMENT ON COLUMN liming_products.particles_under_05mm IS 
'Obsah částic pod 0,5 mm v % (např. min. 74.0 pro Dolomit)';

COMMENT ON COLUMN liming_products.particles_009_05mm IS 
'Obsah částic 0,09-0,5 mm v % (např. min. 90.0 pro Vápenec Vitošov)';

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'liming_products' 
AND column_name IN (
  'moisture_content',
  'particles_over_1mm', 
  'particles_under_05mm',
  'particles_009_05mm'
)
ORDER BY column_name;




