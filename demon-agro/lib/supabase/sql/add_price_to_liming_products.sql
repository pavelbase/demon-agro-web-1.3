-- ============================================================================
-- PŘIDÁNÍ CENY DO PRODUKTŮ VÁPNĚNÍ
-- Add price column to liming_products table
-- ============================================================================
-- Vytvořeno: 2026-01-03
-- Účel: Umožnit nastavení ceny produktu přímo ve správě produktů
-- ============================================================================

-- Přidání sloupce price
ALTER TABLE public.liming_products 
ADD COLUMN IF NOT EXISTS price_per_ton NUMERIC(10,2) DEFAULT NULL;

-- Komentář k sloupci
COMMENT ON COLUMN public.liming_products.price_per_ton IS 
'Orientační cena produktu v CZK/t (bez dopravy a aplikace)';

-- Aktualizace výchozích cen pro existující produkty
-- Tyto ceny jsou orientační a mohou být upraveny administrátorem

UPDATE public.liming_products 
SET price_per_ton = CASE 
  -- Vápenatý vápenec (mletý) - 52% CaO
  WHEN LOWER(name) LIKE '%vápenec mletý%' AND cao_content >= 50 AND mgo_content < 5 THEN 600
  
  -- Dolomit mletý - 30% CaO, 18% MgO
  WHEN LOWER(name) LIKE '%dolomit%' AND LOWER(name) LIKE '%mletý%' THEN 800
  
  -- Granulovaný vápenec - 50% CaO
  WHEN LOWER(name) LIKE '%granulovaný%' AND LOWER(name) LIKE '%vápenec%' THEN 650
  
  -- Vápenec drcený - 48% CaO
  WHEN LOWER(name) LIKE '%drcený%' AND LOWER(name) LIKE '%vápenec%' THEN 550
  
  -- Dolomit granulovaný - 32% CaO, 16% MgO
  WHEN LOWER(name) LIKE '%dolomit%' AND LOWER(name) LIKE '%granulovaný%' THEN 850
  
  -- Vápenec + Mg (hybridní) - 45% CaO, 8% MgO
  WHEN cao_content BETWEEN 40 AND 50 AND mgo_content BETWEEN 5 AND 12 THEN 700
  
  -- Default podle typu
  WHEN type = 'dolomite' THEN 800
  WHEN type = 'calcitic' THEN 600
  ELSE 700
END
WHERE price_per_ton IS NULL;

-- Ověření
SELECT 
  id,
  name,
  type,
  cao_content,
  mgo_content,
  price_per_ton,
  is_active
FROM public.liming_products
ORDER BY display_order;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sloupec price_per_ton byl úspěšně přidán do liming_products!';
  RAISE NOTICE '✅ Výchozí ceny byly nastaveny pro existující produkty';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Správa cen:';
  RAISE NOTICE '   - Ceny lze upravovat v admin portálu: /portal/admin/produkty-vapneni';
  RAISE NOTICE '   - Ceny jsou uvedeny v CZK/t (bez dopravy a aplikace)';
  RAISE NOTICE '   - NULL hodnota = cena bude stanovena individuálně';
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
ORIENTAČNÍ CENY VÁPENATÝCH PRODUKTŮ (CZK/t):

Kalcitické produkty:
- Vápenec drcený (48% CaO):        550-600 CZK/t
- Vápenec mletý (52% CaO):         600-650 CZK/t
- Vápenec granulovaný (50% CaO):   650-700 CZK/t

Dolomitické produkty:
- Dolomit mletý (30% CaO, 18% MgO):       800-850 CZK/t
- Dolomit granulovaný (32% CaO, 16% MgO): 850-900 CZK/t

Hybridní produkty:
- Vápenec + Mg (45% CaO, 8% MgO):  700-750 CZK/t

POZNÁMKY:
- Ceny jsou orientační a mohou se lišit podle dodavatele a množství
- Nezahrnují dopravu a aplikaci
- Doprava: obvykle 200-400 CZK/t v závislosti na vzdálenosti
- Aplikace: obvykle 150-250 CZK/t
- Celková cena může být 1000-1500 CZK/t včetně všech nákladů
*/


