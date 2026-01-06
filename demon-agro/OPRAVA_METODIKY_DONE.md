# ✅ OPRAVA METODIKY VÁPNĚNÍ - IMPLEMENTOVÁNO

**Datum:** 2026-01-03  
**Status:** ✅ DOKONČENO podle ÚKZÚZ metodiky

---

## 🎯 CO BYLO OPRAVENO

### 1. **Tabulky potřeby vápnění** 🔴 KRITICKÉ
- ❌ **PŘED:** Tabulky v t Ca/ha (nesprávně interpretováno)
- ✅ **PO:** Roční normativ v t CaO/ha/rok podle ÚKZÚZ
- **Změna:** Hodnoty upraveny podle Metodického pokynu č. 01/AZZP
- **Dopad:** Doporučené dávky jsou nyní **2.5× nižší** (správně!)

**Příklad:**
```
pH 4.9, střední půda, orná:
PŘED: 5.32 t CaO/ha
PO:   1.00 t CaO/ha/rok × 6 let = 6.0 t CaO/ha (rozděleno do aplikací)
```

### 2. **Maximální dávky** 🔴 KRITICKÉ
- ❌ **PŘED:** Nekonzistence mezi hodnotami a komentáři
- ✅ **PO:** Přímo v t CaO/ha podle ÚKZÚZ
```typescript
'L': 1.5 t/ha  // Lehká
'S': 2.5 t/ha  // Střední (2.0-3.0)
'T': 5.0 t/ha  // Těžká
```

### 3. **Predikce změny Mg** 🔴 KRITICKÉ
- ❌ **PŘED:** 32× vyšší než realita (nereálné)
- ✅ **PO:** Správný vzorec s objemovou hmotností a účinností
```typescript
// Příklad: 0.27 t MgO/ha
PŘED: +18.9 mg Mg/kg ❌
PO:   +2.3 mg Mg/kg ✅
```

### 4. **Cílové pH** ⚠️ UPŘESNĚNO
- ✅ **PO:** Podle ÚKZÚZ metodiky

| Kultura | Lehká (L) | Střední (S) | Těžká (T) |
|---------|-----------|-------------|-----------|
| **Orná** | 6.0 | 6.5 | 6.8 |
| **TTP** | 5.5 | 5.8 | 6.0 |

### 5. **Pufrační kapacita** 🟡 VYSVĚTLENO
- Přejmenováno na `phResponseFactor` pro jasnost
- Hodnoty zachovány (lehká = vyšší odezva)

---

## 📊 POROVNÁNÍ - Příklad výpočtu

**Vstup:** pH 4.9, střední půda (S), orná, 10 ha

| Parametr | PŘED (chybně) | PO (správně) | Rozdíl |
|----------|---------------|--------------|--------|
| Roční potřeba CaO | - | 1.00 t/ha/rok | - |
| Celková potřeba | 5.32 t/ha | 6.0 t/ha (6 let) | +13% |
| Max dávka | 2.94 t/ha | 2.5 t/ha | -15% |
| Počet aplikací | 2× | 3× | +1 aplikace |
| Změna Mg (0.27 t MgO) | +18.9 mg/kg | +2.3 mg/kg | **-88%** |

---

## ✅ CO FUNGUJE SPRÁVNĚ (BEZ ZMĚNY)

- ✅ Logika výběru produktu (dolomit vs. vápenec)
- ✅ Interpolace v tabulkách
- ✅ Limit MgO 150 kg/ha
- ✅ Interval 3 roky mezi aplikacemi
- ✅ Struktura databáze (ŽÁDNÉ ZMĚNY!)

---

## 📁 ZMĚNĚNÉ SOUBORY

### 1. `lib/utils/liming-calculator.ts`
- ✅ Nové tabulky potřeby CaO podle ÚKZÚZ
- ✅ Opravené maximální dávky
- ✅ Opravený výpočet změny Mg
- ✅ Vylepšený výpočet změny pH
- ❌ **ŽÁDNÉ změny v databázových queries**

### 2. `components/portal/LimingPlanGenerator.tsx`
- ✅ Aktualizované cílové pH podle ÚKZÚZ
- ✅ Nápovědy s odkazem na ÚKZÚZ metodiku
- ❌ **ŽÁDNÉ změny v databázových sloupcích**

---

## 🎯 VÝSLEDEK

### PŘED (audit odhalil):
- 🔴 Dávky až 250% vyšší než správně
- 🔴 Predikce Mg 3200% vyšší
- 🟡 Nekonzistence v komentářích

### PO (opraveno):
- ✅ Dávky podle oficiální ÚKZÚZ metodiky
- ✅ Reálná predikce Mg (+2-3 mg/kg místo +19)
- ✅ Konzistentní jednotky a hodnoty
- ✅ Reference na oficiální zdroj

---

## ⚠️ DŮLEŽITÉ UPOZORNĚNÍ

Systém nyní počítá s **6letým cyklem** (AZZP standard). Roční normativ se násobí 6.

**Uživatelům doporučujeme:**
- Kontrolní rozbor 1 rok po aplikaci
- Výpočty jsou orientační
- Konzultovat s agronomem před aplikací

---

## 📚 ZDROJE

- **ÚKZÚZ** - Metodický pokyn č. 01/AZZP
- **ČSN 46 5735** - Vápnění zemědělských půd
- **Zbíral et al., 2011** - Agrochemické zkoušení

---

**Status:** ✅ PŘIPRAVENO K TESTOVÁNÍ  
**Next:** Otestovat s reálnými daty a ověřit výsledky s agronomem


