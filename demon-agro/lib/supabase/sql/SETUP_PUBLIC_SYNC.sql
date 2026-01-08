-- ============================================================================
-- KOMPLETNÍ SETUP PRO SUPABASE SYNCHRONIZACI VEŘEJNÉ ČÁSTI
-- ============================================================================
-- Tento skript vytvoří všechny potřebné tabulky pro synchronizaci:
-- - public_products (produkty)
-- - public_articles (články)
-- - public_content (obsah stránek)
--
-- SPUŠTĚNÍ: Zkopírujte celý tento soubor do Supabase SQL Editor a spusťte
-- ============================================================================

-- ============================================================================
-- 1. TABULKA PRO PRODUKTY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.public_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL UNIQUE,
  product_data jsonb NOT NULL,
  category text NOT NULL,
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT public_products_category_check CHECK (category IN ('ph', 'sira', 'k', 'mg', 'analyza'))
);

CREATE INDEX IF NOT EXISTS idx_public_products_product_id ON public.public_products(product_id);
CREATE INDEX IF NOT EXISTS idx_public_products_category ON public.public_products(category);
CREATE INDEX IF NOT EXISTS idx_public_products_display_order ON public.public_products(display_order);

CREATE OR REPLACE FUNCTION update_public_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS public_products_updated_at ON public.public_products;
CREATE TRIGGER public_products_updated_at
  BEFORE UPDATE ON public.public_products
  FOR EACH ROW
  EXECUTE FUNCTION update_public_products_updated_at();

ALTER TABLE public.public_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public products" ON public.public_products;
CREATE POLICY "Anyone can view public products"
  ON public.public_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert public products" ON public.public_products;
CREATE POLICY "Anyone can insert public products"
  ON public.public_products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update public products" ON public.public_products;
CREATE POLICY "Anyone can update public products"
  ON public.public_products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete public products" ON public.public_products;
CREATE POLICY "Anyone can delete public products"
  ON public.public_products FOR DELETE USING (true);

COMMENT ON TABLE public.public_products IS 'Produkty zobrazené na veřejné části webu';

-- ============================================================================
-- 2. TABULKA PRO ČLÁNKY
-- ============================================================================

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
  
  CONSTRAINT public_articles_category_check CHECK (category IN ('ph', 'vapneni', 'ziviny', 'vyzkumy', 'tipy'))
);

CREATE INDEX IF NOT EXISTS idx_public_articles_article_id ON public.public_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_public_articles_slug ON public.public_articles(slug);
CREATE INDEX IF NOT EXISTS idx_public_articles_category ON public.public_articles(category);
CREATE INDEX IF NOT EXISTS idx_public_articles_published ON public.public_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_public_articles_published_date ON public.public_articles(published_date DESC);

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

ALTER TABLE public.public_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published articles" ON public.public_articles;
CREATE POLICY "Anyone can view published articles"
  ON public.public_articles FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Anyone can view all articles" ON public.public_articles;
CREATE POLICY "Anyone can view all articles"
  ON public.public_articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert articles" ON public.public_articles;
CREATE POLICY "Anyone can insert articles"
  ON public.public_articles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update articles" ON public.public_articles;
CREATE POLICY "Anyone can update articles"
  ON public.public_articles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete articles" ON public.public_articles;
CREATE POLICY "Anyone can delete articles"
  ON public.public_articles FOR DELETE USING (true);

COMMENT ON TABLE public.public_articles IS 'Vzdělávací články zobrazené na veřejné části webu';

-- ============================================================================
-- 3. TABULKA PRO OBSAH STRÁNEK
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.public_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  content_data jsonb NOT NULL,
  page_title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT public_content_page_key_check CHECK (page_key IN (
    'home', 'ph', 'sira', 'k', 'mg', 'analyza', 'onas', 'kontakt', 'kalkulacka'
  ))
);

CREATE INDEX IF NOT EXISTS idx_public_content_page_key ON public.public_content(page_key);

CREATE OR REPLACE FUNCTION update_public_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS public_content_updated_at ON public.public_content;
CREATE TRIGGER public_content_updated_at
  BEFORE UPDATE ON public.public_content
  FOR EACH ROW
  EXECUTE FUNCTION update_public_content_updated_at();

ALTER TABLE public.public_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public content" ON public.public_content;
CREATE POLICY "Anyone can view public content"
  ON public.public_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert public content" ON public.public_content;
CREATE POLICY "Anyone can insert public content"
  ON public.public_content FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update public content" ON public.public_content;
CREATE POLICY "Anyone can update public content"
  ON public.public_content FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete public content" ON public.public_content;
CREATE POLICY "Anyone can delete public content"
  ON public.public_content FOR DELETE USING (true);

COMMENT ON TABLE public.public_content IS 'Textový obsah stránek veřejné části webu';

-- ============================================================================
-- OVĚŘENÍ VYTVOŘENÍ
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('public_products', 'public_articles', 'public_content');
  
  IF table_count = 3 THEN
    RAISE NOTICE '✅ Všechny 3 tabulky byly úspěšně vytvořeny!';
    RAISE NOTICE '   - public_products';
    RAISE NOTICE '   - public_articles';
    RAISE NOTICE '   - public_content';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Další kroky:';
    RAISE NOTICE '   1. Spusťte aplikaci';
    RAISE NOTICE '   2. Přihlaste se do /admin';
    RAISE NOTICE '   3. Data se automaticky migrují z localStorage';
  ELSE
    RAISE WARNING '⚠️  Některé tabulky nebyly vytvořeny. Zkontrolujte chyby výše.';
  END IF;
END $$;

-- Zobrazit počet řádků v nových tabulkách
SELECT 
  'public_products' as table_name,
  COUNT(*) as row_count
FROM public.public_products
UNION ALL
SELECT 
  'public_articles',
  COUNT(*)
FROM public.public_articles
UNION ALL
SELECT 
  'public_content',
  COUNT(*)
FROM public.public_content;

