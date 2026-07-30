-- Migration: Add 'chmelnice' as valid culture (kultura pozemku)
-- Date: 2026-07-29
-- Description: Rozšiřuje případný CHECK constraint na sloupci parcels.culture
-- o hodnotu 'chmelnice', viz zadani-chmelnice-engine.md.
--
-- POZOR: Pokud sloupec parcels.culture v produkční databázi žádný CHECK
-- constraint nemá (je to jen text/varchar), je tento skript no-op a hodnotu
-- 'chmelnice' šlo ukládat i bez něj - engine (lib/utils/liming-calculator.ts,
-- lib/utils/soil-categories.ts) a formuláře v portálu už 'chmelnice' podporují.
-- Skript je zde jen jako bezpečnostní síť pro případ, že constraint existuje.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'parcels'
      AND constraint_name = 'parcels_culture_check'
  ) THEN
    ALTER TABLE parcels DROP CONSTRAINT parcels_culture_check;
  END IF;
END $$;

ALTER TABLE parcels
ADD CONSTRAINT parcels_culture_check
CHECK (culture IN ('orna', 'ttp', 'chmelnice'));

COMMENT ON COLUMN parcels.culture IS 'Kultura pozemku dle LPIS/AZZP: orna=orná půda (+ovocné sady, tab.4/10), ttp=trvalý travní porost (tab.5/11), chmelnice=chmelnice (tab.7/13). Určuje normativy dávek CaO i kritéria zásobenosti živinami.';
