-- =====================================================
-- EMERGENCY FIX - VYPNOUT RLS POUZE NA PROFILES
-- =====================================================

-- Krok 1: Zjisti, které tabulky existují
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Krok 2: Vypni RLS na profiles (hlavní problém)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Krok 3: Vypni RLS na dalších tabulkách (pokud existují)
DO $$
BEGIN
  -- Parcels
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parcels') THEN
    EXECUTE 'ALTER TABLE public.parcels DISABLE ROW LEVEL SECURITY';
  END IF;
  
  -- Soil analyses
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'soil_analyses') THEN
    EXECUTE 'ALTER TABLE public.soil_analyses DISABLE ROW LEVEL SECURITY';
  END IF;
  
  -- Liming requests
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liming_requests') THEN
    EXECUTE 'ALTER TABLE public.liming_requests DISABLE ROW LEVEL SECURITY';
  END IF;
  
  -- Liming request items
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liming_request_items') THEN
    EXECUTE 'ALTER TABLE public.liming_request_items DISABLE ROW LEVEL SECURITY';
  END IF;
  
  -- Products
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    EXECUTE 'ALTER TABLE public.products DISABLE ROW LEVEL SECURITY';
  END IF;
  
  -- Audit logs
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    EXECUTE 'ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Krok 4: Kontrola - zobraz stav RLS
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================
-- TERAZ ZKUS PŘIHLÁŠENÍ:
-- Email: base@demonagro.cz
-- Heslo: DemonAgro2026!
-- =====================================================




