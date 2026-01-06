# MIGRACE SOIL CATEGORIES - Přehled změn

**Datum:** 2. ledna 2026  
**Důvod:** Přechod z krátkých zkratek na plné názvy kategorií podle oficiální české metodiky MEHLICH 3 (ÚKZÚZ, vyhláška 335/2017 Sb.)

---

## 📋 PŘEHLED ZMĚN

### pH Kategorie

| Stará hodnota | Nová hodnota        | Popis                      |
|---------------|---------------------|----------------------------|
| `EK`          | `extremne_kysela`   | Extrémně kyselá (< 4.5)    |
| `SK`          | `silne_kysela`      | Silně kyselá (4.5 - 5.6)   |
| `K`           | `slabe_kysela`      | Slabě kyselá (5.6 - 6.6)   |
| `N`           | `neutralni`         | Neutrální (6.6 - 7.3)      |
| `SZ`          | `slabe_alkalicka`   | Slabě alkalická (7.3 - 8.1)|
| `EZ`          | `alkalicka`         | Alkalická (≥ 8.1)          |

### Nutrient Kategorie (P, K, Mg, Ca, S)

| Stará hodnota | Nová hodnota        | Popis              |
|---------------|---------------------|--------------------|
| `N`           | `nizky`             | Nízký              |
| `VH`          | `vyhovujici`        | Vyhovující         |
| `D`           | `dobry`             | Dobrý              |
| `V`           | `vysoky`            | Vysoký             |
| `VV`          | `velmi_vysoky`      | Velmi vysoký       |

---

## ✅ PROVEDENÉ ZMĚNY

### 1. SQL Migrace
**Soubor:** `lib/supabase/sql/migrate_soil_categories.sql`
- ✅ Migrační skript pro aktualizaci databáze
- ✅ Aktualizace všech kategorií v tabulce `soil_analyses`
- ✅ Nové constrainty pro sloupce kategorií
- ✅ Aktualizované komentáře sloupců

### 2. TypeScript Typy
**Soubor:** `lib/types/database.ts`
- ✅ Aktualizace `PhCategory` typu (6 hodnot)
- ✅ Aktualizace `NutrientCategory` typu (5 hodnot)

### 3. Validační schémata
**Soubor:** `lib/utils/validations.ts`
- ✅ Aktualizace Zod schémat pro pH kategorie
- ✅ Aktualizace Zod schémat pro nutrient kategorie

### 4. Konstanty a Labels
**Soubor:** `lib/constants/database.ts`
- ✅ `PH_CATEGORY_LABELS` - nové české názvy
- ✅ `PH_CATEGORY_DESCRIPTIONS` - aktualizované popisy
- ✅ `PH_CATEGORY_COLORS` - barvy pro nové kategorie
- ✅ `NUTRIENT_CATEGORY_LABELS` - nové české názvy
- ✅ `NUTRIENT_CATEGORY_DESCRIPTIONS` - aktualizované popisy
- ✅ `NUTRIENT_CATEGORY_COLORS` - barvy pro nové kategorie

### 5. Utility Functions
**Soubor:** `lib/utils/soil-categories.ts`
- ✅ `categorizePh()` - vrací nové PhCategory hodnoty
- ✅ `categorizeNutrient()` - vrací nové NutrientCategory hodnoty
- ✅ `getPhCategoryLabel()` - nové labely
- ✅ `getNutrientCategoryLabel()` - nové labely
- ✅ `getCategoryLabel()` - obecná funkce
- ✅ `getCategoryColor()` - barvy pro UI
- ✅ **NOVĚ:** `evaluatePhForSoilType()` - vyhodnocení pH podle půdního typu
- ✅ **NOVĚ:** `getLimingStatusLabel()` - label pro status vápnění

### 6. Frontend Komponenty
**Soubory:**
- ✅ `components/portal/ParcelHealthCard.tsx` - aktualizovány všechny funkce
- ✅ `app/portal/pozemky/page.tsx` - kontroly kategorií
- ✅ `app/portal/dashboard/page.tsx` - kontroly kategorií
- ✅ `app/portal/pozemky/[id]/rozbory/page.tsx` - používá aktualizované funkce

### 7. Backend Utilities
**Soubory:**
- ✅ `lib/utils/fertilization-plan.ts` - všechny kontroly kategorií
- ✅ `lib/utils/calculations.ts` - výpočty s kategoriemi

### 8. API Endpoints
**Soubory:**
- ✅ `app/api/portal/save-soil-analysis/route.ts` - používá aktualizované funkce
- ✅ `app/api/portal/save-soil-analyses-batch/route.ts` - používá aktualizované funkce

---

## 🚀 POSTUP NASAZENÍ

### 1. Backup databáze (DŮLEŽITÉ!)
```sql
-- Vytvořit backup tabulku
CREATE TABLE soil_analyses_backup_20260102 AS 
SELECT * FROM soil_analyses;
```

### 2. Spustit SQL migraci
```bash
# Připojit se k Supabase databázi
psql postgres://[connection-string]

# Spustit migrační skript
\i lib/supabase/sql/migrate_soil_categories.sql
```

### 3. Verifikace migrace
```sql
-- Zkontrolovat počet záznamů v každé kategorii
SELECT ph_category, COUNT(*) FROM soil_analyses 
WHERE ph_category IS NOT NULL 
GROUP BY ph_category;

SELECT p_category, COUNT(*) FROM soil_analyses 
WHERE p_category IS NOT NULL 
GROUP BY p_category;

-- Zkontrolovat, že neexistují staré hodnoty
SELECT COUNT(*) FROM soil_analyses
WHERE 
  ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ', 'K')
  OR p_category IN ('N', 'VH', 'D', 'V', 'VV');
-- Výsledek by měl být 0
```

### 4. Deploy aplikace
```bash
# Commit změny
git add .
git commit -m "Migrace soil categories na nové hodnoty dle metodiky MEHLICH 3"

# Push a deploy
git push
```

### 5. Testování po nasazení
- ✅ Kontrola zobrazení kategorií v UI
- ✅ Kontrola vytvoření nového rozboru
- ✅ Kontrola editace existujícího rozboru
- ✅ Kontrola plánu hnojení
- ✅ Kontrola plánu vápnění

---

## 🔄 ROLLBACK (pokud je potřeba)

Pokud by bylo potřeba vrátit změny zpět:

```sql
-- 1. Obnovit data z backupu
DROP TABLE soil_analyses;
ALTER TABLE soil_analyses_backup_20260102 
RENAME TO soil_analyses;

-- 2. Obnovit původní constrainty
ALTER TABLE soil_analyses 
ADD CONSTRAINT soil_analyses_ph_category_check 
CHECK (ph_category IN ('EK', 'SK', 'N', 'SZ', 'EZ'));

-- 3. Revert kódu v gitu
git revert [commit-hash]
```

---

## 📊 STATISTIKY

- **Souborů upraveno:** 11
- **SQL migrací:** 1
- **TypeScript typů:** 2
- **Komponent:** 4
- **API endpoints:** 2
- **Utility functions:** 2
- **Validation schemas:** 1

---

## ✨ NOVÉ FUNKCE

### `evaluatePhForSoilType()`
Nová funkce pro komplexní vyhodnocení pH podle typu půdy a způsobu využití.

**Příklad použití:**
```typescript
const result = evaluatePhForSoilType(6.0, 'L', 'orna')
// {
//   category: 'neutralni',
//   isOptimal: true,
//   targetPh: 6.0,
//   recommendation: 'pH je v optimálním rozmezí pro tento typ půdy.',
//   status: 'optimalni'
// }
```

**Stavy vápnění:**
- `urgentni_vapneni` - pH < 5.5
- `intenzivni_vapneni` - pH < cílové - 0.5
- `udrzovaci_vapneni` - pH < cílové - 0.3
- `optimalni` - pH v rozmezí ±0.3 od cíle
- `nad_optimum` - pH > cílové + 0.3

---

## 📚 ZDROJE

- Metodika AZZP (Agrochemické zkoušení zemědělských půd)
- Vyhláška č. 335/2017 Sb. o agrochemickém zkoušení zemědělských půd
- ÚKZÚZ - Ústřední kontrolní a zkušební ústav zemědělský
- VFU Brno - Metodika stanovení přístupných živin Mehlich 3

---

## ⚠️ DŮLEŽITÉ POZNÁMKY

1. **Databázová migrace je destruktivní** - nelze ji automaticky vrátit zpět
2. **Vždy vytvořte backup** před spuštěním migrace
3. **Testujte na staging** prostředí před nasazením do produkce
4. Po nasazení **zkontrolujte všechny funkcionality** pracující s kategoriemi
5. Staré hodnoty kategorií (`EK`, `SK`, `N`, `VH`, `VV` atd.) **již nesmí být použity** nikde v kódu

---

**Status:** ✅ Migrace připravena k nasazení  
**Linter chyby:** ❌ Žádné  
**Testováno:** ⏳ Čeká na nasazení do staging



