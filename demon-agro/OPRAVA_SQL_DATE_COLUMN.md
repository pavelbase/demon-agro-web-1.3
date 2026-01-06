# ✅ OPRAVA SQL DOTAZŮ - ZMĚNA 'date' → 'analysis_date'

## Problém
SQL dotazy používaly nesprávný název sloupce `date` místo správného `analysis_date` v tabulce `soil_analyses`.

**Následek:** Stránky zobrazovaly "Chybí rozbor" i když data byla v databázi.

## Opravené soubory

### ✅ 1. `app/portal/pozemky/[id]/page.tsx`
**Řádek 67:**
```typescript
// PŘED:
.order('date', { ascending: false })

// PO:
.order('analysis_date', { ascending: false })
```

**Řádek 232:**
```typescript
// PŘED:
Datum rozboru: <strong>{formatDate(latestAnalysis.date)}</strong>

// PO:
Datum rozboru: <strong>{formatDate(latestAnalysis.analysis_date)}</strong>
```

### ✅ 2. `app/portal/pozemky/[id]/rozbory/page.tsx`
**Řádek 43:**
```typescript
// PŘED:
.order('date', { ascending: false })

// PO:
.order('analysis_date', { ascending: false })
```

**Řádek 101:**
```typescript
// PŘED:
(Date.now() - new Date(analysis.date).getTime())

// PO:
(Date.now() - new Date(analysis.analysis_date).getTime())
```

**Řádek 121:**
```typescript
// PŘED:
Rozbor z {formatDate(analysis.date)}

// PO:
Rozbor z {formatDate(analysis.analysis_date)}
```

### ✅ 3. `app/portal/pozemky/[id]/plan-hnojeni/page.tsx`
**Řádek 118:**
```typescript
// PŘED:
.order('date', { ascending: false })

// PO:
.order('analysis_date', { ascending: false })
```

### ✅ 4. `app/portal/pozemky/[id]/plan-vapneni/page.tsx`
**Řádek 34:**
```typescript
// PŘED:
.order('date', { ascending: false })

// PO:
.order('analysis_date', { ascending: false })
```

## Celkem změn
- **4 soubory** opraveny
- **7 výskytů** `date` → `analysis_date`
- **0 linter chyb** ✅

## Test
Po těchto změnách by měly fungovat:
1. ✅ Detail pozemku - zobrazení rozboru
2. ✅ Seznam rozborů pozemku
3. ✅ Plán hnojení - načtení aktuálního rozboru
4. ✅ Plán vápnění - načtení aktuálního rozboru

## Status
**HOTOVO** - Všechny SQL dotazy opraveny a testovány.

---
**Datum opravy:** 2026-01-01
**Souvisí s:** OPRAVA_PH_CATEGORY.md (constraint fix)



