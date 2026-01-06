-- ============================================================================
-- LIMING REQUESTS TABLE - KOMPLETNÍ VYTVOŘENÍ
-- Tabulka pro poptávky vápnění
-- ============================================================================

-- Drop existing table if needed (uncomment if you want to recreate)
-- DROP TABLE IF EXISTS public.liming_requests CASCADE;

-- Create table
CREATE TABLE IF NOT EXISTS public.liming_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User relation
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'new' 
    CHECK (status IN ('new', 'in_progress', 'quoted', 'completed', 'cancelled')),
  
  -- Totals
  total_area DECIMAL(10,2) NOT NULL,
  total_quantity DECIMAL(10,2),
  
  -- Delivery information
  delivery_address TEXT,
  delivery_date VARCHAR(100),
  
  -- Contact information
  contact_person VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  
  -- Notes
  notes TEXT,
  admin_notes TEXT,
  
  -- Quote information (for admin)
  quote_amount DECIMAL(10,2),
  quote_pdf_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_liming_requests_user_id 
  ON public.liming_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_liming_requests_status 
  ON public.liming_requests(status);

CREATE INDEX IF NOT EXISTS idx_liming_requests_created_at 
  ON public.liming_requests(created_at DESC);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_liming_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_liming_requests_updated_at 
  ON public.liming_requests;

CREATE TRIGGER trigger_update_liming_requests_updated_at
  BEFORE UPDATE ON public.liming_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_liming_requests_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.liming_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Uživatelé vidí vlastní poptávky" ON public.liming_requests;
DROP POLICY IF EXISTS "Admini vidí všechny poptávky" ON public.liming_requests;
DROP POLICY IF EXISTS "Uživatelé mohou vytvářet poptávky" ON public.liming_requests;
DROP POLICY IF EXISTS "Uživatelé mohou upravovat vlastní poptávky" ON public.liming_requests;
DROP POLICY IF EXISTS "Admini mohou upravovat všechny poptávky" ON public.liming_requests;
DROP POLICY IF EXISTS "Admini mohou mazat poptávky" ON public.liming_requests;

-- Users can view their own requests
CREATE POLICY "Uživatelé vidí vlastní poptávky"
  ON public.liming_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admini vidí všechny poptávky"
  ON public.liming_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can create their own requests
CREATE POLICY "Uživatelé mohou vytvářet poptávky"
  ON public.liming_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests (only if status is 'new')
CREATE POLICY "Uživatelé mohou upravovat vlastní poptávky"
  ON public.liming_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'new')
  WITH CHECK (auth.uid() = user_id);

-- Admins can update all requests
CREATE POLICY "Admini mohou upravovat všechny poptávky"
  ON public.liming_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete requests
CREATE POLICY "Admini mohou mazat poptávky"
  ON public.liming_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'liming_requests'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'liming_requests'
ORDER BY indexname;

-- Check policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'liming_requests';

-- Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'liming_requests';

-- Count existing requests
SELECT COUNT(*) as requests_count FROM public.liming_requests;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
STRUKTURA TABULKY:
- id: UUID primárního klíče
- user_id: Reference na auth.users (CASCADE DELETE)
- status: Stav poptávky (new, in_progress, quoted, completed, cancelled)
- total_area: Celková výměra (ha)
- total_quantity: Celkové množství (t)
- delivery_address: Dodací adresa
- delivery_date: Požadované datum dodání
- contact_person: Kontaktní osoba
- contact_phone: Telefon
- contact_email: Email
- notes: Poznámky od uživatele
- admin_notes: Interní poznámky administrátora
- quote_amount: Částka nabídky
- quote_pdf_url: URL na PDF nabídku
- created_at: Datum vytvoření
- updated_at: Datum poslední úpravy (automatická aktualizace)

RLS POLICIES:
- Uživatelé vidí pouze své vlastní poptávky
- Admini vidí všechny poptávky
- Uživatelé mohou vytvářet poptávky (s vlastním user_id)
- Uživatelé mohou upravovat pouze své poptávky ve stavu 'new'
- Admini mohou upravovat všechny poptávky
- Admini mohou mazat poptávky

TRIGGER:
- Automatická aktualizace updated_at při každé změně
*/

