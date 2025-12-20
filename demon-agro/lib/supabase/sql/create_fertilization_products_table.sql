-- ============================================================================
-- FERTILIZATION PRODUCTS TABLE
-- Tabulka hnojivých produktů
-- ============================================================================

-- Create table
CREATE TABLE IF NOT EXISTS public.fertilization_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manufacturer VARCHAR(255),
  
  -- Product type
  type VARCHAR(30) NOT NULL CHECK (type IN ('mineral', 'organic', 'organomineral')),
  -- mineral = Minerální
  -- organic = Organické
  -- organomineral = Organominerální
  
  -- Composition (%) - živiny
  composition JSONB DEFAULT '{}'::jsonb,
  -- Example: {"N": 10, "P2O5": 20, "K2O": 30, "MgO": 5, "S": 10, "CaO": 15}
  
  -- Acidification factor (kg CaCO3 / 100 kg produktu)
  acidification_factor DECIMAL(5,2) DEFAULT 0,
  -- Positive = okyseluje, Negative = alkalizuje, 0 = neutrální
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  
  -- Notes
  notes TEXT,
  application_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fertilization_products_type ON public.fertilization_products(type);
CREATE INDEX IF NOT EXISTS idx_fertilization_products_active ON public.fertilization_products(is_active);
CREATE INDEX IF NOT EXISTS idx_fertilization_products_display_order ON public.fertilization_products(display_order);

-- Enable RLS
ALTER TABLE public.fertilization_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. SELECT: Public can read active products
CREATE POLICY "Anyone can view active fertilization products"
  ON public.fertilization_products
  FOR SELECT
  USING (is_active = true);

-- 2. SELECT: Admin can view all
CREATE POLICY "Admin can view all fertilization products"
  ON public.fertilization_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. INSERT: Only admin
CREATE POLICY "Admin can insert fertilization products"
  ON public.fertilization_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. UPDATE: Only admin
CREATE POLICY "Admin can update fertilization products"
  ON public.fertilization_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. DELETE: Only admin
CREATE POLICY "Admin can delete fertilization products"
  ON public.fertilization_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_fertilization_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fertilization_products_updated_at
  BEFORE UPDATE ON public.fertilization_products
  FOR EACH ROW
  EXECUTE FUNCTION update_fertilization_products_updated_at();

-- Insert default fertilization products (Démon Agro)
INSERT INTO public.fertilization_products (name, type, manufacturer, composition, acidification_factor, is_active, display_order, notes) VALUES
('DAM 390', 'mineral', 'Démon Agro', '{"N": 27, "S": 13.5}'::jsonb, 110, true, 1, 'Dusičnan amonný s sírou'),
('LAV 270', 'mineral', 'Démon Agro', '{"N": 27, "CaO": 6.5}'::jsonb, 70, true, 2, 'Dusičnan vápenatý'),
('NPK 15-15-15', 'mineral', 'Démon Agro', '{"N": 15, "P2O5": 15, "K2O": 15}'::jsonb, 65, true, 3, 'Komplexní hnojivo'),
('Fosforin', 'mineral', 'Démon Agro', '{"P2O5": 40}'::jsonb, 0, true, 4, 'Fosforečné hnojivo'),
('Draselná sůl 60%', 'mineral', 'Démon Agro', '{"K2O": 60}'::jsonb, 0, true, 5, 'Chlorid draselný'),
('Kieserit', 'mineral', 'Démon Agro', '{"MgO": 27, "S": 22}'::jsonb, 0, true, 6, 'Síran hořečnatý');

COMMENT ON TABLE public.fertilization_products IS 'Tabulka hnojivých produktů';
COMMENT ON COLUMN public.fertilization_products.composition IS 'JSON objekt se složením živin (N, P2O5, K2O, MgO, S, CaO)';
COMMENT ON COLUMN public.fertilization_products.acidification_factor IS 'Okyselující faktor v kg CaCO3 na 100 kg produktu (kladné = okyseluje)';
