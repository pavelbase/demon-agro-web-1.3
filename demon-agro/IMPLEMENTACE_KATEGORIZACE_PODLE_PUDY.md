# Implementace kategorizace živin podle typu půdy

## ✅ Hotovo - 2026-01-11

## Úkol
Zajistit, aby se kategorie živin (P, K, Mg) počítaly podle správných limitních hodnot pro daný typ půdy (L/S/T) dle Mehlich 3 metodiky ÚKZÚZ.

## Problém
Komponenta `SoilAnalysisForm` volala neexistující API endpoint `/api/soil-analyses`, který nemohl správně kategorizovat živiny podle typu půdy.

## Řešení

### 1. Oprava SoilAnalysisForm
**Soubor:** `components/portal/SoilAnalysisForm.tsx`

**Změny:**
- ✅ Změněn endpoint z `/api/soil-analyses` na `/api/portal/save-soil-analysis`
- ✅ Přidána autentizace přes Supabase Client
- ✅ Získávání userId při mount komponent (useEffect)
- ✅ Předávání správných parametrů do API

**Nový flow:**
```typescript
1. useEffect získá userId z Supabase auth
2. Formulář odešle data na /api/portal/save-soil-analysis
3. API načte parcel.soil_type
4. API zavolá categorizeNutrient(nutrient, value, soilType)
5. Kategorie se uloží do DB
```

### 2. Ověření existujících API endpointů

**✅ `/api/portal/save-soil-analysis`** (řádky 58-64)
```typescript
const soilType = parcel.soil_type
const phosphorus_category = categorizeNutrient('P', phosphorus, soilType)
const potassium_category = categorizeNutrient('K', potassium, soilType)
const magnesium_category = categorizeNutrient('Mg', magnesium, soilType)
```
→ **Správně implementováno!**

**✅ `/api/portal/save-soil-analyses-batch`** (řádky 187-193)
```typescript
const soilType = parcel.soil_type
const p_category = categorizeNutrient('P', analysis.phosphorus, soilType)
const k_category = categorizeNutrient('K', analysis.potassium, soilType)
const mg_category = categorizeNutrient('Mg', analysis.magnesium, soilType)
```
→ **Správně implementováno!**

### 3. Ověření kategorizační funkce

**Soubor:** `lib/utils/soil-categories.ts`

**Funkce:** `categorizeNutrient(nutrient, value, soilType)`

**Limitní hodnoty - Fosfor (P):**
| Kategorie | L (lehká) | S (střední) | T (těžká) |
|-----------|-----------|-------------|-----------|
| Nízký | ≤50 | ≤100 | ≤105 |
| Vyhovující | 51-80 | 101-160 | 106-170 |
| Dobrý | 81-125 | 161-250 | 171-300 |
| Vysoký | 126-170 | 251-350 | 301-450 |
| Velmi vysoký | >170 | >350 | >450 |

**Limitní hodnoty - Draslík (K):**
| Kategorie | L | S | T |
|-----------|---|---|---|
| Nízký | ≤80 | ≤105 | ≤170 |
| Vyhovující | 81-135 | 106-160 | 171-260 |
| Dobrý | 136-200 | 161-250 | 261-400 |
| Vysoký | 201-300 | 251-380 | 401-600 |
| Velmi vysoký | >300 | >380 | >600 |

**Limitní hodnoty - Hořčík (Mg):**
| Kategorie | L | S | T |
|-----------|---|---|---|
| Nízký | ≤80 | ≤105 | ≤120 |
| Vyhovující | 81-135 | 106-160 | 121-220 |
| Dobrý | 136-200 | 161-250 | 221-350 |
| Vysoký | 201-300 | 251-380 | 351-550 |
| Velmi vysoký | >300 | >380 | >550 |

→ **Hodnoty přesně odpovídají metodice ÚKZÚZ!**

### 4. Testování

**Soubor:** `test-soil-categorization.ts`

**Výsledky testů:**

```
TEST 1: P = 85 mg/kg
✅ L: dobry (rozmezí 81-125)
✅ S: nizky (pod 100)
✅ T: nizky (pod 105)

TEST 2: K = 150 mg/kg
✅ L: dobry (136-200)
✅ S: vyhovujici (106-160)
✅ T: nizky (pod 170)

TEST 3: Mg = 110 mg/kg
✅ L: vyhovujici (81-135)
✅ S: vyhovujici (106-160)
✅ T: nizky (pod 120)

TEST 4: Ca = 2000 mg/kg
✅ Všechny typy: dobry (stejné pro všechny)

TEST 5: S = 20 mg/kg
✅ Všechny typy: dobry (stejné pro všechny)

✅ VŠECHNY TESTY PROŠLY!
```

## Přepočítání existujících dat

Pro přepočítání starých rozborů v databázi existuje migrační script:

**Script:** `scripts/recalculate-soil-categories.ts`

**Spuštění:**
```bash
npx tsx scripts/recalculate-soil-categories.ts
```

**Co dělá:**
1. Načte všechny soil_analyses včetně parcel.soil_type
2. Pro každý rozbor přepočítá kategorie s novou logikou
3. Aktualizuje pouze změněné záznamy
4. Vypíše report (kolik upraveno, kolik beze změny, chyby)

## Ověření v produkci

Po implementaci zkontrolujte:

1. **Nový rozbor - Ručně zadaný:**
   - Přidat rozbor ručně přes formulář
   - Ověřit, že kategorie odpovídají typu půdy pozemku

2. **Nový rozbor - AI extrakce:**
   - Nahrát PDF s rozborema
   - Ověřit správnou kategorizaci

3. **Zdravotní karta:**
   - Zobrazit ParcelHealthCard
   - Zkontrolovat barevné označení kategorií

4. **Přepočítání starých dat:**
   - Spustit migrační script
   - Ověřit změny v Supabase

## Změněné soubory

- ✅ `components/portal/SoilAnalysisForm.tsx` - opravený endpoint a autentizace
- ✅ `test-soil-categorization.ts` - nový testovací script
- ✅ `IMPLEMENTACE_KATEGORIZACE_PODLE_PUDY.md` - tato dokumentace

## Závěr

Kategorizace živin nyní správně funguje podle typu půdy (L/S/T) dle Mehlich 3 metodiky ÚKZÚZ.

**Příklad:**
- P = 85 mg/kg na lehké půdě (L) → **Dobrý** ✅
- P = 85 mg/kg na střední půdě (S) → **Nízký** ✅
- P = 85 mg/kg na těžké půdě (T) → **Nízký** ✅

Stejná hodnota živiny dostává správně různé kategorie podle typu půdy!


