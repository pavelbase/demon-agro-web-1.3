-- ============================================================================
-- OPRAVA CEN V EXISTUJÍCÍCH APLIKACÍCH VÁPNĚNÍ
-- Fix missing prices in liming applications
-- ============================================================================
-- Vytvořeno: 2026-01-03
-- Účel: Zkopírovat ceny z liming_products do aplikací, které je nemají
-- ============================================================================

-- Kontrola PŘED opravou - kolik aplikací má problém
SELECT 
  COUNT(*) as missing_price_count,
  'Aplikace bez ceny, ale produkt cenu má' as description
FROM liming_applications la
LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
WHERE la.product_price_per_ton IS NULL
  AND lp.price_per_ton IS NOT NULL;

-- ============================================================================
-- HLAVNÍ OPRAVNÝ UPDATE
-- ============================================================================

UPDATE liming_applications la
SET product_price_per_ton = lp.price_per_ton
FROM liming_products lp
WHERE la.lime_product_id = lp.id
  AND la.product_price_per_ton IS NULL
  AND lp.price_per_ton IS NOT NULL;

-- ============================================================================
-- OVĚŘENÍ PO OPRAVĚ
-- ============================================================================

-- Zobrazit opravené aplikace
SELECT 
  la.id,
  la.product_name,
  la.total_dose,
  la.product_price_per_ton,
  (la.total_dose * la.product_price_per_ton) as estimated_cost,
  'UPDATED' as status
FROM liming_applications la
LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
WHERE lp.price_per_ton IS NOT NULL
ORDER BY la.created_at DESC
LIMIT 20;

-- Kontrola - kolik aplikací STÁLE nemá cenu (produkt také nemá)
SELECT 
  COUNT(*) as still_missing_count,
  'Aplikace bez ceny - produkt také nemá cenu' as description
FROM liming_applications la
LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
WHERE la.product_price_per_ton IS NULL
  AND (lp.price_per_ton IS NULL OR la.lime_product_id IS NULL);

-- Detail aplikací, které STÁLE nemají cenu
SELECT 
  la.id,
  la.product_name,
  la.lime_product_id,
  la.product_price_per_ton as app_price,
  lp.name as current_product_name,
  lp.price_per_ton as product_price,
  CASE 
    WHEN la.lime_product_id IS NULL THEN 'NO PRODUCT LINK'
    WHEN lp.price_per_ton IS NULL THEN 'PRODUCT HAS NO PRICE'
    ELSE 'UNKNOWN'
  END as reason
FROM liming_applications la
LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
WHERE la.product_price_per_ton IS NULL
ORDER BY la.created_at DESC
LIMIT 20;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Spočítat kolik bylo aktualizováno
  SELECT COUNT(*) INTO updated_count
  FROM liming_applications la
  INNER JOIN liming_products lp ON la.lime_product_id = lp.id
  WHERE la.product_price_per_ton = lp.price_per_ton
    AND lp.price_per_ton IS NOT NULL;
    
  RAISE NOTICE '✅ Oprava dokončena!';
  RAISE NOTICE '✅ Aktualizováno cen: %', updated_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 Další kroky:';
  RAISE NOTICE '   1. Obnovit stránky plánu vápnění (Ctrl+Shift+R)';
  RAISE NOTICE '   2. Zkontrolovat, že se ceny zobrazují správně';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Pokud některé aplikace stále nemají cenu:';
  RAISE NOTICE '   → Jejich produkt nemá nastavenou cenu v liming_products';
  RAISE NOTICE '   → Nastavte cenu v admin portálu: /portal/admin/produkty-vapneni';
  RAISE NOTICE '   → Pak spusťte tento skript znovu';
END $$;

-- ============================================================================
-- POZNÁMKY
-- ============================================================================

/*
TENTO SKRIPT:
✅ Zkopíruje ceny z liming_products do liming_applications
✅ Opraví pouze aplikace, které nemají cenu (product_price_per_ton IS NULL)
✅ Nezmění aplikace, které už cenu mají (zachová historické ceny)
✅ Zobrazí statistiky před a po opravě

POUŽITÍ:
psql -d your_database < lib/supabase/sql/fix_missing_prices_in_applications.sql

NEBO v Supabase SQL Editoru:
- Zkopírujte celý obsah
- Klikněte na "Run" (nebo Ctrl+Enter)

VÝSLEDEK:
- Aplikace, které měly NULL cenu, ale jejich produkt cenu má → dostanou cenu
- Aplikace, jejichž produkt NEMÁ cenu → zůstanou NULL (zobrazí se "individuální")
- Historické ceny (už nastavené) → zůstanou beze změny
*/



