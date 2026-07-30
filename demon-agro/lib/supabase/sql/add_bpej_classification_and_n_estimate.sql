-- ============================================================================
-- ZAŘAZENÍ POZEMKU PODLE BPEJ A ODHADOVANÝ PŘÍVOD DUSÍKU
-- ============================================================================
-- Doplněk k create_nitrate_directive_tables.sql.
--
-- 1) Sestava z LPIS uvádí aplikační pásmo, ale ne klimatický region ani
--    výnosovou hladinu. Na obojím přitom stojí období zákazu hnojení a limit
--    přívodu dusíku k plodině. Obojí lze odvodit z kódu BPEJ podle výčtů
--    v příloze 2 (tab. 2–5) a příloze 3 (tab. 1–3) NV 262/2012.
--
-- 2) Číselník hnojiv nemá u části kapalných hnojiv změřenou měrnou hmotnost
--    a uvádí zástupnou hodnotu 1 kg/l. Dávka v litrech pak vychází nižší, než
--    jaká na pozemek šla, a limity by se počítaly z podhodnoceného dusíku.
--    Takový přívod se proto označí jako odhad.
--
-- Data pravidel se plní importem:
--   npx tsx scripts/import-nitrate-directive.ts
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PRAVIDLA ZAŘAZENÍ BPEJ
-- ----------------------------------------------------------------------------
-- Zbytkové kategorie („všechny ostatní BPEJ") předpis nevyjmenovává – výnosová
-- hladina 2 a II. aplikační pásmo proto v tabulce nejsou a v kontrole jsou
-- fallback větví, ne řádkem.
CREATE TABLE IF NOT EXISTS public.nitrate_bpej_rules (
  id INTEGER PRIMARY KEY,
  rule_kind TEXT NOT NULL
    CHECK (rule_kind IN ('vynosova_hladina', 'aplikacni_pasmo', 'riziko_infiltrace')),
  -- '1'/'3' u hladiny, 'I.'/'III.' u pásma, 'ano' u rizika infiltrace
  result TEXT NOT NULL,
  row_number SMALLINT,
  -- 1. číslice BPEJ
  climatic_regions SMALLINT[] NOT NULL,
  -- 2. a 3. číslice BPEJ (hlavní půdní jednotka)
  hpj_codes SMALLINT[] NOT NULL,
  -- 4. a 5. číslice BPEJ (sklonitost s expozicí, skeletovitost s hloubkou)
  detail_codes TEXT[],
  -- Podmínka se váže na sklonitost pozemku z LPIS, ne na kód BPEJ
  slope_condition TEXT CHECK (slope_condition IN ('do_7', 'nad_7')),
  note TEXT
);

COMMENT ON TABLE public.nitrate_bpej_rules IS
  'Zařazení BPEJ do výnosové hladiny, aplikačního pásma a rizika infiltrace podle NV 262/2012';

ALTER TABLE public.nitrate_bpej_rules ENABLE ROW LEVEL SECURITY;

-- Legislativní číselník je stejný pro všechny, čtení stačí přihlášeným
DROP POLICY IF EXISTS "nitrate_bpej_rules_select" ON public.nitrate_bpej_rules;
CREATE POLICY "nitrate_bpej_rules_select" ON public.nitrate_bpej_rules
  FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- ODHADOVANÝ PŘÍVOD ŽIVIN U POLOŽKY EVIDENCE
-- ----------------------------------------------------------------------------
ALTER TABLE public.application_items
  ADD COLUMN IF NOT EXISTS n_estimated BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.application_items.n_estimated IS
  'Přívod živin je odhad – u objemové dávky nebyla známa skutečná měrná hmotnost hnojiva';
