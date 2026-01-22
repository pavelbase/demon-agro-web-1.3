-- ============================================================================
-- AGRO CUSTOMERS - Přidání polí pro kamionovou logistiku
-- ============================================================================
-- Datum: 2026-01-22
-- Účel: Přidat podporu pro výpočet kamionů (30t) a optimalizaci marže
-- ============================================================================

-- Přidat nové pole pro požadovaný zisk na hektar
ALTER TABLE agro_customers 
ADD COLUMN IF NOT EXISTS pozadovany_zisk_ha NUMERIC(10, 2) NOT NULL DEFAULT 330;

-- Přidat pole pro ruční přepsání počtu kamionů (NULL = automaticky)
ALTER TABLE agro_customers 
ADD COLUMN IF NOT EXISTS pocet_kamionu INTEGER NULL;

-- Komentáře k novým polím
COMMENT ON COLUMN agro_customers.pozadovany_zisk_ha IS 'Cílový zisk na hektar (Kč/ha) - pro výpočet doporučené ceny';
COMMENT ON COLUMN agro_customers.pocet_kamionu IS 'Ručně nastavený počet kamionů (NULL = automatický výpočet)';

-- ============================================================================
-- Ověření
-- ============================================================================

-- Zobrazit aktualizovanou strukturu
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'agro_customers'
AND column_name IN ('pozadovany_zisk_ha', 'pocet_kamionu')
ORDER BY ordinal_position;

SELECT 'Pole pro kamionovou logistiku úspěšně přidána!' AS status;

