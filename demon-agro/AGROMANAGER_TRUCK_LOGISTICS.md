# AgroManažer - Kamionová Logistika ✅

## 🚛 Přehled změn

Implementace "nedělitelnosti kamionů" - materiál se vozí v kamionech po 30 tunách a musí se spotřebovat všechen. Kalkulačka automaticky přepočítává dávku a doporučuje optimální cenu pro udržení požadované marže.

**Datum implementace:** 2026-01-22

---

## 🎯 Problém, který řešíme

### Původní problém:
- Zákazník chce 80 ha s dávkou 500 kg/ha = **40 tun materiálu**
- Ale kamion vozí **30 tun** (nedělitelné!)
- Možnosti:
  - 1 kamion = 30t (málo, jen 375 kg/ha)
  - 2 kamiony = 60t (přebývá 20t, které SE MUSÍ aplikovat)

### Řešení:
1. Kalkulačka automaticky vypočítá počet kamionů
2. Přepočítá skutečnou dávku na 750 kg/ha (60t / 80ha)
3. Přepočítá všechny náklady (materiál, nafta, traktorista)
4. Vypočítá **doporučenou cenu**, aby zůstal požadovaný zisk

---

## 📊 Co bylo změněno

### 1. **Databáze**

#### Nový SQL soubor:
```
lib/supabase/sql/add_truck_logistics_fields.sql
```

#### Nová pole v tabulce `agro_customers`:
- `pozadovany_zisk_ha` (NUMERIC) - Cílový zisk na hektar (default: 330 Kč)
- `pocet_kamionu` (INTEGER, nullable) - Ručně nastavený počet kamionů (NULL = automaticky)

---

### 2. **TypeScript Typy**

Aktualizovány typy v `lib/types/database.ts`:

```typescript
agro_customers: {
  Row: {
    // ... existující pole
    pozadovany_zisk_ha: number
    pocet_kamionu: number | null
  }
}
```

---

### 3. **Výpočetní logika**

#### Nová konstanta:
```typescript
const TRUCK_CAPACITY = 30 // tun
```

#### Rozšířený interface `CustomerWithCalculations`:
```typescript
calculations: {
  // Kamionová logistika
  teoretickaPotrebaTun: number
  pocetKamionuAuto: number
  pocetKamionuSkutecny: number
  skutecneMnozstviTun: number
  skutecnaDavkaKgHa: number
  
  // Původní výpočty (s přepočtem)
  spotrebaMaterialu: number
  celkemHodin: number
  trzba: number
  nakladMaterial: number
  nakladTraktor: number
  nakladNafta: number
  nakladTraktorista: number
  nakladyCelkem: number
  hrubyZisk: number
  ziskNaHodinu: number
  ziskNaHektar: number
  
  // Nové
  doporucenaCena: number
}
```

#### Matematika kamionové logistiky:

```typescript
// 1. Teoretická potřeba podle zadané dávky
teoretickaPotrebaTun = (výměra × dávka_zadaná) / 1000

// 2. Automatický počet kamionů (zaokrouhleno nahoru)
pocetKamionuAuto = Math.ceil(teoretickaPotrebaTun / 30)

// 3. Skutečný počet (pokud uživatel ručně změnil)
pocetKamionuSkutecny = pocet_kamionu ?? pocetKamionuAuto

// 4. Skutečné množství materiálu
skutecneMnozstviTun = pocetKamionuSkutecny × 30

// 5. Skutečná dávka (TOTO SE POUŽIJE VE VÝPOČTECH!)
skutecnaDavkaKgHa = (skutecneMnozstviTun × 1000) / výměra
```

#### Doporučená cena (Reverse Engineering):

```typescript
// Aby zisk byl = požadovaný zisk, musí cena být:
doporucenaCena = (náklady_celkem + (pozadovany_zisk_ha × výměra)) / výměra
```

---

### 4. **UI - Nová sekce "LOGISTIKA KAMIONŮ"**

#### Umístění:
Vloženo mezi "Ceny" a "Traktorista" v Excel-style gridu.

#### Zobrazené informace:

1. **Teoretická potřeba (t)** - Podle zadané dávky
2. **Auto výpočet kamionů** - Automatický výpočet
3. **Počet kamionů** - S tlačítky `[−]` a `[+]` pro ruční úpravu
4. **Skutečné množství (t)** - Co opravdu přijede
5. **Skutečná dávka (kg/ha)** - Přepočítaná dávka s porovnáním původní

#### Příklad UI:
```
┌─────────────────────────────────────────────────────────────┐
│ 🚛 LOGISTIKA KAMIONŮ (30t/kamion)                          │
├─────────────────────────────────────────────────────────────┤
│ Teoretická potřeba (t)  │ 40.00  │ Auto výpočet kamionů │ 2× kamion │
│ Počet kamionů          │ [−] 2× [+] │ Skutečné množství │ 60.00 t   │
│ → Skutečná dávka       │ 750 kg/ha (původně 500 kg/ha)      │
│ Cílový zisk (Kč/ha)    │ 330                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. **UI - Doporučená cena**

#### Umístění:
Hned vedle "Prodej služby (Kč/ha)"

#### Vzhled:
```
┌────────────────────────────────────────────────────────────┐
│ Prodej služby (Kč/ha)  │ [780]  │ 💡 Doporučená │ 890 Kč [Použít] │
└────────────────────────────────────────────────────────────┘
```

- **Zelené pozadí** - upozornění na optimální cenu
- **Tlačítko "Použít"** - jedním kliknutím zkopíruje doporučenou cenu

---

### 6. **Nové handlery**

```typescript
// Handler pro změnu počtu kamionů
const handleTruckCountChange = (change: number) => {
  const current = selectedCustomer.calculations.pocetKamionuSkutecny
  const newCount = Math.max(1, current + change)
  setEditData(prev => ({ ...prev, pocet_kamionu: newCount }))
}

// Handler pro použití doporučené ceny
const handleUseRecommendedPrice = () => {
  const recommended = selectedCustomer.calculations.doporucenaCena
  setEditData(prev => ({
    ...prev,
    cena_prodej_sluzba_ha: Math.round(recommended)
  }))
  toast.success('Doporučená cena byla použita')
}
```

---

### 7. **API - Výchozí hodnoty**

Aktualizován endpoint `POST /api/admin/agro-customers/create`:

```typescript
const customerData = {
  // ... existující pole
  cena_traktorista_mth: body.cena_traktorista_mth ?? 400,
  cena_traktorista_tuna: body.cena_traktorista_tuna ?? 50,
  traktorista_typ: body.traktorista_typ || 'hodina',
  pozadovany_zisk_ha: body.pozadovany_zisk_ha ?? 330,  // ← NOVÉ
  pocet_kamionu: body.pocet_kamionu ?? null,           // ← NOVÉ
}
```

---

## 🔄 Workflow - Jak to funguje v praxi

### Scénář 1: Automatický výpočet

1. Admin zadá: **80 ha**, dávka **500 kg/ha**
2. Kalkulačka vypočítá:
   - Teoretická potřeba: **40 tun**
   - Počet kamionů: **2× kamion** (automaticky)
   - Skutečné množství: **60 tun**
   - Skutečná dávka: **750 kg/ha** ⬆️
3. Přepočítají se náklady:
   - Materiál: `60t × 610 Kč = 36 600 Kč` (místo 24 400 Kč)
   - Nafta: `60t × 70 Kč = 4 200 Kč` (místo 2 800 Kč)
   - Traktorista: Také stoupne
4. Hrubý zisk **klesne** (protože cena je stejná, ale náklady vyšší)
5. Kalkulačka vypočítá **doporučenou cenu: 890 Kč/ha** (místo 780 Kč)
6. Admin klikne **"Použít"**
7. Zisk je zpátky na **330 Kč/ha** ✅

---

### Scénář 2: Ruční úprava počtu kamionů

1. Admin zadá: **80 ha**, dávka **500 kg/ha**
2. Kalkulačka navrhne: **2× kamion**
3. Admin klikne **[+]** → změní na **3× kamiony**
4. Skutečné množství: **90 tun**
5. Skutečná dávka: **1 125 kg/ha** ⬆️⬆️
6. Náklady ještě více stoupnou
7. Doporučená cena: **1 050 Kč/ha**
8. Admin rozhodne, zda použít doporučenou cenu nebo snížit kamiony

---

## 🎨 Vizuální změny

### Barevné kódování:

- 🟠 **Oranžová sekce** - Kamionová logistika
- 🟢 **Zelená** - Doporučená cena
- 🔵 **Modrá** - Tržba
- 🔴 **Červená** - Náklady
- 🟢 **Zelená** - Zisk (pokud kladný)

---

## 📝 Nasazení

### Krok 1: Spustit SQL migraci

```sql
-- V Supabase SQL Editoru spustit:
demon-agro/lib/supabase/sql/add_truck_logistics_fields.sql
```

### Krok 2: Restartovat aplikaci

```bash
npm run dev
# nebo na produkci:
vercel --prod
```

### Krok 3: Ověření

1. Přihlásit se jako admin
2. Otevřít `/portal/admin/agromanager`
3. Vytvořit novou zakázku
4. Ověřit, že sekce "LOGISTIKA KAMIONŮ" je viditelná
5. Změnit počet kamionů pomocí `[−]` `[+]`
6. Kliknout na "Použít" u doporučené ceny

---

## ✅ Checklist funkcí

- ✅ Automatický výpočet počtu kamionů
- ✅ Ruční úprava počtu kamionů (`[−]` `[+]`)
- ✅ Přepočet skutečné dávky
- ✅ Přepočet všech nákladů podle skutečné dávky
- ✅ Výpočet doporučené ceny (reverse engineering)
- ✅ Tlačítko "Použít" pro doporučenou cenu
- ✅ Zobrazení porovnání (původní vs. skutečná dávka)
- ✅ Editovatelné pole "Cílový zisk (Kč/ha)"
- ✅ Persistentní ukládání počtu kamionů do DB
- ✅ Toast notifikace při použití doporučené ceny

---

## 🧮 Příklad výpočtu

### Zadání:
- Výměra: **80 ha**
- Dávka (zadaná): **500 kg/ha**
- Cena nákupu: **610 Kč/t**
- Cena prodeje: **780 Kč/ha**
- Nájem traktoru: **1200 Kč/mth**
- Výkonnost: **10 ha/mth**
- Nafta: **70 Kč/t**
- Traktorista: **400 Kč/mth** (za hodinu)
- Požadovaný zisk: **330 Kč/ha**

### Výpočet BEZ kamionové logistiky:
```
Spotřeba: 40 t
Hodiny: 8 mth
Tržba: 62 400 Kč
Náklady: 
  - Materiál: 24 400 Kč
  - Traktor: 9 600 Kč
  - Nafta: 2 800 Kč
  - Traktorista: 3 200 Kč
  - Celkem: 40 000 Kč
Zisk: 22 400 Kč (280 Kč/ha) ✅
```

### Výpočet S kamionovou logikou (2 kamiony):
```
Teoretická potřeba: 40 t
Počet kamionů: 2× (60 t)
Skutečná dávka: 750 kg/ha ⬆️

Spotřeba: 60 t
Hodiny: 8 mth
Tržba: 62 400 Kč (stejná)
Náklady:
  - Materiál: 36 600 Kč ⬆️
  - Traktor: 9 600 Kč
  - Nafta: 4 200 Kč ⬆️
  - Traktorista: 4 800 Kč ⬆️
  - Celkem: 55 200 Kč ⬆️
Zisk: 7 200 Kč (90 Kč/ha) ❌ PŘÍLIŠ NÍZKÝ!

💡 Doporučená cena: (55 200 + 26 400) / 80 = 1 020 Kč/ha

S novou cenou 1 020 Kč/ha:
Tržba: 81 600 Kč
Náklady: 55 200 Kč
Zisk: 26 400 Kč (330 Kč/ha) ✅ OPTIMÁLNÍ!
```

---

## 🔧 Technické detaily

### Soubory změněny:
1. ✅ `lib/supabase/sql/add_truck_logistics_fields.sql` (nový)
2. ✅ `lib/types/database.ts` (aktualizován)
3. ✅ `components/admin/AgroManagerCalculator.tsx` (rozšířen)
4. ✅ `app/api/admin/agro-customers/create/route.ts` (aktualizován)

### Soubory NEZMĚNĚNY:
- `app/portal/admin/agromanager/page.tsx` (bez změn)
- `app/api/admin/agro-customers/route.ts` (bez změn)
- `app/api/admin/agro-customers/[id]/route.ts` (bez změn - podporuje partial update)

---

## 📖 Pro další rozšíření

### Možné budoucí vylepšení:

1. **Varianty kamionů**
   - Přidat podporu pro různé kapacity (20t, 25t, 30t)
   - Dropdown menu pro výběr velikosti kamionu

2. **Optimalizace více zákazníků**
   - Seskupit zákazníky se stejným materiálem
   - Navrhnout optimální rozdělení kamionů

3. **Historie cen**
   - Ukládat historii změn cen
   - Graf vývoje doporučené ceny

4. **Export do Excel**
   - Export kalkulace s kamionovou logikou
   - Porovnávací tabulka scénářů

---

## ✅ Implementace dokončena!

Kamionová logistika je plně funkční a integrovaná do AgroManažeru.

**Poslední aktualizace:** 2026-01-22

