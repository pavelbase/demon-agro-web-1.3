# AUDIT METODIKY VÝPOČTU ŽIVIN A VÁPNĚNÍ

**Datum auditu:** 4. ledna 2026  
**Autor:** AI Asistent  
**Verze:** 1.0

---

## 📋 PŘEHLED

Tento dokument obsahuje kompletní audit metodiky výpočtu živin mezi **veřejnou kalkulačkou** (`/kalkulacka`) a **portálem** (`/portal`). Audit odhalil **kritické rozdíly** v metodice výpočtu vápnění, které mohou vést k odlišným doporučením pro uživatele.

---

## 🔍 ANALYZOVANÉ SOUBORY

### Veřejná kalkulačka
- **Soubor:** `demon-agro/lib/kalkulace.ts` (549 řádků)
- **Použití:** Veřejně dostupná kalkulačka na webu (`/kalkulacka`)
- **API:** `demon-agro/app/(public)/kalkulacka/page.tsx`

### Portálová metodika
- **Soubor:** `demon-agro/lib/utils/calculations.ts` (516 řádků)
- **Použití:** Portál pro registrované uživatele
- **Komponenta:** `demon-agro/components/portal/LimingPlanGenerator.tsx`

---

## ⚠️ KRITICKÉ ROZDÍLY

### 1. JEDNOTKY VÁPNĚNÍ

#### 🔴 VEŘEJNÁ KALKULAČKA - **t CaO/ha** (tuny oxidu vápenatého)
```typescript
// demon-agro/lib/kalkulace.ts
const LIME_NEED_TABLE_CAO_YEARLY: Record<TypPudy, Record<string, number>> = {
  L: { // Lehká půda
    '4.0': 1.20,  // t CaO/ha/rok
    '4.5': 1.20,
    '5.0': 0.80,
    '5.5': 0.60,
    '6.0': 0.30,
    '6.5': 0,
  },
  S: { // Střední půda
    '4.0': 1.50,  // t CaO/ha/rok
    '4.5': 1.50,
    '5.0': 1.00,
    '5.5': 0.70,
    '6.0': 0.40,
    '6.5': 0.20,
  },
  T: { // Těžká půda
    '4.0': 1.70,  // t CaO/ha/rok
    '4.5': 1.70,
    '5.0': 1.25,
    '5.5': 0.85,
    '6.0': 0.50,
    '6.5': 0.25,
  },
}

// Výpočet celkové potřeby - násobí roční normativ 4 roky
const rokyNapravy = 4;
const celkovaPotrebaCaO_t = rocniNormativ * rokyNapravy;
```

**Poznámka:** Tato metodika odpovídá **ÚKZÚZ Metodickému pokynu č. 01/AZZP**, který definuje roční normativy vápnění v jednotkách **t CaO/ha/rok**.

---

#### 🟢 PORTÁL - **kg CaCO3/ha** (kilogramy uhličitanu vápenatého)
```typescript
// demon-agro/lib/utils/calculations.ts
export const LIME_NEED_TABLE: Record<SoilType, Record<string, number>> = {
  L: { // Lehká půda
    '4.0': 8000,  // kg CaCO3/ha (celková potřeba)
    '4.5': 6000,
    '5.0': 4000,
    '5.5': 2000,
    '6.0': 0,
    '6.5': 0,
  },
  S: { // Střední půda
    '4.0': 12000, // kg CaCO3/ha
    '4.5': 9000,
    '5.0': 6000,
    '5.5': 3000,
    '6.0': 1000,
    '6.5': 0,
  },
  T: { // Těžká půda
    '4.0': 16000, // kg CaCO3/ha
    '4.5': 12000,
    '5.0': 8000,
    '5.5': 4000,
    '6.0': 2000,
    '6.5': 0,
  },
}

// Výpočet - hodnoty již představují celkovou potřebu
// Žádné násobení roky není potřeba
```

**Poznámka:** Tato metodika používá standardní jednotku **kg CaCO3/ha**, která je běžná v mezinárodní agronomické praxi.

---

### 2. PŘEPOČET MEZI CaO a CaCO3

Pro převod mezi těmito jednotkami platí následující vztah:

**1 kg CaO = 1.79 kg CaCO3**  
**1 t CaO = 1.79 t CaCO3 = 1790 kg CaCO3**

#### Příklad výpočtu pro lehkou půdu při pH 4.0:

**Veřejná kalkulačka:**
```
Roční normativ: 1.20 t CaO/ha/rok
Celková potřeba (4 roky): 1.20 × 4 = 4.8 t CaO/ha
Přepočet na CaCO3: 4.8 × 1.79 = 8,592 kg CaCO3/ha ≈ 8,600 kg CaCO3/ha
```

**Portál:**
```
Celková potřeba: 8,000 kg CaCO3/ha
```

**Rozdíl:** ~600 kg CaCO3/ha (7% rozdíl)

---

### 3. POROVNÁNÍ HODNOT PRO VŠECHNY TYPY PŮD

#### Lehká půda (L)

| pH  | Veřejná kalkulačka<br/>(t CaO/ha × 4 roky) | Přepočet na<br/>kg CaCO3/ha | Portál<br/>(kg CaCO3/ha) | Rozdíl<br/>(kg CaCO3/ha) | Rozdíl % |
|-----|---------------------------------------------|----------------------------|--------------------------|------------------------|----------|
| 4.0 | 1.20 × 4 = 4.8                              | 8,592                      | 8,000                    | +592                   | +7%      |
| 4.5 | 1.20 × 4 = 4.8                              | 8,592                      | 6,000                    | +2,592                 | +43%     |
| 5.0 | 0.80 × 4 = 3.2                              | 5,728                      | 4,000                    | +1,728                 | +43%     |
| 5.5 | 0.60 × 4 = 2.4                              | 4,296                      | 2,000                    | +2,296                 | +115%    |
| 6.0 | 0.30 × 4 = 1.2                              | 2,148                      | 0                        | +2,148                 | +∞       |
| 6.5 | 0.0                                         | 0                          | 0                        | 0                      | 0%       |

---

#### Střední půda (S)

| pH  | Veřejná kalkulačka<br/>(t CaO/ha × 4 roky) | Přepočet na<br/>kg CaCO3/ha | Portál<br/>(kg CaCO3/ha) | Rozdíl<br/>(kg CaCO3/ha) | Rozdíl % |
|-----|---------------------------------------------|----------------------------|--------------------------|------------------------|----------|
| 4.0 | 1.50 × 4 = 6.0                              | 10,740                     | 12,000                   | -1,260                 | -11%     |
| 4.5 | 1.50 × 4 = 6.0                              | 10,740                     | 9,000                    | +1,740                 | +19%     |
| 5.0 | 1.00 × 4 = 4.0                              | 7,160                      | 6,000                    | +1,160                 | +19%     |
| 5.5 | 0.70 × 4 = 2.8                              | 5,012                      | 3,000                    | +2,012                 | +67%     |
| 6.0 | 0.40 × 4 = 1.6                              | 2,864                      | 1,000                    | +1,864                 | +186%    |
| 6.5 | 0.20 × 4 = 0.8                              | 1,432                      | 0                        | +1,432                 | +∞       |

---

#### Těžká půda (T)

| pH  | Veřejná kalkulačka<br/>(t CaO/ha × 4 roky) | Přepočet na<br/>kg CaCO3/ha | Portál<br/>(kg CaCO3/ha) | Rozdíl<br/>(kg CaCO3/ha) | Rozdíl % |
|-----|---------------------------------------------|----------------------------|--------------------------|------------------------|----------|
| 4.0 | 1.70 × 4 = 6.8                              | 12,172                     | 16,000                   | -3,828                 | -31%     |
| 4.5 | 1.70 × 4 = 6.8                              | 12,172                     | 12,000                   | +172                   | +1%      |
| 5.0 | 1.25 × 4 = 5.0                              | 8,950                      | 8,000                    | +950                   | +12%     |
| 5.5 | 0.85 × 4 = 3.4                              | 6,086                      | 4,000                    | +2,086                 | +52%     |
| 6.0 | 0.50 × 4 = 2.0                              | 3,580                      | 2,000                    | +1,580                 | +79%     |
| 6.5 | 0.25 × 4 = 1.0                              | 1,790                      | 0                        | +1,790                 | +∞       |

---

## 📊 ZJIŠTĚNÍ

### 1. Konzistence v rozsahu pH 4.0-5.0

V rozsahu **extrémně kyselých půd (pH 4.0-5.0)** jsou rozdíly mezi metodikami **relativně malé** (±7% až ±43% u lehkých půd, ±11% až +31% u těžkých půd).

### 2. Velké rozdíly v rozsahu pH 5.5-6.5

V rozsahu **mírně kyselých půd (pH 5.5-6.5)** se metodiky **výrazně liší**:
- Veřejná kalkulačka doporučuje vápnění i při pH 6.0-6.5
- Portál doporučuje vápnění pouze při pH < 6.0 (lehká), < 6.5 (střední), < 6.5 (těžká)

**Příklad:** Střední půda s pH 6.0
- Veřejná kalkulačka: **2,864 kg CaCO3/ha**
- Portál: **1,000 kg CaCO3/ha**
- Rozdíl: **186%**

### 3. Kritické pH hodnoty

**Veřejná kalkulačka** považuje za optimální pH:
- Lehká půda (L): 5.7 - 6.3 (cíl 6.0)
- Střední půda (S): 6.2 - 6.8 (cíl 6.5)
- Těžká půda (T): 6.5 - 7.1 (cíl 6.8)

**Portál** považuje za optimální pH:
- Lehká půda (L): cíl 6.0 (orná), 5.5 (TTP)
- Střední půda (S): cíl 6.5 (orná), 6.0 (TTP)
- Těžká půda (T): cíl 6.8 (orná), 6.3 (TTP)

**Shodné cílové pH hodnoty → konzistentní!**

---

## 🔬 METODIKA VÝPOČTU ŽIVIN (P, K, Mg, Ca, S)

### ✅ KONZISTENCE

Obě metodiky používají **identickou metodiku** pro hodnocení živin:

1. **Kategorizace podle typu půdy** (L, S, T)
2. **Pět tříd zásobenosti:** Nízký, Vyhovující, Dobrý, Vysoký, Velmi vysoký
3. **Mehlich 3** jako metoda extrakce
4. **Identické hranice kategorií** pro všechny živiny

#### Příklad - Fosfor (P) v mg/kg:

| Třída           | Lehká (L) | Střední (S) | Těžká (T) |
|-----------------|-----------|-------------|-----------|
| Nízký           | ≤50       | ≤100        | ≤105      |
| Vyhovující      | 51-80     | 101-160     | 106-170   |
| Dobrý           | 81-125    | 161-250     | 171-300   |
| Vysoký          | 126-170   | 251-350     | 301-450   |
| Velmi vysoký    | ≥171      | ≥351        | ≥451      |

**✅ SHODNÉ v obou souborech!**

---

### ✅ VÝPOČET DEFICITU

Obě metodiky používají **identický vzorec**:

```typescript
// Deficit v kg/ha: (cíl - aktuální) × koeficient
const deficit = (stred - aktualni) * 4.2;
```

**Koeficient 4.2** odpovídá:
- Ornice: 30 cm
- Objemová hmotnost: 1.4 g/cm³

**✅ SHODNÉ v obou souborech!**

---

### ✅ POMĚR K:Mg

Obě metodiky hodnotí poměr K:Mg stejně:

| Poměr K:Mg | Hodnocení  | Doporučení                              |
|------------|------------|-----------------------------------------|
| < 1.5      | Nízký      | Snížit dávky hořčíku                   |
| 1.5-2.5    | Optimální  | Poměr je v pořádku                     |
| > 2.5      | Vysoký     | Dolomitický vápenec nebo zvýšit Mg     |

**✅ SHODNÉ v obou souborech!**

---

## 🎯 DOPORUČENÍ

### 1. SJEDNOTIT METODIKU VÁPNĚNÍ ⚠️ KRITICKÉ

**Problém:** Dvě různé metodiky vedou k různým doporučením pro stejnou situaci.

**Doporučení:**
- **Rozhodnout, která metodika je oficiální:**
  - **Varianta A:** ÚKZÚZ roční normativy (t CaO/ha/rok) → **veřejná kalkulačka** ✅ Vhodnější pro ČR
  - **Varianta B:** Celková potřeba (kg CaCO3/ha) → **portál**

- **Preferujeme Variantu A (ÚKZÚZ metodika)**, protože:
  - Je založena na oficiálním českém metodickém pokynu
  - Lépe zohledňuje roční normativy a přirozené okyselování půdy
  - Více odpovídá podmínkám v České republice

**Akce:**
```typescript
// UPRAVIT: demon-agro/lib/utils/calculations.ts
// Nahradit tabulku kg CaCO3/ha tabulkou t CaO/ha/rok
// Přidat výpočet s násobením 4 roky (nebo 6 let pro dlouhodobý plán)
```

---

### 2. PŘIDAT PŘEPOČTOVÉ FUNKCE

**Vytvořit utility funkce pro převod mezi jednotkami:**

```typescript
/**
 * Převod CaO na CaCO3
 * 1 kg CaO = 1.79 kg CaCO3
 */
export function caoToCaco3(cao: number): number {
  return cao * 1.79;
}

/**
 * Převod CaCO3 na CaO
 * 1 kg CaCO3 = 0.559 kg CaO
 */
export function caco3ToCao(caco3: number): number {
  return caco3 * 0.559;
}

/**
 * Přepočet na mletý vápenec (48% CaO)
 */
export function caoToLimestone(cao: number, caoContent: number = 0.48): number {
  return cao / caoContent;
}
```

---

### 3. VALIDACE A TESTY

**Vytvořit unit testy** pro ověření konzistence výpočtů:

```typescript
describe('Liming calculations consistency', () => {
  test('Light soil pH 4.0 - both methods should align', () => {
    const publicResult = calculatePublicLiming('L', 4.0);
    const portalResult = calculatePortalLiming('L', 4.0);
    
    // Convert to same unit (kg CaCO3/ha)
    const publicCaCO3 = caoToCaco3(publicResult.cao * 1000); // t → kg
    
    expect(Math.abs(publicCaCO3 - portalResult.caco3)).toBeLessThan(1000); // ±1t tolerance
  });
});
```

---

### 4. DOKUMENTACE PRO UŽIVATELE

**Přidat do UI vysvětlení metodiky:**

- **Veřejná kalkulačka:** Zobrazit poznámku "Dle ÚKZÚZ Metodického pokynu č. 01/AZZP"
- **Portál:** Zobrazit poznámku o použité metodice a rozdílech oproti veřejné kalkulačce (pokud zůstane rozdíl)

---

## 📝 ZÁVĚR

### ✅ CO FUNGUJE DOBŘE

1. **Metodika hodnocení živin** (P, K, Mg, Ca, S) je **konzistentní** v obou systémech
2. **Kategorizace půd** (L, S, T) je **sjednocená**
3. **Výpočet deficitu** používá **stejný vzorec**
4. **Poměr K:Mg** je hodnocen **identicky**
5. **Cílové pH hodnoty** jsou **shodné**

### ⚠️ CO JE TŘEBA OPRAVIT

1. **KRITICKÉ:** Metodika výpočtu potřeby vápnění se **výrazně liší**
   - Veřejná kalkulačka: t CaO/ha/rok × 4 roky
   - Portál: kg CaCO3/ha (celková potřeba)
   - Rozdíly až **186%** v doporučených dávkách!

2. **Chybějící přepočtové funkce** mezi CaO a CaCO3

3. **Nedostatečná dokumentace** rozdílů v UI

---

## 🚀 PRIORITNÍ AKCE

### ⚠️ **KRITICKÁ CHYBA NALEZENA A OPRAVENA!** (4. ledna 2026)

**Soubor:** `demon-agro/components/portal/TabulkovyPrehledVapneni.tsx`  
**Řádek:** 225  
**Problém:** Záměna jednotek CaCO3 ↔ CaO v PDF protokolu

```typescript
// PŘED OPRAVOU (CHYBA):
potrebaCaoTHa = limeNeed.amount / 1000 // převod z kg na tuny
// ❌ limeNeed.amount je v kg CaCO3/ha, ale výsledek se tiskne jako "CaO (t/ha)"

// PO OPRAVĚ (SPRÁVNĚ):
potrebaCaoTHa = (limeNeed.amount / 1000) * 0.559
// ✅ Správný přepočet z t CaCO3/ha na t CaO/ha
```

**Dopad chyby:**
- PDF protokoly generované před 4.1.2026 obsahují **CHYBNÉ hodnoty** o 79% vyšší
- Příklad: Místo správných 5.36 t CaO/ha se tisklo 9.60 t CaO/ha
- **Všechna doporučení před touto opravou jsou NEPLATNÁ!**

---

### 1. NEJVYŠŠÍ PRIORITA ⚠️
- [x] **HOTOVO:** Opravena kritická chyba v jednotkách (TabulkovyPrehledVapneni.tsx)
- [ ] Rozhodnout o oficiální metodice vápnění pro budoucnost
- [ ] Sjednotit výpočty v `kalkulace.ts` a `calculations.ts`
- [ ] Ověřit výsledky s agronomem nebo ÚKZÚZ
- [ ] **URGENTNÍ:** Kontaktovat uživatele, kteří stáhli PDF před 4.1.2026!

### 2. VYSOKÁ PRIORITA
- [ ] Přidat přepočtové funkce `caoToCaco3()` a `caco3ToCao()`
- [ ] Vytvořit unit testy pro ověření konzistence
- [ ] Dokumentovat použitou metodiku v UI
- [ ] Přidat varování do starých PDF (pokud jsou uloženy v DB)

### 3. STŘEDNÍ PRIORITA
- [ ] Přidat upozornění v portálu, pokud se výsledky liší od veřejné kalkulačky
- [ ] Vytvořit FAQ s vysvětlením rozdílů v metodice
- [ ] Vytvořit changelog pro uživatele

---

## 📚 ZDROJE

1. **ÚKZÚZ Metodický pokyn č. 01/AZZP** - Vápnění zemědělských půd
2. **Vyhláška 335/2017 Sb.** - Hodnocení půdní úrodnosti
3. **Mehlich 3** - Standardní extrakční metoda pro živiny v ČR

---

**Konec dokumentu**


