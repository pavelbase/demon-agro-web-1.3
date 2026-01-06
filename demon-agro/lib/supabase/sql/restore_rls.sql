-- =====================================================
-- ZAPNOUT ZPĚT RLS NA VŠECH TABULKÁCH
-- =====================================================

-- Zapni RLS na tabulkách, které jsme vypnuli
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liming_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liming_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Kontrola - všechny by měly mít rowsecurity = true
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================
-- HOTOVO! RLS je zpět zapnutý na všech tabulkách
-- =====================================================


