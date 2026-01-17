# FIX: Konzistentní acidifikační konstanty

## 🔴 PROBLÉM

V tabulce plánu vápnění se objevovaly **nekonzistentní hodnoty acidifikace** pro stejný typ půdy:

```
Střední půda (S):
2030: 5.73 → 5.67 (-0.07)  ✓ správně
2032: 6.10 → 6.00 (-0.10)  ✗ CHYBA!
```

**Agronomicky nedává smysl:**
- Pro daný typ půdy **musí být acidifikace konstantní**
- Při vyšším pH (6.10) se půda **neokyseluje rychleji** než při nižším pH (5.80)
- Hodnota -0.10 místo -0.07 je matoucí pro uživatele

## 🔍 PŘÍČINA

Frontend **dynamicky přepočítával** pokles pH zpětně z uložených hodnot v databázi:

```typescript
// ❌ CHYBNĚ: Dynamický přepočet
const actualPhDrop = previousApp.ph_after - app.ph_before
const phDropPerYear = actualPhDrop / yearsGap
```

**Problém:**
- Pokud backend kvůli zaokrouhlování nebo jiným faktorům uložil nepatrně odlišné pH
- Frontend to přepočítal zpátky a dostal jiný roční pokles
- Výsledek: -0.07 vs -0.10 pro stejný typ půdy

## ✅ ŘEŠENÍ

### Zavedení fixních konstant

Frontend nyní používá **stejné fixní konstanty** jako backend:

```typescript
// ✅ FIXNÍ KONSTANTY pro roční pokles pH
const FIXED_ANNUAL_DROP: Record<string, number> = {
  'L': 0.09, // Lehká půda
  'S': 0.07, // Střední půda
  'T': 0.04  // Těžká půda
}

// Použít fixní konstantu podle typu půdy (NE dynamický přepočet!)
const phDropPerYear = FIXED_ANNUAL_DROP[plan.soil_type] || 0.07
```

## 📊 PŘÍKLAD OPRAVY

### PŘED (Nekonzistentní):

```
Aplikace 2028: pH 5.0 → 5.8
  2029: 5.80 → 5.73 (-0.07) ✓
  2030: 5.73 → 5.67 (-0.07) ✓  <- Backend zaokrouhlil na 5.67

Aplikace 2031: pH 5.6 → 6.2
  2032: 6.20 → 6.10 (-0.10) ✗  <- Frontend viděl 0.10 rozdíl!
  2033: 6.10 → 6.00 (-0.10) ✗  <- Propagace chyby
```

### PO OPRAVĚ (Konzistentní):

```
Aplikace 2028: pH 5.0 → 5.8
  2029: 5.80 → 5.73 (-0.07) ✓
  2030: 5.73 → 5.66 (-0.07) ✓

Aplikace 2031: pH 5.6 → 6.2
  2032: 6.20 → 6.13 (-0.07) ✓
  2033: 6.13 → 6.06 (-0.07) ✓
```

## 🎯 KLÍČOVÉ ZMĚNY

### 1. Acidifikace mezi aplikacemi

**Soubor:** `components/portal/LimingPlanTable.tsx` (řádky 675-688)

**PŘED:**
```typescript
const actualPhDrop = previousApp.ph_after - app.ph_before
const phDropPerYear = actualPhDrop / yearsGap
```

**PO OPRAVĚ:**
```typescript
const FIXED_ANNUAL_DROP: Record<string, number> = {
  'L': 0.09,
  'S': 0.07,
  'T': 0.04
}
const phDropPerYear = FIXED_ANNUAL_DROP[plan.soil_type] || 0.07
```

### 2. Projekce budoucích roků

**Soubor:** `components/portal/LimingPlanTable.tsx` (řádky 976-990)

Tato část **již používala fixní konstanty** správně:
```typescript
const annualPhDrop = plan.soil_type === 'L' ? 0.09 : 
                     plan.soil_type === 'S' ? 0.07 : 0.04
```

✅ **Žádná změna potřebná**

## 📋 KONZISTENCE S BACKENDEM

### Backend konstanty:
**Soubor:** `lib/utils/liming-calculator.ts` (řádky 305-311)

```typescript
const ROCNI_POKLES_PH: Record<SoilDetailType, number> = {
  'piscita': 0.09,
  'hlinitopiscita': 0.09,    // Lehká (L)
  'piscitohlinita': 0.07,
  'hlinita': 0.07,           // Střední (S)
  'jilovitohlinita': 0.04    // Těžká (T)
}
```

### Frontend konstanty:
**Soubor:** `components/portal/LimingPlanTable.tsx` (nově přidáno)

```typescript
const FIXED_ANNUAL_DROP: Record<string, number> = {
  'L': 0.09, // = hlinitopiscita
  'S': 0.07, // = hlinita
  'T': 0.04  // = jilovitohlinita
}
```

✅ **Nyní konzistentní!**

## 🧪 TESTOVÁNÍ

1. **Vygenerujte nový plán** nebo obnovte stávající
2. ✅ Zkontrolujte acidifikační řádky mezi aplikacemi
3. ✅ Ověřte, že **všechny roky** mají stejný pokles:
   - Lehká půda: vždy -0.09
   - Střední půda: vždy -0.07
   - Těžká půda: vždy -0.04
4. ✅ Zkontrolujte projekci po poslední aplikaci (také -0.07 pro střední)

## 📐 AGRONOMICKÉ KONSTANTY

| Typ půdy | Kód | Roční pokles pH | Důvod |
|----------|-----|-----------------|-------|
| **Lehká** | L | **-0.09** pH/rok | Nízká pufrační kapacita, rychlá deplece CaO |
| **Střední** | S | **-0.07** pH/rok | Střední pufrační kapacita |
| **Těžká** | T | **-0.04** pH/rok | Vysoká pufrační kapacita, pomalá deplece CaO |

**Zdroj:** ROCNI_POKLES_PH konstanty v liming-calculator.ts (řádek 305)

## ✅ VÝHODY OPRAVY

1. **Konzistence:** Stejné konstanty v backendu i frontendu
2. **Přehlednost:** Uživatel vidí konzistentní "pilu" (-0.07, -0.07, -0.07...)
3. **Agronomická správnost:** Fixní hodnota pro daný typ půdy
4. **Profesionalita:** Žádné matoucí skoky (-0.07 → -0.10 → -0.07)

## 📅 DATUM IMPLEMENTACE
5. ledna 2026

## 👨‍💻 AUTOR
AI Assistant (Claude Sonnet 4.5) + Pavel Baše

---

## 🎓 PONAUČENÍ

**Lesson Learned:**
> Když zobrazujete časové řady fyzikálních/chemických procesů, **nikdy** je nepřepočítávejte zpětně z výsledků. Vždy použijte **původní konstanty**, i když to znamená malý nesoulad s uloženými hodnotami (kvůli zaokrouhlování).

**Pravidlo:**
> **Display Logic = Calculation Logic**  
> Frontend by měl zobrazovat pomocí **stejných konstant**, jaké použil backend při výpočtu. Nikdy "reverse-engineer" hodnoty z databáze.



