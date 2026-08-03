-- ============================================================================
-- ÚDAJE POVINNÉ PRO EXPORT EVIDENCE DO EPH
-- ============================================================================
-- Rozhraní pro import dat evidence hnojení, POR a pastvy (Portál farmáře / EPH)
-- žádá dva údaje, které portál z ničeho jiného nedopočítá:
--
-- 1) SUBJEKT/SZR – jednotný identifikátor hospodařícího subjektu ze Společného
--    zemědělského registru. Bez něj se import nemá k čemu přiřadit.
--
-- 2) PARCELA/IDPLODINY – identifikátor plodiny z číselníku plodin LPIS
--    (služba LPI_GPL01D). Chybějící ID je podle rozhraní tvrdá chyba, název
--    plodiny ho nenahradí – slouží jen ke kontrole a neshoda je měkká chyba.
--
-- ID plodin se plní importem z vyhlášeného číselníku, ne ručním opisem:
--   npx tsx scripts/import-lpis-crop-catalog.ts
-- ============================================================================

-- ----------------------------------------------------------------------------
-- IDENTIFIKÁTOR SUBJEKTU ZE SZR
-- ----------------------------------------------------------------------------
-- Textem, aby se neztratily případné vodicí nuly.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS szr_id TEXT;

COMMENT ON COLUMN public.profiles.szr_id IS
  'Jednotný identifikátor subjektu ze SZR – povinný údaj exportu evidence do EPH';

-- ----------------------------------------------------------------------------
-- ID PLODINY Z ČÍSELNÍKU LPIS
-- ----------------------------------------------------------------------------
-- Prázdná hodnota znamená, že plodina není na číselník napojená a evidenci
-- s ní nelze vyexportovat. Nechává se prázdná i tam, kde je náš název obecnější
-- než číselník (např. „Brambory" proti pěti položkám číselníku) – dosadit
-- kteroukoli z nich by byl výmysl, ne evidence.
ALTER TABLE public.crops
  ADD COLUMN IF NOT EXISTS lpis_crop_id INTEGER;

COMMENT ON COLUMN public.crops.lpis_crop_id IS
  'ID plodiny z číselníku plodin LPIS (LPI_GPL01D) – povinné pro export evidence do EPH';
