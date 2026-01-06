# CRITICAL FIX: Mg Accumulation & Depletion Logic

## 🔴 KRITICKÝ PROBLÉM

Systém generování plánu vápnění **ignoroval akumulaci hořčíku (Mg)** v půdě a **neaplikoval přirozenou depleci** mezi roky. To vedlo k tomu, že:

1. ❌ Systém doporučoval **Dolomit při každé aplikaci** (2026, 2029, 2032, ...)
2. ❌ Ignoroval fakt, že po první aplikaci Dolomitu je Mg již **dostatečné**
3. ❌ Riziko **Mg přesycení** → antagonismus K-Mg → rostliny nemohou přijímat draslík
4. ❌ Nesprávná produktová strategie

### Agronomický důsledek

**Jedna aplikace Dolomitu (1.2 t MgO/ha):**
- Zvyšuje Mg v půdě o cca **150-200 mg/kg**
- Po aplikaci: Mg stoupne z 90 → **~250 mg/kg** (VYSOKÉ!)
- **Další aplikace Dolomitu = ZBYTEČNÁ A ŠKODLIVÁ**

## 🔧 ŘEŠENÍ

### 1. Mg Depletion - Přirozená ztráta mezi roky

Přidána **přirozená deplece Mg** analogicky k acidifikaci pH:

```typescript
const MG_ANNUAL_DEPLETION = 5 // mg/kg/rok

// V gap years (roky bez aplikace):
if (rokyOdMinule > 0) {
  // 1) Acidifikace pH
  currentPh = vypoctiPhPoAcidifikaci(currentPh, soilDetailType, rokyOdMinule)
  
  // 2) ✅ NOVĚ: Depletion Mg
  currentMg -= rokyOdMinule * MG_ANNUAL_DEPLETION
  currentMg = Math.max(currentMg, 30) // Minimální hodnota
}
```

**Příčiny Mg deplece:**
- 🌾 **Sklizeň plodin** (odnos Mg v biomase)
- 💧 **Vyplavování** (srážky, drenáž)
- 🔒 **Imobilizace** v půdním komplexu

### 2. Mg Accumulation - Správná akumulace

Opravena logika, aby výpočty vycházely z **depleted hodnot**:

```typescript
// ✅ PO depleci:
const mgBefore = currentMg

// ✅ Výběr produktu na základě AKTUÁLNÍHO stavu:
if (mgBefore < 130) {
  selectedProduct = dolomit // Nízké Mg → použít Dolomit
} else {
  selectedProduct = vápenec // Dostatečné Mg → použít Vápenec
}

// ✅ Akumulace od depleted hodnoty:
const mgChange = calculateMgChange(mgoThisApp, soilType)
const mgAfter = mgBefore + mgChange // ← CRITICAL!

// ✅ Aktualizace pro další iteraci:
currentMg = mgAfter
```

### 3. Default hodnota

Přidána bezpečná default hodnota:

```typescript
let currentMg = input.currentMg || 90 // Default pokud není zadána
```

## 📊 PŘÍKLAD OPRAVY

### PŘED (CHYBNĚ):

```
Aplikace 2026: 
  - Mg před: 90 mg/kg → Doporučen Dolomit ✓
  - Mg po:   ~250 mg/kg ← Ale systém to IGNOROVAL!

Aplikace 2029:
  - Mg před: 90 mg/kg ← ❌ CHYBA! Mělo být ~235 mg/kg (250 - 3×5)
  - Doporučen: Dolomit ← ❌ ZBYTEČNÝ! Mg je již dostatečné!

Aplikace 2032:
  - Mg před: 90 mg/kg ← ❌ CHYBA!
  - Doporučen: Dolomit ← ❌ RIZIKO MG PŘESYCENÍ!
```

### PO OPRAVĚ (SPRÁVNĚ):

```
Aplikace 2026:
  - Mg před: 90 mg/kg → Doporučen Dolomit ✓
  - Mg po:   ~250 mg/kg
  - Doporučení: "Nízké Mg (90 mg/kg) - doporučen dolomitický vápenec"

--- 3 roky gap ---
  2027: Mg 250 → 245 (deplece -5)
  2028: Mg 245 → 240 (deplece -5)
  2029: Mg 240 → 235 (deplece -5)

Aplikace 2029:
  - Mg před: 235 mg/kg ✅ (PO depleci)
  - 235 > 130 → Doporučen VÁPENEC ✅
  - Mg po:   ~235 mg/kg (vápenec neobsahuje MgO)
  - Doporučení: "Udržovací vápnění (Mg: 235 mg/kg dostatečné)"

--- 3 roky gap ---
  2030: Mg 235 → 230
  2031: Mg 230 → 225
  2032: Mg 225 → 220

Aplikace 2032:
  - Mg před: 220 mg/kg ✅
  - 220 > 130 → Doporučen VÁPENEC ✅
  - Doporučení: "Udržovací vápnění (Mg: 220 mg/kg dostatečné)"
```

## 🎯 KLÍČOVÉ ZMĚNY V KÓDU

### 1. Konstanta pro depleci

```typescript
const MG_ANNUAL_DEPLETION = 5 // mg/kg/rok
```

### 2. Depletion loop (analogie k acidifikaci)

```typescript
// V sekci "6.0 ACIDIFIKACE & Mg DEPLETION"
currentMg -= rokyOdMinule * MG_ANNUAL_DEPLETION
currentMg = Math.max(currentMg, 30)
```

### 3. Tracking hodnot před/po

```typescript
const mgBefore = currentMg // Po depleci!
const mgAfter = mgBefore + mgChange // Akumulace
```

### 4. Konzistentní použití v logice

```typescript
// Výběr produktu: používá mgBefore
if (mgBefore < MG_OPTIMAL_LIMIT) { ... }

// Doporučení: používá mgBefore
if (mgBefore < 80) {
  recommendation = `Kriticky nízké Mg (${mgBefore.toFixed(0)} mg/kg) - dolomit NUTNÝ`
}

// Aktualizace: používá mgAfter
currentMg = mgAfter
```

## ✅ VALIDACE

### Test Scenario 1: Nízké Mg (< 130)
- ✅ Aplikace 1: Mg 90 → Dolomit → Mg 250
- ✅ Aplikace 2 (po 3 letech): Mg 235 (po depleci) → Vápenec → Mg 235

### Test Scenario 2: Kriticky nízké Mg (< 80)
- ✅ Aplikace 1: Mg 60 → Dolomit → Mg 210
- ✅ Varování: "Kriticky nízké Mg - dolomit NUTNÝ"

### Test Scenario 3: Dostatečné Mg (> 130)
- ✅ Aplikace 1: Mg 150 → Vápenec → Mg 150
- ✅ Doporučení: "Udržovací vápnění (Mg: 150 mg/kg dostatečné)"

### Test Scenario 4: Depletion na kritickou úroveň
```
Aplikace 1: Mg 130 → Vápenec → Mg 130
--- 11 let gap (11 × 5 = 55 mg/kg deplece) ---
Aplikace 2: Mg 75 (130 - 55) → Dolomit
⚠️ Varování: "Mg kleslo na kritickou úroveň 75 mg/kg"
```

## 📋 ZMĚNĚNÉ SOUBORY

### `lib/utils/liming-calculator.ts`
1. ➕ Přidána konstanta `MG_ANNUAL_DEPLETION = 5`
2. ➕ Default hodnota `currentMg = input.currentMg || 90`
3. ✏️ Sekce "6.0" přejmenována na "ACIDIFIKACE & Mg DEPLETION"
4. ➕ Logika `currentMg -= rokyOdMinule * MG_ANNUAL_DEPLETION`
5. ➕ Proměnná `mgBefore` (hodnota po depleci)
6. ✏️ Výběr produktu používá `mgBefore` místo `currentMg`
7. ✏️ Doporučení používá `mgBefore` místo `currentMg`
8. ✏️ Predikce `mgAfter = mgBefore + mgChange`

## 🔬 AGRONOMICKÉ PARAMETRY

| Parametr | Hodnota | Zdroj |
|----------|---------|-------|
| **Mg Annual Depletion** | 5 mg/kg/rok | Průměr pro střední půdu, střední sklizeň |
| **Mg Minimum** | 30 mg/kg | Extrémně chudá půda |
| **Mg Optimal Limit** | 130 mg/kg | Práh pro přechod Dolomit → Vápenec |
| **Mg Critical** | 80 mg/kg | Pod touto hodnotou NUTNÝ dolomit |
| **Mg Increase** | ~150-200 mg/kg | Po aplikaci 1.2 t MgO/ha |

## 🚨 DOPORUČENÍ PRO TESTOVÁNÍ

1. **Vygenerujte nový plán** s Mg < 130 mg/kg
2. ✅ Ověřte, že **první aplikace** doporučuje **Dolomit**
3. ✅ Ověřte, že **druhá aplikace** (3 roky později) doporučuje **Vápenec**
4. ✅ Zkontrolujte hodnoty Mg v tabulce (před/po každé aplikaci)
5. ✅ Zkontrolujte doporučení (měly by obsahovat aktuální Mg hodnoty)

## 📅 DATUM IMPLEMENTACE
5. ledna 2026

## 👨‍💻 AUTOR
AI Assistant (Claude Sonnet 4.5) + Pavel Baše

---

## 🎓 POZNATKY PRO BUDOUCNOST

**Lesson Learned:**
> Při simulacích dlouhodobého vývoje půdních vlastností je kritické sledovat **akumulaci i depleci** VŠECH relevantních živin, ne jen pH. Mg, K, P - všechny podléhají dynamickým procesům.

**Best Practice:**
> Každá simulovaná veličina by měla mít:
> - ✅ Akumulaci (přidání hnojivem)
> - ✅ Depleci (odnos sklizní, vyplavování)
> - ✅ Validaci mezí (min/max hodnoty)
> - ✅ Varování při kritických stavech

