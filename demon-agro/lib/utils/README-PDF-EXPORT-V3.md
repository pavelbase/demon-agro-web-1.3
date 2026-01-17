# PDF Export V3 - Návod k použití

## 📄 Přehled

Profesionální PDF export kalkulačky ztrát s důrazem na:
- ✅ **Vizuální strukturu** (dashboard karty, grid layout)
- ✅ **Native jsPDF rendering** (bez html2canvas)
- ✅ **Logo na každé stránce**
- ✅ **Automatické stránkování**

---

## 🚀 Rychlý start

### 1. Import funkce

```typescript
import { exportToPDF, PDFDashboardData } from '@/lib/utils/kalkulacka-export-pdf-v3'
```

### 2. Připravte data

```typescript
const pdfData: PDFDashboardData = {
  // Input parameters
  fertilizerCost: 8000,
  revenuePerHa: 35000,
  limingCostPerTon: 800,
  
  // Dashboard cards
  totalLossYear: 3807788,
  totalLimingCost: 2943816,
  averageROIMonths: 11,
  averagePh: 6.2,
  
  // Additional info
  criticalParcelsCount: 18,
  totalAreaHa: 1358.2,
  totalParcelsCount: 87,
  
  // Table data
  parcels: [
    {
      kod: '6504/25',
      nazev: 'standardni orna puda',
      vymeraHa: 5.27,
      typPudy: 'S',
      aktualnePh: 4.1,
      cilovePh: 6.5,
      efektivita: 0.22,
      ztrataKcHaRok: 17806,
      ztrataCelkem: 93838,
      nakladyVapneni: 48646,
      navratnostMesice: 7
    },
    // ... více pozemků
  ]
}
```

### 3. Zavolejte export

```typescript
await exportToPDF(pdfData)
```

---

## 🎨 Struktura PDF

### Stránka 1 - Dashboard

```
┌────────────────────────────────────────────────┐
│ [Logo]      KALKULAČKA ZTRÁT      15.1.2026   │
├────────────────────────────────────────────────┤
│ PARAMETRY VÝPOČTU                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Hnojiva  │ │  Tržby   │ │ Vápnění  │       │
│ │ 8000 Kč  │ │ 35000 Kč │ │  800 Kč  │       │
│ └──────────┘ └──────────┘ └──────────┘       │
├────────────────────────────────────────────────┤
│ PŘEHLED ZTRÁT                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │3.8 M │ │2.9 M │ │ 11   │ │ pH   │          │
│ │Ztráta│ │Vápní │ │měsíců│ │ 6.2  │          │
│ └──────┘ └──────┘ └──────┘ └──────┘          │
├────────────────────────────────────────────────┤
│ TABULKA POZEMKŮ                                │
│ ┌───┬─────┬────┬────┬───┬────┬────┬────┐    │
│ │Kód│Název│ ha │pH  │...│Ztráta│Vápnění│    │
│ ├───┼─────┼────┼────┼───┼────┼────┼────┤    │
│ │...│     │    │    │   │     │       │    │
└────────────────────────────────────────────────┘
```

### Strány 2-N - Pokračování tabulky

- Logo nahoře
- Hlavička tabulky se opakuje
- Automatické stránkování

### Poslední strana - Metodika

- Vědecké zdroje (5 zdrojů)
- Detailní výpočty (4 sekce)
- Důležité poznámky

---

## 🖼️ Přidání loga

### ⚠️ Důležité změny:

✅ **Logo je pouze na první stránce**  
✅ **Automatické zachování aspect ratio** (proporce)  
✅ **Fixní šířka 15mm, výška se vypočítá automaticky**

### Krok 1: Převeďte logo na Base64

#### Online konvertor (nejrychlejší):
```
1. Jděte na: https://base64.guru/converter/encode/image
2. Nahrajte: demon-agro/public/logo.png
3. Klikněte "Encode image to Base64"
4. Zkopírujte celý string (začíná "data:image/png;base64,...")
```

#### Node.js (pro automatizaci):
```bash
cd demon-agro
node -e "const fs = require('fs'); const img = fs.readFileSync('public/logo.png'); console.log('data:image/png;base64,' + img.toString('base64'));" > logo-b64.txt
```

### Krok 2: Vložte Base64 do kódu

Otevřete soubor:
```
demon-agro/lib/utils/kalkulacka-export-pdf-v3.ts
```

Najděte řádek 22-28:
```typescript
const LOGO_BASE64 = "" // TODO: Insert base64 logo here
```

Nahraďte prázdný string vaším Base64:
```typescript
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." // Celý váš string
```

### Krok 3: Hotovo! 🎉

Logo se nyní zobrazí **pouze na první stránce** s **perfektními proporcemi**.

**Jak to funguje:**
```typescript
// 1. Vytvoří se Image object z Base64
const img = new Image()
img.src = LOGO_BASE64

// 2. Získá se aspect ratio z přirozených rozměrů
const aspectRatio = img.naturalHeight / img.naturalWidth

// 3. Vypočítá se výška: 15mm × aspectRatio
const calculatedHeight = 15 * aspectRatio

// 4. Logo se vykreslí s perfektními proporcemi
doc.addImage(LOGO_BASE64, 'PNG', x, y, 15, calculatedHeight)
```

**Příklady výsledných rozměrů:**
- Čtvercové logo (1:1): `15mm × 15mm`
- Široké logo (3:1): `15mm × 5mm`
- Vysoké logo (1:2): `15mm × 30mm`

---

## 🎨 Dashboard Cards - Klíčová část

### Barvy karet

```typescript
const COLORS = {
  cardRed: { r: 255, g: 239, b: 239 },      // Celková ztráta
  cardBlue: { r: 239, g: 246, b: 255 },     // Náklady vápnění
  cardGreen: { r: 236, g: 253, b: 245 },    // Návratnost
  cardOrange: { r: 255, g: 251, b: 235 },   // Průměrné pH
}
```

### Struktura karty

```
┌─────────────────────┐
│ Celková ztráta      │ ← Label (malý, šedý)
│                     │
│ 3 807 788 Kč       │ ← Main Value (velký, tučný, barevný)
│                     │
│ 18 kritické pozemky│ ← Subtext (malý, šedý)
└─────────────────────┘
```

### Upravení barev

Pokud chcete změnit barvy karet:

```typescript
// V souboru kalkulacka-export-pdf-v3.ts, řádek ~60
drawDashboardCard(doc, {
  x: PAGE.marginLeft,
  y: currentY,
  width: cardWidth,
  height: cardHeight,
  bgColor: { r: 255, g: 200, b: 200 },  // ← Změňte RGB
  iconColor: '#FF0000',                  // ← Změňte barvu textu
  mainValue: '...',
  label: '...',
  subtext: '...'
})
```

---

## 📊 Tabulka

### Sloupce

| Sloupec | Šířka (mm) | Zarovnání | Popis |
|---------|-----------|-----------|-------|
| Kód | 18 | Left | Kód pozemku |
| Název | 45 | Left | Název pozemku |
| Výměra | 15 | Right | Hektary |
| Typ půdy | 15 | Center | L/S/T |
| pH | 12 | Center | Aktuální pH |
| Cílové pH | 15 | Center | Target pH |
| Efektivita | 15 | Center | Procenta |
| Ztráta/ha | 20 | Right | Kč/ha/rok |
| Ztráta celkem | 25 | Right | Kč celkem |
| Vápnění | 22 | Right | Náklady Kč |
| Návratnost | 15 | Center | Měsíce |

### Barevné označení pH

- **pH < 5.0:** Červeně, tučně
- **pH 5.0-5.5:** Oranžově, tučně
- **pH > 5.5:** Normálně

---

## ⚙️ Konfigurace

### Rozměry stránky

```typescript
const PAGE = {
  width: 297,        // A4 landscape šířka
  height: 210,       // A4 landscape výška
  marginLeft: 20,    // Levý okraj
  marginRight: 20,   // Pravý okraj
  marginTop: 15,     // Horní okraj
  marginBottom: 15,  // Dolní okraj
  contentWidth: 257, // 297 - 20 - 20
}
```

### Velikosti fontů

```typescript
const FONTS = {
  title: 18,      // Hlavní nadpis
  heading: 14,    // Sekce nadpisy
  subheading: 11, // Podnadpisy
  body: 9,        // Normální text
  small: 7.5,     // Malý text
  tiny: 6.5,      // Mini text
}
```

---

## 🔧 Integrace do komponenty

### V KalkulackaZtrat.tsx

```typescript
import { exportToPDF } from '@/lib/utils/kalkulacka-export-pdf-v3'

const handleExportPDF = async () => {
  if (!summary) return

  const pdfData = {
    fertilizerCost,
    revenuePerHa,
    limingCostPerTon,
    
    totalLossYear: summary.celkovaZtrata,
    totalLimingCost: summary.celkoveNakladyVapneni,
    averageROIMonths: summary.prumernaNavratnost,
    averagePh: summary.prumernePh,
    
    criticalParcelsCount: summary.pozemky.filter(p => p.aktualnePh < 5.5).length,
    totalAreaHa: summary.celkovaVymera,
    totalParcelsCount: summary.pozemky.length,
    
    parcels: summary.pozemky.map(p => ({
      kod: pozemky.find(poz => poz.id === p.pozemekId)?.kod || null,
      nazev: p.nazev,
      vymeraHa: p.vymeraHa,
      typPudy: p.typPudy,
      aktualnePh: p.aktualnePh,
      cilovePh: p.cilovePh,
      efektivita: p.efektivita,
      ztrataKcHaRok: p.celkovaZtrataKcHa,
      ztrataCelkem: p.celkovaZtrataPozemek,
      nakladyVapneni: p.nakladyVapneni,
      navratnostMesice: p.navratnostMesice,
    }))
  }

  await exportToPDF(pdfData)
}
```

---

## 🐛 Troubleshooting

### Logo se zobrazuje deformované (roztažené)

**Problém:** Logo vypadá roztažené nebo zmáčknuté

**Řešení:**
✅ **Toto je již opraveno ve V3!**

Nový kód automaticky:
1. Načte přirozené rozměry obrázku
2. Vypočítá aspect ratio
3. Nastaví šířku na 15mm
4. Automaticky vypočítá výšku pro zachování proporcí

```typescript
// Automatický výpočet
const aspectRatio = img.naturalHeight / img.naturalWidth
const height = 15 * aspectRatio  // Perfektní proporce!
```

### Logo je na všech stránkách a chci ho jen na první

**Problém:** Logo se opakuje na každé stránce

**Řešení:**
✅ **Toto je již opraveno ve V3!**

Logo se zobrazuje **pouze na první stránce**. Odstraněno z:
- ❌ Stránek 2-N (tabulka)
- ❌ Poslední stránky (metodika)

### Logo je příliš velké/malé

**Problém:** Logo zabírá moc místa nebo je příliš malé

**Řešení:**
Změňte konstantu `logoWidth` v kódu (řádek ~202):

```typescript
// V exportToPDF funkci
const logoWidth = 15  // ← Změňte na 10, 20, 25 atd.
```

Výška se automaticky přizpůsobí!

### Karty jsou rozházené

**Problém:** Dashboard karty se překrývají nebo jsou špatně rozmístěné

**Řešení:**
```typescript
// Zkontrolujte výpočet šířky
const cardWidth = (PAGE.contentWidth - 12) / 4  // 3 mezery po 4mm
const cardGap = 4
```

### Tabulka přetéká přes okraj

**Problém:** Text v tabulce je příliš dlouhý

**Řešení:**
```typescript
// Upravte šířky sloupců v columnStyles
columnStyles: {
  1: { halign: 'left', cellWidth: 50 },  // Zvětšete šířku
}
```

---

## 📚 Další zdroje

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [jsPDF AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [Base64 Guru](https://base64.guru/)

---

**Vytvořeno:** 15.01.2026  
**Verze:** 3.0  
**Autor:** Senior Frontend Developer

