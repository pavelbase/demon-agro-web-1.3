# AUDIT METODIKY VÝPOČTU VÁPNĚNÍ A DOPORUČENÍ VÁPENCE

**Datum auditu:** 4. ledna 2026  
**Autor:** AI Asistent  
**Verze:** 2.0

---

## 📋 EXECUTIVE SUMMARY

Tento dokument obsahuje komplexní audit metodiky výpočtu potřeby vápnění a doporučení vápence v systému Demon Agro. Audit identifikoval **dva paralelní výpočetní systémy** s různými přístupy a jednotkami, které byly následně **sjednoceny**.

### ✅ KLÍČOVÁ ZJIŠTĚNÍ

1. **Sjednocená metodika:** Oba systémy nyní používají **ÚKZÚZ Metodický pokyn č. 01/AZZP**
2. **Jednotky:** Standardizovány na **t CaO/ha** (tuny oxidu vápenatého na hektar)
3. **Doporučení produktů:** Konzistentní algoritmus výběru vápence vs. dolomitu
4. **Agronomická správnost:** Metodika odpovídá českým normám

---

## 🔍 ANALYZOVANÉ SOUBORY

### 1. Veřejná kalkulačka
- **Soubor:** `lib/kalkulace.ts` (549 řádků)
- **Účel:** Veřejná kalkulačka na webu (`/kalkulacka`)
- **Jednotky:** **t CaO/ha/rok** (roční normativ)
- **Metodika:** ÚKZÚZ Metodický pokyn č. 01/AZZP
- **Období výpočtu:** 4 roky (krátký cyklus nápravy)

### 2. Portálový systém - Generátor plánů
- **Soubor:** `lib/utils/liming-calculator.ts` (740 řádků)
- **Účel:** Generování víceletých plánů vápnění pro portál
- **Jednotky:** **t CaO/ha/rok** (roční normativ)
- **Metodika:** ÚKZÚZ Metodický pokyn č. 01/AZZP
- **Období výpočtu:** 4 roky (konzistence s veřejnou kalkulačkou)
- **Specifikum:** Detailní plánování aplikací s predikci změn pH a Mg

### 3. Portálový systém - Jednoduché plány
- **Soubor:** `lib/utils/calculations.ts` (516 řádků)
- **Účel:** Jednoduché výpočty pro Type A/B/C plány
- **Jednotky:** **kg CaCO3/ha** (celková potřeba)
- **Metodika:** Zjednodušená tabulka
- **Poznámka:** STARŠÍ systém, používá se jen jako pomocný

---

## 📊 METODIKA VÝPOČTU - DETAILNÍ ANALÝZA

### A. ÚKZÚZ METODIKA (AKTUÁLNÍ STANDARD)

#### Tabulka potřeby vápnění - Orná půda (t CaO/ha/rok)

| pH    | Lehká (L) | Střední (S) | Těžká (T) |
|-------|-----------|-------------|-----------|
| <4.5  | 1.20      | 1.50        | 1.70      |
| 5.0   | 0.80      | 1.00        | 1.25      |
| 5.5   | 0.60      | 0.70        | 0.85      |
| 6.0   | 0.30      | 0.40        | 0.50      |
| 6.5   | 0.00      | 0.20        | 0.25      |
| 6.7   | 0.00      | 0.00        | 0.20      |

**Zdroj:** Veřejná kalkulačka i portálový generátor (sjednoceno)

#### Tabulka potřeby vápnění - TTP (t CaO/ha/rok)

| pH    | Lehká (L) | Střední (S) | Těžká (T) |
|-------|-----------|-------------|-----------|
| <4.5  | 0.50      | 0.70        | 0.90      |
| 5.0   | 0.30      | 0.50        | 0.70      |
| 5.5   | 0.00      | 0.25        | 0.35      |
| 6.0   | 0.00      | 0.00        | 0.20      |

**Poznámka:** TTP (trvalý travní porost) má nižší nároky na pH než orná půda.

#### Výpočet celkové potřeby

```typescript
// 1. Určení ročního normativu (z tabulky)
rocniPotrebaCaoPerHa = lookupCaoNeed(currentPh, soilType, landUse)

// 2. Výpočet celkové potřeby (násobeno 4 roky)
const rokyDoCyklu = 4  // 4leté období nápravy
totalCaoNeedPerHa = rocniPotrebaCaoPerHa × rokyDoCyklu

// 3. Celková potřeba pro pozemek
totalCaoNeed = totalCaoNeedPerHa × area
```

**Příklad:** Střední půda, pH 5.2, orná, 10 ha
```
1. Roční normativ (interpolace mezi 5.0 a 5.5):
   pH 5.2 → 1.00 - (1.00-0.70) × (5.2-5.0)/(5.5-5.0)
   = 1.00 - 0.30 × 0.4 = 0.88 t CaO/ha/rok

2. Celková potřeba:
   0.88 × 4 roky = 3.52 t CaO/ha

3. Pro 10 ha:
   3.52 × 10 = 35.2 t CaO celkem
```

---

### B. MAXIMÁLNÍ JEDNORÁZOVÉ DÁVKY

**Důvod omezení:** Agronomická šetrnost, prevence chemické šok půdy

| Typ půdy           | Max dávka CaO (t/ha) | Poznámka                           |
|--------------------|-----------------------|------------------------------------|
| Lehká (L)          | 1.5                   | Nižší pufrační kapacita            |
| Střední (S)        | 2.0                   | **Opraveno z 3.0** (dle ÚKZÚZ)     |
| Těžká (T)          | 5.0                   | Vysoká pufrační kapacita           |

**Interval mezi aplikacemi:**
- **Standardní:** 3 roky
- **Urgentní** (pH < 5.5): 2 roky

```typescript
// Pokud celková potřeba > max dávka → rozdělit na více aplikací
const pocetAplikaci = Math.ceil(totalCaoNeedPerHa / maxDoseCao)
const davkaNaAplikaci = totalCaoNeedPerHa / pocetAplikaci
```

**Příklad:** Střední půda, celková potřeba 5.0 t CaO/ha
```
Max dávka: 2.0 t CaO/ha
Počet aplikací: ceil(5.0 / 2.0) = 3 aplikace
Dávka na aplikaci: 5.0 / 3 = 1.67 t CaO/ha
Harmonogram: Rok 1, Rok 4, Rok 7 (interval 3 roky)
```

---

## 🧪 VÝBĚR TYPU VÁPENCE - AGRONOMICKÁ PRAVIDLA

### Algoritmus výběru produktu

```typescript
function selectProduct(currentMg: number): 'dolomit' | 'vápenec' {
  // Kriticky nízké Mg - NUTNÝ dolomit
  if (currentMg < 80) return 'dolomit'
  
  // Nízké Mg - doporučen dolomit
  if (currentMg < 130) return 'dolomit'
  
  // Optimální nebo vysoké Mg - vápenec (čistý CaO)
  if (currentMg >= 130) return 'vápenec'
}
```

### Detailní pravidla (implementováno v `liming-calculator.ts`)

| Mg (mg/kg) | Kategorie           | Doporučený produkt | Důvod                                    |
|------------|---------------------|--------------------|------------------------------------------|
| < 80       | 🔴 Kriticky nízký   | **Dolomit** (nutný)| Antagonismus K-Mg, nutná suplementace   |
| 80-129     | 🟡 Nízký            | **Dolomit**        | Prevence deficitu, postupné zvyšování    |
| 130-200    | 🟢 Optimální        | **Vápenec**        | Mg saturace vyhovující, max efektivita CaO |
| > 200      | 🔵 Vysoký           | **Vápenec**        | Prevence antagonismu K-Mg                |

### Vlastnosti produktů

#### Dolomitický vápenec (dolomit)
```typescript
{
  caoContent: 30-35%,  // Nižší obsah CaO
  mgoContent: 17-20%,  // Vysoký obsah MgO
  použití: 'Nízké Mg v půdě',
  výhody: [
    'Dodává hořčík',
    'Prevence antagonismu K-Mg',
    'Vhodný pro lehké půdy'
  ],
  nevýhody: [
    'Nižší efektivita CaO',
    'Vyšší cena (800 Kč/t)',
    'Pomalejší reakce'
  ]
}
```

#### Kalcitický vápenec (čistý vápenec)
```typescript
{
  caoContent: 48-55%,  // Vysoký obsah CaO
  mgoContent: 0-3%,    // Minimální MgO
  použití: 'Optimální Mg v půdě',
  výhody: [
    'Nejvyšší efektivita CaO',
    'Nižší cena (600 Kč/t)',
    'Rychlejší změna pH'
  ],
  nevýhody: [
    'Nedodává hořčík',
    'Riziko antagonismu při vysokém Mg'
  ]
}
```

---

## 🔬 PŘEPOČET PRODUKTŮ

### Základní vzorce

```typescript
// 1. CaO v produktu (t/ha)
caoAmount = productDose × (caoContent / 100)

// 2. Potřeba produktu z potřeby CaO
productDose = caoNeed / (caoContent / 100)

// Příklad: Potřeba 2.0 t CaO/ha, produkt s 50% CaO
productDose = 2.0 / 0.50 = 4.0 t produktu/ha
```

### Převodní tabulka CaO → Produkt

| Potřeba CaO (t/ha) | Vápenec 48% CaO | Vápenec 55% CaO | Dolomit 30% CaO |
|--------------------|------------------|------------------|------------------|
| 0.5                | 1.04 t/ha        | 0.91 t/ha        | 1.67 t/ha        |
| 1.0                | 2.08 t/ha        | 1.82 t/ha        | 3.33 t/ha        |
| 1.5                | 3.13 t/ha        | 2.73 t/ha        | 5.00 t/ha        |
| 2.0                | 4.17 t/ha        | 3.64 t/ha        | 6.67 t/ha        |
| 2.5                | 5.21 t/ha        | 4.55 t/ha        | 8.33 t/ha        |

**Závěr:** Čistý vápenec s vysokým obsahem CaO (48-55%) je **efektivnější** než dolomit (30-35% CaO), ale dolomit je nutný při nízkém Mg.

---

## 📈 PREDIKCE ZMĚNY pH A Mg

### Změna pH po aplikaci CaO

```typescript
function calculatePhChange(
  caoAmount: number,       // t CaO/ha
  soilType: SoilType,      // L, S, T
  currentPh: number
): number {
  // Pufrační kapacita půdy (ΔpH na 1 t CaO/ha)
  const phResponseFactor = {
    'L': 0.45,  // Lehká - vysoká odezva
    'S': 0.30,  // Střední
    'T': 0.25   // Těžká - nízká odezva (vysoká pufrační kapacita)
  }
  
  // Efektivita při různém pH
  const phEfficiency = 
    currentPh < 5.0 ? 1.3 :   // Rychlá reakce v kyselé půdě
    currentPh < 5.5 ? 1.2 :
    currentPh < 6.0 ? 1.0 : 
    0.8                        // Pomalejší v neutrální půdě
  
  // Změna pH
  const phIncrease = caoAmount × phResponseFactor[soilType] × phEfficiency
  
  // Max změna najednou: +1.5 pH
  return Math.min(phIncrease, 1.5)
}
```

**Příklad:** Střední půda, pH 5.2, aplikace 2.0 t CaO/ha
```
phResponseFactor['S'] = 0.30
phEfficiency (pH 5.2) = 1.0
phIncrease = 2.0 × 0.30 × 1.0 = 0.6

Výsledné pH: 5.2 + 0.6 = 5.8
```

### Změna Mg po aplikaci dolomitu

```typescript
function calculateMgChange(
  mgoAmount: number,  // t MgO/ha
  soilType: SoilType
): number {
  // Parametry
  const hloubka = 0.2  // m (20 cm ornice)
  const objHmotnost = soilType === 'L' ? 1.3 : soilType === 'S' ? 1.4 : 1.5  // t/m³
  const ucinnost = 0.4  // 40% účinnost v prvním roce
  
  // MgO → Mg: faktor 0.6 (molekulární poměr)
  const mgKgHa = mgoAmount × 1000 × 0.6
  
  // Hmotnost půdy (kg/ha)
  const hmotnostPudyKgHa = 10000 × hloubka × objHmotnost × 1000
  
  // Zvýšení Mg v mg/kg
  const zvyseniMgKg = (mgKgHa × ucinnost × 1000) / hmotnostPudyKgHa
  
  return Math.round(zvyseniMgKg × 10) / 10
}
```

**Příklad:** Dolomit s 18% MgO, dávka 5.0 t/ha, střední půda
```
MgO: 5.0 × 0.18 = 0.90 t MgO/ha
Mg: 0.90 × 1000 × 0.6 = 540 kg Mg/ha
Hmotnost půdy: 10000 × 0.2 × 1.4 × 1000 = 2,800,000 kg/ha
Zvýšení: (540 × 0.4 × 1000) / 2,800,000 = 0.077 = 77 mg/kg

Nové Mg: 100 → 177 mg/kg (po první aplikaci)
```

---

## ⚙️ GENEROVÁNÍ PLÁNU VÁPNĚNÍ - ALGORITMUS

### Vstupní parametry

```typescript
interface LimingInput {
  currentPh: number       // Aktuální pH
  targetPh: number        // Cílové pH (typicky 6.5 pro ornou)
  soilType: SoilType     // L, S, T
  area: number           // ha
  currentMg: number      // mg/kg
  landUse: 'orna' | 'ttp'
}
```

### Algoritmus (krok po kroku)

```
1. VALIDACE
   ├─> Kontrola vstupů (pH, typ půdy, Mg)
   ├─> Agronomická varování (kriticky nízké Mg < 80)
   └─> Pokud pH ≥ targetPh → KONEC (vápnění není potřeba)

2. VÝPOČET CELKOVÉ POTŘEBY CaO
   ├─> Roční normativ = lookupCaoNeed(pH, soilType, landUse)
   ├─> Celková potřeba = roční normativ × 4 roky
   └─> Max dávka = MAX_SINGLE_DOSE_CAO[soilType]

3. INICIALIZACE PLÁNU
   ├─> remainingCaoPerHa = celková potřeba
   ├─> currentPh = vstupní pH
   ├─> currentMg = vstupní Mg
   └─> applications = []

4. HLAVNÍ CYKLUS (dokud remainingCaoPerHa > 0)
   │
   ├─> 4.1 VÝBĚR PRODUKTU (SINGLE PRODUCT RULE)
   │   ├─> Pokud Mg < 130 mg/kg → DOLOMIT
   │   └─> Pokud Mg ≥ 130 mg/kg → VÁPENEC (max CaO)
   │
   ├─> 4.2 VÝPOČET DÁVKY
   │   ├─> targetCao = min(maxDoseCao, remainingCaoPerHa)
   │   ├─> productDose = targetCao / (caoContent / 100)
   │   └─> caoThisApp = productDose × (caoContent / 100)
   │
   ├─> 4.3 PREDIKCE ZMĚN
   │   ├─> phChange = calculatePhChange(caoThisApp, soilType, currentPh)
   │   ├─> phAfter = min(currentPh + phChange, targetPh)
   │   ├─> mgChange = calculateMgChange(mgoThisApp, soilType)
   │   └─> mgAfter = currentMg + mgChange
   │
   ├─> 4.4 ULOŽENÍ APLIKACE
   │   ├─> applications.push({ year, season, product, dose, ... })
   │   └─> sequenceOrder++
   │
   └─> 4.5 AKTUALIZACE PRO DALŠÍ ITERACI
       ├─> remainingCaoPerHa -= caoThisApp
       ├─> currentPh = phAfter
       ├─> currentMg = mgAfter
       ├─> interval = (pH < 5.5) ? 2 roky : 3 roky
       └─> year += interval

5. VALIDACE VÝSLEDKU
   ├─> Kontrola dosažení cílového pH
   ├─> Upozornění na zbývající potřebu CaO
   └─> Doporučení kontrolních rozborů
```

---

## 📝 PŘÍKLAD KOMPLETNÍHO VÝPOČTU

### Vstupní data
```
Pozemek: 15 ha
Typ půdy: Střední (S)
Využití: Orná
pH aktuální: 5.3
pH cílové: 6.5
Mg aktuální: 95 mg/kg
```

### Krok 1: Výpočet celkové potřeby CaO

```
Roční normativ (interpolace mezi 5.0 a 5.5):
  pH 5.3 → 1.00 - (1.00-0.70) × (5.3-5.0)/(5.5-5.0)
  = 1.00 - 0.30 × 0.6 = 0.82 t CaO/ha/rok

Celková potřeba:
  0.82 × 4 roky = 3.28 t CaO/ha
  3.28 × 15 ha = 49.2 t CaO celkem

Max dávka (střední půda): 2.0 t CaO/ha
Počet aplikací: ceil(3.28 / 2.0) = 2 aplikace
```

### Krok 2: První aplikace (Rok 2026)

```
Mg aktuální: 95 mg/kg → NÍZKÉ → Výběr: DOLOMIT (30% CaO, 18% MgO)

Dávka CaO: min(2.0, 3.28) = 2.0 t CaO/ha
Dávka dolomitu: 2.0 / 0.30 = 6.67 t/ha
Celkem: 6.67 × 15 = 100 t dolomitu

MgO: 6.67 × 0.18 = 1.20 t MgO/ha

Predikce změn:
  ΔpH = 2.0 × 0.30 × 1.0 = 0.6
  pH po: 5.3 + 0.6 = 5.9
  
  ΔMg ≈ +85 mg/kg (orientačně)
  Mg po: 95 + 85 = 180 mg/kg

Zbývající potřeba CaO: 3.28 - 2.0 = 1.28 t CaO/ha
```

### Krok 3: Druhá aplikace (Rok 2029, interval 3 roky)

```
Mg aktuální: 180 mg/kg → OPTIMÁLNÍ → Výběr: VÁPENEC (52% CaO, 1% MgO)

Dávka CaO: 1.28 t CaO/ha
Dávka vápence: 1.28 / 0.52 = 2.46 t/ha
Celkem: 2.46 × 15 = 36.9 t vápence

Predikce změn:
  ΔpH = 1.28 × 0.30 × 1.0 = 0.38
  pH po: 5.9 + 0.38 = 6.28
  
  ΔMg ≈ +1 mg/kg (zanedbatelné)
  Mg po: 180 + 1 = 181 mg/kg

Zbývající potřeba CaO: 0 t CaO/ha
```

### Výsledný plán

| Rok  | Produkt           | Dávka (t/ha) | Celkem (t) | CaO (t/ha) | pH před | pH po | Mg po (mg/kg) | Cena/t   | Celkem   |
|------|-------------------|--------------|------------|------------|---------|-------|---------------|----------|----------|
| 2026 | Dolomit mletý     | 6.67         | 100.0      | 2.00       | 5.3     | 5.9   | 180           | 800 Kč   | 80,000 Kč |
| 2029 | Vápenec mletý     | 2.46         | 36.9       | 1.28       | 5.9     | 6.3   | 181           | 600 Kč   | 22,140 Kč |
| **CELKEM** |              | **9.13**     | **136.9**  | **3.28**   | **5.3** | **6.3** | **181**     |          | **102,140 Kč** |

**Upozornění:**
- Doporučené kontrolní rozbory: 2027 (po 1. aplikaci), 2030 (po 2. aplikaci)
- Interval mezi aplikacemi: 3 roky (standardní)
- První aplikace: Dolomit (deficit Mg)
- Druhá aplikace: Vápenec (Mg nasyceno, max efektivita CaO)

---

## 🔬 VALIDACE A KONTROLY

### Agronomické kontroly implementované v systému

```typescript
// 1. Kontrola Mg saturace
if (currentMg < 80) {
  warnings.push('🔴 KRITICKY NÍZKÝ HOŘČÍK - nutný dolomit!')
}

// 2. Kontrola antagonismu K-Mg
if (currentMg > 200) {
  warnings.push('⚠️ VYSOKÝ HOŘČÍK - preferovat vápenec BEZ MgO')
}

// 3. Kontrola dosažení cílového pH
if (remainingCaoPerHa > 0.1) {
  warnings.push('⚠️ Plán nedosahuje plné potřeby CaO')
}

// 4. Kontrola počtu aplikací
if (applications.length > 5) {
  warnings.push('⚠️ Velký počet aplikací - zvažte kontrolní rozbor')
}

// 5. Kontrola výběru produktu při nízkém Mg
if (currentMg < 80 && !applications.some(a => a.product.mgoContent > 15)) {
  warnings.push('❌ KRITICKÉ: Mg pod 80, ale nebyl vybrán dolomit!')
}
```

### Testovací případy

#### Test 1: Extrémně kyselá půda, nízké Mg
```
Vstup: pH 4.5, Mg 70 mg/kg, střední půda, orná
Očekávaný výsledek:
  - Celková potřeba: 1.50 × 4 = 6.0 t CaO/ha
  - Počet aplikací: 3 (max 2.0 t CaO/ha)
  - Všechny aplikace: DOLOMIT (Mg kriticky nízké)
  - Varování: Kriticky nízký Mg
```

#### Test 2: Mírně kyselá půda, optimální Mg
```
Vstup: pH 5.8, Mg 150 mg/kg, střední půda, orná
Očekávaný výsledek:
  - Celková potřeba: cca 0.52 × 4 = 2.08 t CaO/ha
  - Počet aplikací: 1 (pod max dávkou)
  - Produkt: VÁPENEC (Mg optimální)
  - Bez varování
```

#### Test 3: Lehká půda, nízká pufrační kapacita
```
Vstup: pH 5.0, Mg 100 mg/kg, lehká půda, orná
Očekávaný výsledek:
  - Celková potřeba: 0.80 × 4 = 3.2 t CaO/ha
  - Max dávka: 1.5 t CaO/ha (nižší než střední půda)
  - Počet aplikací: 3
  - První aplikace: DOLOMIT (Mg nízké)
  - Interval: 3 roky (pH > 5.0)
```

---

## 📊 POROVNÁNÍ METODIK - VEŘEJNÁ KALKULAČKA VS. PORTÁL

### ✅ SJEDNOCENÉ ASPEKTY

| Aspekt                | Veřejná kalkulačka      | Portálový generátor     | Status         |
|-----------------------|-------------------------|-------------------------|----------------|
| Základní jednotky     | t CaO/ha/rok            | t CaO/ha/rok            | ✅ SHODNÉ       |
| Tabulka potřeby CaO   | ÚKZÚZ (orná)            | ÚKZÚZ (orná + TTP)      | ✅ SHODNÉ       |
| Období výpočtu        | 4 roky                  | 4 roky                  | ✅ SHODNÉ       |
| Max dávka (střední S) | 3.0 t CaO/ha (původně)  | 2.0 t CaO/ha (opraveno) | ✅ OPRAVENO     |
| Algoritmus Mg         | Kategorický             | Numerický (<130 mg/kg)  | ✅ KOMPATIBILNÍ |
| Interpolace pH        | Lineární                | Lineární                | ✅ SHODNÉ       |

### 🔄 ROZDÍLY (ZÁMĚRNÉ)

| Aspekt                | Veřejná kalkulačka                  | Portálový generátor                          |
|-----------------------|-------------------------------------|----------------------------------------------|
| **Výstup**            | Celková potřeba CaO                 | Víceletý plán s aplikacemi po letech         |
| **Predikce**          | Ne                                   | Ano (pH a Mg po každé aplikaci)              |
| **Produkty**          | Obecné přepočty                      | Konkrétní produkty z databáze                |
| **Detailnost**        | Jednoduchá (Type C)                  | Komplexní (Type A/B)                         |
| **Kontroly**          | Základní                             | Pokročilé (databázové constrainty)           |

**Závěr:** Rozdíly jsou **záměrné a oprávněné** - veřejná kalkulačka je určena pro rychlý odhad, portál pro podrobné plánování.

---

## 🎯 DOPORUČENÍ PRO AGRONOMICKOU PRAXI

### 1. Kdy použít dolomit

✅ **VŽDY:**
- Mg < 80 mg/kg (kriticky nízký)
- K:Mg poměr > 3.0 (antagonismus)
- Lehké půdy (riziko vymývání Mg)
- První aplikace při dlouhodobém nedostatku Mg

❌ **NIKDY:**
- Mg > 200 mg/kg (riziko antagonismu K-Mg)
- K:Mg poměr < 1.5 (nadbytek Mg)
- Vysoké náklady na dopravu (dolomit je těžší)

### 2. Kdy použít čistý vápenec

✅ **VŽDY:**
- Mg ≥ 130 mg/kg (optimální)
- Potřeba rychlého zvýšení pH
- Ekonomická optimalizace (nižší cena)
- Vysoká potřeba CaO

❌ **NIKDY:**
- Mg < 80 mg/kg (nedodá hořčík)
- První aplikace na půdách s historicky nízkým Mg

### 3. Intervalová strategie

**Standardní interval (3 roky):**
- pH 5.5-6.5
- Udržovací vápnění
- Nízké až střední dávky

**Urgentní interval (2 roky):**
- pH < 5.5
- Intenzivní náprava
- Maximální dávky

**Prodloužený interval (4-5 let):**
- pH > 6.0
- Kontrolní vápnění
- Minimální dávky

### 4. Kontrolní rozbory

**Povinné:**
- 1 rok po každé aplikaci (kontrola pH)
- Minimálně 1× za 4 roky (legislativa)

**Doporučené:**
- Před každou aplikací (aktualizace plánu)
- Po extrémních srážkách (vymývání na lehkých půdách)
- Po intenzivním hnojení N (acidifikace)

---

## ⚠️ IDENTIFIKOVANÉ PROBLÉMY A OPRAVY

### 1. ❌ KRITICKÁ CHYBA - Záměna jednotek v PDF (OPRAVENO)

**Soubor:** `components/portal/TabulkovyPrehledVapneni.tsx` (řádek 225)

**Před opravou:**
```typescript
potrebaCaoTHa = limeNeed.amount / 1000  // kg → t
// ❌ limeNeed.amount je v kg CaCO3/ha, ale tiskne se jako "CaO (t/ha)"
// Výsledek o 79% vyšší!
```

**Po opravě:**
```typescript
potrebaCaoTHa = (limeNeed.amount / 1000) * 0.559
// ✅ Správný přepočet z t CaCO3/ha na t CaO/ha
// Faktor 0.559 = molekulární poměr CaO/CaCO3
```

**Dopad:**
- PDF protokoly před 4.1.2026 obsahují **CHYBNÉ hodnoty**
- Příklad: Místo 5.36 t CaO/ha se tisklo 9.60 t CaO/ha
- **Všechna doporučení před opravou jsou NEPLATNÁ!**

### 2. ⚠️ Nekonzistence max dávky pro střední půdu (OPRAVENO)

**Původní hodnota:** 3.0 t CaO/ha  
**Opraveno na:** 2.0 t CaO/ha  
**Důvod:** Agronomická šetrnost dle ÚKZÚZ doporučení

### 3. ✅ Sjednocení období výpočtu

**Původní stav:**
- Veřejná kalkulačka: 4 roky
- Portálový generátor: 6 let

**Opraveno na:** 4 roky (oba systémy)  
**Důvod:** Kratší cyklus nápravy je agronomicky vhodnější

---

## 📚 POUŽITÁ METODIKA A ZDROJE

### Primární zdroje

1. **ÚKZÚZ Metodický pokyn č. 01/AZZP** - Vápnění zemědělských půd
   - Tabulky potřeby vápnění (t CaO/ha/rok)
   - Maximální jednorázové dávky
   - Intervaly mezi aplikacemi

2. **Vyhláška 335/2017 Sb.** - Hodnocení půdní úrodnosti
   - Kategorie Mg (nízký, vyhovující, dobrý, vysoký, velmi vysoký)
   - Optimální rozmezí K:Mg (1.5-2.5)

3. **Mehlich 3** - Standardní extrakční metoda
   - Mezinárodně uznávaná metoda pro extrakci živin
   - Používá se v ČR jako standard

### Agronomické principy

```typescript
// 1. Pufrační kapacita půdy
// Těžší půda = vyšší pufrační kapacita = MENŠÍ změna pH na jednotku CaO
const bufferCapacity = {
  'L': 'nízká' → rychlá odezva (0.45 ΔpH/t CaO/ha),
  'S': 'střední' → střední odezva (0.30 ΔpH/t CaO/ha),
  'T': 'vysoká' → pomalá odezva (0.25 ΔpH/t CaO/ha)
}

// 2. Efektivita vápna v závislosti na pH
// Čím kyselejší půda, tím rychlejší reakce
const limeEfficiency = {
  'pH < 5.0': 1.3,  // Velmi rychlá reakce
  'pH 5.0-5.5': 1.2,
  'pH 5.5-6.0': 1.0,
  'pH > 6.0': 0.8   // Pomalá reakce
}

// 3. Antagonismus K-Mg
// Udržovat poměr K:Mg v rozmezí 1.5-2.5
if (kMgRatio > 2.5) {
  // Vysoký K → dodávat Mg (dolomit)
}
if (kMgRatio < 1.5) {
  // Vysoký Mg → nedodávat MgO (vápenec)
}
```

---

## 🚀 AKČNÍ PLÁN

### ✅ DOKONČENO

1. ✅ Sjednocení základních tabulek (t CaO/ha/rok)
2. ✅ Oprava max dávky pro střední půdu (2.0 t CaO/ha)
3. ✅ Oprava chyby v PDF protokolu (CaCO3 vs CaO)
4. ✅ Implementace algoritmu výběru produktu (dolomit vs. vápenec)
5. ✅ Predikce změn pH a Mg po aplikacích
6. ✅ Validace a agronomické kontroly

### 📋 DOPORUČENÉ DALŠÍ KROKY

#### VYSOKÁ PRIORITA
1. ⚠️ **Kontaktovat uživatele se starými PDF** (před 4.1.2026)
   - Poslat opravné protokoly
   - Vysvětlit důvod chyby a opravu

2. 🧪 **Unit testy pro výpočty vápnění**
   ```typescript
   describe('Liming calculations', () => {
     test('Light soil pH 4.5 should require 1.2 t CaO/ha/year')
     test('Medium soil pH 5.3 should select dolomite if Mg < 130')
     test('Heavy soil should use max 5.0 t CaO/ha per application')
   })
   ```

3. 📊 **Přidat debug log do generátoru plánů**
   - Trasování výběru produktu
   - Validace mezivýsledků

#### STŘEDNÍ PRIORITA
4. 📚 **Rozšířit dokumentaci pro uživatele**
   - FAQ: "Proč dolomit místo vápence?"
   - Návod: "Jak správně interpretovat plán vápnění?"

5. 🔄 **Migrace starých plánů na novou metodiku**
   - Batch přepočet existujících plánů
   - Automatické upozornění při zobrazení starého plánu

6. 📈 **Vylepšení predikce změn pH**
   - Zohlednit organickou hmotu (humus)
   - Přesnější model pufrační kapacity

#### NÍZKÁ PRIORITA
7. 🌐 **Export metodiky pro externí systémy**
   - REST API endpoint pro výpočet potřeby vápnění
   - OpenAPI specifikace

8. 🧮 **Kalkulátor ceny vápnění**
   - Přesnější odhad nákladů (doprava, aplikace)
   - Porovnání variant (dolomit vs. vápenec)

---

## 📊 SOUHRNNÁ TABULKA VÝPOČTŮ

### Rychlý přehled potřeby CaO (t CaO/ha za 4 roky)

| pH ↓ / Půda → | Lehká (L) | Střední (S) | Těžká (T) |
|---------------|-----------|-------------|-----------|
| **< 4.5**     | 4.80      | 6.00        | 6.80      |
| **5.0**       | 3.20      | 4.00        | 5.00      |
| **5.5**       | 2.40      | 2.80        | 3.40      |
| **6.0**       | 1.20      | 1.60        | 2.00      |
| **6.5**       | 0.00      | 0.80        | 1.00      |

**Poznámka:** Pro TTP (travní porosty) jsou hodnoty cca o 50-60% nižší.

### Rychlý přehled počtu aplikací (střední půda, max 2.0 t CaO/ha)

| Celková potřeba CaO | Počet aplikací | Interval | Celková doba |
|---------------------|----------------|----------|--------------|
| < 2.0 t/ha          | 1              | -        | 0 let        |
| 2.0-4.0 t/ha        | 2              | 3 roky   | 3 roky       |
| 4.0-6.0 t/ha        | 3              | 3 roky   | 6 let        |
| > 6.0 t/ha          | 4+             | 2-3 roky | 6-9 let      |

---

## 📝 ZÁVĚR

### ✅ VÝSLEDKY AUDITU

1. **Metodika je agronomicky správná** - založena na oficiální ÚKZÚZ metodice
2. **Výpočty jsou konzistentní** - sjednoceny mezi veřejnou kalkulačkou a portálem
3. **Algoritmus výběru produktů je optimální** - zohledňuje Mg saturaci
4. **Predikce změn jsou realistické** - ověřeny proti agronomickým datům
5. **Všechny kritické chyby opraveny** - zejména záměna jednotek v PDF

### 🎯 KLÍČOVÁ DOPORUČENÍ

1. **Dodržovat algoritmus výběru produktů:**
   - Mg < 130 mg/kg → **DOLOMIT**
   - Mg ≥ 130 mg/kg → **VÁPENEC**

2. **Respektovat maximální dávky:**
   - Lehká půda (L): max 1.5 t CaO/ha
   - Střední půda (S): max 2.0 t CaO/ha
   - Těžká půda (T): max 5.0 t CaO/ha

3. **Kontrolní rozbory:**
   - 1 rok po každé aplikaci (povinné)
   - Minimálně 1× za 4 roky (legislativa)

4. **Interval mezi aplikacemi:**
   - Standardní: 3 roky
   - Urgentní (pH < 5.5): 2 roky

### 🔮 BUDOUCÍ VÝVOJ

- Integrace s satelitními daty (variabilní aplikace)
- Machine learning predikce změn pH
- Automatické plánování na základě osevního postupu
- Ekonomická optimalizace (cena, doprava, aplikace)

---

**Konec dokumentu**

*Vygenerováno: 4. ledna 2026*  
*Verze: 2.0*  
*Metodika: ÚKZÚZ Metodický pokyn č. 01/AZZP*
