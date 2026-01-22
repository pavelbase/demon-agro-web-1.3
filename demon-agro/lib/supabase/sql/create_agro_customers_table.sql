-- ============================================================================
-- AGRO CUSTOMERS TABLE
-- ============================================================================
-- Tabulka pro evidenci zákazníků a výpočet ziskovosti aplikace hnojiv
-- Pro AgroManažer - kalkulačka ziskovosti v administrátorské sekci
-- 
-- Vytvořeno: 2026-01-22
-- Účel: Správa zákazníků s cenami, výměrami a automatický výpočet ziskovosti
-- ============================================================================

-- Drop table if exists (pro čistou migraci)
DROP TABLE IF EXISTS agro_customers CASCADE;

-- Create agro_customers table
CREATE TABLE agro_customers (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to profiles (pouze admini mají přístup)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Základní informace
  jmeno TEXT NOT NULL DEFAULT 'Nový zákazník',
  
  -- Vstupní parametry (hodnoty jako v zadání)
  vymera_ha NUMERIC(10, 2) NOT NULL DEFAULT 120,
  davka_kg_ha NUMERIC(10, 2) NOT NULL DEFAULT 500,
  cena_nakup_material_tuna NUMERIC(10, 2) NOT NULL DEFAULT 610,
  cena_prodej_sluzba_ha NUMERIC(10, 2) NOT NULL DEFAULT 780,
  cena_najem_traktor_mth NUMERIC(10, 2) NOT NULL DEFAULT 1200,
  vykonnost_ha_mth NUMERIC(10, 2) NOT NULL DEFAULT 10,
  cena_nafta_tuna_materialu NUMERIC(10, 2) NOT NULL DEFAULT 70,
  
  -- Náklad na traktoristu (nové pole)
  cena_traktorista_mth NUMERIC(10, 2) NOT NULL DEFAULT 400,
  cena_traktorista_tuna NUMERIC(10, 2) NOT NULL DEFAULT 50,
  traktorista_typ TEXT NOT NULL DEFAULT 'hodina' CHECK (traktorista_typ IN ('hodina', 'tuna')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index pro rychlé vyhledávání podle uživatele (admina)
CREATE INDEX idx_agro_customers_user_id ON agro_customers(user_id);

-- Index pro řazení podle data vytvoření
CREATE INDEX idx_agro_customers_created_at ON agro_customers(created_at DESC);

-- Index pro vyhledávání podle jména
CREATE INDEX idx_agro_customers_jmeno ON agro_customers(jmeno);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE agro_customers ENABLE ROW LEVEL SECURITY;

-- Policy: Pouze admini mohou vidět všechny zákazníky
CREATE POLICY "Admins can view all agro customers"
  ON agro_customers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Pouze admini mohou vytvářet zákazníky
CREATE POLICY "Admins can create agro customers"
  ON agro_customers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Pouze admini mohou aktualizovat zákazníky
CREATE POLICY "Admins can update agro customers"
  ON agro_customers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Pouze admini mohou mazat zákazníky
CREATE POLICY "Admins can delete agro customers"
  ON agro_customers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agro_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_agro_customers_updated_at
  BEFORE UPDATE ON agro_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_agro_customers_updated_at();

-- ============================================================================
-- SAMPLE DATA (Optional - pro testování)
-- ============================================================================

-- Vložit 3 testovací zákazníky (pouze pokud existuje admin uživatel)
-- Tento blok můžete odkomentovat po vytvoření admin účtu

/*
INSERT INTO agro_customers (
  user_id,
  jmeno,
  vymera_ha,
  davka_kg_ha,
  cena_nakup_material_tuna,
  cena_prodej_sluzba_ha,
  cena_najem_traktor_mth,
  vykonnost_ha_mth,
  cena_nafta_tuna_materialu
) VALUES 
  (
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Farma Novák',
    150,
    550,
    620,
    800,
    1200,
    10,
    70
  ),
  (
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Zemědělství Svoboda',
    85,
    450,
    600,
    750,
    1150,
    9,
    65
  ),
  (
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'Agrospol Dvořák',
    200,
    600,
    630,
    820,
    1250,
    11,
    75
  );
*/

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE agro_customers IS 'Evidence zákazníků pro AgroManažer - kalkulačka ziskovosti aplikace hnojiv';
COMMENT ON COLUMN agro_customers.id IS 'Unikátní identifikátor zákazníka';
COMMENT ON COLUMN agro_customers.user_id IS 'ID admina, který vytvořil záznam';
COMMENT ON COLUMN agro_customers.jmeno IS 'Jméno zákazníka/zakázky';
COMMENT ON COLUMN agro_customers.vymera_ha IS 'Výměra v hektarech';
COMMENT ON COLUMN agro_customers.davka_kg_ha IS 'Dávka v kg/ha';
COMMENT ON COLUMN agro_customers.cena_nakup_material_tuna IS 'Cena nákupu materiálu za tunu (Kč)';
COMMENT ON COLUMN agro_customers.cena_prodej_sluzba_ha IS 'Cena prodeje služby za hektar (Kč)';
COMMENT ON COLUMN agro_customers.cena_najem_traktor_mth IS 'Cena nájmu traktoru za motohodinu (Kč)';
COMMENT ON COLUMN agro_customers.vykonnost_ha_mth IS 'Výkonnost - kolik ha se udělá za 1 hodinu';
COMMENT ON COLUMN agro_customers.cena_nafta_tuna_materialu IS 'Cena nafty za tunu materiálu (Kč)';
COMMENT ON COLUMN agro_customers.cena_traktorista_mth IS 'Cena traktoristu za motohodinu (Kč/mth)';
COMMENT ON COLUMN agro_customers.cena_traktorista_tuna IS 'Cena traktoristu za tunu materiálu (Kč/t)';
COMMENT ON COLUMN agro_customers.traktorista_typ IS 'Typ výpočtu nákladu traktoristu: "hodina" nebo "tuna"';

-- ============================================================================
-- VERIFICATION QUERIES (pro testování po migraci)
-- ============================================================================

-- Zobrazit strukturu tabulky
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'agro_customers'
-- ORDER BY ordinal_position;

-- Zobrazit všechny RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'agro_customers';

-- Zobrazit všechny indexy
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'agro_customers';

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Migrace dokončena
SELECT 'Tabulka agro_customers úspěšně vytvořena!' AS status;

