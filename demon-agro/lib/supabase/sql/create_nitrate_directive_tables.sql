-- ============================================================================
-- NITRÁTOVÁ SMĚRNICE – LEGISLATIVNÍ ČÍSELNÍKY AKČNÍHO PROGRAMU
-- ============================================================================
-- Ve zranitelných oblastech dusíkem platí akční program: období zákazu hnojení,
-- maximální dávky dusíku po sklizni a limity přívodu dusíku k plodině. Hodnoty
-- jsou v přílohách č. 2 a 3 nařízení vlády č. 262/2012 Sb., ve znění nařízení
-- vlády č. 193/2024 Sb. (6. akční program, účinné od 1. 7. 2024).
--
-- Data se plní importem, aby se hodnoty přepisovaly strojově ze zdrojového
-- přepisu vyhlášeného znění a nevznikla chyba v opisu čísla nebo datumu:
--   npx tsx scripts/import-nitrate-directive.ts
--   zdroj: data/legislativa/NV_262-2012_prilohy_2_a_3.xlsx
--
-- Kontroly z těchto tabulek počítají zjištění, nikdy nezakazují zápis –
-- evidence musí odpovídat skutečnosti. Právně závazné je znění vyhlášené
-- ve Sbírce zákonů.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- OBDOBÍ ZÁKAZU HNOJENÍ (příloha 2, tabulka 1)
-- ----------------------------------------------------------------------------
-- Zákaz je vymezený dnem a měsícem a přechází přes konec roku (1. 11. – 15. 2.),
-- proto se ukládá po složkách, ne jako datum.
CREATE TABLE IF NOT EXISTS public.nitrate_ban_periods (
  id SMALLINT PRIMARY KEY,
  -- Klimatický region je 1. číslice BPEJ; předpis je slučuje do skupin 0–5, 6–7, 8–9
  climatic_region_from SMALLINT NOT NULL CHECK (climatic_region_from BETWEEN 0 AND 9),
  climatic_region_to SMALLINT NOT NULL CHECK (climatic_region_to BETWEEN 0 AND 9),
  fertilizer_group TEXT NOT NULL CHECK (fertilizer_group IN ('mineralni', 'rychle', 'pomalu')),
  -- zakladni = bez dalších podmínek
  -- sklon_do_5_s_porostem = kratší zákaz na pozemcích do 5° s porostem plodin
  -- letni_bez_nasledne_plodiny = letní zákaz z poznámky pod tabulkou
  variant TEXT NOT NULL
    CHECK (variant IN ('zakladni', 'sklon_do_5_s_porostem', 'letni_bez_nasledne_plodiny')),
  ban_from_month SMALLINT NOT NULL CHECK (ban_from_month BETWEEN 1 AND 12),
  ban_from_day SMALLINT NOT NULL CHECK (ban_from_day BETWEEN 1 AND 31),
  ban_to_month SMALLINT NOT NULL CHECK (ban_to_month BETWEEN 1 AND 12),
  ban_to_day SMALLINT NOT NULL CHECK (ban_to_day BETWEEN 1 AND 31),
  -- Zákaz platí jen za další podmínky (chybějící následná plodina) – kontrola
  -- z něj dělá upozornění, ne porušení
  is_conditional BOOLEAN NOT NULL DEFAULT false,
  note TEXT
);

-- ----------------------------------------------------------------------------
-- MAXIMÁLNÍ DÁVKA N PO SKLIZNI (příloha 2, tabulka 6)
-- ----------------------------------------------------------------------------
-- Předpis rozlišuje čtyři způsoby hnojení po sklizni jednoleté hlavní plodiny;
-- text způsobu a jeho podmínky drží samostatná tabulka, limity se pak liší
-- podle aplikačního pásma a skupiny hnojiva.
CREATE TABLE IF NOT EXISTS public.nitrate_post_harvest_methods (
  method_number SMALLINT PRIMARY KEY,
  label TEXT NOT NULL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS public.nitrate_post_harvest_limits (
  id SMALLINT PRIMARY KEY,
  method_number SMALLINT NOT NULL
    REFERENCES public.nitrate_post_harvest_methods(method_number) ON DELETE CASCADE,
  application_zone TEXT NOT NULL CHECK (application_zone IN ('I.', 'II.', 'III.')),
  -- Rozlišuje se jen ve III. pásmu; LPIS ho vede jako „III a." (střední riziko
  -- infiltrace) a „III b." (vysoké riziko infiltrace)
  infiltration_risk TEXT CHECK (infiltration_risk IN ('stredni', 'vysoke')),
  -- Skupina A předpisu = minerální dusíkatá hnojiva,
  -- skupina B = celkový dusík ve hnojivech s rychle uvolnitelným dusíkem
  fertilizer_group TEXT NOT NULL CHECK (fertilizer_group IN ('mineralni', 'rychle')),
  limit_kg_n_ha NUMERIC(6, 1) NOT NULL,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_nitrate_post_harvest_zone
  ON public.nitrate_post_harvest_limits(application_zone, method_number);

-- ----------------------------------------------------------------------------
-- LIMITY PŘÍVODU DUSÍKU K PLODINĚ (příloha 3, tabulky 4–6)
-- ----------------------------------------------------------------------------
-- Tabulka 4 rozlišuje tři výnosové hladiny podle BPEJ pozemku, tabulky 5 (pícniny,
-- luskoviny, jahody) a 6 (zelenina) mají limit jediný.
--
-- Limit v hladině 1 se vztahuje k uvedenému výnosu, v hladině 2 k výnosu na
-- horním okraji rozmezí a v hladině 3 k výnosu o 30 % vyššímu, než je uvedeno –
-- proto se u hladin drží i výnosy, ne jen limit.
CREATE TABLE IF NOT EXISTS public.nitrate_crop_limits (
  crop_key TEXT PRIMARY KEY,
  crop_label TEXT NOT NULL,
  source_table TEXT NOT NULL CHECK (source_table IN ('p3_t4', 'p3_t5', 'p3_t6')),
  yield_unit TEXT,
  level1_yield NUMERIC(8, 2),
  level1_limit_kg_n_ha NUMERIC(6, 1),
  level2_yield_from NUMERIC(8, 2),
  level2_yield_to NUMERIC(8, 2),
  level2_limit_kg_n_ha NUMERIC(6, 1),
  level3_yield_over NUMERIC(8, 2),
  level3_limit_kg_n_ha NUMERIC(6, 1),
  -- Limit bez ohledu na výnosovou hladinu (tabulky 5 a 6)
  flat_limit_kg_n_ha NUMERIC(6, 1),
  -- U části pícnin se limit vztahuje ke kalendářnímu roku, ne k plodině
  per_calendar_year BOOLEAN NOT NULL DEFAULT false,
  note TEXT
);

-- ----------------------------------------------------------------------------
-- NAVÁZÁNÍ NA EVIDENCI
-- ----------------------------------------------------------------------------
-- Zařazení pozemku podle BPEJ: klimatický region je 1. číslice BPEJ, výnosová
-- hladina z něj vychází podle tabulek 1–3 přílohy 3. Sestava Informativní údaje
-- o DPB ani jedno neuvádí, proto se u dílu půdního bloku doplňují.
ALTER TABLE public.land_blocks
  ADD COLUMN IF NOT EXISTS climatic_region SMALLINT CHECK (climatic_region BETWEEN 0 AND 9),
  ADD COLUMN IF NOT EXISTS yield_level SMALLINT CHECK (yield_level IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS bpej_code TEXT;

COMMENT ON COLUMN public.land_blocks.climatic_region IS 'Klimatický region (1. číslice BPEJ) – rozhoduje o období zákazu hnojení';
COMMENT ON COLUMN public.land_blocks.yield_level IS 'Výnosová hladina 1–3 podle BPEJ (příloha 3 tab. 1–3) – rozhoduje o limitu přívodu N';
COMMENT ON COLUMN public.land_blocks.bpej_code IS 'Převažující BPEJ dílu půdního bloku, ze které se region a hladina odvozují';

-- Zařazení hnojiva do skupiny podle uvolnitelnosti dusíku drží číselník hnojiv;
-- u položky evidence se ukládá proto, aby kontroly a bilance nemusely číselník
-- dohledávat a aby zůstalo zachované zařazení platné v době aplikace.
ALTER TABLE public.application_items
  ADD COLUMN IF NOT EXISTS nitrogen_group TEXT
    CHECK (nitrogen_group IN ('mineralni', 'rychle', 'pomalu', 'bez_dusiku')),
  ADD COLUMN IF NOT EXISTS is_livestock_manure BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.application_items.nitrogen_group IS 'Skupina hnojiva podle uvolnitelnosti N – vstup pro období zákazu hnojení a limity dávek';
COMMENT ON COLUMN public.application_items.is_livestock_manure IS 'Statkové hnojivo nebo hnojivo z exkrementů – vstup pro limit 170 kg N/ha zemědělské půdy';

CREATE INDEX IF NOT EXISTS idx_application_items_nitrogen
  ON public.application_items(user_id, nitrogen_group);

-- Limit přívodu N k plodině nese číselník podle přílohy 3. Sloupec
-- crops.n_limit_kg_ha byl přípravou na tuto fázi; nahrazuje ho vazba, protože
-- limit se liší podle výnosové hladiny pozemku.
ALTER TABLE public.crops
  ADD COLUMN IF NOT EXISTS nitrate_limit_key TEXT
    REFERENCES public.nitrate_crop_limits(crop_key) ON DELETE SET NULL;
ALTER TABLE public.crops DROP COLUMN IF EXISTS n_limit_kg_ha;

COMMENT ON COLUMN public.crops.nitrate_limit_key IS 'Vazba na limit přívodu N v příloze 3 NV 262/2012; kde předpis rozlišuje víc variant téže plodiny, je přiřazená ta s vyšším limitem';

-- ----------------------------------------------------------------------------
-- RLS – číselníky jsou společné: čtení všem přihlášeným, zápis adminovi
-- ----------------------------------------------------------------------------
ALTER TABLE public.nitrate_ban_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nitrate_post_harvest_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nitrate_post_harvest_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nitrate_crop_limits ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'nitrate_ban_periods',
    'nitrate_post_harvest_methods',
    'nitrate_post_harvest_limits',
    'nitrate_crop_limits'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated can read %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Authenticated can read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (true)',
      t
    );
    EXECUTE format('DROP POLICY IF EXISTS "Admin can manage %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admin can manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''admin'')) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''admin''))',
      t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- KOMENTÁŘE
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.nitrate_ban_periods IS 'Období zákazu hnojení – příloha 2 tab. 1 NV 262/2012 (6. akční program)';
COMMENT ON TABLE public.nitrate_post_harvest_methods IS 'Způsoby hnojení po sklizni jednoletých hlavních plodin – příloha 2 tab. 6 NV 262/2012';
COMMENT ON TABLE public.nitrate_post_harvest_limits IS 'Maximální dávky N po sklizni podle aplikačního pásma – příloha 2 tab. 6 NV 262/2012';
COMMENT ON TABLE public.nitrate_crop_limits IS 'Limity přívodu dusíku k plodině – příloha 3 tab. 4–6 NV 262/2012';
