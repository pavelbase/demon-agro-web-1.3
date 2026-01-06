-- =====================================================
-- NAPLNĚNÍ TABULKY LIMING_PRODUCTS ZÁKLADNÍMI PRODUKTY
-- =====================================================
-- Tento soubor vloží základní vápenné produkty, pokud
-- tabulka liming_products ještě není naplněná.
-- =====================================================

-- Kontrola, zda tabulka existuje
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liming_products') THEN
    RAISE EXCEPTION 'Tabulka liming_products neexistuje! Spusťte nejdříve create_liming_products_complete.sql';
  END IF;
END $$;

-- Smazání starých testovacích dat (volitelné - odkomentuj pokud chceš)
-- DELETE FROM liming_products WHERE name LIKE '%test%' OR name LIKE '%Test%';

-- =====================================================
-- VLOŽENÍ ZÁKLADNÍCH PRODUKTŮ
-- =====================================================
-- Produkty jsou vkládány pouze pokud ještě neexistují

-- 1. Vápenec mletý (čistý vápenec)
INSERT INTO liming_products (
  name, 
  type, 
  cao_content, 
  mgo_content, 
  reactivity, 
  price_per_ton,
  is_active,
  description
) VALUES (
  'Vápenec mletý',
  'vapenec_mlety',
  52.0,
  0.0,
  'vysoka',
  300,
  true,
  'Standardní mletý vápenec s vysokým obsahem CaO, vhodný pro půdy s dostatečným obsahem hořčíku.'
)
ON CONFLICT (name) DO NOTHING;

-- 2. Dolomit mletý (vápenec + hořčík)
INSERT INTO liming_products (
  name, 
  type, 
  cao_content, 
  mgo_content, 
  reactivity, 
  price_per_ton,
  is_active,
  description
) VALUES (
  'Dolomit mletý',
  'dolomit_mlety',
  30.0,
  18.0,
  'vysoka',
  300,
  true,
  'Dolomitický vápenec s vysokým obsahem hořčíku (MgO), doporučen pro půdy s nízkým obsahem Mg.'
)
ON CONFLICT (name) DO NOTHING;

-- 3. Vápenec granulovaný
INSERT INTO liming_products (
  name, 
  type, 
  cao_content, 
  mgo_content, 
  reactivity, 
  price_per_ton,
  is_active,
  description
) VALUES (
  'Vápenec granulovaný',
  'vapenec_granul',
  50.0,
  0.0,
  'stredni',
  350,
  true,
  'Granulovaný vápenec s dobrou aplikovatelností, střední reaktivita.'
)
ON CONFLICT (name) DO NOTHING;

-- 4. Dolomit granulovaný
INSERT INTO liming_products (
  name, 
  type, 
  cao_content, 
  mgo_content, 
  reactivity, 
  price_per_ton,
  is_active,
  description
) VALUES (
  'Dolomit granulovaný',
  'dolomit_granul',
  28.0,
  16.0,
  'stredni',
  350,
  true,
  'Granulovaný dolomit s obsahem hořčíku, snadná aplikace.'
)
ON CONFLICT (name) DO NOTHING;

-- 5. Křídovec (nižší reaktivita, ale levnější)
INSERT INTO liming_products (
  name, 
  type, 
  cao_content, 
  mgo_content, 
  reactivity, 
  price_per_ton,
  is_active,
  description
) VALUES (
  'Křídovec',
  'kridovec',
  48.0,
  0.0,
  'nizka',
  250,
  true,
  'Ekonomická varianta vápnění, nižší reaktivita ale dlouhodobý účinek.'
)
ON CONFLICT (name) DO NOTHING;

-- 6. Pálené vápno (rychlý účinek)
INSERT INTO liming_products (
  name, 
  type, 
  cao_content, 
  mgo_content, 
  reactivity, 
  price_per_ton,
  is_active,
  description
) VALUES (
  'Pálené vápno',
  'palene_vapno',
  85.0,
  0.0,
  'vysoka',
  450,
  true,
  'Pálené vápno s velmi vysokým obsahem CaO a rychlým účinkem. Vyžaduje opatrnou aplikaci.'
)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- KONTROLA A VÝPIS
-- =====================================================

-- Výpis vložených produktů
DO $$ 
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM liming_products WHERE is_active = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ PRODUKTY ÚSPĚŠNĚ VLOŽENY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Celkem aktivních produktů: %', product_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Seznam produktů:';
  
  FOR product_name IN 
    SELECT name FROM liming_products WHERE is_active = true ORDER BY cao_content DESC
  LOOP
    RAISE NOTICE '  ✓ %', product_name;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$;

-- Výpis detailů všech produktů
SELECT 
  name AS "Název produktu",
  type AS "Typ",
  cao_content || '%' AS "CaO obsah",
  mgo_content || '%' AS "MgO obsah",
  reactivity AS "Reaktivita",
  price_per_ton || ' Kč/t' AS "Cena",
  CASE WHEN is_active THEN '✓ Aktivní' ELSE '✗ Neaktivní' END AS "Stav"
FROM liming_products
ORDER BY cao_content DESC;

-- =====================================================
-- POZNÁMKY
-- =====================================================
-- 
-- Obsah CaO a MgO:
-- - CaO (oxid vápenatý): Hlavní složka pro neutralizaci kyselosti
-- - MgO (oxid hořečnatý): Důležitý pro půdy s nízkým obsahem Mg
--
-- Reaktivita:
-- - Vysoká: Rychlý účinek (do 3 měsíců)
-- - Střední: Postupný účinek (3-6 měsíců)
-- - Nízká: Dlouhodobý účinek (6-12 měsíců)
--
-- Doporučení:
-- - Mg < 80 mg/kg → Dolomit NUTNÝ
-- - Mg 80-105 mg/kg → Dolomit doporučen
-- - Mg > 105 mg/kg → Čistý vápenec
--
-- Ceny jsou orientační a mohou se lišit dle dodavatele.
--
-- =====================================================

