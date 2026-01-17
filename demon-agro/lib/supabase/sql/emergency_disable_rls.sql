-- =====================================================
-- EMERGENCY FIX - VYPNOUT RLS NA VŠECH TABULKÁCH
-- =====================================================
-- POUZE PRO DEBUGGING! Vrátit zpět po přihlášení!
-- =====================================================

-- Vypni RLS na všech tabulkách
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilization_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_rotation DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilization_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.liming_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.liming_request_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Kontrola
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================
-- TERAZ ZKUS PŘIHLÁŠENÍ:
-- Email: base@demonagro.cz
-- Heslo: DemonAgro2026!
-- 
-- PO ÚSPĚŠNÉM PŘIHLÁŠENÍ SPUSŤ:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- (a pro ostatní tabulky také)
-- =====================================================




