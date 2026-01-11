-- ============================================================================
-- DIAGNOSTIKA: Kontrola tabulky liming_products
-- ============================================================================
-- Spusťte tento SQL v Supabase SQL Editoru pro zjištění stavu tabulky
-- ============================================================================

-- 1. Zjistit, zda tabulka existuje
SELECT EXISTS (
  SELECT FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'liming_products'
) AS table_exists;

-- 2. Počet záznamů v tabulce
SELECT COUNT(*) AS total_products FROM liming_products;

-- 3. Počet aktivních produktů
SELECT COUNT(*) AS active_products FROM liming_products WHERE is_active = true;

-- 4. Zobrazit všechny produkty
SELECT 
  id,
  name,
  type,
  cao_content,
  mgo_content,
  is_active,
  display_order
FROM liming_products
ORDER BY display_order;

-- 5. Hledat konkrétní UUID z chyby
SELECT 
  id,
  name
FROM liming_products 
WHERE id = '5e85bd74-cf2b-4ff7-84a5-3a301151a5f9';

-- ============================================================================
-- INTERPRETACE VÝSLEDKŮ:
-- ============================================================================
-- 
-- Pokud table_exists = false:
--   → Spusťte: create_liming_products_complete.sql
--
-- Pokud total_products = 0:
--   → Tabulka je prázdná
--   → Spusťte: insert_liming_products.sql
--   → NEBO znovu: create_liming_products_complete.sql (obsahuje i data)
--
-- Pokud total_products > 0, ale konkrétní UUID neexistuje:
--   → Generátor plánu používá špatné UUID
--   → Problém je v kódu, ne v datech
--
-- ============================================================================



