-- ============================================================================
-- LIMING PRODUCTS TABLE
-- Tabulka vápnících produktů Démon Agro
-- ============================================================================

-- Drop table if exists (pro development)
DROP TABLE IF EXISTS public.liming_products CASCADE;

-- Create table
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
  
  -- Physical properties
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

-- Indexes
CREATE INDEX idx_liming_products_type ON public.liming_products(type);
CREATE INDEX idx_liming_products_active ON public.liming_products(is_active);
CREATE INDEX idx_liming_products_display_order ON public.liming_products(display_order);

-- RLS Policies (veřejné čtení, admin zápis)
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
  application_notes
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
    'Aplikovat na jaře nebo na podzim. Zapracovat do půdy do 24 hodin.'
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
    'Ideální při nízkém obsahu Mg v půdě nebo nevyváženém poměru K:Mg.'
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
    'Vhodný pro běžné údržbové vápnění. Postupné uvolňování účinné látky.'
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
    'Vhodný pro údržbové vápnění na velkých plochách. Nižší cena než mletý.'
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
    'Vhodný při potřebě doplnění Mg a současně úpravy pH.'
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
    'Vhodný jako univerzální řešení, když není jasné zda použít kalcitický nebo dolomitický.'
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
-- VERIFICATION
-- ============================================================================

-- Kontrola, že tabulka existuje
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'liming_products';

-- Kontrola počtu produktů
SELECT COUNT(*) as product_count FROM public.liming_products;

-- Výpis všech produktů
SELECT 
  name,
  type,
  cao_content,
  mgo_content,
  reactivity,
  is_active
FROM public.liming_products
ORDER BY display_order;

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

POUŽITÍ V APLIKACI:
1. Systém doporučí typ (calcitic/dolomite) podle stavu Mg
2. Uživatel vybere konkrétní produkt podle reaktivity/formy
3. Systém vypočítá potřebné množství podle obsahu CaO
*/
