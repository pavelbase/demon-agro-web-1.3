# CHANGELOG - Oprava kritické chyby v jednotkách vápnění

**Datum:** 4. ledna 2026  
**Verze:** 1.3.1  
**Typ:** CRITICAL BUGFIX 🔴

---

## 🐛 OPRAVENÁ CHYBA

### Popis problému
V PDF protokolech doporučení vápnění byla nalezena **kritická chyba v jednotkách**, která vedla k nadhodnoceným doporučením o **79%**.

**Příčina:**
- Funkce `calculateLimeNeed()` vrací hodnoty v **kg CaCO3/ha**
- Tyto hodnoty se převáděly na tuny (`/1000`) → **t CaCO3/ha**
- Ale v PDF se zobrazovaly jako **"CaO (t/ha)"** bez chemické konverze
- Chyběl přepočet: **1 t CaCO3 = 0.559 t CaO**

**Dopad:**
- Všechna PDF vygenerovaná před 4.1.2026 obsahují **chybné hodnoty**
- Příklad: Místo správných 5.36 t CaO/ha se tisklo 9.60 t CaO/ha
- Rozdíl: **+79%** (téměř dvojnásobek!)

---

## ✅ PROVEDENÉ OPRAVY

### 1. Opravený soubor: `TabulkovyPrehledVapneni.tsx`

**Řádek 225 - PŘED:**
```typescript
potrebaCaoTHa = limeNeed.amount / 1000 // převod z kg na tuny
// ❌ CHYBA: Chybí chemická konverze CaCO3 → CaO
```

**Řádek 225-229 - PO:**
```typescript
// KRITICKÁ OPRAVA (4.1.2026): calculateLimeNeed() vrací kg CaCO3/ha
// Musíme převést na t CaO/ha pomocí utility funkce
// Tato funkce kombinuje převod jednotek (kg→t) a chemickou konverzi (CaCO3→CaO)
potrebaCaoTHa = kgCaco3PerHa_to_tCaoPerHa(limeNeed.amount)
// ✅ SPRÁVNĚ: (kg CaCO3 / 1000) × 0.559 = t CaO
```

---

### 2. Nový soubor: `lib/utils/lime-unit-conversions.ts`

Vytvořen kompletní utility modul pro převody jednotek vápnění:

**Funkce:**
- `caoToCaco3()` - Převod CaO → CaCO3
- `caco3ToCao()` - Převod CaCO3 → CaO
- `kgCaco3PerHa_to_tCaoPerHa()` - **Hlavní funkce pro opravu**
- `tCaoPerHa_to_kgCaco3PerHa()` - Opačná konverze
- `tCaco3PerHa_to_tCaoPerHa()` - Tuny CaCO3 → tuny CaO
- `tCaoPerHa_to_tCaco3PerHa()` - Tuny CaO → tuny CaCO3
- `calculateProductAmount()` - Výpočet množství produktu podle % CaO
- `calculateCaoInProduct()` - Výpočet CaO v produktu
- `convertLimeUnits()` - Univerzální převodník
- `formatLimeValue()` - Formátování s jednotkou

**Konstanty:**
- `CAO_TO_CACO3_FACTOR = 1.79`
- `CACO3_TO_CAO_FACTOR = 0.559`

---

### 3. Dokumentace

Vytvořeny následující dokumenty:

1. **`AUDIT_METODIKY_VYPOCTU_ZIVIN.md`**
   - Kompletní audit metodiky (402 řádků)
   - Porovnání veřejné kalkulačky vs. portálu
   - Tabulky rozdílů pro všechny typy půd
   - Identifikace kritické chyby

2. **`KLICOVE_ROZDILY_METODIKY.md`**
   - Stručné shrnutí hlavních rozdílů
   - Rychlý přehled pro vývojáře

3. **`KRITICKA_OPRAVA_JEDNOTEK_VAPNENI.md`**
   - Varování pro uživatele
   - Návod, co dělat se starými PDF
   - Doporučení při předávkování

4. **`OPRAVA_JEDNOTEK_CHANGELOG.md`** (tento soubor)
   - Changelog pro vývojáře
   - Přehled všech změn

---

## 📊 PŘÍKLADY OPRAVY

### Střední půda, pH 4.4

| | Před opravou | Po opravě | Rozdíl |
|---|--------------|-----------|--------|
| **Výsledek z `calculateLimeNeed()`** | 9600 kg CaCO3/ha | 9600 kg CaCO3/ha | - |
| **Zobrazeno v PDF jako "CaO (t/ha)"** | 9.60 ❌ | 5.36 ✅ | -44.2% |
| **Správná interpretace** | 9.60 t CaCO3/ha | 5.36 t CaO/ha | - |

### Lehká půda, pH 5.5

| | Před opravou | Po opravě | Rozdíl |
|---|--------------|-----------|--------|
| **Výsledek z `calculateLimeNeed()`** | 2000 kg CaCO3/ha | 2000 kg CaCO3/ha | - |
| **Zobrazeno v PDF jako "CaO (t/ha)"** | 2.00 ❌ | 1.12 ✅ | -44.0% |

---

## 🧪 TESTOVÁNÍ

### Unit testy (doporučeno přidat)

```typescript
import { 
  kgCaco3PerHa_to_tCaoPerHa,
  caco3ToCao,
  caoToCaco3 
} from '@/lib/utils/lime-unit-conversions'

describe('Lime unit conversions', () => {
  test('CaCO3 to CaO conversion', () => {
    expect(caco3ToCao(1790)).toBeCloseTo(1000, 0)
    expect(caco3ToCao(1)).toBeCloseTo(0.559, 3)
  })
  
  test('CaO to CaCO3 conversion', () => {
    expect(caoToCaco3(1000)).toBeCloseTo(1790, 0)
    expect(caoToCaco3(1)).toBeCloseTo(1.79, 2)
  })
  
  test('kg CaCO3/ha to t CaO/ha', () => {
    expect(kgCaco3PerHa_to_tCaoPerHa(9600)).toBeCloseTo(5.3664, 2)
    expect(kgCaco3PerHa_to_tCaoPerHa(2000)).toBeCloseTo(1.118, 2)
  })
})
```

### Manuální test

1. Otevřít portál
2. Přejít na "Tabulkový přehled vápnění"
3. Vybrat pozemek s pH < 6.0
4. Stáhnout PDF protokol
5. Ověřit, že hodnoty v sloupci "CaO (t/ha)" jsou **nižší** než před opravou
6. Ověřit výpočet: `Hodnota v PDF ≈ (kg CaCO3 z calculateLimeNeed) / 1000 × 0.559`

---

## 🚨 DŮLEŽITÉ UPOZORNĚNÍ PRO UŽIVATELE

### Pokud jste stáhli PDF před 4.1.2026:

1. **PDF je NEPLATNÉ** - obsahuje chybné hodnoty
2. **Stáhněte nové PDF** z portálu (po 4.1.2026)
3. **Nebo přepočítejte ručně:**
   ```
   Správná hodnota CaO = Hodnota z PDF × 0.559
   ```

### Pokud jste už objednali vápno:

- Objednané množství je **o 79% vyšší**, než by mělo být
- Není to smrtelné, ale může způsobit:
  - Nadměrné zvýšení pH
  - Deficit mikroelementů (Fe, Mn, Zn, Cu)
  - Zablokování fosforu
- **Doporučení:**
  - Kontrolní rozbor za 3-6 měsíců
  - Sledovat žloutnutí listů (chloróza)
  - Případně doplnit chelátované mikroelementy

---

## 📞 KONTAKT

Pokud máte dotazy nebo potřebujete pomoc:

**Démon Agro**  
Web: www.demonagro.cz  
Email: [váš email]  
Tel: [váš telefon]

---

## 🔄 SOUVISEJÍCÍ ZMĚNY

### Soubory upravené:
- ✅ `demon-agro/components/portal/TabulkovyPrehledVapneni.tsx` (řádek 225)

### Soubory vytvořené:
- ✅ `demon-agro/lib/utils/lime-unit-conversions.ts` (nový modul)
- ✅ `demon-agro/AUDIT_METODIKY_VYPOCTU_ZIVIN.md`
- ✅ `demon-agro/KLICOVE_ROZDILY_METODIKY.md`
- ✅ `demon-agro/KRITICKA_OPRAVA_JEDNOTEK_VAPNENI.md`
- ✅ `demon-agro/OPRAVA_JEDNOTEK_CHANGELOG.md`

### Soubory beze změn (ověřeno):
- ✅ `demon-agro/lib/utils/calculations.ts` - používá správné jednotky (kg CaCO3/ha)
- ✅ `demon-agro/lib/utils/liming-calculator.ts` - používá správné jednotky (t CaO/ha/rok)
- ✅ `demon-agro/lib/kalkulace.ts` - používá správné jednotky (t CaO/ha)
- ✅ `demon-agro/lib/utils/liming-pdf-export.ts` - pouze zobrazuje data z props

---

## ✅ CHECKLIST PRO DEPLOYMENT

- [x] Opravena chyba v `TabulkovyPrehledVapneni.tsx`
- [x] Vytvořen utility modul `lime-unit-conversions.ts`
- [x] Vytvořena dokumentace pro uživatele
- [x] Vytvořena dokumentace pro vývojáře
- [x] Ověřeno linterem (0 errors)
- [ ] Přidány unit testy (doporučeno)
- [ ] Manuální test v portálu
- [ ] Notifikace uživatelům se starými PDF
- [ ] Update verze v `package.json` → 1.3.1

---

**Konec dokumentu**

Datum poslední aktualizace: 4. ledna 2026




