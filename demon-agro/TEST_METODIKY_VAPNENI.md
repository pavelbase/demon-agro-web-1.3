# 🧪 TESTOVACÍ PŘÍKLADY - Ověření metodiky

## Příklad 1: Střední půda, pH 4.9 → 6.35

**Vstup:**
- Aktuální pH: 4.9
- Cílové pH: 6.35 (střední, orná)
- Typ půdy: S (střední, hlinita)
- Výměra: 10 ha
- Mg: 89 mg/kg

### Výpočet podle aktuálního kódu:

**1. Tabulková hodnota Ca:**
```
lookupCaNeed(4.9, 'hlinita')
- pH 4.9 je mezi 4.5 a 5.0
- table['<4.5'] = 5.0 t Ca/ha
- table['5.0'] = 3.5 t Ca/ha
- Interpolace: pH 4.9 je 80% mezi 4.5 a 5.0
- Výsledek ≈ 5.0 - 0.8×(5.0-3.5) = 5.0 - 1.2 = 3.8 t Ca/ha
```

**2. Konverze Ca → CaO:**
```
3.8 t Ca/ha × 1.4 = 5.32 t CaO/ha
```

**3. Maximální dávka:**
```
MAX_SINGLE_DOSE_CA['hlinita'] = 2.1 t Ca
2.1 × 1.4 = 2.94 t CaO/ha (max na jednu aplikaci)
```

**4. Počet aplikací:**
```
5.32 / 2.94 = 1.81 → potřeba 2 aplikace
```

### ⚠️ PROBLÉM:

Pokud je tabulka ve skutečnosti v **kg CaCO3/ha** (jak je běžné v ČR):

**Správný výpočet:**
```
1. Hodnota z tabulky: 3800 kg CaCO3/ha (ne 3.8 t Ca!)
2. Konverze CaCO3 → CaO:
   CaCO3 × 0.56 = CaO
   3800 × 0.56 = 2128 kg CaO/ha = 2.13 t CaO/ha

ROZDÍL: 5.32 vs 2.13 = 2.5× VÍCE než má být! 🔴
```

---

## Příklad 2: Predikce změny Mg

**Vstup:**
- Dávka: 1.5 t/ha dolomitu s 18% MgO
- MgO: 1.5 × 0.18 = 0.27 t MgO/ha
- Aktuální Mg: 89 mg/kg
- Půda: S (střední)

### Aktuální kód:
```typescript
calculateMgChange(0.27, 'S')
= 0.27 × 70 = 18.9 mg/kg
Nové Mg = 89 + 18.9 = 107.9 mg/kg
```

### Správný vzorec:
```
ΔMg = (MgO_kg/ha × 0.603) / (hloubka × obj_hmotnost × 10)
    = (270 × 0.603) / (20 × 1.4 × 10)
    = 162.8 / 280
    = 0.58 mg/kg

Nové Mg = 89 + 0.58 = 89.6 mg/kg
```

**ROZDÍL: 18.9 vs 0.58 = 32× VÍCE než realita! 🔴**

**ZÁVĚR:** Predikce Mg je zcela nereálná, měla by být **odstraněna** nebo **přepsána**.

---

## Příklad 3: Změna pH

**Vstup:**
- Dávka: 2.0 t CaO/ha
- Půda: hlinita (střední, S)
- Aktuální pH: 5.0

### Aktuální kód:
```typescript
bufferCapacity['hlinita'] = 0.30
phEfficiency (pH 5.0) = 1.2
phIncrease = 2.0 × 0.30 × 1.2 = 0.72
pH po = 5.0 + 0.72 = 5.72
```

### Realitní check:
Pro střední půdu s pH 5.0:
- Dávka 2.0 t CaO/ha je VYSOKÁ
- Očekávaná změna: +0.5 až +0.8 pH jednotek
- **Výsledek 0.72 se zdá ROZUMNÝ** ✅

**ALE:** Pokud by pufrační kapacita byla obrácená:
```
bufferCapacity['hlinita'] = 0.40 (oprava)
phIncrease = 2.0 × 0.40 × 1.2 = 0.96
pH po = 5.96
```

Což by bylo **realističtější** pro takovou dávku.

---

## 📊 SOUHRN TESTŮ

| Test | Aktuální výsledek | Očekávaný | Rozdíl | Status |
|------|-------------------|-----------|--------|--------|
| Potřeba CaO | 5.32 t/ha | 2.13 t/ha | 2.5× | 🔴 KRITICKÉ |
| Změna Mg | +18.9 mg/kg | +0.6 mg/kg | 32× | 🔴 KRITICKÉ |
| Změna pH | +0.72 | +0.6 až +0.8 | OK | ✅ PŘIJATELNÉ |

---

## 🎯 DOPORUČENÍ PRO UŽIVATELE

**PŘED POUŽITÍM V PRODUKCI:**

1. **URGENTNĚ ověřit zdroj tabulkových hodnot**
   - Kontaktovat ČZU nebo ÚKZÚZ
   - Zjistit, zda jsou hodnoty v t Ca/ha nebo kg CaCO3/ha

2. **Odstranit nebo opravit predikci Mg**
   - Aktuální predikce je zcela nereálná
   - Doporučuji **ODSTRANIT** a nezobrazovat budoucí Mg

3. **Přidat upozornění do UI**
   ```
   ⚠️ Výpočty jsou orientační. Doporučujeme kontrolní rozbor 
   1 rok po aplikaci pro ověření skutečných změn.
   ```

4. **Konzervativní přístup**
   - Dokud není metodika ověřena, doporučit **nižší dávky**
   - Raději více aplikací než převápnění

---

**POZNÁMKA:** Systém funguje a logika je správná, ale **NUMERICKÉ HODNOTY** mohou být špatně až o 250%!



