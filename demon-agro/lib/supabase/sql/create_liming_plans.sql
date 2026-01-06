-- =====================================================
-- SYSTÉM PLÁNOVÁNÍ VÁPNĚNÍ - DATABÁZOVÉ SCHÉMA
-- =====================================================
-- Vytvořeno: 2026-01-03
-- Účel: Víceleté plány vápnění s automatickým návrhem
-- Metodika: ČZU Praha (oficiální tabulky potřeby vápnění)
-- =====================================================

-- =====================================================
-- 1. TABULKA: liming_plans
-- =====================================================
-- Hlavní plán vápnění pro pozemek
CREATE TABLE IF NOT EXISTS liming_plans (
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
  current_mg NUMERIC(6,1), -- mg/kg
  
  -- Vypočtené hodnoty
  total_ca_need NUMERIC(6,2), -- t Ca celkem pro pozemek
  total_cao_need NUMERIC(6,2), -- t CaO celkem pro pozemek
  total_ca_need_per_ha NUMERIC(5,2), -- t Ca/ha
  total_cao_need_per_ha NUMERIC(5,2), -- t CaO/ha
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed')),
  notes TEXT,
  
  CONSTRAINT valid_ph CHECK (current_ph >= 4.0 AND current_ph <= 8.0 AND target_ph >= 4.0 AND target_ph <= 8.0),
  CONSTRAINT valid_ph_direction CHECK (target_ph >= current_ph)
);

-- Indexy pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_liming_plans_parcel ON liming_plans(parcel_id);
CREATE INDEX IF NOT EXISTS idx_liming_plans_status ON liming_plans(status);
CREATE INDEX IF NOT EXISTS idx_liming_plans_created ON liming_plans(created_at DESC);

-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_liming_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_liming_plans_updated_at
  BEFORE UPDATE ON liming_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_liming_plans_updated_at();

-- =====================================================
-- 2. TABULKA: liming_applications
-- =====================================================
-- Jednotlivé aplikace vápna v rámci plánu
CREATE TABLE IF NOT EXISTS liming_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liming_plan_id UUID NOT NULL REFERENCES liming_plans(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('jaro', 'leto', 'podzim')),
  sequence_order INTEGER NOT NULL, -- 1, 2, 3... pořadí aplikace
  
  -- Produkt (denormalizováno pro historii)
  lime_product_id UUID REFERENCES liming_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  cao_content NUMERIC(4,1) NOT NULL, -- % CaO
  mgo_content NUMERIC(4,1) DEFAULT 0, -- % MgO
  
  -- Dávky
  dose_per_ha NUMERIC(6,2) NOT NULL, -- t produktu/ha
  total_dose NUMERIC(8,2) NOT NULL, -- t produktu celkem
  cao_per_ha NUMERIC(5,2) NOT NULL, -- t CaO/ha
  mgo_per_ha NUMERIC(5,2), -- t MgO/ha
  
  -- Predikce změn
  ph_before NUMERIC(3,1) NOT NULL,
  ph_after NUMERIC(3,1) NOT NULL,
  mg_after NUMERIC(6,1), -- mg/kg (predikované Mg po aplikaci)
  
  -- Stav aplikace
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ordered', 'applied', 'cancelled')),
  applied_date DATE,
  actual_dose NUMERIC(8,2), -- skutečně aplikovaná dávka
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_year CHECK (year >= 2024 AND year <= 2050),
  CONSTRAINT valid_doses CHECK (dose_per_ha > 0 AND total_dose > 0 AND cao_per_ha > 0),
  CONSTRAINT valid_ph_change CHECK (ph_before < ph_after OR ph_before = ph_after),
  UNIQUE (liming_plan_id, sequence_order)
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_liming_applications_plan ON liming_applications(liming_plan_id);
CREATE INDEX IF NOT EXISTS idx_liming_applications_year ON liming_applications(year);
CREATE INDEX IF NOT EXISTS idx_liming_applications_status ON liming_applications(status);
CREATE INDEX IF NOT EXISTS idx_liming_applications_product ON liming_applications(lime_product_id);

-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_liming_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_liming_applications_updated_at
  BEFORE UPDATE ON liming_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_liming_applications_updated_at();

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Zapnutí RLS
ALTER TABLE liming_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE liming_applications ENABLE ROW LEVEL SECURITY;

-- Politiky pro liming_plans
CREATE POLICY "Users can view their own liming plans"
  ON liming_plans FOR SELECT
  USING (
    parcel_id IN (
      SELECT id FROM parcels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own liming plans"
  ON liming_plans FOR INSERT
  WITH CHECK (
    parcel_id IN (
      SELECT id FROM parcels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own liming plans"
  ON liming_plans FOR UPDATE
  USING (
    parcel_id IN (
      SELECT id FROM parcels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own liming plans"
  ON liming_plans FOR DELETE
  USING (
    parcel_id IN (
      SELECT id FROM parcels WHERE user_id = auth.uid()
    )
  );

-- Politiky pro liming_applications
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

-- =====================================================
-- 4. ADMIN POLITIKY (pokud existuje admin role)
-- =====================================================

-- Admin může vše zobrazit
CREATE POLICY "Admins can view all liming plans"
  ON liming_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all liming applications"
  ON liming_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 5. HELPER VIEWS (volitelné)
-- =====================================================

-- View: Přehled plánů s informacemi o pozemku
CREATE OR REPLACE VIEW liming_plans_overview AS
SELECT 
  lp.*,
  p.name AS parcel_name,
  p.area AS parcel_area,
  p.user_id,
  COUNT(la.id) AS total_applications,
  SUM(CASE WHEN la.status = 'applied' THEN 1 ELSE 0 END) AS applied_applications,
  MIN(la.year) AS first_application_year,
  MAX(la.year) AS last_application_year
FROM liming_plans lp
JOIN parcels p ON p.id = lp.parcel_id
LEFT JOIN liming_applications la ON la.liming_plan_id = lp.id
GROUP BY lp.id, p.name, p.area, p.user_id;

-- =====================================================
-- KONEC MIGRACE
-- =====================================================

-- Výpis vytvořených objektů
DO $$ 
BEGIN
  RAISE NOTICE '✅ Tabulky vytvořeny:';
  RAISE NOTICE '   - liming_plans';
  RAISE NOTICE '   - liming_applications';
  RAISE NOTICE '✅ Indexy vytvořeny: 8 indexů';
  RAISE NOTICE '✅ RLS politiky aktivovány: 10 politik';
  RAISE NOTICE '✅ View: liming_plans_overview';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Další kroky:';
  RAISE NOTICE '   1. Ověř, že tabulka liming_products existuje';
  RAISE NOTICE '   2. Naplň liming_products základními produkty';
  RAISE NOTICE '   3. Implementuj API routes';
  RAISE NOTICE '   4. Vytvoř UI komponenty';
END $$;

