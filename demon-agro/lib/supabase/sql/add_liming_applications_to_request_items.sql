-- ============================================================================
-- MIGRACE: Přidání vazby mezi poptávkou a aplikacemi plánu vápnění
-- ============================================================================
-- Datum: 3. ledna 2026
-- Účel: Umožnit trackování, které roky/aplikace z plánu již byly poptány
-- ============================================================================

-- 1. Přidat sloupce do liming_request_items
ALTER TABLE public.liming_request_items
ADD COLUMN IF NOT EXISTS liming_plan_id UUID REFERENCES public.liming_plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS liming_application_id UUID REFERENCES public.liming_applications(id) ON DELETE SET NULL;

-- 2. Přidat indexy pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_liming_request_items_plan_id 
  ON public.liming_request_items(liming_plan_id) 
  WHERE liming_plan_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_liming_request_items_application_id 
  ON public.liming_request_items(liming_application_id) 
  WHERE liming_application_id IS NOT NULL;

-- 3. Přidat sloupec s detaily aplikace (pro historii, i když se aplikace smaže)
ALTER TABLE public.liming_request_items
ADD COLUMN IF NOT EXISTS application_year INTEGER,
ADD COLUMN IF NOT EXISTS application_season VARCHAR(20) CHECK (application_season IN ('jaro', 'leto', 'podzim'));

-- 4. Přidat komentáře k novým sloupcům
COMMENT ON COLUMN public.liming_request_items.liming_plan_id IS 
'Reference na plán vápnění, ze kterého pochází tato položka poptávky';

COMMENT ON COLUMN public.liming_request_items.liming_application_id IS 
'Reference na konkrétní aplikaci v plánu vápnění (rok + sezóna)';

COMMENT ON COLUMN public.liming_request_items.application_year IS 
'Rok aplikace z plánu (uloženo pro historii)';

COMMENT ON COLUMN public.liming_request_items.application_season IS 
'Sezóna aplikace z plánu: jaro, leto, podzim (uloženo pro historii)';

-- ============================================================================
-- VERIFIKACE
-- ============================================================================

-- Zobrazit strukturu tabulky
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items'
ORDER BY ordinal_position;

-- Zobrazit indexy
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'liming_request_items'
ORDER BY indexname;

-- ============================================================================
-- POZNÁMKY
-- ============================================================================

/*
POUŽITÍ:

1. Při vytváření poptávky z košíku:
   - Pokud položka pochází z plánu vápnění, uloží se:
     - liming_plan_id (ID plánu)
     - liming_application_id (ID konkrétní aplikace)
     - application_year (rok pro snadné filtrování)
     - application_season (sezóna pro snadné filtrování)

2. Kontrola již poptaných aplikací:
   - SELECT liming_application_id FROM liming_request_items
     WHERE parcel_id = ? AND liming_application_id IS NOT NULL

3. Historie:
   - I když se plán nebo aplikace smaže, zachová se application_year a application_season
   - To umožňuje zobrazit historii "co bylo poptáno kdy"

4. RLS:
   - Používá stávající policies přes request_id → user_id
   - Žádné další úpravy nejsou potřeba
*/




