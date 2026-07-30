-- ============================================================================
-- REGISTR PŘÍPRAVKŮ NA OCHRANU ROSTLIN (POR) – ÚKZÚZ
-- ============================================================================
-- Zdroj dat: oficiální export registru POR z ÚKZÚZ (xlsx, 9 listů).
-- Struktura zachovává členění zdroje: přípravek → rozhodnutí → detaily
-- (účinné látky, použití, dávkování, plodiny, škodlivé organismy, údaje).
--
-- Data jsou referenční (veřejný registr) → čtení pro všechny přihlášené,
-- zápis pouze pro adminy (import běží pod service_role, který RLS obchází).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ----------------------------------------------------------------------------
-- 1. PŘÍPRAVKY (list "Rozhodnutí" – agregováno na Id položky)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_products (
  -- "Id položky" z registru ÚKZÚZ (stabilní identifikátor přípravku)
  item_id BIGINT PRIMARY KEY,

  name TEXT NOT NULL,

  -- Souběžný dovoz / obchodní varianta odkazuje na hlavní přípravek
  main_product_item_id BIGINT,
  main_product_name TEXT,

  -- Hodnoty z aktuálně platného (nejnovějšího) rozhodnutí
  registration_number TEXT,
  all_registration_numbers TEXT[],
  authorization_holder TEXT,
  biological_function TEXT,
  all_biological_functions TEXT[],
  registration_status TEXT,
  decision_status TEXT,
  product_regime TEXT,
  package_type TEXT,
  organic_farming BOOLEAN,
  seed_treatment BOOLEAN,
  renewal_in_progress BOOLEAN,

  valid_from DATE,
  valid_until DATE,
  market_until DATE,
  use_until DATE,
  trade_name_until DATE,

  -- Odvozené příznaky pro filtrování v aplikaci
  parallel_import BOOLEAN DEFAULT false,
  is_authorized BOOLEAN DEFAULT false,
  is_discontinued BOOLEAN DEFAULT false,
  decisions_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_products_name_trgm
  ON public.por_products USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_por_products_registration_number
  ON public.por_products(registration_number);
CREATE INDEX IF NOT EXISTS idx_por_products_biological_function
  ON public.por_products(biological_function);
CREATE INDEX IF NOT EXISTS idx_por_products_authorized
  ON public.por_products(is_authorized);
CREATE INDEX IF NOT EXISTS idx_por_products_main_product
  ON public.por_products(main_product_item_id);

-- ----------------------------------------------------------------------------
-- 2. ROZHODNUTÍ (list "Rozhodnutí" – všechny řádky s Id rozhodnutí)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_decisions (
  id BIGSERIAL PRIMARY KEY,
  product_item_id BIGINT NOT NULL REFERENCES public.por_products(item_id) ON DELETE CASCADE,
  decision_id BIGINT NOT NULL,

  registration_number TEXT,
  authorization_holder TEXT,

  valid_from DATE,
  valid_until DATE,
  market_until DATE,
  use_until DATE,
  trade_name_until DATE,

  biological_function TEXT,
  registration_status TEXT,
  decision_status TEXT,
  product_regime TEXT,
  package_type TEXT,
  organic_farming BOOLEAN,
  seed_treatment BOOLEAN,
  renewal_in_progress BOOLEAN,

  main_product_item_id BIGINT,
  main_product_name TEXT,

  -- Souběžný dovoz (SP = souběžný přípravek)
  sp_record_number TEXT,
  reference_product_name TEXT,
  eea_product_name TEXT,
  eea_country TEXT,
  import_permit_holder TEXT,
  import_purpose TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE (product_item_id, decision_id)
);

CREATE INDEX IF NOT EXISTS idx_por_decisions_product ON public.por_decisions(product_item_id);
CREATE INDEX IF NOT EXISTS idx_por_decisions_decision_id ON public.por_decisions(decision_id);
CREATE INDEX IF NOT EXISTS idx_por_decisions_registration_number ON public.por_decisions(registration_number);

-- ----------------------------------------------------------------------------
-- 3. ÚČINNÉ LÁTKY (list "Účinné látky")
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_active_substances (
  id BIGSERIAL PRIMARY KEY,
  product_item_id BIGINT NOT NULL REFERENCES public.por_products(item_id) ON DELETE CASCADE,
  decision_id BIGINT,
  registration_number TEXT,

  substance_record_id BIGINT,
  name_cs TEXT NOT NULL,
  name_en TEXT,
  amount NUMERIC,
  amount_text TEXT,
  unit TEXT,
  substance_groups TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_active_substances_product ON public.por_active_substances(product_item_id);
CREATE INDEX IF NOT EXISTS idx_por_active_substances_name ON public.por_active_substances(name_cs);
CREATE INDEX IF NOT EXISTS idx_por_active_substances_decision ON public.por_active_substances(product_item_id, decision_id);

-- ----------------------------------------------------------------------------
-- 4. POUŽITÍ (list "Použití") – plodina + škodlivý organismus + ochranná lhůta
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_usages (
  id BIGSERIAL PRIMARY KEY,
  product_item_id BIGINT NOT NULL REFERENCES public.por_products(item_id) ON DELETE CASCADE,
  decision_id BIGINT,
  registration_number TEXT,

  crop TEXT,
  pest TEXT,
  dose_text TEXT,

  -- Ochranná lhůta: v registru i nečíselné hodnoty ("AT", "14/21", "100-110")
  protection_period_text TEXT,
  protection_period_days INTEGER,

  aerial_application BOOLEAN,
  application_notes TEXT,
  seed_treatment BOOLEAN,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_usages_product ON public.por_usages(product_item_id);
CREATE INDEX IF NOT EXISTS idx_por_usages_decision ON public.por_usages(product_item_id, decision_id);
CREATE INDEX IF NOT EXISTS idx_por_usages_crop ON public.por_usages(crop);
CREATE INDEX IF NOT EXISTS idx_por_usages_pest ON public.por_usages(pest);

-- ----------------------------------------------------------------------------
-- 5. DÁVKOVÁNÍ (list "Dávkování") – strukturované dávky vč. dávky vody
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_dosages (
  id BIGSERIAL PRIMARY KEY,
  product_item_id BIGINT NOT NULL REFERENCES public.por_products(item_id) ON DELETE CASCADE,
  decision_id BIGINT,
  registration_number TEXT,

  crop TEXT,
  pest TEXT,

  dose_text TEXT,
  dose_min NUMERIC,
  dose_max NUMERIC,
  unit TEXT,

  water_min NUMERIC,
  water_max NUMERIC,
  water_unit TEXT,

  dose_note TEXT,
  dose_full_text TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_dosages_product ON public.por_dosages(product_item_id);
CREATE INDEX IF NOT EXISTS idx_por_dosages_decision ON public.por_dosages(product_item_id, decision_id);
CREATE INDEX IF NOT EXISTS idx_por_dosages_crop ON public.por_dosages(crop);

-- ----------------------------------------------------------------------------
-- 6. HODNOCENÉ ÚDAJE (list "Údaje") – klasifikace CLP, H-věty, rizika…
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_product_attributes (
  id BIGSERIAL PRIMARY KEY,
  product_item_id BIGINT NOT NULL REFERENCES public.por_products(item_id) ON DELETE CASCADE,
  decision_id BIGINT,
  registration_number TEXT,

  attribute TEXT NOT NULL,
  abbreviation TEXT,
  meaning TEXT,
  note TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_product_attributes_product ON public.por_product_attributes(product_item_id);
CREATE INDEX IF NOT EXISTS idx_por_product_attributes_attribute ON public.por_product_attributes(attribute);
CREATE INDEX IF NOT EXISTS idx_por_product_attributes_decision ON public.por_product_attributes(product_item_id, decision_id);

-- ----------------------------------------------------------------------------
-- 7. PLODINY (list "Plodiny") – vazba na číselník plodin
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_crops (
  id BIGSERIAL PRIMARY KEY,
  product_item_id BIGINT NOT NULL REFERENCES public.por_products(item_id) ON DELETE CASCADE,
  decision_id BIGINT,
  registration_number TEXT,

  crop_code TEXT,
  crop_name TEXT,
  crop_type TEXT,
  is_match BOOLEAN,
  web_listing TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_crops_product ON public.por_crops(product_item_id);
CREATE INDEX IF NOT EXISTS idx_por_crops_code ON public.por_crops(crop_code);
CREATE INDEX IF NOT EXISTS idx_por_crops_decision ON public.por_crops(product_item_id, decision_id);

-- ----------------------------------------------------------------------------
-- 8. ŠKODLIVÉ ORGANISMY (list "Škodlivý organismus vs. Přípravek")
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_pests (
  id BIGSERIAL PRIMARY KEY,
  product_item_id BIGINT NOT NULL REFERENCES public.por_products(item_id) ON DELETE CASCADE,
  decision_id BIGINT,
  registration_number TEXT,

  pest_name TEXT,
  ppp_code TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_pests_product ON public.por_pests(product_item_id);
CREATE INDEX IF NOT EXISTS idx_por_pests_code ON public.por_pests(ppp_code);
CREATE INDEX IF NOT EXISTS idx_por_pests_decision ON public.por_pests(product_item_id, decision_id);

-- ----------------------------------------------------------------------------
-- 9. LOG IMPORTŮ – umožňuje poznat, ze které verze registru data pochází
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.por_imports (
  id BIGSERIAL PRIMARY KEY,
  source_file TEXT NOT NULL,
  exported_on DATE,
  row_counts JSONB DEFAULT '{}'::jsonb,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- RLS – referenční data: čtení pro přihlášené, zápis pouze admin
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'por_products',
    'por_decisions',
    'por_active_substances',
    'por_usages',
    'por_dosages',
    'por_product_attributes',
    'por_crops',
    'por_pests',
    'por_imports'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format(
      'DROP POLICY IF EXISTS "Authenticated can read %1$s" ON public.%1$I', t
    );
    EXECUTE format(
      'CREATE POLICY "Authenticated can read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (true)', t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "Admin can manage %1$s" ON public.%1$I', t
    );
    EXECUTE format(
      'CREATE POLICY "Admin can manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''admin'')) '
      'WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''admin''))', t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- KOMENTÁŘE
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.por_products IS 'Přípravky na ochranu rostlin z registru ÚKZÚZ (agregace listu Rozhodnutí na Id položky)';
COMMENT ON TABLE public.por_decisions IS 'Jednotlivá rozhodnutí o povolení přípravku (historie registrace)';
COMMENT ON TABLE public.por_active_substances IS 'Účinné látky přípravků včetně obsahu a chemické skupiny';
COMMENT ON TABLE public.por_usages IS 'Povolená použití: plodina, škodlivý organismus, dávka, ochranná lhůta';
COMMENT ON TABLE public.por_dosages IS 'Strukturované dávkování vč. min/max dávky a dávky vody';
COMMENT ON TABLE public.por_product_attributes IS 'Hodnocené údaje (klasifikace CLP, H-věty, rizika pro včely/vodní organismy, ochranná pásma vod…)';
COMMENT ON TABLE public.por_crops IS 'Vazba přípravku na číselník plodin ÚKZÚZ';
COMMENT ON TABLE public.por_pests IS 'Vazba přípravku na kódovaný seznam škodlivých organismů (PPP)';
COMMENT ON TABLE public.por_imports IS 'Log importů registru POR – verze zdrojového souboru a počty řádků';

COMMENT ON COLUMN public.por_products.item_id IS '"Id položky" z registru ÚKZÚZ – stabilní identifikátor přípravku';
COMMENT ON COLUMN public.por_products.is_authorized IS 'Přípravek má alespoň jedno platné rozhodnutí';
COMMENT ON COLUMN public.por_products.is_discontinued IS 'Přípravek bez rozhodnutí – platnost ukončena';
COMMENT ON COLUMN public.por_usages.protection_period_days IS 'Ochranná lhůta ve dnech, pouze pokud je v registru uvedena čistě číselně';
