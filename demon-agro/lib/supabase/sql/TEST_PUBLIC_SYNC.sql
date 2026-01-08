-- ============================================================================
-- TEST SKRIPT PRO OVĚŘENÍ SYNCHRONIZACE VEŘEJNÉ ČÁSTI
-- ============================================================================
-- Tento skript zkontroluje, zda tabulky fungují správně
-- ============================================================================

-- Zkontrolovat, že tabulky existují
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    ) THEN '✅'
    ELSE '❌'
  END as exists
FROM (
  VALUES 
    ('public_products'),
    ('public_articles'),
    ('public_content')
) AS t(table_name);

-- Zkontrolovat počet produktů podle kategorií
SELECT 
  '📦 PRODUKTY' as section,
  category,
  COUNT(*) as count,
  COUNT(CASE WHEN is_available THEN 1 END) as available
FROM public.public_products
GROUP BY category
ORDER BY category;

-- Zkontrolovat články
SELECT 
  '📝 ČLÁNKY' as section,
  category,
  COUNT(*) as total,
  COUNT(CASE WHEN is_published THEN 1 END) as published,
  COUNT(CASE WHEN NOT is_published THEN 1 END) as drafts
FROM public.public_articles
GROUP BY category
ORDER BY category;

-- Zkontrolovat obsah stránek
SELECT 
  '📄 OBSAH STRÁNEK' as section,
  page_key,
  page_title,
  jsonb_object_keys(content_data) as content_keys_count,
  updated_at
FROM public.public_content
ORDER BY page_key;

-- Poslední upravené položky
SELECT 
  '🕐 POSLEDNÍ ZMĚNY' as section,
  'product' as type,
  product_id as id,
  category,
  updated_at
FROM public.public_products
ORDER BY updated_at DESC
LIMIT 5;

SELECT 
  '🕐 POSLEDNÍ ZMĚNY' as section,
  'article' as type,
  article_id as id,
  category,
  updated_at
FROM public.public_articles
ORDER BY updated_at DESC
LIMIT 5;

SELECT 
  '🕐 POSLEDNÍ ZMĚNY' as section,
  'content' as type,
  page_key as id,
  page_title as category,
  updated_at
FROM public.public_content
ORDER BY updated_at DESC
LIMIT 5;

-- Celkový přehled
SELECT 
  '📊 CELKOVÝ PŘEHLED' as report,
  (SELECT COUNT(*) FROM public.public_products) as products,
  (SELECT COUNT(*) FROM public.public_articles) as articles,
  (SELECT COUNT(*) FROM public.public_content) as pages,
  (SELECT COUNT(*) FROM public.public_articles WHERE is_published = true) as published_articles;

-- Zkontrolovat RLS policies
SELECT 
  '🔒 RLS POLICIES' as section,
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('public_products', 'public_articles', 'public_content')
ORDER BY tablename, policyname;

-- Test vložení testovacího produktu (nepovinné - odkomentujte pro test)
/*
INSERT INTO public.public_products (product_id, product_data, category)
VALUES (
  'test-product-1',
  '{"nazev": "Test produkt", "popis": "Testovací produkt pro ověření funkčnosti", "dostupnost": true}'::jsonb,
  'ph'
)
ON CONFLICT (product_id) 
DO UPDATE SET updated_at = now()
RETURNING product_id, category, updated_at;
*/

-- Výsledek testu
DO $$
DECLARE
  products_count INTEGER;
  articles_count INTEGER;
  content_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO products_count FROM public.public_products;
  SELECT COUNT(*) INTO articles_count FROM public.public_articles;
  SELECT COUNT(*) INTO content_count FROM public.public_content;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '           VÝSLEDEK TESTU';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Produkty:      % řádků', products_count;
  RAISE NOTICE 'Články:        % řádků', articles_count;
  RAISE NOTICE 'Obsah stránek: % řádků', content_count;
  RAISE NOTICE '';
  
  IF products_count = 0 AND articles_count = 0 AND content_count = 0 THEN
    RAISE NOTICE '⚠️  Tabulky jsou prázdné';
    RAISE NOTICE '   → Data se automaticky migrují při prvním načtení webu';
    RAISE NOTICE '   → Nebo přihlaste se do /admin pro ruční migraci';
  ELSIF products_count > 0 OR articles_count > 0 OR content_count > 0 THEN
    RAISE NOTICE '✅ Synchronizace funguje!';
    RAISE NOTICE '   → Data jsou v Supabase';
  END IF;
  
  RAISE NOTICE '============================================';
END $$;

