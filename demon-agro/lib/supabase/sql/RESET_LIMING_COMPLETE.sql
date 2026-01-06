-- ============================================================================
-- KOMPLETNÍ RESET LIMING SYSTÉMU
-- ============================================================================
-- POZOR: Tento skript SMAŽE všechna existující data v liming tabulkách!
-- Použijte pouze pokud chcete začít od nuly.
-- ============================================================================
-- Co tento skript udělá:
-- 1. Smaže všechny liming tabulky (CASCADE)
-- 2. Vytvoří je znovu s aktuální strukturou
-- 3. Naplní liming_products 6 základními produkty
-- 4. Nastaví správné foreign key constraints
-- 5. Nastaví RLS policies
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'KOMPLETNÍ RESET LIMING SYSTÉMU';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'VAROVÁNÍ: Toto SMAŽE všechna data!';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- KROK 1: SMAZÁNÍ STARÝCH TABULEK
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '--- KROK 1: Mazání starých tabulek ---';
END $$;

DROP TABLE IF EXISTS public.liming_applications CASCADE;
DROP TABLE IF EXISTS public.liming_plans CASCADE;
DROP TABLE IF EXISTS public.liming_products CASCADE;

-- Pro jistotu i starý název (pokud existuje)
DROP TABLE IF EXISTS public.lime_products CASCADE;

DO $$ BEGIN
  RAISE NOTICE '✅ Staré tabulky smazány';
END $$;

-- ============================================================================
-- KROK 2: VYTVOŘENÍ TABULKY liming_products
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- KROK 2: Vytváření liming_products ---';
END $$;

CREATE TABLE public.liming_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  
  -- Product type
  type VARCHAR(20) NOT NULL CHECK (type IN ('calcitic', 'dolomite', 'both')),
  
  -- Composition (%)
  cao_content DECIMAL(5,2) NOT NULL,
  mgo_content DECIMAL(5,2) DEFAULT 0,
  
  -- Reactivity
  reactivity VARCHAR(20) CHECK (reactivity IN ('low', 'medium', 'high', 'very_high')),
  
  -- Physical properties
  moisture_content DECIMAL(5,2),
  particles_over_1mm DECIMAL(5,2),
  particles_under_05mm DECIMAL(5,2),
  particles_009_05mm DECIMAL(5,2),
  granulation VARCHAR(50),
  form VARCHAR(50),
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'on_order')),
  
  -- Display
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  
  -- Notes
  notes TEXT,
  application_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_liming_products_type ON public.liming_products(type);
CREATE INDEX idx_liming_products_active ON public.liming_products(is_active);
CREATE INDEX idx_liming_products_display_order ON public.liming_products(display_order);

DO $$ BEGIN
  RAISE NOTICE '✅ Tabulka liming_products vytvořena';
END $$;

-- ============================================================================
-- KROK 3: VYTVOŘENÍ TABULKY liming_plans
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- KROK 3: Vytváření liming_plans ---';
END $$;

CREATE TABLE public.liming_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  soil_analysis_id UUID REFERENCES soil_analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Vstupní parametry
  current_ph NUMERIC(3,1) NOT NULL,
  target_ph NUMERIC(3,1) NOT NULL,
  soil_type TEXT NOT NULL CHECK (soil_type IN ('L', 'S', 'T')),
  land_use TEXT NOT NULL CHECK (land_use IN ('orna', 'ttp')),
  current_mg NUMERIC(6,1),
  
  -- Vypočtené hodnoty
  total_ca_need NUMERIC(6,2),
  total_cao_need NUMERIC(6,2),
  total_ca_need_per_ha NUMERIC(5,2),
  total_cao_need_per_ha NUMERIC(5,2),
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed')),
  notes TEXT,
  
  CONSTRAINT valid_ph CHECK (current_ph >= 4.0 AND current_ph <= 8.0 AND target_ph >= 4.0 AND target_ph <= 8.0),
  CONSTRAINT valid_ph_direction CHECK (target_ph >= current_ph)
);

CREATE INDEX idx_liming_plans_parcel ON liming_plans(parcel_id);
CREATE INDEX idx_liming_plans_status ON liming_plans(status);

DO $$ BEGIN
  RAISE NOTICE '✅ Tabulka liming_plans vytvořena';
END $$;

-- ============================================================================
-- KROK 4: VYTVOŘENÍ TABULKY liming_applications
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- KROK 4: Vytváření liming_applications ---';
END $$;

CREATE TABLE public.liming_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liming_plan_id UUID NOT NULL REFERENCES liming_plans(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('jaro', 'leto', 'podzim')),
  sequence_order INTEGER NOT NULL,
  
  -- Produkt - SPRÁVNÝ FOREIGN KEY
  lime_product_id UUID REFERENCES liming_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  cao_content NUMERIC(4,1) NOT NULL,
  mgo_content NUMERIC(4,1) DEFAULT 0,
  
  -- Dávky
  dose_per_ha NUMERIC(6,2) NOT NULL,
  total_dose NUMERIC(8,2) NOT NULL,
  cao_per_ha NUMERIC(5,2) NOT NULL,
  mgo_per_ha NUMERIC(5,2),
  
  -- Predikce změn
  ph_before NUMERIC(3,1) NOT NULL,
  ph_after NUMERIC(3,1) NOT NULL,
  mg_after NUMERIC(6,1),
  
  -- Stav aplikace
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ordered', 'applied', 'cancelled')),
  applied_date DATE,
  actual_dose NUMERIC(8,2),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_year CHECK (year >= 2024 AND year <= 2050),
  CONSTRAINT valid_doses CHECK (dose_per_ha > 0 AND total_dose > 0 AND cao_per_ha > 0),
  UNIQUE (liming_plan_id, sequence_order)
);

CREATE INDEX idx_liming_applications_plan ON liming_applications(liming_plan_id);
CREATE INDEX idx_liming_applications_year ON liming_applications(year);
CREATE INDEX idx_liming_applications_product ON liming_applications(lime_product_id);

DO $$ BEGIN
  RAISE NOTICE '✅ Tabulka liming_applications vytvořena';
END $$;

-- ============================================================================
-- KROK 5: NAPLNĚNÍ liming_products DATY
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- KROK 5: Vkládání produktů ---';
END $$;

INSERT INTO liming_products (name, description, type, cao_content, mgo_content, reactivity, granulation, form, is_active, display_order) VALUES
  ('Vápenec mletý', 'Standardní mletý vápenec s vysokým obsahem CaO', 'calcitic', 52.0, 0.0, 'high', 'mletý', 'moučka', true, 1),
  ('Dolomit mletý', 'Dolomitický vápenec s obsahem hořčíku', 'dolomite', 30.0, 18.0, 'high', 'mletý', 'moučka', true, 2),
  ('Vápenec granulovaný', 'Granulovaný vápenec, snazší aplikace', 'calcitic', 50.0, 0.0, 'medium', '2-5mm', 'granulát', true, 3),
  ('Dolomit granulovaný', 'Granulovaný dolomit s obsahem hořčíku', 'dolomite', 28.0, 16.0, 'medium', '2-5mm', 'granulát', true, 4),
  ('Křídovec', 'Přírodní vápenec s pomalejším působením', 'calcitic', 45.0, 0.0, 'low', 'drcený', 'drcený', true, 5),
  ('Pálené vápno', 'Rychle působící vápno pro urgentní úpravu pH', 'both', 85.0, 0.0, 'very_high', 'mletý', 'moučka', true, 6);

DO $$ BEGIN
  RAISE NOTICE '✅ Vloženo 6 produktů';
END $$;

-- ============================================================================
-- KROK 6: RLS POLICIES
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- KROK 6: Nastavení RLS ---';
END $$;

-- liming_products - veřejné čtení
ALTER TABLE liming_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Veřejné čtení aktivních produktů"
  ON liming_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin může upravovat produkty"
  ON liming_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- liming_plans - pouze vlastní plány
ALTER TABLE liming_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liming plans"
  ON liming_plans FOR SELECT
  USING (parcel_id IN (SELECT id FROM parcels WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own liming plans"
  ON liming_plans FOR INSERT
  WITH CHECK (parcel_id IN (SELECT id FROM parcels WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own liming plans"
  ON liming_plans FOR UPDATE
  USING (parcel_id IN (SELECT id FROM parcels WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own liming plans"
  ON liming_plans FOR DELETE
  USING (parcel_id IN (SELECT id FROM parcels WHERE user_id = auth.uid()));

-- liming_applications - pouze vlastní aplikace
ALTER TABLE liming_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liming applications"
  ON liming_applications FOR SELECT
  USING (
    liming_plan_id IN (
      SELECT lp.id FROM liming_plans lp
      JOIN parcels p ON p.id = lp.parcel_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own liming applications"
  ON liming_applications FOR INSERT
  WITH CHECK (
    liming_plan_id IN (
      SELECT lp.id FROM liming_plans lp
      JOIN parcels p ON p.id = lp.parcel_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own liming applications"
  ON liming_applications FOR UPDATE
  USING (
    liming_plan_id IN (
      SELECT lp.id FROM liming_plans lp
      JOIN parcels p ON p.id = lp.parcel_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own liming applications"
  ON liming_applications FOR DELETE
  USING (
    liming_plan_id IN (
      SELECT lp.id FROM liming_plans lp
      JOIN parcels p ON p.id = lp.parcel_id
      WHERE p.user_id = auth.uid()
    )
  );

DO $$ BEGIN
  RAISE NOTICE '✅ RLS policies nastaveny';
END $$;

-- ============================================================================
-- KROK 7: OVĚŘENÍ
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'OVĚŘENÍ ÚSPĚŠNOSTI';
  RAISE NOTICE '=========================================';
END $$;

-- Počet produktů
SELECT COUNT(*) AS product_count FROM liming_products;

-- Zobrazit produkty
SELECT name, type, cao_content, mgo_content, is_active 
FROM liming_products 
ORDER BY display_order;

-- Ověřit foreign key
SELECT 
  conname AS constraint_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'liming_applications'::regclass
  AND contype = 'f'
  AND conname LIKE '%lime_product%';

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE '✅ RESET DOKONČEN!';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Nyní můžete vygenerovat plán vápnění.';
  RAISE NOTICE '=========================================';
END $$;

