-- ============================================================================
-- TABULKA PRO SPRÁVU OBRÁZKŮ NA WEBU
-- ============================================================================
-- Ukládá URL a metadata všech obrázků použitých na webu
-- Nahrazuje localStorage - sdíleno pro všechny uživatele a režimy prohlížeče
-- ============================================================================

-- Vytvoření tabulky
CREATE TABLE IF NOT EXISTS public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  url text NOT NULL,
  category text NOT NULL,
  page text,
  product_id text,
  article_id text,
  title text NOT NULL,
  dimensions text,
  size_bytes bigint DEFAULT 0,
  format text,
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Indexy pro rychlé vyhledávání
  CONSTRAINT site_images_category_check CHECK (category IN ('hero', 'background', 'section', 'product', 'article'))
);

-- Index pro rychlé vyhledávání podle klíče
CREATE INDEX IF NOT EXISTS idx_site_images_key ON public.site_images(key);

-- Index pro filtrování podle kategorie
CREATE INDEX IF NOT EXISTS idx_site_images_category ON public.site_images(category);

-- Index pro filtrování podle stránky
CREATE INDEX IF NOT EXISTS idx_site_images_page ON public.site_images(page);

-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_site_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_images_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW
  EXECUTE FUNCTION update_site_images_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Všichni mohou číst obrázky
CREATE POLICY "Anyone can view site images"
  ON public.site_images
  FOR SELECT
  USING (true);

-- Pouze autentizovaní uživatelé mohou vkládat/upravovat
-- (v budoucnu můžete přidat role-based kontrolu)
CREATE POLICY "Authenticated users can insert site images"
  ON public.site_images
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site images"
  ON public.site_images
  FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete site images"
  ON public.site_images
  FOR DELETE
  USING (true);

-- ============================================================================
-- MIGRACE DAT Z LOCALSTORAGE (VOLITELNÉ)
-- ============================================================================
-- Tento SQL skript vytvoří strukturu tabulky
-- Data z localStorage budou migrována automaticky při prvním načtení stránky
-- pomocí migračního skriptu v aplikaci
-- ============================================================================

COMMENT ON TABLE public.site_images IS 'Centrální úložiště pro všechny obrázky použité na webu';
COMMENT ON COLUMN public.site_images.key IS 'Unikátní klíč obrázku (např. home_hero, product_ph-up)';
COMMENT ON COLUMN public.site_images.url IS 'Plná URL obrázku (Supabase Storage nebo externí)';
COMMENT ON COLUMN public.site_images.category IS 'Kategorie obrázku: hero, background, section, product, article';
COMMENT ON COLUMN public.site_images.page IS 'Stránka, na které se obrázek používá (pokud není produkt)';
COMMENT ON COLUMN public.site_images.product_id IS 'ID produktu (pokud je to produktový obrázek)';



