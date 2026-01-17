# PDF Export Vápnění - V2.1

## 🎨 Oprava barev živin v PDF

### Co bylo opraveno?

PDF export plánů vápnění (`liming-pdf-export-v2.ts`) nyní **zobrazuje hodnoty živin ve stejných barvách jako v portálu**.

---

## 📊 Barevný systém - PŘED a PO

### ❌ PŘED (V2.0) - 3 barvy (zjednodušené)

```typescript
// Fixní prahy - NESPRÁVNÉ
if (ca < 1000) → červená
if (ca < 2000) → oranžová
else → zelená
```

**Problémy:**
- ❌ Nepoužívá vědeckou metodiku
- ❌ Nezohledňuje typ půdy (lehká/střední/těžká)
- ❌ Chybí kategorie "vysoký" (modrá) a "velmi vysoký" (fialová)
- ❌ Barvy neodpovídají portálu

---

### ✅ PO (V2.1) - 5 barev (vědecká metodika)

```typescript
// Použití categorizeNutrient() - SPRÁVNÉ
const category = categorizeNutrient('Ca', ca, soilType)
const color = getNutrientColorRGB(category)
```

**Barvy podle kategorie:**

| Kategorie       | Barva      | RGB              | Popis                  |
|-----------------|------------|------------------|------------------------|
| `nizky`         | 🔴 Červená | `(239, 68, 68)`  | Nízký obsah           |
| `vyhovujici`    | 🟠 Oranžová| `(249, 115, 22)` | Vyhovující            |
| `dobry`         | 🟢 Zelená  | `(34, 197, 94)`  | Dobrý (optimální)     |
| `vysoky`        | 🔵 Modrá   | `(59, 130, 246)` | Vysoký                |
| `velmi_vysoky`  | 🟣 Fialová | `(168, 85, 247)` | Velmi vysoký          |

---

## 🔬 Vědecká metodika

### Kategorizace živin podle typu půdy

PDF nyní používá **stejnou funkci** jako portál: `categorizeNutrient()` z `soil-categories.ts`.

**Příklad pro Fosfor (P):**

#### Lehká půda (L):
- ≤ 50 mg/kg → 🔴 Nízký
- 51-80 → 🟠 Vyhovující
- 81-125 → 🟢 Dobrý
- 126-170 → 🔵 Vysoký
- \> 170 → 🟣 Velmi vysoký

#### Střední půda (S):
- ≤ 100 mg/kg → 🔴 Nízký
- 101-160 → 🟠 Vyhovující
- 161-250 → 🟢 Dobrý
- 251-350 → 🔵 Vysoký
- \> 350 → 🟣 Velmi vysoký

#### Těžká půda (T):
- ≤ 105 mg/kg → 🔴 Nízký
- 106-170 → 🟠 Vyhovující
- 171-300 → 🟢 Dobrý
- 301-450 → 🔵 Vysoký
- \> 450 → 🟣 Velmi vysoký

---

## 📋 Živiny které se obarvují

### ✅ Obarvené podle kategorie:
1. **Ca** (Vápník) - mg/kg
2. **Mg** (Hořčík) - mg/kg
3. **K** (Draslík) - mg/kg
4. **P** (Fosfor) - mg/kg
5. **S** (Síra) - mg/kg

### 🟡 Speciální logika:
- **K/Mg poměr** - vlastní pravidla:
  - 1.5-2.5 → 🟢 Zelená (optimální)
  - 1.2-1.5 nebo 2.5-3.5 → 🟡 Žlutá (+ K nebo + Mg)
  - < 1.2 nebo > 3.5 → 🔴 Červená (kritický)

- **pH** - vlastní škála (nezměněno):
  - < 5.0 → 🔴 Červená (kritický stav)
  - 5.0-5.5 → 🟠 Oranžová
  - 5.5-6.0 → 🟡 Žlutá
  - \> 6.0 → 🟢 Zelená

---

## 🔧 Technické změny

### 1. Nový import
```typescript
import { categorizeNutrient, type NutrientCategory } from '@/lib/utils/soil-categories'
```

### 2. Helper funkce
```typescript
// Převod kategorie na RGB barvu
function getNutrientColorRGB(category: NutrientCategory | null): [number, number, number]

// Převod řetězce půdního typu na SoilType enum
function parseSoilType(soilTypeStr: string): SoilType
```

### 3. Aktualizovaná logika v `didParseCell`
```typescript
// Získání typu půdy z řádku
const soilType = parseSoilType(rowData[4]) // Column 4 = 'Druh půdy'

// Kategorizace živiny
const category = categorizeNutrient('Ca', ca, soilType)

// Aplikace barvy
const color = getNutrientColorRGB(category)
data.cell.styles.textColor = color
```

---

## 🧪 Testování

### Před release:

1. **Exportujte PDF** z "Tabulkový přehled vápnění"
2. **Zkontrolujte barvy** u pozemků s různými hodnotami:
   - 🔴 Nízké hodnoty Ca/Mg/K/P/S (červená)
   - 🟠 Vyhovující hodnoty (oranžová)
   - 🟢 Dobré hodnoty (zelená)
   - 🔵 Vysoké hodnoty (modrá)
   - 🟣 Velmi vysoké hodnoty (fialová)
3. **Porovnejte s portálem** - barvy musí být **IDENTICKÉ**

---

## 📚 Zdroje

- **Metodika:** Vyhláška č. 335/2017 Sb. (ÚKZÚZ)
- **Funkce:** `demon-agro/lib/utils/soil-categories.ts`
- **Komponenta portálu:** `demon-agro/components/portal/TabulkovyPrehledVapneni.tsx`

---

## 📝 Changelog

### V2.1 - 2026-01-17
- ✅ Integrace `categorizeNutrient()` funkce
- ✅ Podpora 5-barevného systému
- ✅ Zohlednění typu půdy (L/S/T)
- ✅ 100% shoda barev s portálem

### V2.0 - 2026-01-04
- ✅ Podpora českých znaků (Roboto font)
- ✅ Profesionální layout
- ✅ Inteligentní doporučení
- ❌ Zjednodušený 3-barevný systém živin

---

## 🎯 Výsledek

**PDF nyní zobrazuje barvy hodnot živin PŘESNĚ STEJNĚ jako v portálu!** 🎉

```
PORTÁL (tabulka) ←→ PDF (export)
    🔴 Červená   =   🔴 Červená
    🟠 Oranžová  =   🟠 Oranžová
    🟢 Zelená    =   🟢 Zelená
    🔵 Modrá     =   🔵 Modrá
    🟣 Fialová   =   🟣 Fialová
```

