-- ============================================================================
-- LIMING REQUEST ITEMS TABLE
-- Položky poptávek vápnění (vztah k liming_requests)
-- ============================================================================

-- Check if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'liming_request_items'
    ) THEN
        -- Create table
        CREATE TABLE public.liming_request_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          
          -- Relations
          request_id UUID NOT NULL REFERENCES public.liming_requests(id) ON DELETE CASCADE,
          parcel_id UUID NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
          product_id UUID REFERENCES public.liming_products(id) ON DELETE SET NULL,
          
          -- Product info (stored for history, even if product deleted)
          product_name VARCHAR(255) NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          unit VARCHAR(20) DEFAULT 't',
          
          -- Notes
          notes TEXT,
          
          -- Metadata
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Indexes
        CREATE INDEX idx_liming_request_items_request_id 
          ON public.liming_request_items(request_id);
        
        CREATE INDEX idx_liming_request_items_parcel_id 
          ON public.liming_request_items(parcel_id);
        
        CREATE INDEX idx_liming_request_items_product_id 
          ON public.liming_request_items(product_id) 
          WHERE product_id IS NOT NULL;

        -- RLS Policies
        ALTER TABLE public.liming_request_items ENABLE ROW LEVEL SECURITY;

        -- Users can view their own request items
        CREATE POLICY "Uživatelé vidí vlastní položky poptávek"
          ON public.liming_request_items
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.liming_requests
              WHERE liming_requests.id = liming_request_items.request_id
              AND liming_requests.user_id = auth.uid()
            )
          );

        -- Admins can view all items
        CREATE POLICY "Admini vidí všechny položky poptávek"
          ON public.liming_request_items
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );

        -- Users can insert their own request items
        CREATE POLICY "Uživatelé mohou vytvářet položky"
          ON public.liming_request_items
          FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.liming_requests
              WHERE liming_requests.id = liming_request_items.request_id
              AND liming_requests.user_id = auth.uid()
            )
          );

        -- Admins can update items
        CREATE POLICY "Admini mohou upravovat položky"
          ON public.liming_request_items
          FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );

        -- Admins can delete items
        CREATE POLICY "Admini mohou mazat položky"
          ON public.liming_request_items
          FOR DELETE
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );

        RAISE NOTICE 'Table liming_request_items created successfully';
    ELSE
        RAISE NOTICE 'Table liming_request_items already exists, skipping creation';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check table exists
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'liming_request_items';

-- Count items
SELECT COUNT(*) as items_count FROM public.liming_request_items;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'liming_request_items'
ORDER BY indexname;

-- Check policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'liming_request_items';

-- ============================================================================
-- NOTES
-- ============================================================================

/*
STRUKTURA:
- id: UUID primárního klíče
- request_id: Reference na liming_requests (CASCADE DELETE)
- parcel_id: Reference na parcels (CASCADE DELETE)
- product_id: Reference na liming_products (SET NULL pokud smazán)
- product_name: Název produktu (uložen pro historii)
- quantity: Množství (decimal)
- unit: Jednotka (default 't')
- notes: Poznámky k položce
- created_at: Timestamp vytvoření

RLS POLICIES:
- Uživatelé vidí pouze své položky (přes request_id → user_id)
- Admini vidí všechny položky
- Uživatelé mohou vytvářet pouze k vlastním poptávkám
- Admini mohou upravovat a mazat

CASCADE DELETE:
- Pokud se smaže poptávka (liming_requests), smažou se i položky
- Pokud se smaže pozemek (parcels), smažou se i položky
- Pokud se smaže produkt (liming_products), pouze se nastaví product_id na NULL
  (product_name zůstává zachován pro historii)
*/
