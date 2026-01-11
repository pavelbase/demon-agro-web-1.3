-- ============================================================================
-- FIX: Oprava foreign key constraint v tabulce liming_applications
-- ============================================================================
-- Problém: Constraint odkazuje na neexistující tabulku "lime_products"
--          místo správné "liming_products"
-- Řešení: Odstranit špatný constraint a vytvořit nový správný
-- ============================================================================

-- 1. Zjistit, jestli tabulka liming_applications existuje
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liming_applications') THEN
    RAISE EXCEPTION 'Tabulka liming_applications neexistuje! Spusťte nejdříve create_liming_plans.sql';
  END IF;
END $$;

-- 2. Zjistit, jestli tabulka liming_products existuje
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liming_products') THEN
    RAISE EXCEPTION 'Tabulka liming_products neexistuje! Spusťte nejdříve create_liming_products_complete.sql';
  END IF;
END $$;

-- 3. Odstranit špatný constraint (pokud existuje)
DO $$ 
BEGIN
  -- Pokusíme se odstranit constraint s názvem "liming_applications_lime_product_id_fkey"
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'liming_applications_lime_product_id_fkey'
  ) THEN
    ALTER TABLE liming_applications 
    DROP CONSTRAINT liming_applications_lime_product_id_fkey;
    
    RAISE NOTICE '✓ Špatný constraint odstraněn: liming_applications_lime_product_id_fkey';
  ELSE
    RAISE NOTICE 'ℹ Constraint liming_applications_lime_product_id_fkey neexistuje (možná už byl odstraněn)';
  END IF;
END $$;

-- 4. Vytvořit nový správný constraint
DO $$ 
BEGIN
  -- Zkontrolovat, jestli už nový constraint neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'liming_applications_liming_product_id_fkey'
  ) THEN
    ALTER TABLE liming_applications
    ADD CONSTRAINT liming_applications_liming_product_id_fkey
    FOREIGN KEY (lime_product_id) 
    REFERENCES liming_products(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE '✓ Nový správný constraint vytvořen: liming_applications_liming_product_id_fkey';
  ELSE
    RAISE NOTICE 'ℹ Constraint liming_applications_liming_product_id_fkey už existuje';
  END IF;
END $$;

-- 5. Ověření
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conrelid = 'liming_applications'::regclass
    AND conname LIKE '%lime_product%';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'OVĚŘENÍ CONSTRAINTŮ V liming_applications';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Počet constraintů týkajících se lime_product_id: %', constraint_count;
  RAISE NOTICE '';
  
  -- Vypsat všechny foreign key constraints v tabulce
  FOR constraint_name IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'liming_applications'::regclass 
      AND contype = 'f'
    ORDER BY conname
  LOOP
    RAISE NOTICE '  ✓ %', constraint_name;
  END LOOP;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;



