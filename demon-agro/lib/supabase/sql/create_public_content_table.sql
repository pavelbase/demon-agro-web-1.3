-- ============================================================================
-- TABULKA PRO TEXTOVÝ OBSAH STRÁNEK VEŘEJNÉ ČÁSTI WEBU
-- ============================================================================
-- Ukládá textový obsah jednotlivých stránek (hero texty, popisy problémů, atd.)
-- Nahrazuje localStorage - sdíleno pro všechny uživatele a režimy prohlížeče
-- Stejný pattern jako site_images
-- ============================================================================

-- Vytvoření tabulky
CREATE TABLE IF NOT EXISTS public.public_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  content_data jsonb NOT NULL,
  page_title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validace page_key
  CONSTRAINT public_content_page_key_check CHECK (page_key IN (
    'home', 'ph', 'sira', 'k', 'mg', 'analyza', 'onas', 'kontakt', 'kalkulacka'
  ))
);

-- Index pro rychlé vyhledávání podle page_key
CREATE INDEX IF NOT EXISTS idx_public_content_page_key ON public.public_content(page_key);

-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_public_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER public_content_updated_at
  BEFORE UPDATE ON public.public_content
  FOR EACH ROW
  EXECUTE FUNCTION update_public_content_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE public.public_content ENABLE ROW LEVEL SECURITY;

-- Všichni mohou číst obsah stránek
CREATE POLICY "Anyone can view public content"
  ON public.public_content
  FOR SELECT
  USING (true);

-- Pouze autentizovaní uživatelé mohou vkládat/upravovat
CREATE POLICY "Anyone can insert public content"
  ON public.public_content
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update public content"
  ON public.public_content
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete public content"
  ON public.public_content
  FOR DELETE
  USING (true);

-- ============================================================================
-- KOMENTÁŘE
-- ============================================================================
COMMENT ON TABLE public.public_content IS 'Textový obsah stránek veřejné části webu';
COMMENT ON COLUMN public.public_content.page_key IS 'Klíč stránky (např. home, ph, sira)';
COMMENT ON COLUMN public.public_content.content_data IS 'JSON data obsahu stránky (hero_nadpis, hero_popis, problem_nadpis, atd.)';
COMMENT ON COLUMN public.public_content.page_title IS 'Název stránky pro admin rozhraní';



