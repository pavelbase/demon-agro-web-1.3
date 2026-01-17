-- ============================================================================
-- OPRAVA KATEGORIÍ PRO TABULKU public_articles
-- ============================================================================
-- Problém: SQL constraint má jiné kategorie než UI aplikace
-- Důsledek: Články s kategoriemi "ph", "vapneni", "vyzkumy", "tipy" 
--           se neuloží kvůli constraint erroru
-- Řešení: Aktualizovat constraint podle kategorií v UI
-- ============================================================================

-- Odstranit starý constraint
ALTER TABLE public.public_articles 
DROP CONSTRAINT IF EXISTS public_articles_category_check;

-- Přidat nový constraint se správnými kategoriemi
ALTER TABLE public.public_articles
ADD CONSTRAINT public_articles_category_check 
CHECK (category IN (
  'ph',           -- pH půdy
  'vapneni',      -- Vápnění
  'ziviny',       -- Živiny
  'vyzkumy',      -- Výzkumy
  'tipy'          -- Tipy pro zemědělce
));

-- ============================================================================
-- OVĚŘENÍ
-- ============================================================================

-- Zkontrolovat, že constraint byl vytvořen
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'public_articles_category_check'
    AND conrelid = 'public.public_articles'::regclass
  ) THEN
    RAISE NOTICE '✅ Constraint úspěšně aktualizován!';
    RAISE NOTICE '   Povolené kategorie: ph, vapneni, ziviny, vyzkumy, tipy';
  ELSE
    RAISE WARNING '⚠️  Constraint nebyl nalezen. Zkontrolujte chyby výše.';
  END IF;
END $$;

-- Zobrazit aktuální constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'public_articles_category_check'
  AND conrelid = 'public.public_articles'::regclass;

-- ============================================================================
-- DALŠÍ KROKY PO SPUŠTĚNÍ TOHOTO SKRIPTU
-- ============================================================================
-- 
-- 1. Smazat stávající data v tabulce (volitelné):
--    DELETE FROM public.public_articles;
--
-- 2. Obnovit stránku v prohlížeči
--    → Automaticky se znovu spustí migrace z localStorage
--    → Tentokrát projdou VŠECHNY kategorie
--
-- 3. Ověřit v inkognito režimu
--    → Všechny články by měly být viditelné
--
-- ============================================================================

-- Volitelně: Smazat stávající článek/články
-- (Odkomentujte, pokud chcete začít znovu)
-- DELETE FROM public.public_articles;
-- RAISE NOTICE '🗑️  Všechny články smazány. Obnovte stránku pro novou migraci.';



