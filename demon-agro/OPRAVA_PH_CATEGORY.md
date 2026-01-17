# 🔧 Oprava chyby "soil_analyses_ph_category_check"

## Problém
Rozbory se neukládají kvůli chybě v databázové check constraint pro `ph_category`. 

**Chybová hláška:**
```
new row for relation "soil_analyses" violates check constraint "soil_analyses_ph_category_check"
```

## Příčina
Databázová constraint očekávala staré hodnoty pH kategorií (`'K'`, `'A'`, `'SA'`), ale kód používal nové hodnoty (`'N'`, `'SZ'`, `'EZ'`).

## Řešení

### 1. ✅ Oprava kódu (už hotovo)
- Aktualizován soubor `lib/utils/soil-categories.ts`
- Funkce `categorizePh()` nyní vrací správné hodnoty: `'EK' | 'SK' | 'N' | 'SZ' | 'EZ'`

### 2. 🔄 Aktualizace databáze (POTŘEBUJE SPUŠTĚNÍ)

**Krok 1:** Otevřete Supabase dashboard
- Přejděte na: https://supabase.com/dashboard
- Vyberte váš projekt

**Krok 2:** Otevřete SQL Editor
- V levém menu klikněte na "SQL Editor"

**Krok 3:** Spusťte migraci
- Zkopírujte obsah souboru: `demon-agro/lib/supabase/sql/update_ph_category_constraint.sql`
- Vložte do SQL Editoru
- Klikněte na "Run"

**SQL migrace:**
```sql
-- Migration: Update pH category constraint
-- Date: 2026-01-01
-- Description: Updates the ph_category check constraint to match the correct enum values

-- First, drop the existing constraint if it exists
ALTER TABLE soil_analyses DROP CONSTRAINT IF EXISTS soil_analyses_ph_category_check;

-- Add the updated constraint with the correct pH category values
ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_ph_category_check 
CHECK (ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ'));

-- Update comment
COMMENT ON COLUMN soil_analyses.ph_category IS 'pH kategorie: EK=extrémně kyselá (<5.0), SK=silně kyselá (5.0-6.5), N=neutrální (6.5-7.2), SZ=slabě zásaditá (7.2-8.0), EZ=extrémně zásaditá (≥8.0)';
```

**Krok 4:** Ověřte úspěšné provedení
- V SQL Editoru spusťte:
```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'soil_analyses_ph_category_check';
```

### 3. 🧪 Test
Po aplikování migrace v databázi:
1. Restartujte dev server (pokud běží)
2. Zkuste znovu nahrát PDF s rozbory
3. Všechny rozbory by se měly úspěšně uložit

## Mapování pH kategorií

### Staré → Nové
- ~~`'K'` (kyselá)~~ → zahrnuté v `'SK'` (silně kyselá)
- ~~`'A'` (alkalická)~~ → `'SZ'` (slabě zásaditá)
- ~~`'SA'` (silně alkalická)~~ → `'EZ'` (extrémně zásaditá)

### Nové kategorie
| Kód | Název | pH rozsah |
|-----|-------|-----------|
| EK  | Extrémně kyselá | < 5.0 |
| SK  | Silně kyselá | 5.0 - 6.5 |
| N   | Neutrální | 6.5 - 7.2 |
| SZ  | Slabě zásaditá | 7.2 - 8.0 |
| EZ  | Extrémně zásaditá | ≥ 8.0 |

## Status
- [x] Kód opraven
- [ ] **Databáze čeká na migraci** ← SPUSŤTE NYNÍ
- [ ] Testování po migraci

---

**Po spuštění migrace budou všechny rozbory ukládat správně! ✅**





