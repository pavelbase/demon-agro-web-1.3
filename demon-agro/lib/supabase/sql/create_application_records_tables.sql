-- ============================================================================
-- EVIDENCE POUŽITÍ HNOJIV A PŘÍPRAVKŮ NA OCHRANU ROSTLIN
-- ============================================================================
-- Struktura odpovídá evidenční knize podle vyhlášky (formulář EPH):
--
--   land_blocks (DPB z LPIS)
--     └── crop_parcels ....... evidenční parcela / objekt (leží v jednom DPB)
--           └── parcel_crops . osev v sezóně (plodina, termín setí a sklizně)
--                 └── applications ..... jedna aplikace k datu
--                       └── application_items ... hnojiva / POR / pomocné látky
--
-- Kontroly (registrace přípravku, registrovaná plodina, dávka, ochranná lhůta,
-- termíny) se počítají v aplikaci a jejich výsledek se ukládá do
-- applications.check_findings, aby přehled nemusel přepočítávat celý registr.
--
-- product_cards drží obsah živin u hnojiv – registr ÚKZÚZ ho neobsahuje, ale
-- evidence hnojení vyžaduje přívod N, P2O5 a K2O na hektar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ČÍSELNÍK PLODIN
-- ----------------------------------------------------------------------------
-- Názvy plodin v evidenci (EPH) se neshodují s názvy v registru POR
-- ("Pšenice setá ozimá" vs. "pšenice ozimá"), a registr navíc uvádí skupiny
-- plodin v jednom textu ("pšenice ozimá, ječmen ozimý, žito ozimé").
-- registry_aliases proto drží tokeny, kterými se plodina v registru pozná;
-- season zabrání záměně ozimé a jarní formy.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crops (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  season TEXT CHECK (season IN ('ozima', 'jarni')),
  registry_aliases TEXT[] NOT NULL DEFAULT '{}',
  -- Limit přívodu dusíku (kg N/ha) pro pozdější kontrolu ve zranitelných
  -- oblastech; plní se v další fázi
  n_limit_kg_ha NUMERIC(6, 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crops_name ON public.crops(name);

-- ----------------------------------------------------------------------------
-- SKLADOVÉ KARTY PRODUKTŮ
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('hnojivo', 'por', 'pomocna')),
  name TEXT NOT NULL,
  -- Vazba na registr: POR podle item_id, hnojivo podle evidenčního čísla
  por_item_id BIGINT REFERENCES public.por_products(item_id) ON DELETE SET NULL,
  fert_evidence_number TEXT REFERENCES public.fert_products(evidence_number) ON DELETE SET NULL,
  default_unit TEXT,
  -- Obsah živin u hnojiv (% v hmotnosti, resp. g/l u kapalných – viz note)
  n_percent NUMERIC(6, 3),
  p2o5_percent NUMERIC(6, 3),
  k2o_percent NUMERIC(6, 3),
  dry_matter_percent NUMERIC(6, 3),
  density_kg_l NUMERIC(6, 3),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_product_cards_user ON public.product_cards(user_id, kind);

-- ----------------------------------------------------------------------------
-- EVIDENČNÍ PARCELY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crop_parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- DPB, ve kterém parcela leží; nullable, dokud se import nespáruje s LPIS
  land_block_id UUID REFERENCES public.land_blocks(id) ON DELETE SET NULL,
  -- Kód bloku ze zdroje evidence – ponechán i po spárování pro dohledatelnost
  block_code TEXT,
  name TEXT NOT NULL,
  area NUMERIC(10, 4) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_crop_parcels_user ON public.crop_parcels(user_id, status);
CREATE INDEX IF NOT EXISTS idx_crop_parcels_block ON public.crop_parcels(land_block_id);

-- ----------------------------------------------------------------------------
-- OSEVY (plodina v sezóně)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parcel_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_parcel_id UUID NOT NULL REFERENCES public.crop_parcels(id) ON DELETE CASCADE,
  crop_id INTEGER REFERENCES public.crops(id) ON DELETE SET NULL,
  -- Název plodiny tak, jak je vedený v evidenci (i když není v číselníku)
  crop_name TEXT NOT NULL,
  -- Hospodářský rok sklizně
  season INTEGER NOT NULL,
  sowing_date DATE,
  harvest_date DATE,
  variety TEXT,
  area NUMERIC(10, 4),
  yield_t_ha NUMERIC(8, 3),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, crop_parcel_id, season, crop_name)
);

CREATE INDEX IF NOT EXISTS idx_parcel_crops_parcel ON public.parcel_crops(crop_parcel_id, season DESC);
CREATE INDEX IF NOT EXISTS idx_parcel_crops_user ON public.parcel_crops(user_id, season DESC);

-- ----------------------------------------------------------------------------
-- APLIKACE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_parcel_id UUID NOT NULL REFERENCES public.crop_parcels(id) ON DELETE CASCADE,
  parcel_crop_id UUID REFERENCES public.parcel_crops(id) ON DELETE SET NULL,
  application_date DATE NOT NULL,
  applied_area NUMERIC(10, 4) NOT NULL,
  -- Mód podle EPH: skutečnost / plán
  mode TEXT NOT NULL DEFAULT 'skutecnost' CHECK (mode IN ('skutecnost', 'plan')),
  method TEXT,
  is_tankmix BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'import')),
  -- Výsledek kontrol; evidence se ukládá vždy, problémy se jen označí
  check_status TEXT NOT NULL DEFAULT 'unchecked'
    CHECK (check_status IN ('unchecked', 'ok', 'info', 'warning', 'error')),
  check_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_date
  ON public.applications(user_id, application_date DESC);
CREATE INDEX IF NOT EXISTS idx_applications_parcel
  ON public.applications(crop_parcel_id, application_date DESC);
CREATE INDEX IF NOT EXISTS idx_applications_parcel_crop
  ON public.applications(parcel_crop_id);
CREATE INDEX IF NOT EXISTS idx_applications_check_status
  ON public.applications(user_id, check_status);

-- ----------------------------------------------------------------------------
-- POLOŽKY APLIKACE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('hnojivo', 'por', 'pomocna')),
  product_name TEXT NOT NULL,
  product_card_id UUID REFERENCES public.product_cards(id) ON DELETE SET NULL,
  por_item_id BIGINT REFERENCES public.por_products(item_id) ON DELETE SET NULL,
  fert_evidence_number TEXT REFERENCES public.fert_products(evidence_number) ON DELETE SET NULL,
  dose NUMERIC(12, 4) NOT NULL,
  unit TEXT NOT NULL,
  total_amount NUMERIC(14, 4),
  -- Cílový škodlivý organismus nebo jiný účel aplikace (povinné u POR)
  target_pest TEXT,
  -- Přívod živin u hnojiv (kg/ha) – dopočítané ze skladové karty nebo zadané
  n_kg_ha NUMERIC(10, 3),
  p2o5_kg_ha NUMERIC(10, 3),
  k2o_kg_ha NUMERIC(10, 3),
  batch TEXT,
  warehouse TEXT,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_items_application
  ON public.application_items(application_id, position);
CREATE INDEX IF NOT EXISTS idx_application_items_por
  ON public.application_items(por_item_id);
CREATE INDEX IF NOT EXISTS idx_application_items_user
  ON public.application_items(user_id, kind);

-- ----------------------------------------------------------------------------
-- LOG IMPORTŮ EVIDENCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_file TEXT NOT NULL,
  counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_evidence_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_product_cards_updated_at ON public.product_cards;
CREATE TRIGGER trg_product_cards_updated_at BEFORE UPDATE ON public.product_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_evidence_updated_at();

DROP TRIGGER IF EXISTS trg_crop_parcels_updated_at ON public.crop_parcels;
CREATE TRIGGER trg_crop_parcels_updated_at BEFORE UPDATE ON public.crop_parcels
  FOR EACH ROW EXECUTE FUNCTION public.set_evidence_updated_at();

DROP TRIGGER IF EXISTS trg_parcel_crops_updated_at ON public.parcel_crops;
CREATE TRIGGER trg_parcel_crops_updated_at BEFORE UPDATE ON public.parcel_crops
  FOR EACH ROW EXECUTE FUNCTION public.set_evidence_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_evidence_updated_at();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcel_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_imports ENABLE ROW LEVEL SECURITY;

-- Číselník plodin je společný: čtení všem přihlášeným, zápis adminovi
DROP POLICY IF EXISTS "Anyone can read crops" ON public.crops;
CREATE POLICY "Anyone can read crops" ON public.crops
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin can manage crops" ON public.crops;
CREATE POLICY "Admin can manage crops" ON public.crops
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Uživatelská data
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['product_cards', 'crop_parcels', 'parcel_crops', 'applications', 'application_items', 'application_imports']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users manage own %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Users manage own %1$s" ON public.%1$I FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())',
      t
    );
    EXECUTE format('DROP POLICY IF EXISTS "Admin can read %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admin can read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''admin''))',
      t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- KOMENTÁŘE
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.crops IS 'Číselník plodin s aliasy pro párování na názvy plodin v registru POR';
COMMENT ON COLUMN public.crops.registry_aliases IS 'Tokeny, kterými se plodina pozná v poli por_usages.crop (to obsahuje seznamy plodin)';
COMMENT ON COLUMN public.crops.season IS 'ozima/jarni – brání záměně ozimé a jarní formy při párování na registr';
COMMENT ON TABLE public.crop_parcels IS 'Evidenční parcely (parcela/objekt v EPH) ležící v dílu půdního bloku';
COMMENT ON TABLE public.parcel_crops IS 'Osev parcely v sezóně včetně termínu setí a sklizně – vstup pro kontrolu ochranných lhůt';
COMMENT ON TABLE public.applications IS 'Aplikace hnojiv a POR – jeden záznam evidenční knihy k datu a parcele';
COMMENT ON COLUMN public.applications.check_findings IS 'Výsledek kontrol (pole objektů code/severity/title/detail); evidence se ukládá vždy';
COMMENT ON TABLE public.application_items IS 'Položky aplikace – hnojiva, přípravky a pomocné látky včetně dávky a cílového organismu';
COMMENT ON TABLE public.product_cards IS 'Skladové karty produktů uživatele; u hnojiv nesou obsah živin, který registr ÚKZÚZ neuvádí';
