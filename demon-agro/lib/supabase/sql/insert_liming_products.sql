-- =====================================================
-- NAPLNĚNÍ TABULKY LIMING_PRODUCTS ZÁKLADNÍMI PRODUKTY
-- =====================================================
-- Tento soubor vloží základní vápenné produkty
-- Kompatibilní s: create_liming_products_complete.sql
-- Verze: 2.0 (2026-01-03)
-- =====================================================

-- Kontrola, zda tabulka existuje
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liming_products') THEN
    RAISE EXCEPTION 'Tabulka liming_products neexistuje! Spusťte nejdříve create_liming_products_complete.sql';
  END IF;
END $$;

-- Smazání starých produktů (volitelné - odkomentuj pokud chceš začít od nuly)
-- DELETE FROM liming_products;

-- =====================================================
-- VLOŽENÍ ZÁKLADNÍCH PRODUKTŮ
-- =====================================================

-- 1. Vápenec mletý (čistý vápenec)
INSERT INTO liming_products (
  name, 
  description,
  type, 
  cao_content, 
  mgo_content, 
  reactivity,
  granulation,
  form,
  is_active,
  display_order
) VALUES (
  'Vápenec mletý',
  'Standardní mletý vápenec s vysokým obsahem CaO, vhodný pro půdy s dostatečným obsahem hořčíku.',
  'calcitic',
  52.0,
  0.0,
  'high',
  'mletý',
  'moučka',
  true,
  1
);

-- 2. Dolomit mletý (vápenec + hořčík)
INSERT INTO liming_products (
  name, 
  description,
  type, 
  cao_content, 
  mgo_content, 
  reactivity,
  granulation,
  form,
  is_active,
  display_order
) VALUES (
  'Dolomit mletý',
  'Dolomitický vápenec s obsahem hořčíku, ideální pro půdy s nedostatkem Mg.',
  'dolomite',
  30.0,
  18.0,
  'high',
  'mletý',
  'moučka',
  true,
  2
);

-- 3. Vápenec granulovaný
INSERT INTO liming_products (
  name, 
  description,
  type, 
  cao_content, 
  mgo_content, 
  reactivity,
  granulation,
  form,
  is_active,
  display_order
) VALUES (
  'Vápenec granulovaný',
  'Granulovaný vápenec, snazší aplikace a rovnoměrnější rozptyl.',
  'calcitic',
  50.0,
  0.0,
  'medium',
  '2-5mm',
  'granulát',
  true,
  3
);

-- 4. Dolomit granulovaný
INSERT INTO liming_products (
  name, 
  description,
  type, 
  cao_content, 
  mgo_content, 
  reactivity,
  granulation,
  form,
  is_active,
  display_order
) VALUES (
  'Dolomit granulovaný',
  'Granulovaný dolomit s obsahem hořčíku.',
  'dolomite',
  28.0,
  16.0,
  'medium',
  '2-5mm',
  'granulát',
  true,
  4
);

-- 5. Křídovec (nižší reaktivita, ale levnější)
INSERT INTO liming_products (
  name, 
  description,
  type, 
  cao_content, 
  mgo_content, 
  reactivity,
  granulation,
  form,
  is_active,
  display_order
) VALUES (
  'Křídovec',
  'Přírodní vápenec s pomalejším působením, ekonomická varianta.',
  'calcitic',
  45.0,
  0.0,
  'low',
  'drcený',
  'drcený',
  true,
  5
);

-- 6. Pálené vápno (rychlý účinek)
INSERT INTO liming_products (
  name, 
  description,
  type, 
  cao_content, 
  mgo_content, 
  reactivity,
  granulation,
  form,
  is_active,
  display_order
) VALUES (
  'Pálené vápno',
  'Rychle působící vápno pro urgentní úpravu pH, vyžaduje opatrnost při aplikaci.',
  'both',
  85.0,
  0.0,
  'very_high',
  'mletý',
  'moučka',
  true,
  6
);

-- =====================================================
-- OVĚŘENÍ VLOŽENÍ
-- =====================================================

-- Zobrazení počtu vložených produktů
DO $$
DECLARE
  product_count INTEGER;
  product_name TEXT;
BEGIN
  SELECT COUNT(*) INTO product_count FROM liming_products WHERE is_active = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'VLOŽENÍ PRODUKTŮ DOKONČENO';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Celkem aktivních produktů: %', product_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Seznam produktů:';
  
  FOR product_name IN 
    SELECT name FROM liming_products WHERE is_active = true ORDER BY display_order
  LOOP
    RAISE NOTICE '  ✓ %', product_name;
  END LOOP;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

-- Výpis všech produktů v tabulkovém formátu
SELECT 
  name AS "Název produktu",
  type AS "Typ",
  cao_content || '%' AS "CaO obsah",
  mgo_content || '%' AS "MgO obsah",
  reactivity AS "Reaktivita",
  CASE WHEN is_active THEN '✓ Aktivní' ELSE '✗ Neaktivní' END AS "Stav"
FROM liming_products
ORDER BY display_order;

-- =====================================================
-- POZNÁMKY
-- =====================================================
-- 
-- Typ produktu (type):
--   - 'calcitic'  = Vápenatý (pouze CaO)
--   - 'dolomite'  = Dolomitický (CaO + MgO)
--   - 'both'      = Univerzální
--
-- Reaktivita (reactivity):
--   - 'very_high' = Velmi vysoká (pálené vápno)
--   - 'high'      = Vysoká (mleté produkty)
--   - 'medium'    = Střední (granulované)
--   - 'low'       = Nízká (křídovec, přírodní)
--
-- =====================================================
