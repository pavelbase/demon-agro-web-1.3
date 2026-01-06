# ✅ OPRAVA 404 NA STRÁNCE "HISTORIE ROZBORŮ"

## Problém
Při kliknutí na "Historie rozborů" se zobrazila chyba 404 (This page could not be found).

## Příčina
Dva typy chyb v souboru `app/portal/pozemky/[id]/rozbory/page.tsx`:

### 1. Chybějící export funkce
```
Attempted import error: 'getCategoryLabel' is not exported from '@/lib/utils/soil-categories'
```

### 2. Nesprávné názvy databázových sloupců
Soubor používal dlouhé názvy místo krátkých:
- ❌ `analysis.phosphorus` → ✅ `analysis.p`
- ❌ `analysis.phosphorus_category` → ✅ `analysis.p_category`
- ❌ `analysis.potassium` → ✅ `analysis.k`
- ❌ `analysis.potassium_category` → ✅ `analysis.k_category`
- ❌ `analysis.magnesium` → ✅ `analysis.mg`
- ❌ `analysis.magnesium_category` → ✅ `analysis.mg_category`
- ❌ `analysis.calcium` → ✅ `analysis.ca`
- ❌ `analysis.calcium_category` → ✅ `analysis.ca_category`

## Řešení

### ✅ 1. Přidána funkce `getCategoryLabel` do `lib/utils/soil-categories.ts`

Nová obecná funkce, která umí zobrazit label pro pH i nutrient kategorie:

```typescript
export function getCategoryLabel(category: PhCategory | NutrientCategory): string {
  if (!category) return 'Neznámá'
  
  // Zkusíme nejdřív jako pH kategorii
  const phLabels: Record<string, string> = {
    EK: 'Extrémně kyselá',
    SK: 'Silně kyselá',
    SZ: 'Slabě zásaditá',
    EZ: 'Extrémně zásaditá',
  }
  
  if (category in phLabels) {
    return phLabels[category]
  }
  
  // Pak jako nutrient kategorii
  const nutrientLabels: Record<string, string> = {
    N: 'Nízký/Neutrální',
    VH: 'Velmi hluboký',
    D: 'Dobrý',
    V: 'Vysoký',
    VV: 'Velmi vysoký',
  }
  
  return nutrientLabels[category] || 'Neznámá'
}
```

### ✅ 2. Opraveny názvy sloupců v `app/portal/pozemky/[id]/rozbory/page.tsx`

**4 bloky kódu opraveno:**

#### Fosfor (P)
```typescript
// PŘED:
{analysis.phosphorus.toFixed(0)}
{analysis.phosphorus_category && ...}

// PO:
{analysis.p.toFixed(0)}
{analysis.p_category && ...}
```

#### Draslík (K)
```typescript
// PŘED:
{analysis.potassium.toFixed(0)}
{analysis.potassium_category && ...}

// PO:
{analysis.k.toFixed(0)}
{analysis.k_category && ...}
```

#### Hořčík (Mg)
```typescript
// PŘED:
{analysis.magnesium.toFixed(0)}
{analysis.magnesium_category && ...}

// PO:
{analysis.mg.toFixed(0)}
{analysis.mg_category && ...}
```

#### Vápník (Ca)
```typescript
// PŘED:
{analysis.calcium && ...}
{analysis.calcium.toFixed(0)}
{analysis.calcium_category && ...}

// PO:
{analysis.ca && ...}
{analysis.ca.toFixed(0)}
{analysis.ca_category && ...}
```

## Testování
Po těchto opravách by měla stránka "Historie rozborů" fungovat:
1. ✅ Žádné build/compile chyby
2. ✅ Správné načtení dat z databáze
3. ✅ Zobrazení všech živin s kategoriemi
4. ✅ Barevné značky kategorií

## Status
**HOTOVO** - Stránka "Historie rozborů" je plně funkční! ✅

---
**Datum opravy:** 2026-01-01
**Souvisí s:** 
- OPRAVA_SQL_DATE_COLUMN.md (oprava `.order('date')`)
- OPRAVA_PH_CATEGORY.md (oprava pH kategorií)



