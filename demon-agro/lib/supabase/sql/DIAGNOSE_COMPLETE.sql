-- ============================================================================
-- KOMPLEXNÍ DIAGNOSTIKA STAVU DATABÁZE - Liming System
-- ============================================================================
-- Tento skript zobrazí VEŠKERÉ informace o aktuálním stavu tabulek
-- Spusťte v Supabase SQL Editoru a pošlete mi výsledek
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'DIAGNOSTIKA LIMING SYSTÉMU';
  RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 1. KONTROLA EXISTENCE TABULEK
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- 1. EXISTENCE TABULEK ---';
END $$;
SELECT 
  tablename,
  CASE WHEN tablename IN (
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public'
  ) THEN '✅ EXISTUJE' ELSE '❌ NEEXISTUJE' END AS status
FROM (
  VALUES 
    ('liming_products'),
    ('lime_products'),
    ('liming_plans'),
    ('liming_applications')
) AS expected_tables(tablename);

-- ============================================================================
-- 2. STRUKTURA TABULKY liming_products (SLOUPCE)
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- 2. SLOUPCE V liming_products ---';
END $$;
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'liming_products'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. POČET ZÁZNAMŮ V TABULKÁCH
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- 3. POČET ZÁZNAMŮ ---';
END $$;
DO $$
DECLARE
  products_count INTEGER := 0;
  plans_count INTEGER := 0;
  apps_count INTEGER := 0;
BEGIN
  -- Počet produktů
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_products') THEN
    SELECT COUNT(*) INTO products_count FROM liming_products;
    RAISE NOTICE 'liming_products: % záznamů', products_count;
  ELSE
    RAISE NOTICE 'liming_products: TABULKA NEEXISTUJE';
  END IF;
  
  -- Počet plánů
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_plans') THEN
    SELECT COUNT(*) INTO plans_count FROM liming_plans;
    RAISE NOTICE 'liming_plans: % záznamů', plans_count;
  ELSE
    RAISE NOTICE 'liming_plans: TABULKA NEEXISTUJE';
  END IF;
  
  -- Počet aplikací
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_applications') THEN
    SELECT COUNT(*) INTO apps_count FROM liming_applications;
    RAISE NOTICE 'liming_applications: % záznamů', apps_count;
  ELSE
    RAISE NOTICE 'liming_applications: TABULKA NEEXISTUJE';
  END IF;
END $$;

-- ============================================================================
-- 4. ZOBRAZIT VŠECHNY PRODUKTY (pokud existují)
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- 4. PRODUKTY V liming_products ---';
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_products') THEN
    IF EXISTS (SELECT 1 FROM liming_products LIMIT 1) THEN
      RAISE NOTICE 'Produkty nalezeny - zobrazuji...';
    ELSE
      RAISE NOTICE '⚠️  TABULKA JE PRÁZDNÁ!';
    END IF;
  END IF;
END $$;

SELECT 
  id,
  name,
  type,
  cao_content,
  mgo_content,
  is_active
FROM liming_products
ORDER BY display_order
LIMIT 20;

-- ============================================================================
-- 5. FOREIGN KEY CONSTRAINTS
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- 5. FOREIGN KEY CONSTRAINTS ---';
END $$;
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'liming_applications'::regclass
  AND contype = 'f'
ORDER BY conname;

-- ============================================================================
-- 6. KONTROLA PROBLEMATICKÉHO UUID
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- 6. HLEDÁNÍ CHYBĚJÍCÍHO PRODUKTU ---';
END $$;
-- Zkusit najít jakýkoliv produkt, který se pokouší liming_applications použít
DO $$
DECLARE
  missing_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_applications') 
     AND EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_products') THEN
    
    SELECT COUNT(*) INTO missing_count
    FROM liming_applications la
    LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
    WHERE la.lime_product_id IS NOT NULL
      AND lp.id IS NULL;
    
    IF missing_count > 0 THEN
      RAISE NOTICE '⚠️  NALEZENO % aplikací s neexistujícími produkty!', missing_count;
      RAISE NOTICE 'Chybějící UUIDs:';
      
      -- Zobrazit chybějící UUID
      FOR rec IN 
        SELECT DISTINCT la.lime_product_id
        FROM liming_applications la
        LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
        WHERE la.lime_product_id IS NOT NULL
          AND lp.id IS NULL
      LOOP
        RAISE NOTICE '  - %', rec.lime_product_id;
      END LOOP;
    ELSE
      RAISE NOTICE '✅ Všechny foreign keys jsou v pořádku';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 7. SOUHRN A DOPORUČENÍ
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'SOUHRN DIAGNOSTIKY';
  RAISE NOTICE '=========================================';
END $$;

DO $$
DECLARE
  products_exist BOOLEAN;
  products_count INTEGER := 0;
  apps_count INTEGER := 0;
BEGIN
  -- Zjistit stav
  products_exist := EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_products');
  
  IF products_exist THEN
    SELECT COUNT(*) INTO products_count FROM liming_products;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'liming_applications') THEN
    SELECT COUNT(*) INTO apps_count FROM liming_applications;
  END IF;
  
  -- Doporučení
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'DOPORUČENÍ:';
  RAISE NOTICE '===========================================';
  
  IF NOT products_exist THEN
    RAISE NOTICE '❌ Tabulka liming_products NEEXISTUJE';
    RAISE NOTICE '→ ŘEŠENÍ: Spusťte create_liming_products_complete.sql';
  ELSIF products_count = 0 THEN
    RAISE NOTICE '⚠️  Tabulka liming_products je PRÁZDNÁ';
    RAISE NOTICE '→ ŘEŠENÍ: Spusťte insert_liming_products.sql';
  ELSE
    RAISE NOTICE '✅ Tabulka liming_products má % produktů', products_count;
  END IF;
  
  IF apps_count > 0 THEN
    RAISE NOTICE '⚠️  Existuje % aplikací - možná s chybnými odkazy', apps_count;
    RAISE NOTICE '→ MOŽNÉ ŘEŠENÍ: Smazat staré aplikace a začít znovu';
  END IF;
  
  RAISE NOTICE '===========================================';
END $$;

-- ============================================================================
-- KONEC DIAGNOSTIKY
-- ============================================================================

