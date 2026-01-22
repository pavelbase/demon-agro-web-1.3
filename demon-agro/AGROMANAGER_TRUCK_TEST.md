# AgroManažer - Test kamionové logistiky 🧪

## 🎯 Rychlý test

### Příprava

1. **Spustit SQL migraci**
   ```sql
   -- V Supabase SQL Editoru spustit:
   demon-agro/lib/supabase/sql/add_truck_logistics_fields.sql
   ```

2. **Restartovat dev server**
   ```bash
   npm run dev
   ```

3. **Přihlásit se jako admin**
   - URL: `http://localhost:3000/portal/prihlaseni`
   - Email: base@demonagro.cz (nebo váš admin účet)

---

## ✅ Test 1: Nová zakázka s automatickým výpočtem

### Kroky:
1. Otevřít `/portal/admin/agromanager`
2. Kliknout **"Přidat zakázku"**
3. Zadat:
   - Název: "Test Kamiony"
   - Výměra: **80 ha**
   - Dávka: **500 kg/ha**
   - Ostatní nechat výchozí

### Očekávaný výsledek:
```
┌─────────────────────────────────────────────────────┐
│ 🚛 LOGISTIKA KAMIONŮ (30t/kamion)                  │
├─────────────────────────────────────────────────────┤
│ Teoretická potřeba: 40.00 t                         │
│ Auto výpočet: 2× kamion                             │
│ Počet kamionů: [−] 2× [+]                           │
│ Skutečné množství: 60.00 t                          │
│ → Skutečná dávka: 750 kg/ha (původně 500 kg/ha)    │
└─────────────────────────────────────────────────────┘
```

### ✅ Zkontrolovat:
- [ ] Sekce kamionů je viditelná
- [ ] Teoretická potřeba = 40 t
- [ ] Automaticky 2 kamiony
- [ ] Skutečná dávka = 750 kg/ha
- [ ] Doporučená cena je vyšší než prodejní cena

---

## ✅ Test 2: Ruční úprava počtu kamionů

### Kroky:
1. U stejné zakázky kliknout **[+]** (zvýšit kamiony)
2. Pozorovat změny

### Očekávaný výsledek:
```
Počet kamionů: 3× (bylo 2×)
Skutečné množství: 90.00 t (bylo 60 t)
Skutečná dávka: 1,125 kg/ha (bylo 750 kg/ha)
```

### ✅ Zkontrolovat:
- [ ] Počet kamionů stoupl na 3
- [ ] Skutečná dávka stoupla na 1,125 kg/ha
- [ ] Náklady na materiál stouply
- [ ] Doporučená cena se zvýšila
- [ ] Hrubý zisk klesl (pokud cena nebyla upravena)

### Kroky pokračování:
3. Kliknout **[−]** (snížit kamiony zpátky na 2)
4. Ověřit, že se hodnoty vrátily

### ✅ Zkontrolovat:
- [ ] Počet kamionů klesl zpět na 2
- [ ] Skutečná dávka klesla zpět na 750 kg/ha
- [ ] Hodnoty jsou jako v Testu 1

---

## ✅ Test 3: Použití doporučené ceny

### Kroky:
1. Zkontrolovat aktuální prodejní cenu (např. 780 Kč/ha)
2. Zkontrolovat doporučenou cenu (např. 1,020 Kč/ha)
3. Zkontrolovat aktuální zisk (měl by být nízký, např. 90 Kč/ha)
4. Kliknout **"Použít"** u doporučené ceny
5. Pozorovat změny

### Očekávaný výsledek:
```
Před použitím:
  Prodejní cena: 780 Kč/ha
  Doporučená cena: 1,020 Kč/ha
  Zisk: 90 Kč/ha ❌

Po použití:
  Prodejní cena: 1,020 Kč/ha ✅ (automaticky zkopírováno)
  Doporučená cena: 1,020 Kč/ha
  Zisk: 330 Kč/ha ✅ (= cílový zisk)
```

### ✅ Zkontrolovat:
- [ ] Prodejní cena se změnila na doporučenou
- [ ] Toast notifikace "Doporučená cena byla použita"
- [ ] Hrubý zisk = cílový zisk (330 Kč/ha)
- [ ] Všechny výpočty se přepočítaly

---

## ✅ Test 4: Změna cílového zisku

### Kroky:
1. Najít pole **"Cílový zisk (Kč/ha)"** (výchozí: 330)
2. Změnit na **500 Kč/ha**
3. Pozorovat změnu doporučené ceny

### Očekávaný výsledek:
```
Cílový zisk: 330 Kč/ha → 500 Kč/ha
Doporučená cena: 1,020 Kč/ha → 1,190 Kč/ha (zvýšila se)
```

### ✅ Zkontrolovat:
- [ ] Doporučená cena se zvýšila
- [ ] Výpočet: `(Náklady + (500 × 80)) / 80`
- [ ] Po použití doporučené ceny je zisk = 500 Kč/ha

---

## ✅ Test 5: Edge case - malá výměra

### Kroky:
1. Vytvořit novou zakázku
2. Zadat:
   - Výměra: **20 ha**
   - Dávka: **500 kg/ha**

### Očekávaný výsledek:
```
Teoretická potřeba: 10.00 t
Počet kamionů: 1× (10t < 30t, zaokrouhleno nahoru)
Skutečné množství: 30.00 t
Skutečná dávka: 1,500 kg/ha ⬆️⬆️ (3× více!)
```

### ✅ Zkontrolovat:
- [ ] 1 kamion
- [ ] Dávka se výrazně zvýšila (1,500 kg/ha)
- [ ] Doporučená cena je VÝRAZNĚ vyšší
- [ ] Zisk je negativní bez úpravy ceny

---

## ✅ Test 6: Edge case - přesný násobek 30t

### Kroky:
1. Vytvořit novou zakázku
2. Zadat:
   - Výměra: **60 ha**
   - Dávka: **500 kg/ha**

### Očekávaný výsledek:
```
Teoretická potřeba: 30.00 t (přesně 1 kamion!)
Počet kamionů: 1×
Skutečné množství: 30.00 t
Skutečná dávka: 500 kg/ha (beze změny! ✅)
```

### ✅ Zkontrolovat:
- [ ] Skutečná dávka = zadaná dávka (500 kg/ha)
- [ ] Žádný "nadbytek" materiálu
- [ ] Doporučená cena ≈ prodejní cena

---

## ✅ Test 7: Uložení a reload

### Kroky:
1. U testovací zakázky změnit počet kamionů na **3**
2. Kliknout **"Uložit"** (nebo Ctrl+S)
3. Počkat na potvrzení
4. Přejít na jinou zakázku
5. Vrátit se zpět na testovací zakázku

### Očekávaný výsledek:
```
Počet kamionů: 3× (zůstalo uloženo)
Skutečné množství: 90 t
Skutečná dávka: 1,125 kg/ha
```

### ✅ Zkontrolovat:
- [ ] Počet kamionů zůstal 3
- [ ] Všechny hodnoty se načetly správně
- [ ] Výpočty fungují i po reloadu

---

## ✅ Test 8: Celkové metriky (levý panel)

### Kroky:
1. Vytvořit 2-3 zakázky s různými hodnotami
2. Zkontrolovat celkové metriky v levém panelu

### ✅ Zkontrolovat:
- [ ] Celková tržba = suma tržeb všech zakázek
- [ ] Celkové náklady = suma nákladů (s kamionovými přepočty!)
- [ ] Celkový zisk = suma zisků
- [ ] Celková výměra = suma výměr
- [ ] Průměrný zisk/ha se počítá správně

---

## 🐛 Možné problémy a řešení

### Problém 1: Sekce kamionů se nezobrazuje
**Řešení:**
1. Zkontrolovat, že SQL migrace proběhla
2. Restartovat dev server
3. Vyčistit cache browseru (Ctrl+Shift+R)

### Problém 2: Chyba při ukládání
**Řešení:**
1. Zkontrolovat console (F12)
2. Ověřit, že pole `pozadovany_zisk_ha` a `pocet_kamionu` existují v DB
3. Zkontrolovat RLS policies

### Problém 3: Doporučená cena se nezmění
**Řešení:**
1. Zkontrolovat, že cílový zisk je nastaven (ne NULL)
2. Zkontrolovat výpočet v console: `(náklady + (zisk × výměra)) / výměra`

### Problém 4: Toast notifikace se nezobrazuje
**Řešení:**
1. Zkontrolovat, že `react-hot-toast` je importován
2. Zkontrolovat, že `<Toaster />` je v layoutu

---

## 📊 Referenční hodnoty (80 ha, 500 kg/ha)

### BEZ kamionové logistiky:
```
Dávka: 500 kg/ha
Spotřeba: 40 t
Náklady: ~40,000 Kč
Zisk při 780 Kč/ha: ~22,400 Kč (280 Kč/ha)
```

### S kamionovou logikou (2 kamiony):
```
Dávka: 750 kg/ha ⬆️
Spotřeba: 60 t ⬆️
Náklady: ~55,200 Kč ⬆️
Zisk při 780 Kč/ha: ~7,200 Kč (90 Kč/ha) ❌
Doporučená cena: ~1,020 Kč/ha
Zisk při 1,020 Kč/ha: ~26,400 Kč (330 Kč/ha) ✅
```

---

## ✅ Všechny testy prošly?

Gratulujeme! Kamionová logistika je plně funkční. 🎉

**Poslední aktualizace:** 2026-01-22

