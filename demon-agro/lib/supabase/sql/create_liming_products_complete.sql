-- ============================================================================
-- COMPLETE LIMING PRODUCTS SETUP WITH MOISTURE & PARTICLES
-- Kompletní vytvoření tabulky vápnících produktů včetně vlhkosti a částic
-- ============================================================================
-- POUŽITÍ: Spusť tento soubor pokud tabulka liming_products ještě neexistuje
-- ============================================================================

-- Drop table if exists (pro development/testing)
DROP TABLE IF EXISTS public.liming_products CASCADE;

-- ============================================================================
-- CREATE TABLE
-- ============================================================================

CREATE TABLE public.liming_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Product type
  type VARCHAR(20) NOT NULL CHECK (type IN ('calcitic', 'dolomite', 'both')),
  -- calcitic = Vápenatý (pouze CaO)
  -- dolomite = Dolomitický (CaO + MgO)
  -- both = Univerzální (vhodný pro oba účely)
  
  -- Composition (%)
  cao_content DECIMAL(5,2) NOT NULL, -- % CaO (0-100)
  mgo_content DECIMAL(5,2) DEFAULT 0, -- % MgO (0-100)
  
  -- Reactivity
  reactivity VARCHAR(20) CHECK (reactivity IN ('low', 'medium', 'high', 'very_high')),
  -- low = Nízká (pomalé uvolňování)
  -- medium = Střední (standardní)
  -- high = Vysoká (rychlé působení)
  -- very_high = Velmi vysoká (okamžitý efekt)
  
  -- Physical properties (NOVĚ PŘIDÁNO - 3.1.2026)
  moisture_content DECIMAL(5,2), -- Vlhkost v %
  particles_over_1mm DECIMAL(5,2), -- Částice nad 1 mm v %
  particles_under_05mm DECIMAL(5,2), -- Částice pod 0,5 mm v %
  particles_009_05mm DECIMAL(5,2), -- Částice 0,09-0,5 mm v %
  
  granulation VARCHAR(50), -- e.g., "0-3mm", "2-5mm", "mletý"
  form VARCHAR(50), -- e.g., "granulát", "moučka", "drcený"
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'on_order')),
  
  -- Display
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  
  -- Notes
  notes TEXT,
  application_notes TEXT, -- Poznámky k aplikaci
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_liming_products_type ON public.liming_products(type);
CREATE INDEX idx_liming_products_active ON public.liming_products(is_active);
CREATE INDEX idx_liming_products_display_order ON public.liming_products(display_order);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN liming_products.moisture_content IS 
'Vlhkost v % (např. 3.0 pro Dolomit, 15.0-20.0 pro Vápenec)';

COMMENT ON COLUMN liming_products.particles_over_1mm IS 
'Obsah částic nad 1 mm v % (např. max. 18.0 pro Dolomit)';

COMMENT ON COLUMN liming_products.particles_under_05mm IS 
'Obsah částic pod 0,5 mm v % (např. min. 74.0 pro Dolomit)';

COMMENT ON COLUMN liming_products.particles_009_05mm IS 
'Obsah částic 0,09-0,5 mm v % (např. min. 90.0 pro Vápenec Vitošov)';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.liming_products ENABLE ROW LEVEL SECURITY;

-- Všichni mohou číst aktivní produkty
CREATE POLICY "Veřejné čtení aktivních produktů"
  ON public.liming_products
  FOR SELECT
  USING (is_active = true);

-- Pouze admini mohou upravovat
CREATE POLICY "Admin může upravovat produkty"
  ON public.liming_products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- UPDATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_liming_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_liming_products_updated_at
  BEFORE UPDATE ON public.liming_products
  FOR EACH ROW
  EXECUTE FUNCTION update_liming_products_updated_at();

-- ============================================================================
-- DEFAULT PRODUCTS (Výchozí produkty Démon Agro)
-- ============================================================================

INSERT INTO public.liming_products (
  name, 
  description, 
  type, 
  cao_content, 
  mgo_content, 
  reactivity, 
  granulation,
  form,
  display_order,
  application_notes,
  moisture_content,
  particles_over_1mm,
  particles_under_05mm,
  particles_009_05mm
) VALUES
  (
    'Vápenec mletý - Vysokoreaktivní',
    'Jemně mletý vápenec pro rychlou úpravu pH půdy. Ideální pro okamžitý efekt a kyselé půdy.',
    'calcitic',
    52.0,
    0.0,
    'very_high',
    '0-0.5mm',
    'moučka',
    1,
    'Aplikovat na jaře nebo na podzim. Zapracovat do půdy do 24 hodin.',
    NULL, -- vlhkost neuvedena
    NULL,
    NULL,
    NULL
  ),
  (
    'Dolomit mletý',
    'Kombinace vápníku a hořčíku pro dlouhodobou stabilizaci pH. Vhodné při nedostatku Mg.',
    'dolomite',
    30.0,
    18.0,
    'high',
    '0-3mm',
    'moučka',
    2,
    'Ideální při nízkém obsahu Mg v půdě nebo nevyváženém poměru K:Mg.',
    NULL, -- vlhkost neuvedena
    NULL,
    NULL,
    NULL
  ),
  (
    'Granulovaný vápenec',
    'Snadná aplikace, rovnoměrné rozprostření po celém poli. Standardní reaktivita.',
    'calcitic',
    50.0,
    0.0,
    'medium',
    '2-5mm',
    'granulát',
    3,
    'Vhodný pro běžné údržbové vápnění. Postupné uvolňování účinné látky.',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Vápenec drcený',
    'Ekonomické řešení pro údržbové vápnění. Dlouhodobý efekt.',
    'calcitic',
    48.0,
    0.0,
    'medium',
    '0-10mm',
    'drcený',
    4,
    'Vhodný pro údržbové vápnění na velkých plochách. Nižší cena než mletý.',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Dolomit granulovaný',
    'Granulovaná forma dolomitu pro snadnou aplikaci. Obsahuje vápník i hořčík.',
    'dolomite',
    32.0,
    16.0,
    'medium',
    '2-5mm',
    'granulát',
    5,
    'Vhodný při potřebě doplnění Mg a současně úpravy pH.',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'Vápenec + Mg (hybridní)',
    'Vápenatý produkt s přídavkem hořčíku. Univerzální použití.',
    'both',
    45.0,
    8.0,
    'high',
    '0-5mm',
    'směs',
    6,
    'Vhodný jako univerzální řešení, když není jasné zda použít kalcitický nebo dolomitický.',
    NULL,
    NULL,
    NULL,
    NULL
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Kontrola, že tabulka existuje
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'liming_products';

-- Kontrola všech sloupců včetně nových
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'liming_products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Kontrola počtu produktů
SELECT COUNT(*) as product_count FROM public.liming_products;

-- Výpis všech produktů
SELECT 
  name,
  type,
  cao_content,
  mgo_content,
  reactivity,
  moisture_content,
  particles_over_1mm,
  particles_under_05mm,
  particles_009_05mm,
  is_active
FROM public.liming_products
ORDER BY display_order;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tabulka liming_products byla úspěšně vytvořena!';
  RAISE NOTICE '✅ Včetně nových sloupců: moisture_content, particles_over_1mm, particles_under_05mm, particles_009_05mm';
  RAISE NOTICE '✅ Přidáno 6 výchozích produktů';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Nyní můžeš přidat své vlastní produkty s kompletními údaji z etiket.';
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
TYPY PRODUKTŮ:
- calcitic: Vápenatý vápenec (pouze CaO) - pro zvýšení pH bez doplnění Mg
- dolomite: Dolomitický vápenec (CaO + MgO) - pro zvýšení pH + doplnění Mg
- both: Univerzální/hybridní - vhodný pro oba účely

REAKTIVITA:
- very_high: Velmi vysoká (0-0.5mm moučka) - působí do týdnů
- high: Vysoká (0-3mm jemný) - působí do měsíců
- medium: Střední (2-5mm granulát) - působí do roka
- low: Nízká (hrubší) - působí několik let

FYZIKÁLNÍ VLASTNOSTI (NOVĚ):
- moisture_content: Vlhkost v % (např. 3.0 pro Dolomit, 15-20 pro Vápenec)
- particles_over_1mm: Částice nad 1 mm v % (pro hrubší frakce)
- particles_under_05mm: Částice pod 0.5 mm v % (pro hrubší frakce)
- particles_009_05mm: Částice 0.09-0.5 mm v % (pro jemně mleté produkty)

PŘÍKLADY HODNOT Z ETIKET:
1. Dolomit (O1635):
   - moisture_content: 3.0
   - particles_over_1mm: 18.0
   - particles_under_05mm: 74.0

2. Vápenec Vitošov (O635):
   - moisture_content: 17.5 (nebo 15-20)
   - particles_009_05mm: 90.0

POUŽITÍ V APLIKACI:
1. Systém doporučí typ (calcitic/dolomite) podle stavu Mg
2. Uživatel vybere konkrétní produkt podle reaktivity/formy
3. Systém vypočítá potřebné množství podle obsahu CaO
4. Fyzikální vlastnosti slouží pro přesnější výpočty a skladování
*/


