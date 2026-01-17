# TEST KALKULAČKY - NOVÁ ČESKÁ METODIKA (ÚKZÚZ)

## ✅ Přehled změn

### Co bylo změněno:
1. **Metodika**: VDLUFA → Česká metodika ÚKZÚZ (Mehlich 3)
2. **Tabulky vápnění**: Nové hodnoty v kg CaCO3/ha
3. **Kategorizace živin**: Podle Mehlich 3 a typu půdy
4. **pH kategorie**: Zjednodušené kategorie podle cílového pH
5. **Deficity živin**: Aktualizované výpočty s koeficientem 4.2
6. **Poměr K:Mg**: Optimální rozmezí 1.5-2.5
7. **UI texty**: "VDLUFA" → "ÚKZÚZ (Mehlich 3)"

---

## 🧪 Testovací scénáře

### TEST 1: Střední půda, nízké pH, deficit živin

**Vstupní hodnoty:**
- Typ půdy: **Hlinito-písčitá** (S)
- pH: **5.2** (silně kyselá)
- P: **80** mg/kg
- K: **150** mg/kg
- Mg: **90** mg/kg
- Ca: **2000** mg/kg
- S: **12** mg/kg

**Očekávané výsledky:**

#### Vápnění:
- pH třída: **B** (velmi nízké pH)
- Cílové pH: **6.5** (střední půda, orná)
- Potřeba CaCO3: **~6000** kg/ha (z tabulky pro S, pH 5.2)
- Potřeba CaO: **~3.4** t/ha (6000 × 0.56)
- Mletý vápenec (48% CaO): **~7.0** t/ha
- Status: **Intenzivní vápnění**

#### Živiny (podle Mehlich 3 pro střední půdu S):
- **P (80 mg/kg)**: Kategorie **A** (nízký, < 100) → Vysoká dávka nutná
- **K (150 mg/kg)**: Kategorie **B** (vyhovující, 106-160) → Zvýšená dávka
- **Mg (90 mg/kg)**: Kategorie **A** (nízký, < 105) → Vysoká dávka nutná
- **Ca (2000 mg/kg)**: Kategorie **B** (vyhovující, 1500-2500) → Zvýšená dávka
- **S (12 mg/kg)**: Kategorie **B** (vyhovující, 10-14) → Zvýšená dávka

#### K:Mg poměr:
- Poměr: **1.67** (150/90)
- Status: **Optimální** (1.5-2.5) ✓
- Barva: Zelená

---

### TEST 2: Lehká půda, optimální pH, dobré živiny

**Vstupní hodnoty:**
- Typ půdy: **Písčitá** (L)
- pH: **5.9** (téměř optimální)
- P: **90** mg/kg
- K: **160** mg/kg
- Mg: **150** mg/kg
- Ca: **2800** mg/kg
- S: **20** mg/kg

**Očekávané výsledky:**

#### Vápnění:
- pH třída: **C** (optimální, 5.9 ≈ 6.0 cíl)
- Cílové pH: **6.0** (lehká půda, orná)
- Potřeba CaCO3: **~0** kg/ha (pH je u cíle)
- Potřeba CaO: **0** t/ha
- Status: **Udržovací vápnění / Optimální**

#### Živiny (podle Mehlich 3 pro lehkou půdu L):
- **P (90 mg/kg)**: Kategorie **C** (dobrý, 81-125) → Udržovací dávka
- **K (160 mg/kg)**: Kategorie **C** (dobrý, 136-200) → Udržovací dávka
- **Mg (150 mg/kg)**: Kategorie **C** (dobrý, 136-200) → Udržovací dávka
- **Ca (2800 mg/kg)**: Kategorie **C** (dobrý, 2501-4000) → Udržovací dávka
- **S (20 mg/kg)**: Kategorie **C** (dobrý, 15-24) → Udržovací dávka

#### K:Mg poměr:
- Poměr: **1.07** (160/150)
- Status: **Nízký** (< 1.5) ⚠️
- Doporučení: Snížit dávky hořčíku
- Barva: Oranžová

---

### TEST 3: Těžká půda, vysoké pH, přehnojeno

**Vstupní hodnoty:**
- Typ půdy: **Jílovitá** (T)
- pH: **7.2** (nad optimem)
- P: **380** mg/kg
- K: **500** mg/kg
- Mg: **180** mg/kg
- Ca: **5500** mg/kg
- S: **45** mg/kg

**Očekávané výsledky:**

#### Vápnění:
- pH třída: **D** nebo **E** (nad optimem)
- Cílové pH: **6.8** (těžká půda, orná)
- Potřeba CaCO3: **0** kg/ha (pH je nad cílem)
- Status: **Bez vápnění / Nad optimum**

#### Živiny (podle Mehlich 3 pro těžkou půdu T):
- **P (380 mg/kg)**: Kategorie **D** (vysoký, 301-450) → Snížená dávka
- **K (500 mg/kg)**: Kategorie **D** (vysoký, 401-600) → Snížená dávka
- **Mg (180 mg/kg)**: Kategorie **B** (vyhovující, 121-220) → Zvýšená dávka
- **Ca (5500 mg/kg)**: Kategorie **D** (vysoký, 4001-6000) → Snížená dávka
- **S (45 mg/kg)**: Kategorie **E** (velmi vysoký, > 40) → Omezit hnojení

#### K:Mg poměr:
- Poměr: **2.78** (500/180)
- Status: **Vysoký** (> 2.5) ⚠️
- Doporučení: Použít dolomitický vápenec nebo zvýšit Mg
- Barva: Červená

---

## 📊 Srovnání metodiky

### Hlavní rozdíly VDLUFA vs ÚKZÚZ:

| Aspekt | VDLUFA (staré) | ÚKZÚZ (nové) |
|--------|----------------|--------------|
| **Jednotky vápnění** | dt CaO/ha | kg CaCO3/ha → CaO |
| **Fosfor hranice (S)** | N: <31, C: 56-80 | N: <100, C: 161-250 |
| **Draslík hranice (S)** | N: <105, C: 171-250 | N: <105, C: 161-250 |
| **Hořčík hranice (S)** | N: <105, C: 161-240 | N: <105, C: 161-250 |
| **Cílové pH (hlinita)** | 6.3-7.0 | 6.5 |
| **Deficit koeficient** | 3.9 | 4.2 |
| **Interval aplikací** | 1-2 roky | 3 roky |
| **K:Mg optimum** | 1.0-1.8 | 1.5-2.5 |

### Praktické dopady:

✅ **Výhody nové metodiky:**
- Konzistence s portálem (stejná metodika)
- Soulad s českou legislativou (Vyhláška 335/2017)
- Metodika Mehlich 3 je standard v ČR
- Realističtější hodnoty pro české půdy
- Lepší soulad s AZZP rozbory

---

## 🎯 Kontrolní body pro test

### Před testem ověřit:
- [ ] Kalkulačka načítá správnou metodiku
- [ ] UI texty zobrazují "ÚKZÚZ (Mehlich 3)"
- [ ] Tooltip u rozborů zmiňuje Mehlich 3

### Během testu zkontrolovat:
- [ ] Výpočet vápnění pro různá pH
- [ ] Kategorizaci živin podle typu půdy
- [ ] Výpočet deficitů
- [ ] Poměr K:Mg a doporučení
- [ ] Zobrazení výsledků

### Po testu ověřit:
- [ ] Email obsahuje správné hodnoty
- [ ] Uložení do localStorage funguje
- [ ] Export výsledků je konzistentní

---

## 🚀 Jak testovat

### 1. Otevřít kalkulačku
```
http://localhost:3000/kalkulacka
```

### 2. Zadat testovací data (TEST 1)
- Vybrat: **Hlinito-písčitá**
- pH: **5.2**
- P: **80**, K: **150**, Mg: **90**, Ca: **2000**, S: **12**
- Vyplnit kontakt a odeslat

### 3. Zkontrolovat výsledky
- pH třída: **B**
- Potřeba CaO: **~3.4 t/ha**
- Mletý vápenec: **~7.0 t/ha**
- Kategorie živin odpovídají tabulce výše

### 4. Opakovat s TEST 2 a TEST 3

---

## ✅ Očekávané výsledky

Po implementaci by měla kalkulačka:

1. ✅ Používat českou metodiku ÚKZÚZ
2. ✅ Zobrazovat správné kategorie živin
3. ✅ Počítat vápnění podle české tabulky
4. ✅ Hodnotit K:Mg poměr správně (1.5-2.5)
5. ✅ Zobrazovat konzistentní texty v UI
6. ✅ Poskytovat realistická doporučení

---

## 📝 Poznámky

- Metodika je nyní 100% konzistentní s portálem
- Veškeré výpočty odpovídají Vyhlášce 335/2017 Sb.
- Kategorizace podle Mehlich 3 je standard AZZP
- Hodnoty vápnění odpovídají doporučením ČZU Praha




