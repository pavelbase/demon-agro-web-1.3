# AgroManažer - Update: Celkové množství materiálu ✅

## 📊 Nová metrika v souhrnu

**Datum:** 2026-01-22  
**Status:** ✅ Implementováno

---

## 🎯 Co bylo přidáno

V levém panelu (celkové metriky) byla přidána nová položka:

### **🚛 Materiál: X.X t**

Tato metrika zobrazuje **celkové množství skutečně vyaplikovaného materiálu** ze všech zakázek, **s respektováním kamionové logistiky**.

---

## 🧮 Jak se počítá

### Pro každou zakázku:
```typescript
// 1. Teoretická potřeba
teoretickaPotrebaTun = (výměra × dávka) / 1000

// 2. Počet kamionů (zaokrouhleno nahoru)
pocetKamionuAuto = Math.ceil(teoretickaPotrebaTun / 30)

// 3. Skutečný počet (pokud uživatel ručně upravil)
pocetKamionuSkutecny = pocet_kamionu ?? pocetKamionuAuto

// 4. Skutečné množství materiálu
skutecneMnozstviTun = pocetKamionuSkutecny × 30

// 5. Sečíst všechny zakázky
totalTuny = suma(skutecneMnozstviTun)
```

---

## 📸 Vzhled v UI

```
┌────────────────────────────────────┐
│ Celkem (3x zakázky)                │
├────────────────────────────────────┤
│ Tržba:        245,600 Kč           │
│ Náklady:      165,600 Kč           │
│ ────────────────────────────────── │
│ ZISK:          80,000 Kč           │
│ ────────────────────────────────── │
│ Výměra:        240.0 ha            │
│ Hodiny:         24.0 mth           │
│ 🚛 Materiál:   180.0 t    ← NOVÉ! │
│ Ø Zisk/ha:     333 Kč              │
└────────────────────────────────────┘
```

**Barevné zvýraznění:**
- 🚛 Ikona kamionu
- Oranžová barva (text-orange-700)
- Font: font-semibold

---

## 💡 Proč je to užitečné?

### Příklad:

#### 3 zakázky:
1. **Zakázka A:** 80 ha × 500 kg/ha = 40t → **2 kamiony = 60t**
2. **Zakázka B:** 60 ha × 500 kg/ha = 30t → **1 kamion = 30t**
3. **Zakázka C:** 100 ha × 500 kg/ha = 50t → **2 kamiony = 60t**

#### Teoretická potřeba celkem:
```
40 + 30 + 50 = 120 tun
```

#### Skutečné množství (s kamiony):
```
60 + 30 + 60 = 150 tun ← 🚛 Materiál zobrazí toto!
```

**Rozdíl:** +30 tun navíc (kvůli nedělitelnosti kamionů)

Tato metrika vám řekne:
- ✅ Kolik materiálu OPRAVDU objednáte
- ✅ Kolik kamionů celkem pojedede
- ✅ O kolik je reálná spotřeba vyšší než teoretická

---

## 🔧 Implementace

### Změněné soubory:

```
✅ components/admin/AgroManagerCalculator.tsx
```

### Změny v kódu:

#### 1. Rozšířený interface `totalMetrics`:
```typescript
return {
  totalTrzba,
  totalNaklady,
  totalZisk,
  totalVymera,
  totalHodin,
  totalTuny,      // ← NOVÉ
  count: customers.length,
}
```

#### 2. Výpočet v forEach loop:
```typescript
customers.forEach(customer => {
  // Kamionová logistika
  const teoretickaPotrebaTun = (vymera * davka) / 1000
  const pocetKamionuAuto = Math.ceil(teoretickaPotrebaTun / TRUCK_CAPACITY)
  const pocetKamionuSkutecny = customer.pocet_kamionu ?? pocetKamionuAuto
  const skutecneMnozstviTun = pocetKamionuSkutecny * TRUCK_CAPACITY
  
  // Přičíst k celkovým tunám
  totalTuny += skutecneMnozstviTun
})
```

#### 3. UI zobrazení:
```tsx
<div className="flex justify-between text-gray-600">
  <span>🚛 Materiál:</span>
  <span className="font-semibold text-orange-700">
    {formatNumber(totalMetrics.totalTuny, 1)} t
  </span>
</div>
```

---

## ✅ Test

### Testovací scénář:

1. Vytvořit 2 zakázky:
   - **Zakázka 1:** 80 ha, 500 kg/ha → 2 kamiony (60t)
   - **Zakázka 2:** 20 ha, 500 kg/ha → 1 kamion (30t)

2. Zkontrolovat levý panel:
   ```
   Výměra: 100.0 ha
   🚛 Materiál: 90.0 t
   ```

3. Ručně změnit počet kamionů u Zakázky 1 na 3 kamiony

4. Zkontrolovat aktualizaci:
   ```
   🚛 Materiál: 120.0 t (bylo 90.0 t)
   ```

### ✅ Očekávaný výsledek:
- Metrika se zobrazuje s ikonou 🚛
- Oranžová barva
- Aktualizuje se real-time při změně kamionů
- Počítá skutečné množství (s kamiony), ne teoretické

---

## 📈 Výhody

1. **Přehlednost:** Na první pohled vidíte celkovou spotřebu
2. **Realističnost:** Počítá s nedělitelností kamionů
3. **Plánování:** Víte přesně, kolik materiálu objednat
4. **Logistika:** Vidíte celkový počet kamionů: `totalTuny / 30`
5. **Náklady:** Pomáhá odhadnout celkové náklady na materiál

---

## 🎯 Další možná rozšíření

### Verze 1.1:
- Zobrazit počet kamionů: `"🚛 Materiál: 180.0 t (6× kamion)"`
- Tooltip s rozdílem: hover ukáže teoretickou vs. skutečnou potřebu

### Verze 1.2:
- Export CSV s celkovými metrikami
- Graf vývoje spotřeby materiálu v čase

---

## ✅ Status

**Implementováno a připraveno k použití!**

Žádné další kroky nejsou potřeba - změna je součástí stávajícího kódu a funguje okamžitě po načtení komponentu.

---

**Poslední aktualizace:** 2026-01-22

