-- ============================================================================
-- DIAGNOSTIKA PROBLÉMU S CENAMI V PLÁNU VÁPNĚNÍ
-- ============================================================================

-- 1. Zkontrolovat, zda sloupec product_price_per_ton existuje
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'liming_applications' 
  AND column_name = 'product_price_per_ton';

-- 2. Zkontrolovat ceny produktů v liming_products
SELECT 
  id,
  name,
  type,
  cao_content,
  mgo_content,
  price_per_ton,
  is_active
FROM liming_products
ORDER BY display_order;

-- 3. Zkontrolovat aplikace pro konkrétní plán (nahraď PLAN_ID skutečným ID)
-- Získej PLAN_ID z URL: /pozemky/.../plan-vapneni?planId=XXXX nebo z tabulky
SELECT 
  la.id,
  la.product_name,
  la.lime_product_id,
  la.dose_per_ha,
  la.total_dose,
  la.product_price_per_ton,
  lp.name as current_product_name,
  lp.price_per_ton as current_product_price,
  CASE 
    WHEN la.product_price_per_ton IS NOT NULL THEN 
      (la.total_dose * la.product_price_per_ton)
    ELSE NULL
  END as estimated_cost
FROM liming_applications la
LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
WHERE la.liming_plan_id = (
  -- Poslední plán pro pozemek
  SELECT id FROM liming_plans 
  WHERE parcel_id = 'fe2039a3-aeaf-488d-a674-51a106cf2f2b' -- ID z URL
  ORDER BY created_at DESC 
  LIMIT 1
)
ORDER BY la.sequence_order;

-- 4. Zjistit, které aplikace NEMAJÍ cenu, ale jejich produkt cenu MÁ
SELECT 
  la.id,
  la.product_name,
  la.lime_product_id,
  la.product_price_per_ton as app_price,
  lp.price_per_ton as product_price,
  'MISSING PRICE - SHOULD BE UPDATED' as status
FROM liming_applications la
LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
WHERE la.product_price_per_ton IS NULL
  AND lp.price_per_ton IS NOT NULL
ORDER BY la.created_at DESC
LIMIT 20;

-- 5. Zjistit, které aplikace nemají vazbu na produkt (lime_product_id IS NULL)
SELECT 
  la.id,
  la.product_name,
  la.lime_product_id,
  la.product_price_per_ton,
  'NO PRODUCT LINK' as status
FROM liming_applications la
WHERE la.lime_product_id IS NULL
ORDER BY la.created_at DESC
LIMIT 20;

-- ============================================================================
-- OPRAVNÝ SQL - Pokud bod 4 ukáže problémové řádky
-- ============================================================================
-- Spusť tento UPDATE pokud jsou aplikace bez ceny, ale produkt cenu má:

-- UPDATE liming_applications la
-- SET product_price_per_ton = lp.price_per_ton
-- FROM liming_products lp
-- WHERE la.lime_product_id = lp.id
--   AND la.product_price_per_ton IS NULL
--   AND lp.price_per_ton IS NOT NULL;

-- ============================================================================
-- POZNÁMKY
-- ============================================================================
/*
MOŽNÉ PŘÍČINY:

1. Produkty nemají nastavenou cenu (price_per_ton IS NULL)
   → Řešení: Nastavit cenu v admin portálu /portal/admin/produkty-vapneni

2. Aplikace nemají vazbu na produkt (lime_product_id IS NULL)
   → Řešení: Starší aplikace vytvořené před přidáním vazby
   → Nutno ručně spojit podle product_name

3. Migrace neproběhla správně
   → Zkontrolovat sloupec product_price_per_ton existuje (bod 1)
   → Spustit opravný UPDATE (výše)

4. Cache/Browser problém
   → Hard refresh (Ctrl+Shift+R)
   → Vyčistit cache prohlížeče
*/


