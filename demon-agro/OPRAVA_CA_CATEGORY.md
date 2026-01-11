# ✅ OPRAVA - Ukládání ca_category (kategorie vápníku)

## Problém
Kategorie vápníku (`ca_category`) se **nepočítala** a **neukládala** do databáze, i když hodnota vápníku (`ca`) byla k dispozici.

## Příčina
V souboru `app/api/portal/save-soil-analyses-batch/route.ts`:
- ❌ Chyběl výpočet `ca_category` pomocí `categorizeNutrient('Ca', ...)`
- ❌ Chybělo přidání `ca_category` do INSERT query

## Řešení

### ✅ 1. Přidán výpočet ca_category (řádek 193)

**PŘED:**
```typescript
const p_category = categorizeNutrient('P', analysis.phosphorus, soilType)
const k_category = categorizeNutrient('K', analysis.potassium, soilType)
const mg_category = categorizeNutrient('Mg', analysis.magnesium, soilType)
const s_category = analysis.sulfur ? categorizeNutrient('S', analysis.sulfur, soilType) : null
// ❌ ca_category chybí
```

**PO:**
```typescript
const p_category = categorizeNutrient('P', analysis.phosphorus, soilType)
const k_category = categorizeNutrient('K', analysis.potassium, soilType)
const mg_category = categorizeNutrient('Mg', analysis.magnesium, soilType)
const ca_category = analysis.calcium ? categorizeNutrient('Ca', analysis.calcium, soilType) : null // ✅ PŘIDÁNO
const s_category = analysis.sulfur ? categorizeNutrient('S', analysis.sulfur, soilType) : null
```

### ✅ 2. Přidáno ca_category do INSERT (řádek 233)

**PŘED:**
```typescript
mg: analysis.magnesium,
mg_category,
ca: analysis.calcium || null,
// ❌ ca_category chybí
s: analysis.sulfur || null,
s_category,
```

**PO:**
```typescript
mg: analysis.magnesium,
mg_category,
ca: analysis.calcium || null,
ca_category, // ✅ PŘIDÁNO
s: analysis.sulfur || null,
s_category,
```

## Testování

Po této opravě:

1. ✅ Nahrané rozbory budou mít kategorii pro vápník (Ca)
2. ✅ Kategorie se zobrazí v Zdravotní kartě půdy
3. ✅ Kategorie se zobrazí v Historii rozborů
4. ✅ Uložené kategorie pomohou s plány hnojení

### Jak otestovat:

1. **Nahrajte nový rozbor** s hodnotou vápníku (Ca)
2. **Otevřete Zdravotní kartu půdy** - měla by zobrazit kategorii vápníku
3. **Zkontrolujte v Supabase**:
```sql
SELECT ca, ca_category FROM soil_analyses WHERE ca IS NOT NULL ORDER BY created_at DESC LIMIT 5;
```

## Status
**OPRAVENO** ✅ - Kategorie vápníku se nyní správně počítá a ukládá!

---
**Datum opravy:** 2026-01-01  
**Soubor:** `app/api/portal/save-soil-analyses-batch/route.ts`

---

## 📊 Přehled kategorií živin

Nyní se ukládají **všechny** kategorie:

| Živina | Hodnota | Kategorie | Status |
|--------|---------|-----------|--------|
| pH | `ph` | `ph_category` | ✅ |
| Fosfor | `p` | `p_category` | ✅ |
| Draslík | `k` | `k_category` | ✅ |
| Hořčík | `mg` | `mg_category` | ✅ |
| **Vápník** | `ca` | `ca_category` | ✅ **OPRAVENO** |
| Síra | `s` | `s_category` | ✅ |

---

**Pro aplikaci změn nahrajte nové rozbory!**




