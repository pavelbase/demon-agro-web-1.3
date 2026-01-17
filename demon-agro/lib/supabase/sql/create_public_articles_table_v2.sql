-- ============================================================================
-- TABULKA PRO VZDĚLÁVACÍ ČLÁNKY VEŘEJNÉ ČÁSTI WEBU (OPRAVENÁ VERZE)
-- ============================================================================
-- Ukládá články zobrazené v sekci Vzdělávání
-- Nahrazuje localStorage - sdíleno pro všechny uživatele a režimy prohlížeče
-- Stejný pattern jako site_images
-- 
-- OPRAVA V2: Správné kategorie odpovídající UI aplikace
-- ============================================================================

-- Vytvoření tabulky
CREATE TABLE IF NOT EXISTS public.public_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL UNIQUE,
  article_data jsonb NOT NULL,
  category text NOT NULL,
  is_published boolean DEFAULT false,
  slug text NOT NULL UNIQUE,
  published_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validace kategorie (OPRAVENO - odpovídá UI)
  CONSTRAINT public_articles_category_check CHECK (category IN (
    'ph',           -- pH půdy
    'vapneni',      -- Vápnění
    'ziviny',       -- Živiny
    'vyzkumy',      -- Výzkumy
    'tipy'          -- Tipy pro zemědělce
  ))
);

-- Index pro rychlé vyhledávání podle article_id
CREATE INDEX IF NOT EXISTS idx_public_articles_article_id ON public.public_articles(article_id);

-- Index pro vyhledávání podle slug (URL)
CREATE INDEX IF NOT EXISTS idx_public_articles_slug ON public.public_articles(slug);

-- Index pro filtrování podle kategorie
CREATE INDEX IF NOT EXISTS idx_public_articles_category ON public.public_articles(category);

-- Index pro filtrování publikovaných článků
CREATE INDEX IF NOT EXISTS idx_public_articles_published ON public.public_articles(is_published);

-- Index pro řazení podle data publikace
CREATE INDEX IF NOT EXISTS idx_public_articles_published_date ON public.public_articles(published_date DESC);

-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_public_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS public_articles_updated_at ON public.public_articles;
CREATE TRIGGER public_articles_updated_at
  BEFORE UPDATE ON public.public_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_public_articles_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE public.public_articles ENABLE ROW LEVEL SECURITY;

-- Všichni mohou číst publikované články
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.public_articles;
CREATE POLICY "Anyone can view published articles"
  ON public.public_articles
  FOR SELECT
  USING (is_published = true);

-- Všichni mohou číst všechny články (včetně konceptů) pro admin účely
DROP POLICY IF EXISTS "Anyone can view all articles" ON public.public_articles;
CREATE POLICY "Anyone can view all articles"
  ON public.public_articles
  FOR SELECT
  USING (true);

-- Pouze autentizovaní uživatelé mohou vkládat/upravovat
DROP POLICY IF EXISTS "Anyone can insert articles" ON public.public_articles;
CREATE POLICY "Anyone can insert articles"
  ON public.public_articles
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update articles" ON public.public_articles;
CREATE POLICY "Anyone can update articles"
  ON public.public_articles
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete articles" ON public.public_articles;
CREATE POLICY "Anyone can delete articles"
  ON public.public_articles
  FOR DELETE
  USING (true);

-- ============================================================================
-- KOMENTÁŘE
-- ============================================================================
COMMENT ON TABLE public.public_articles IS 'Vzdělávací články zobrazené na veřejné části webu';
COMMENT ON COLUMN public.public_articles.article_id IS 'Unikátní ID článku (např. article-123456)';
COMMENT ON COLUMN public.public_articles.article_data IS 'JSON data článku (nadpis, perex, obsah, obrazek_url, autor, atd.)';
COMMENT ON COLUMN public.public_articles.category IS 'Kategorie článku: ph, vapneni, ziviny, vyzkumy, tipy';
COMMENT ON COLUMN public.public_articles.slug IS 'URL slug pro článek (např. jak-spravne-vapnit)';

-- ============================================================================
-- OVĚŘENÍ
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tabulka public_articles vytvořena/aktualizována';
  RAISE NOTICE '   Povolené kategorie: ph, vapneni, ziviny, vyzkumy, tipy';
END $$;



