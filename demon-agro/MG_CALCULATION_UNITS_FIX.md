# CRITICAL FIX: Mg Calculation Units Error

## 🔴 PROBLÉM

Funkce `calculateMgChange()` měla **chybu ve výpočtu jednotek**, která způsobovala, že:
- ❌ Mg v tabulce **klesalo** místo aby stoupalo (89 → 79 → 64 mg/kg)
- ❌ Systém doporučoval **Dolomit při každé aplikaci** (všechny roky 2026, 2028, 2031, 2034)
- ❌ **IGNOROVAL se přírůstek** z aplikace MgO

## 🧮 MATEMATICKÁ KONTROLA (Selský rozum)

### Vstup: 1.2 t MgO/ha

**Krok 1: Převod MgO na čistý Mg**
```
1.2 t MgO/ha = 1200 kg MgO/ha
Mg obsah v MgO: 60.3%
Čistý Mg: 1200 × 0.603 = 723 kg Mg/ha
```

**Krok 2: Hmotnost ornice (20 cm, střední půda)**
```
Plocha: 10,000 m²/ha
Hloubka: 0.2 m (20 cm - AZZP standard!)
Objemová hmotnost: 1.4 t/m³
Hmotnost půdy: 10,000 × 0.2 × 1.4 = 2,800 tun/ha
              = 2,800,000 kg/ha
```

**Krok 3: Výpočet koncentrace**
```
Koncentrace = (723 kg Mg / 2,800,000 kg půdy) × 1,000,000
            = 258 mg/kg (syrový přírůstek)
```

**Krok 4: Účinnost (40% dostupnost v 1. roce)**
```
Efektivní přírůstek = 258 × 0.4 = ~103 mg/kg
```

### ✅ OČEKÁVANÝ VÝSLEDEK
```
Mg před aplikací: 89 mg/kg
Mg po aplikaci:   89 + 103 = ~192 mg/kg
```

## 🐛 CO BYLO ŠPATNĚ

### PŘED OPRAVOU (Chybný kód):
```typescript
// ❌ CHYBNÝ VÝPOČET (nesprávné jednotky)
const mgKgHa = mgoAmount * 1000 * 0.6 // t/ha → kg/ha
const hmotnostPudyKgHa = 10000 * hloubka * objHmotnost * 1000
const zvyseniMgKg = (mgKgHa * ucinnost * 1000) / hmotnostPudyKgHa
//                                        ↑ 
//                     CHYBA: Navíc 1000× způsobuje podhodnocení!
```

**Problém:**
- Nesprávný převod jednotek v řádku 416
- Výsledek byl ~100× menší než měl být
- Přírůstek: ~1 mg/kg místo ~100 mg/kg

## ✅ OPRAVA

### PO OPRAVĚ (Správný kód):
```typescript
function calculateMgChange(
  mgoAmount: number, // t MgO/ha
  soilType: SoilType
): number {
  // Konstanty pro převod jednotek
  const MGO_TO_MG_RATIO = 0.603 // Mg tvoří 60.3% MgO
  const KG_IN_TON = 1000
  const MG_IN_KG = 1e6 // pro převod na mg/kg (ppm)
  
  // KROK 1: Čistý Mg v kg/ha
  const mgKgPerHa = mgoAmount * KG_IN_TON * MGO_TO_MG_RATIO
  
  // KROK 2: Hmotnost půdy (kg/ha) - AZZP standard 20 cm
  const depth = 0.2 // ✅ 20 cm (NE 15 cm!)
  const density = soilType === 'L' ? 1.3 : soilType === 'S' ? 1.4 : 1.5
  const soilMassKgPerHa = 10000 * depth * density * KG_IN_TON
  
  // KROK 3: Účinnost (40% dostupnost v 1. roce)
  const efficiency = 0.4
  
  // KROK 4: Výsledné zvýšení v mg/kg
  // ✅ SPRÁVNÝ VÝPOČET:
  const rawIncrease = (mgKgPerHa / soilMassKgPerHa) * MG_IN_KG
  const effectiveIncrease = rawIncrease * efficiency
  
  return Math.round(effectiveIncrease * 10) / 10
}
```

## 📊 PŘÍKLAD OPRAVY

### PŘED (CHYBNĚ):
```
Aplikace 2026:
  - Mg před: 89 mg/kg
  - Dolomit: 1.2 t MgO/ha
  - Přírůstek: ~1 mg/kg ❌ (chyba ve výpočtu!)
  - Mg po: 90 mg/kg (89 + 1)
  
--- 2 roky gap (deplece 2 × 5 = 10 mg/kg) ---
  
Aplikace 2028:
  - Mg před: 80 mg/kg (90 - 10) ❌ Kleslo!
  - 80 < 130 → Dolomit ❌ (opět Dolomit!)
  - Přírůstek: ~1 mg/kg ❌
  - Mg po: 81 mg/kg
  
Aplikace 2031:
  - Mg před: 66 mg/kg ❌ Stále klesá!
  - → Dolomit ❌ (pořád Dolomit!)
```

### PO OPRAVĚ (SPRÁVNĚ):
```
Aplikace 2026:
  - Mg před: 89 mg/kg
  - Dolomit: 1.2 t MgO/ha
  - Přírůstek: ~103 mg/kg ✅ (správný výpočet!)
  - Mg po: 192 mg/kg (89 + 103) ✅
  - Doporučení: "Nízké Mg (89 mg/kg) - doporučen dolomitický vápenec"
  
--- 2 roky gap (deplece 2 × 5 = 10 mg/kg) ---
  
Aplikace 2028:
  - Mg před: 182 mg/kg (192 - 10) ✅ Zůstává vysoké!
  - 182 > 130 → VÁPENEC ✅ (přechod na vápenec!)
  - Přírůstek: 0 mg/kg (vápenec neobsahuje MgO)
  - Mg po: 182 mg/kg
  - Doporučení: "Udržovací vápnění (Mg: 182 mg/kg dostatečné)"
  
Aplikace 2031:
  - Mg před: 167 mg/kg (182 - 15) ✅
  - 167 > 130 → VÁPENEC ✅
  - Doporučení: "Udržovací vápnění (Mg: 167 mg/kg dostatečné)"
```

## ✅ VALIDACE VÝPOČTU

### Test: 1.2 t MgO/ha, Střední půda (S)

**Vstup:**
- MgO: 1.2 t/ha
- Typ půdy: S (střední)
- Hustota: 1.4 t/m³
- Hloubka: 0.2 m

**Výpočet:**
```typescript
mgKgPerHa = 1.2 × 1000 × 0.603 = 723.6 kg Mg/ha
soilMassKgPerHa = 10000 × 0.2 × 1.4 × 1000 = 2,800,000 kg/ha
rawIncrease = (723.6 / 2,800,000) × 1,000,000 = 258.4 mg/kg
effectiveIncrease = 258.4 × 0.4 = 103.4 mg/kg
```

**Výsledek:** `103.4 mg/kg` ✅ (odpovídá agronomickým očekáváním!)

## 🎯 KLÍČOVÉ ZMĚNY

1. **Hloubka:** ✅ Zůstává **20 cm** (AZZP standard, NE 15 cm!)
2. **Převod jednotek:** ✅ Opravena matematika (odstraněno nadbytečné `× 1000`)
3. **MGO_TO_MG_RATIO:** ✅ Přesnější hodnota 0.603 (místo 0.6)
4. **Komentáře:** ✅ Přidány jasné kroky a vysvětlení

## 📋 ZMĚNĚNÉ SOUBORY

### `lib/utils/liming-calculator.ts`
- ✏️ Funkce `calculateMgChange()` - kompletně přepsána
- ✅ Správné jednotky a převodní faktory
- ✅ Zachována 20 cm hloubka (AZZP standard)
- ✅ Akumulace Mg funguje správně (řádek 687: `mgAfter = mgBefore + mgChange`)

## 🧪 OČEKÁVANÉ CHOVÁNÍ PO OPRAVĚ

### Po vygenerování nového plánu:

1. ✅ **První aplikace (2026):**
   - Mg: 89 → ~192 mg/kg
   - Produkt: Dolomit (správně)
   - Doporučení: "Nízké Mg (89 mg/kg)"

2. ✅ **Druhá aplikace (2028-2029):**
   - Mg: ~182 mg/kg (po depleci)
   - Produkt: **VÁPENEC** (přechod z Dolomitu!)
   - Doporučení: "Udržovací vápnění (Mg: 182 mg/kg dostatečné)"

3. ✅ **Následující aplikace:**
   - Mg zůstává vysoké (150-180 mg/kg)
   - Produkt: Stále VÁPENEC
   - Doporučení: "Udržovací vápnění"

## 🚨 TESTOVÁNÍ

1. **Smažte starý plán** (měl chybný výpočet Mg)
2. **Vygenerujte nový plán** s Mg < 130 mg/kg
3. ✅ Zkontrolujte, že **Mg stoupá** po první aplikaci (89 → ~190 mg/kg)
4. ✅ Zkontrolujte, že **druhá aplikace používá Vápenec** (ne Dolomit!)
5. ✅ Zkontrolujte doporučení (měly by reflektovat vysoké Mg)

## 📅 DATUM IMPLEMENTACE
5. ledna 2026

## 👨‍💻 AUTOR
AI Assistant (Claude Sonnet 4.5) + Pavel Baše

---

## 🎓 PONAUČENÍ

**Lesson Learned:**
> Při výpočtech s převodem jednotek vždy:
> - ✅ Explicitně pojmenovat každý převodní faktor
> - ✅ Komentovat každý krok výpočtu
> - ✅ Provést "selský rozum" kontrolu výsledku
> - ✅ Nikdy nepoužívat "magické" násobky (× 1000) bez jasného důvodu

**Pro budoucnost:**
> Před nasazením do produkce vždy ověřit matematiku na papíře nebo kalkulačce!



