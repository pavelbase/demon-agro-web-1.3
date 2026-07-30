-- ============================================================================
-- ZÁPIS Z POLE A JEHO SCHVÁLENÍ
-- ============================================================================
-- Zápis pořízený přímo v provozu nese jen to, co obsluha na poli spolehlivě ví
-- (parcela, datum, produkt, dávka). Do evidenční knihy se ale smí dostat až
-- záznam, který někdo prošel a schválil – proto se ukládá do stejné tabulky,
-- ale ve stavu 'ceka' a evidence, bilance dusíku i výkazy počítají výhradně
-- se stavem 'schvaleno'.
--
-- Oddělená tabulka by znamenala druhý datový model pro tytéž položky a při
-- schválení kopírování mezi nimi; stav u záznamu udrží jednu pravdu a schválení
-- je změna jednoho pole.
-- ============================================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS record_status TEXT NOT NULL DEFAULT 'schvaleno',
  -- Kdy zápis odešla obsluha z pole
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
  -- Kdy byl zápis propsán do evidence
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_record_status_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_record_status_check
  CHECK (record_status IN ('ceka', 'schvaleno'));

-- Zdroj 'pole' odliší rychlý zápis z provozu od zápisu v kanceláři a od importu
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_source_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_source_check
  CHECK (source IN ('manual', 'import', 'pole'));

-- Evidence i fronta ke schválení se ptají vždy na stav
CREATE INDEX IF NOT EXISTS idx_applications_record_status
  ON public.applications(user_id, record_status, application_date DESC);

COMMENT ON COLUMN public.applications.record_status IS
  'ceka = zápis z provozu čekající na schválení, schvaleno = součást evidenční knihy';
COMMENT ON COLUMN public.applications.submitted_at IS 'Odeslání zápisu z pole';
COMMENT ON COLUMN public.applications.approved_at IS 'Schválení a propsání do evidence';
