-- ============================================================================
-- TABULKA PRO PRODUKTY VEŘEJNÉ ČÁSTI WEBU
-- ============================================================================
-- Ukládá produkty zobrazené na veřejném webu (pH, síra, draslík, hořčík, analýza)
-- Nahrazuje localStorage - sdíleno pro všechny uživatele a režimy prohlížeče
-- Stejný pattern jako site_images
-- ============================================================================

-- Vytvoření tabulky
CREATE TABLE IF NOT EXISTS public.public_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL UNIQUE,
  product_data jsonb NOT NULL,
  category text NOT NULL,
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validace kategorie
  CONSTRAINT public_products_category_check CHECK (category IN ('ph', 'sira', 'k', 'mg', 'analyza'))
);

-- Index pro rychlé vyhledávání podle product_id
CREATE INDEX IF NOT EXISTS idx_public_products_product_id ON public.public_products(product_id);

-- Index pro filtrování podle kategorie
CREATE INDEX IF NOT EXISTS idx_public_products_category ON public.public_products(category);

-- Index pro řazení
CREATE INDEX IF NOT EXISTS idx_public_products_display_order ON public.public_products(display_order);

-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_public_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER public_products_updated_at
  BEFORE UPDATE ON public.public_products
  FOR EACH ROW
  EXECUTE FUNCTION update_public_products_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE public.public_products ENABLE ROW LEVEL SECURITY;

-- Všichni mohou číst produkty
CREATE POLICY "Anyone can view public products"
  ON public.public_products
  FOR SELECT
  USING (true);

-- Pouze autentizovaní uživatelé mohou vkládat/upravovat
-- (v admin panelu se použije jednoduchá autentizace přes heslo)
CREATE POLICY "Anyone can insert public products"
  ON public.public_products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update public products"
  ON public.public_products
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete public products"
  ON public.public_products
  FOR DELETE
  USING (true);

-- ============================================================================
-- KOMENTÁŘE
-- ============================================================================
COMMENT ON TABLE public.public_products IS 'Produkty zobrazené na veřejné části webu (ne v portálu)';
COMMENT ON COLUMN public.public_products.product_id IS 'Unikátní ID produktu (např. ph-1, sira-2)';
COMMENT ON COLUMN public.public_products.product_data IS 'JSON data produktu (nazev, popis, technicke_parametry, fotka_url, atd.)';
COMMENT ON COLUMN public.public_products.category IS 'Kategorie produktu: ph, sira, k, mg, analyza';

