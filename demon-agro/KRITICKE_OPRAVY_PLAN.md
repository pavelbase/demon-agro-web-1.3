# 🔧 KRITICKÉ OPRAVY - Plán vápnění

**Datum:** 2026-01-03  
**Priorita:** 🔴 KRITICKÉ  
**Status:** ✅ OPRAVENO

---

## 🐛 PROBLÉMY IDENTIFIKOVANÉ

### 1. ❌ Sloupec CaO zobrazoval špatnou hodnotu
**Problém:** Zobrazovalo se 3.00 t CaO/ha místo 0.25 t CaO/ha  
**Příčina:** Nebyla - výpočet byl správný (`totalCaoThisApp`), ale možná chyba v ukládání nebo zobrazení

### 2. ❌ Chyběl druhý produkt v aplikaci
**Problém:** Kombinace dolomit + vápenec se neukládala do DB  
**Příčina:** API ukládalo jen první produkt (`app.product`), ignorovalo `app.products[]`

### 3. ❌ Celkový plán nepokrýval potřebu
**Problém:** Potřeba 60 t CaO → Plán 16.7 t CaO (chybí 43.3 t!)  
**Příčina:** Podmínka `currentPh < input.targetPh` ukončila cyklus předčasně

### 4. ✅ Predikce pH (už bylo správně)
Predikce již používala `totalCaoThisApp` - správně!

---

## ✅ OPRAVY IMPLEMENTOVANÉ

### Oprava 1: Podmínka while cyklu

**PŘED:**
```typescript
while (remainingCaoPerHa > 0.1 && applications.length < maxApplications && currentPh < input.targetPh)
```
❌ Problém: Ukončí se, když pH dosáhne cíle, i když zbývá CaO

**PO:**
```typescript
while (remainingCaoPerHa > 0.1 && applications.length < maxApplications)
```
✅ Řešení: Pokračuj, dokud není pokryta CELKOVÁ potřeba CaO

---

### Oprava 2: Ukládání více produktů do DB

**PŘED:**
```typescript
const applicationsToInsert = plan.applications.map(app => ({
  lime_product_id: app.product.id,  // JEN první produkt
  dose_per_ha: app.dosePerHa,
  cao_per_ha: app.caoPerHa,         // Celková hodnota, ale produkt jen jeden!
  // ...
}))
```
❌ Problém: Když je kombinace (dolomit + vápenec), uložil se jen dolomit

**PO:**
```typescript
plan.applications.forEach(app => {
  if (app.products && app.products.length > 0) {
    // Vytvoř záznam PRO KAŽDÝ produkt
    app.products.forEach((productDose, subIndex) => {
      applicationsToInsert.push({
        lime_product_id: productDose.product.id,
        dose_per_ha: productDose.dosePerHa,       // Správná dávka TOHOTO produktu
        cao_per_ha: productDose.caoPerHa,         // Správné CaO TOHOTO produktu
        sequence_order: app.sequenceOrder + (subIndex / 100), // 1.00, 1.01, 1.02
        // ...
      })
    })
  }
})
```
✅ Řešení: Vytvoř samostatný DB záznam pro každý produkt v aplikaci

---

### Oprava 3: Debug logování

Přidáno logování pro diagnostiku:

```typescript
console.log('🔍 LIMING PLAN SUMMARY:', {
  totalCaoNeedPerHa: totalCaoNeedPerHa.toFixed(2),
  totalCaoApplied: totalCaoApplied.toFixed(2),
  remainingCaoPerHa: remainingCaoPerHa.toFixed(2),
  applicationsCount: applications.length,
  finalPh: applications[applications.length - 1].phAfter
})
```

---

## 📊 OČEKÁVANÉ VÝSLEDKY

### Příklad: pH 5.0 → 6.5, Mg 99, Střední půda

**Před opravami:**
```
Potřeba: 60.0 t CaO
Plán:    16.7 t CaO (28%)
Chybí:   43.3 t CaO ❌

Aplikace:
2026: Dolomit 0.83 t/ha → 0.25 t CaO (pH 5.0→5.1)
2029: Dolomit 0.83 t/ha → 0.25 t CaO (pH 5.1→5.2)
...
Ukončeno když pH dosáhlo cílové hodnoty ❌
```

**Po opravách:**
```
Potřeba: 60.0 t CaO
Plán:    60.0 t CaO (100%) ✅
Zbývá:   0.0 t CaO

Aplikace:
2026: 
  - Dolomit mletý 0.83 t/ha → 0.25 t CaO + 150 kg MgO
  - Vápenec mletý 4.33 t/ha → 2.25 t CaO
  CELKEM: 2.50 t CaO/ha = 25.0 t CaO

2027:
  - Dolomit mletý 0.83 t/ha → 0.25 t CaO + 150 kg MgO
  - Vápenec mletý 4.33 t/ha → 2.25 t CaO
  CELKEM: 2.50 t CaO/ha = 25.0 t CaO

2029:
  - Vápenec mletý 1.92 t/ha → 1.00 t CaO
  CELKEM: 1.00 t CaO/ha = 10.0 t CaO

Pokračuje dokud není pokryto 60 t CaO ✅
```

---

## 📁 ZMĚNĚNÉ SOUBORY

### 1. `lib/utils/liming-calculator.ts`
- ✅ Opravena podmínka `while` cyklu (řádek 441)
- ✅ Přidáno debug logování (řádek 587-600)
- ✅ Vylepšeno upozornění při zbývající potřebě

### 2. `app/api/portal/liming-plans/generate/route.ts`
- ✅ Přepsána logika ukládání aplikací (řádek 192-251)
- ✅ Podpora více produktů v jedné aplikaci
- ✅ Správné `cao_per_ha` pro každý produkt zvlášť

### ❌ CO NEBYLO ZMĚNĚNO:
- Databázová struktura (zachována)
- SQL migrace (žádné)
- Názvy sloupců (beze změny)

---

## 🧪 JAK TESTOVAT

### Test 1: Kontrola pokrytí celkové potřeby

1. Vytvoř plán pro pozemek s pH 5.0 → 6.5
2. Zkontroluj v konzoli:
   ```
   🔍 LIMING PLAN SUMMARY:
   totalCaoNeedPerHa: 6.00
   totalCaoApplied: 6.00   ← MUSÍ BÝT STEJNÉ!
   remainingCaoPerHa: 0.00 ← MUSÍ BÝT 0!
   ```

### Test 2: Kontrola zobrazení více produktů

1. Vytvoř plán s nízkým Mg (< 120 mg/kg)
2. V databázi (`liming_applications`) zkontroluj:
   ```sql
   SELECT year, sequence_order, product_name, dose_per_ha, cao_per_ha
   FROM liming_applications
   WHERE liming_plan_id = 'XXX'
   ORDER BY sequence_order;
   
   Očekáváno:
   2026  1.00  Dolomit mletý   0.83  0.25
   2026  1.01  Vápenec mletý   4.33  2.25  ← DRUHÝ produkt!
   2027  2.00  Dolomit mletý   0.83  0.25
   2027  2.01  Vápenec mletý   4.33  2.25
   ```

### Test 3: Kontrola hodnoty CaO

1. Pro každý záznam v DB:
   ```
   cao_per_ha = dose_per_ha × (cao_content / 100)
   
   Příklad:
   0.83 × 0.30 = 0.249 ≈ 0.25 ✅
   4.33 × 0.52 = 2.252 ≈ 2.25 ✅
   ```

---

## ⚠️ MOŽNÉ UPOZORNĚNÍ

Pokud se zobrazí:
```
⚠️ POZOR: Plán nedosahuje plné potřeby CaO!
Zbývá X.XX t CaO/ha
```

**Možné příčiny:**
1. Dosažen limit 8 aplikací (ochrana proti year > 2050)
2. Cílové pH je příliš vysoké (nedosažitelné s dostupnými produkty)
3. Nedostatečné produkty v databázi

**Řešení:** Zkontrolovat console log a warnings.

---

## ✅ ZÁVĚR

### Co bylo opraveno:
1. ✅ Plán nyní pokrývá **CELKOVOU potřebu CaO** (ne jen do cílového pH)
2. ✅ Více produktů v jedné aplikaci se **správně ukládá do DB**
3. ✅ Každý produkt má **správnou hodnotu `cao_per_ha`**
4. ✅ Debug logování pro snadnou diagnostiku

### Co otestovat:
- Pokrytí celkové potřeby (60 t → 60 t ✅)
- Zobrazení obou produktů (dolomit + vápenec)
- Správné hodnoty CaO (0.25 + 2.25 = 2.50 ✅)

---

**Status:** ✅ Připraveno k testování!




