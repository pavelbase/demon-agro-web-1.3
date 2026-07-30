-- ============================================================================
-- ČÍSELNÍK HNOJIV – OBSAHY ŽIVIN
-- ============================================================================
-- Registr hnojiv ÚKZÚZ (tabulka fert_products) obsah živin neuvádí, evidence
-- hnojení ho ale potřebuje: bez obsahu N nelze spočítat přívod dusíku ani
-- hlídat limity ve zranitelných oblastech.
--
-- Zdrojem je číselník hnojiv (export z portálu eAGRI), který drží obsahy
-- živin v procentech hmotnosti a měrnou hmotnost pro přepočet objemových
-- dávek. Kromě registrovaných hnojiv obsahuje i normativy statkových hnojiv
-- a rostlinných zbytků (kejda, hnůj, sláma, zelené hnojení) – ty registrační
-- číslo nemají, ale do evidence se zapisují stejně jako kupovaná hnojiva.
--
-- Párování na evidenci:
--   1. podle evidenčního čísla (application_items.fert_evidence_number)
--   2. podle normalizovaného názvu (name_key) – u normativů a u záznamů,
--      které vznikly importem bez vazby na registr
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fert_nutrients (
  -- Identifikátor hnojiva z číselníku
  catalog_id BIGINT PRIMARY KEY,
  -- Evidenční číslo hnojiva; u normativů statkových hnojiv chybí
  evidence_number TEXT,
  registration_number TEXT,
  name TEXT NOT NULL,
  -- Název bez diakritiky a v malých písmenech pro párování s evidencí
  name_key TEXT NOT NULL,
  catalog_type TEXT,
  nitrogen_category TEXT,
  product_kind TEXT,
  -- Typ obvyklé MJ: H = hmotnostní (kg, t), O = objemová (l, m³)
  unit_type TEXT CHECK (unit_type IN ('H', 'O')),
  -- Normativ statkového hnojiva nebo rostlinného zbytku (bez evidenčního čísla)
  is_normative BOOLEAN NOT NULL DEFAULT false,
  is_excrement BOOLEAN NOT NULL DEFAULT false,
  is_organic BOOLEAN NOT NULL DEFAULT false,
  valid_from DATE,
  valid_until DATE,

  -- Obsahy živin v % hmotnosti
  n_percent NUMERIC(8, 3),
  p2o5_percent NUMERIC(8, 3),
  k2o_percent NUMERIC(8, 3),
  cao_percent NUMERIC(8, 3),
  mgo_percent NUMERIC(8, 3),
  na2o_percent NUMERIC(8, 3),
  s_percent NUMERIC(8, 3),
  cl_percent NUMERIC(8, 3),
  zn_percent NUMERIC(8, 3),
  cu_percent NUMERIC(8, 3),
  fe_percent NUMERIC(8, 3),
  b_percent NUMERIC(8, 3),
  mn_percent NUMERIC(8, 3),
  mo_percent NUMERIC(8, 3),
  se_percent NUMERIC(8, 3),
  -- Spalitelné látky (organická hmota) v % sušiny
  combustible_matter_percent NUMERIC(8, 3),
  trace_elements TEXT,
  -- Měrná hmotnost v kg/l – přepočet dávky v litrech na kilogramy
  density_kg_l NUMERIC(8, 3),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fert_nutrients_evidence
  ON public.fert_nutrients(evidence_number)
  WHERE evidence_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fert_nutrients_name_key ON public.fert_nutrients(name_key);
CREATE INDEX IF NOT EXISTS idx_fert_nutrients_normative
  ON public.fert_nutrients(is_normative)
  WHERE is_normative = true;

DROP TRIGGER IF EXISTS trg_fert_nutrients_updated_at ON public.fert_nutrients;
CREATE TRIGGER trg_fert_nutrients_updated_at BEFORE UPDATE ON public.fert_nutrients
  FOR EACH ROW EXECUTE FUNCTION public.set_evidence_updated_at();

-- ----------------------------------------------------------------------------
-- RLS – číselník je společný: čtení všem přihlášeným, zápis adminovi
-- ----------------------------------------------------------------------------
ALTER TABLE public.fert_nutrients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read fert_nutrients" ON public.fert_nutrients;
CREATE POLICY "Authenticated can read fert_nutrients" ON public.fert_nutrients
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin can manage fert_nutrients" ON public.fert_nutrients;
CREATE POLICY "Admin can manage fert_nutrients" ON public.fert_nutrients
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ----------------------------------------------------------------------------
-- KOMENTÁŘE
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.fert_nutrients IS 'Číselník hnojiv (eAGRI) s obsahy živin – doplňuje registr ÚKZÚZ, který obsah živin neuvádí';
COMMENT ON COLUMN public.fert_nutrients.is_normative IS 'Normativ statkového hnojiva nebo rostlinného zbytku – bez evidenčního čísla, páruje se podle názvu';
COMMENT ON COLUMN public.fert_nutrients.unit_type IS 'H = obvyklá MJ hmotnostní (kg, t), O = objemová (l, m³) – u objemových se dávka přepočítává měrnou hmotností';
COMMENT ON COLUMN public.fert_nutrients.density_kg_l IS 'Měrná hmotnost kg/l pro přepočet dávky v litrech na kilogramy';
COMMENT ON COLUMN public.fert_nutrients.name_key IS 'Název bez diakritiky, malými písmeny – párování hnojiv v evidenci bez vazby na registr';
