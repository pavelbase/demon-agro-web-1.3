# 🧪 TESTOVACÍ SCÉNÁŘE - Opravená metodika ÚKZÚZ

**Datum:** 2026-01-03  
**Status:** Připraveno k testování

---

## 🎯 CO TESTOVAT

### 1. **ZÁKLADNÍ VÝPOČET POTŘEBY CaO**

#### Testovací případ 1: Orná půda, střední, kyselá
```
Vstup:
- pH: 4.9
- Typ půdy: S (Střední)
- Kultura: Orná
- Výměra: 10.00 ha

Očekávaný výsledek:
- Roční potřeba: 1.00 t CaO/ha/rok (z tabulky ÚKZÚZ)
- Celková potřeba (6 let): 6.0 t CaO/ha = 60.0 t CaO celkem
- Maximální dávka: 2.5 t CaO/ha
- Počet aplikací: 3× (2.0 + 2.0 + 2.0 t/ha)
- Interval: 3 roky mezi aplikacemi
```

#### Testovací případ 2: TTP, lehká, mírně kyselá
```
Vstup:
- pH: 5.3
- Typ půdy: L (Lehká)
- Kultura: TTP
- Výměra: 5.00 ha

Očekávaný výsledek:
- Roční potřeba: ~0.15 t CaO/ha/rok (interpolace mezi 5.0 a 5.5)
- Celková potřeba (6 let): 0.9 t CaO/ha = 4.5 t CaO celkem
- Maximální dávka: 1.5 t CaO/ha
- Počet aplikací: 1× (0.9 t/ha)
```

#### Testovací případ 3: Orná, těžká, extrémně kyselá
```
Vstup:
- pH: 4.3
- Typ půdy: T (Těžká)
- Kultura: Orná
- Výměra: 15.00 ha

Očekávaný výsledek:
- Roční potřeba: 1.70 t CaO/ha/rok (z tabulky)
- Celková potřeba (6 let): 10.2 t CaO/ha = 153.0 t CaO celkem
- Maximální dávka: 5.0 t CaO/ha
- Počet aplikací: 3× (3.4 + 3.4 + 3.4 t/ha)
```

---

### 2. **CÍLOVÉ pH PODLE KULTURY A TYPU**

#### Test: Automatické nastavení cílového pH

| Kultura | Typ | Očekávané pH | Co testovat |
|---------|-----|--------------|-------------|
| Orná | L | 6.0 | Při změně typu půdy se aktualizuje |
| Orná | S | 6.5 | Výchozí pro ornou |
| Orná | T | 6.8 | Nejvyšší hodnota |
| TTP | L | 5.5 | Nižší než orná |
| TTP | S | 5.8 | Střední TTP |
| TTP | T | 6.0 | Nejvyšší TTP |

**Jak testovat:**
1. Otevřít generátor plánu vápnění
2. Změnit kulturu z "Orná" na "TTP" → pH by se mělo snížit
3. Změnit typ půdy z "L" na "T" → pH by se mělo zvýšit

---

### 3. **PŘEPOČET NA PRODUKTY**

#### Test: Vápenec mletý (50% CaO)
```
Potřeba: 2.0 t CaO/ha
Očekáváno: 4.0 t vápence mletého/ha
Vzorec: 2.0 / 0.50 = 4.0 ✅
```

#### Test: Dolomit mletý (30% CaO, 18% MgO)
```
Potřeba: 2.0 t CaO/ha
Očekáváno: 6.67 t dolomitu mletého/ha
Vzorec: 2.0 / 0.30 = 6.67 ✅
```

#### Test: Pálené vápno (85% CaO)
```
Potřeba: 2.0 t CaO/ha
Očekáváno: 2.35 t páleného vápna/ha
Vzorec: 2.0 / 0.85 = 2.35 ✅
```

---

### 4. **PREDIKCE ZMĚNY Mg (KRITICKÝ TEST)**

#### Vstup:
- Dávka dolomitu: 6.67 t/ha
- Obsah MgO v dolomitu: 18%
- Množství MgO: 6.67 × 0.18 = 1.2 t MgO/ha = 0.12 t MgO/ha (po úpravě na max 150 kg/ha)
- Typ půdy: S (obj. hmotnost 1.4 t/m³)

#### Očekávaný výsledek:
```
Původní Mg: 50 mg/kg
Zvýšení: +2 až +3 mg/kg (reálné!)
Nové Mg: 52-53 mg/kg ✅
```

#### ❌ CO NESMÍ NASTAT:
```
Zvýšení: +19 mg/kg ❌ (TO JE CHYBA!)
```

**Jak testovat:**
1. Vytvořit plán vápnění s nízkým Mg (např. 50 mg/kg)
2. Vygenerovat plán → měl by doporučit dolomit
3. Zkontrolovat predikované zvýšení Mg v jednotlivých aplikacích
4. **SPRÁVNĚ:** +2-3 mg/kg
5. **ŠPATNĚ:** +15-20 mg/kg

---

### 5. **MAXIMÁLNÍ DÁVKY - KRITICKÝ TEST**

#### Test: Lehká půda - nesmí překročit 1.5 t CaO/ha
```
Vstup: pH 4.5, půda L, orná
Celková potřeba: 7.2 t CaO/ha
Očekáváno: 
- Aplikace 1: 1.5 t/ha (MAX) ✅
- Aplikace 2: 1.5 t/ha (MAX) ✅
- Aplikace 3: 1.5 t/ha (MAX) ✅
- Aplikace 4: 1.5 t/ha (MAX) ✅
- Aplikace 5: 1.2 t/ha (zbytek) ✅
```

#### Test: Těžká půda - může až 5.0 t CaO/ha
```
Vstup: pH 4.3, půda T, orná
Celková potřeba: 10.2 t CaO/ha
Očekáváno:
- Aplikace 1: 3.4 t/ha ✅ (pod limitem 5.0)
- Aplikace 2: 3.4 t/ha ✅
- Aplikace 3: 3.4 t/ha ✅
```

---

### 6. **POZEMEK 8 5002/12 - KONKRÉTNÍ TEST**

```
Pozemek: 8 5002/12
Kultura: Orná
Typ půdy: S (Střední)
Současné pH: 5.2
Cílové pH: 6.5 (SPRÁVNĚ! NE 5.2!)

Očekávaný výpočet:
1. Cílové pH automaticky nastaveno na 6.5 ✅
2. Roční potřeba: ~0.80 t CaO/ha/rok
3. Celková potřeba: 4.8 t CaO/ha
4. Plán: 2 aplikace po 2.4 t/ha (nebo 3× po 1.6 t/ha)
```

**Jak testovat:**
1. Najít pozemek 8 5002/12
2. Kliknout "Vygenerovat nový plán"
3. **ZKONTROLOVAT:** Cílové pH je 6.5 (NE 5.2!)
4. Vygenerovat plán
5. Zkontrolovat doporučené dávky

---

## ✅ CHECKLIST PRO TESTOVÁNÍ

### Před testem:
- [ ] Poznamenat si aktuální verzi aplikace
- [ ] Vytvořit testovací pozemek s pH 4.9, střední půda, orná
- [ ] Vytvořit kontrolní tabulku očekávaných výsledků

### Během testu:
- [ ] Otestovat všech 6 scénářů výše
- [ ] Zapsat skutečné vs. očekávané výsledky
- [ ] Zachytit screenshot výsledků
- [ ] Zkontrolovat cílové pH u pozemku 8 5002/12

### Po testu:
- [ ] Porovnat s předchozí verzí (pokud máte záznamy)
- [ ] Ověřit, že **Mg predikce je 2-3 mg/kg** (ne 19!)
- [ ] Ověřit, že **cílové pH = 6.5** pro ornou/střední
- [ ] Ověřit, že maximální dávky jsou respektovány

---

## 📊 ŠABLONA PRO ZÁZNAM VÝSLEDKŮ

```
┌────────────────────────────────────────────────────┐
│ TEST #1: Orná, střední, pH 4.9                     │
├────────────────────────────────────────────────────┤
│ Očekáváno: 6.0 t CaO/ha, 3 aplikace               │
│ Výsledek:  _______ t CaO/ha, ___ aplikace         │
│ Cílové pH: Očekáváno 6.5 | Skutečnost: _____      │
│ Status:    ✅ / ❌                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ TEST #4: Predikce Mg (dolomit)                     │
├────────────────────────────────────────────────────┤
│ Očekáváno: +2 až +3 mg/kg                          │
│ Výsledek:  +_____ mg/kg                            │
│ Status:    ✅ / ❌                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ TEST #6: Pozemek 8 5002/12                         │
├────────────────────────────────────────────────────┤
│ Očekáváno: Cílové pH 6.5                           │
│ Výsledek:  Cílové pH _____                         │
│ Status:    ✅ / ❌                                  │
└────────────────────────────────────────────────────┘
```

---

## 🚨 ČERVENÉ VLAJEČKY (CO HLÍDAT)

| Signál | Co to znamená | Akce |
|--------|---------------|------|
| Cílové pH < 6.0 pro ornou/střední | Chyba v metodice | ❌ BUG |
| Predikce Mg > +5 mg/kg | Špatný vzorec | ❌ BUG |
| Dávka > 5.0 t CaO/ha | Překročen legislativní limit | ❌ BUG |
| Počet aplikací > 5 | Příliš malé dávky | ⚠️ Zvážit |
| Interval < 3 roky | Porušení metodiky | ❌ BUG |

---

**Připraveno k testování!**  
Pokud najdete nesrovnalosti, zapište je a konzultujte s agronomem.




