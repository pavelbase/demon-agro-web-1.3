-- ============================================================================
-- REGISTR HNOJIV – ÚKZÚZ
-- ============================================================================
-- Zdroj dat: oficiální export registru hnojiv z ÚKZÚZ (xlsx, 1 list).
-- Jeden řádek exportu = jeden registrační záznam (evidenční číslo), takže
-- jedno hnojivo může mít v registru více záznamů za sebou (obnovy registrace
-- pod stejným registračním číslem).
--
-- Data jsou referenční (veřejný registr) → čtení pro všechny přihlášené,
-- zápis pouze pro adminy (import běží pod service_role, který RLS obchází).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ----------------------------------------------------------------------------
-- 1. HNOJIVA (list "Sheet1")
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fert_products (
  -- "Evidenční číslo" – unikátní identifikátor záznamu v registru (R/O/V/E/C + číslo)
  evidence_number TEXT PRIMARY KEY,

  -- "Registrační číslo" – společné pro obnovy registrace téhož hnojiva,
  -- u ohlášených a uznávaných výrobků není vyplněno
  registration_number TEXT,

  name TEXT NOT NULL,

  -- "Režim": Registrace / Ohlášení / Vzájemné uznávání / ES hnojiva / CE hnojiva
  regime TEXT,
  -- "Typ": číslo typu podle vyhlášky, nebo "Netypový výrobek"
  product_type TEXT,
  -- "Druh": minerální/organické/organominerální hnojivo, substrát, biostimulant…
  product_kind TEXT,
  -- "Kategorie N": Minerálně dusíkaté / Rychle uvolnitelný N / Pomalu uvolnitelný N / Nedusíkaté / Pomocné látky
  nitrogen_category TEXT,

  -- "Ekol.zem." – použitelné v ekologickém zemědělství
  organic_farming BOOLEAN,

  applicant TEXT,
  manufacturer TEXT,

  valid_from DATE,
  valid_until DATE,

  -- Odvozené příznaky pro filtrování v aplikaci (počítané při importu)
  is_valid BOOLEAN DEFAULT false,
  is_latest BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fert_products_name_trgm
  ON public.fert_products USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_fert_products_registration_number
  ON public.fert_products(registration_number);
CREATE INDEX IF NOT EXISTS idx_fert_products_regime
  ON public.fert_products(regime);
CREATE INDEX IF NOT EXISTS idx_fert_products_kind
  ON public.fert_products(product_kind);
CREATE INDEX IF NOT EXISTS idx_fert_products_nitrogen_category
  ON public.fert_products(nitrogen_category);
CREATE INDEX IF NOT EXISTS idx_fert_products_valid
  ON public.fert_products(is_valid);
CREATE INDEX IF NOT EXISTS idx_fert_products_latest
  ON public.fert_products(is_latest);
CREATE INDEX IF NOT EXISTS idx_fert_products_organic
  ON public.fert_products(organic_farming);
CREATE INDEX IF NOT EXISTS idx_fert_products_manufacturer_trgm
  ON public.fert_products USING gin (lower(manufacturer) gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 2. LOG IMPORTŮ – umožňuje poznat, ze které verze registru data pochází
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fert_imports (
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
  FOREACH t IN ARRAY ARRAY['fert_products', 'fert_imports']
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
COMMENT ON TABLE public.fert_products IS 'Hnojiva, substráty a pomocné látky z registru hnojiv ÚKZÚZ (jeden řádek = jeden registrační záznam)';
COMMENT ON TABLE public.fert_imports IS 'Log importů registru hnojiv – verze zdrojového souboru a počty řádků';

COMMENT ON COLUMN public.fert_products.evidence_number IS '"Evidenční číslo" z registru – prefix určuje režim (R registrace, O ohlášení, V vzájemné uznávání, E ES hnojiva, C CE hnojiva)';
COMMENT ON COLUMN public.fert_products.registration_number IS '"Registrační číslo" – shodné pro obnovy registrace téhož hnojiva';
COMMENT ON COLUMN public.fert_products.is_valid IS 'Platnost výrobku ke dni importu (valid_until je v budoucnosti nebo není uvedeno)';
COMMENT ON COLUMN public.fert_products.is_latest IS 'Nejnovější záznam v rámci registračního čísla – slouží k potlačení historických obnov registrace';
