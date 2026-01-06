-- ============================================================================
-- PŘIDÁNÍ CENY DO APLIKACÍ VÁPNĚNÍ
-- Add price to liming_applications for estimated cost calculation
-- ============================================================================
-- Vytvořeno: 2026-01-03
-- Účel: Umožnit výpočet odhadované ceny přímo z aplikace vápnění
-- ============================================================================

-- Přidání sloupce product_price_per_ton do liming_applications
ALTER TABLE public.liming_applications 
ADD COLUMN IF NOT EXISTS product_price_per_ton NUMERIC(10,2) DEFAULT NULL;

-- Komentář k sloupci
COMMENT ON COLUMN public.liming_applications.product_price_per_ton IS 
'Cena produktu v CZK/t v době vytvoření plánu (denormalizováno pro historii)';

-- Aktualizace existujících aplikací - zkusit spojit s aktuální cenou z liming_products
UPDATE public.liming_applications la
SET product_price_per_ton = lp.price_per_ton
FROM public.liming_products lp
WHERE la.lime_product_id = lp.id
  AND la.product_price_per_ton IS NULL
  AND lp.price_per_ton IS NOT NULL;

-- Ověření
SELECT 
  la.id,
  la.product_name,
  la.total_dose,
  la.product_price_per_ton,
  lp.price_per_ton as current_product_price,
  (la.total_dose * COALESCE(la.product_price_per_ton, lp.price_per_ton, 0)) as estimated_cost
FROM public.liming_applications la
LEFT JOIN public.liming_products lp ON la.lime_product_id = lp.id
ORDER BY la.created_at DESC
LIMIT 10;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sloupec product_price_per_ton byl přidán do liming_applications!';
  RAISE NOTICE '✅ Existující aplikace byly aktualizovány s cenou z liming_products';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Poznámky:';
  RAISE NOTICE '   - Cena je denormalizovaná pro zachování historických hodnot';
  RAISE NOTICE '   - NULL hodnota = cena nebyla v době vytvoření známa';
  RAISE NOTICE '   - Při vytváření nové aplikace se cena zkopíruje z liming_products';
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
POUŽITÍ:

1. Při vytváření nové aplikace:
   INSERT INTO liming_applications (..., product_price_per_ton)
   VALUES (..., (SELECT price_per_ton FROM liming_products WHERE id = lime_product_id))

2. Výpočet odhadované ceny:
   SELECT 
     total_dose * COALESCE(product_price_per_ton, 0) as estimated_cost
   FROM liming_applications

3. Zobrazení v UI:
   - Pokud product_price_per_ton IS NOT NULL → zobraz cenu
   - Pokud product_price_per_ton IS NULL → zobraz "Cena individuální" nebo pokus o fallback

VÝHODY DENORMALIZACE:
- Historická přesnost: cena zůstane stejná i když se změní v liming_products
- Výkon: není třeba JOIN při zobrazení aplikací
- Jednoduchost: cena je přímo v záznamu aplikace
*/


