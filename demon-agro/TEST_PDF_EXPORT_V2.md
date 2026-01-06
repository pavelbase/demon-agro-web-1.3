# TEST PLAN - PDF Export V2

**Date:** January 4, 2026  
**Purpose:** Verify Czech character support and professional layout

---

## 🧪 QUICK TEST

### Test Data (Czech Characters)

```typescript
const testData: LimingPDFData = {
  companyName: 'Zkušební zemědělský podnik ŠÝP',
  totalParcels: 5,
  totalArea: 50.5,
  averagePh: 5.2,
  totalCaoNeed: 25.5,
  parcelsToLime: 3,
  parcelsOk: 2,
  rows: [
    {
      kultura: 'Orná',
      pozemek: 'Horní pole',
      kodPozemku: '1234/5',
      vymera: '10,00',
      druh: 'Střední',
      rokRozboru: '2024',
      ph: '4,4',
      ca: '1070',
      mg: '91',
      k: '148',
      p: '171',
      s: '19,1',
      kMgRatio: '1,63 (+ Mg)',
      potrebaCaoTHa: '5,36',
      potrebaCaoCelkem: '53,6',
      doporucenyProdukt: 'Pálené vápno',
      davkaProdukt: '6,31',
      stav: 'Vyžaduje vápnění',
    },
    {
      kultura: 'Orná',
      pozemek: 'Dolní pole',
      kodPozemku: '2345/6',
      vymera: '15,50',
      druh: 'Těžká',
      rokRozboru: '2024',
      ph: '6,2',
      ca: '2890',
      mg: '215',
      k: '380',
      p: '195',
      s: '22,5',
      kMgRatio: '1,77 (+ Mg)',
      potrebaCaoTHa: '-',
      potrebaCaoCelkem: '-',
      doporucenyProdukt: '-',
      davkaProdukt: '-',
      stav: 'V pořádku',
    },
    {
      kultura: 'Orná',
      pozemek: 'Středové pole',
      kodPozemku: '3456/7',
      vymera: '12,00',
      druh: 'Lehká',
      rokRozboru: '2023',
      ph: '5,1',
      ca: '1520',
      mg: '124',
      k: '88',
      p: '184',
      s: '19,0',
      kMgRatio: '0,71 (+ K)',
      potrebaCaoTHa: '2,24',
      potrebaCaoCelkem: '26,9',
      doporucenyProdukt: 'Vápenec mletý',
      davkaProdukt: '4,67',
      stav: 'Vyžaduje vápnění',
    },
  ],
}
```

---

## ✅ EXPECTED RESULTS

### 1. Header Section
- [x] Logo: "DÉMON AGRO" in dark green box
- [x] Title: "PROTOKOL DOPORUČENÍ VÁPNĚNÍ A VÝŽIVY ROSTLIN"
- [x] Company: "Zkušební zemědělský podnik ŠÝP" (with Š, Ý, P displayed correctly)
- [x] Total area: "50,50 ha" (comma as decimal separator)
- [x] Date: "4. ledna 2026" (Czech month name)
- [x] Average pH: "5,2" in orange color (warning)

### 2. Recommendations Section (should appear)
- [x] "📋 CELKOVÉ HODNOCENÍ"
- [x] Text: "Podnik má mírně kyselou půdní reakci..."
- [x] "Strategie vápnění:"
- [x] Mentions dolomite if Mg is low

### 3. Table
- [x] Header row: Dark green background, white text
- [x] Column headers with Czech characters:
  - "Kód pozemku" (not "Kod pozemku")
  - "Výměra (ha)" (not "Vymera")
  - "Poměr K/Mg" (not "Pomer")
  - "Doporučený produkt" (not "Doporuceny")
- [x] Data rows:
  - Row 1: "Střední" (not "Styed" or "Stredni")
  - Row 2: "Těžká" (not "Tžka" or "Tezka")
  - Row 3: "Lehká" (not "Lehka")
- [x] Products:
  - "Pálené vápno" (not "Palene vapno")
  - "Vápenec mletý" (not "Vapenec miety")
- [x] Zebra striping (alternating row colors)
- [x] Numbers: "10,00" with comma (not "10.00" with dot)

### 4. pH Color Coding
- [x] pH 4.4: RED (< 5.0) + light red background
- [x] pH 5.1: ORANGE (5.0-5.5)
- [x] pH 6.2: GREEN (≥ 6.0)

### 5. K/Mg Ratio Color Coding
- [x] 1.63: ORANGE (outside 1.1-1.6)
- [x] 1.77: ORANGE
- [x] 0.71: RED (< 0.8) + bold
- [x] Notes: "+ Mg", "+ K" displayed correctly

### 6. Summary Section
- [x] Three colored boxes:
  - Box 1: "Celkem pozemků: 5" (blue)
  - Box 2: "Pozemků k vápnění: 3" (orange/yellow)
  - Box 3: "Pozemků v pořádku: 2" (green)
- [x] "📌 Prioritní akce:" section with bullet points

### 7. Methodology Section
- [x] Header: "METODIKA A POZNÁMKY"
- [x] Notes with correct Czech:
  - "1) Poměr K/Mg (draslík ku hořčíku)..."
  - "2) Doporučený produkt..."
  - "• Dolomit mletý: při nízkém Mg"
  - "• Vápenec mletý: při vyhovujícím Mg"
  - "• Pálené vápno: při urgentní potřebě"

### 8. Footer (on all pages)
- [x] Left: "DÉMON AGRO • www.demonagro.cz"
- [x] Center: "Vygenerováno: 4. ledna 2026"
- [x] Right: "Strana 1 z 1"

---

## 🔍 VISUAL INSPECTION CHECKLIST

### Czech Characters Test
Read these words in the PDF and verify they look correct:

| Word | Expected | ✓ |
|------|----------|---|
| Těžká | Těžká | [ ] |
| Střední | Střední | [ ] |
| Lehká | Lehká | [ ] |
| Výměra | Výměra | [ ] |
| Kód | Kód | [ ] |
| Poměr | Poměr | [ ] |
| Doporučený | Doporučený | [ ] |
| Pálené | Pálené | [ ] |
| Vápenec | Vápenec | [ ] |
| mletý | mletý | [ ] |
| draslík | draslík | [ ] |
| hořčík | hořčík | [ ] |
| nízkém | nízkém | [ ] |
| vyhovujícím | vyhovujícím | [ ] |
| urgentní | urgentní | [ ] |
| potřebě | potřebě | [ ] |
| vápnění | vápnění | [ ] |
| půdy | půdy | [ ] |
| Vygenerováno | Vygenerováno | [ ] |

**If ANY of these look wrong or garbled, the font didn't load correctly!**

---

## 🚨 COMMON ISSUES

### Issue 1: Some Czech characters missing
**Example:** "T žka" instead of "Těžká"

**Diagnosis:**
- Font failed to load
- Check browser console for errors

**Fix:**
```typescript
// Check if font loaded successfully
const loaded = await loadRobotoFont(doc)
if (!loaded) {
  console.error('Font loading failed!')
  // Consider fallback or retry
}
```

### Issue 2: All text is boxes/squares
**Diagnosis:**
- Font completely failed
- Browser blocked Google Fonts CDN

**Fix:**
- Use bundled local fonts instead of CDN
- See "Option 2" in upgrade guide

### Issue 3: Numbers use dots instead of commas
**Example:** "10.00" instead of "10,00"

**Fix:**
```typescript
// Use formatNumber() helper
function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals).replace('.', ',')
}
```

---

## 📱 BROWSER COMPATIBILITY TEST

Test PDF generation in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

**All should display Czech characters correctly!**

---

## 🎯 SUCCESS CRITERIA

✅ **PASS if:**
1. All Czech characters display correctly (no garbled text)
2. Color coding works (pH red/orange/green)
3. Layout is professional and clean
4. Recommendations section appears
5. Summary boxes show correct data
6. Footer shows on all pages
7. PDF opens in all major readers

❌ **FAIL if:**
1. Any Czech character is garbled
2. Colors are missing
3. Layout is broken
4. Font didn't load
5. Data is incorrect

---

## 📋 MANUAL TEST STEPS

1. Open your app in browser
2. Navigate to liming recommendations page
3. Click "Export PDF" or "Stáhnout PDF protokol"
4. Wait for download (should be <3 seconds)
5. Open PDF in reader
6. Check header - do you see "DÉMON AGRO"?
7. Check title - "PROTOKOL DOPORUČENÍ VÁPNĚNÍ..."?
8. Check table - do you see "Střední", "Těžká", "Lehká"?
9. Check products - "Pálené vápno", "Vápenec mletý"?
10. Check footer - "Vygenerováno: [date]"?

**If all YES → SUCCESS! ✅**

---

## 🐛 DEBUGGING

### Enable Verbose Logging

```typescript
// In liming-pdf-export-v2.ts
console.log('📄 Starting PDF generation...')
console.log('✅ Roboto font loaded:', loaded)
console.log('📊 Data:', data)
console.log('📋 Recommendations:', recommendations)
console.log('✅ PDF blob created:', blob.size, 'bytes')
```

### Check Font Loading

```typescript
// Add to PDF generator
try {
  const loaded = await loadRobotoFont(doc)
  if (loaded) {
    console.log('✅ Font loaded successfully')
    const supports = testCzechCharacterSupport(doc, 'Roboto')
    console.log('✅ Czech support:', supports)
  }
} catch (error) {
  console.error('❌ Font error:', error)
}
```

---

## ✅ FINAL CHECKLIST

Before deploying to production:

- [ ] V2 PDF generator tested with real data
- [ ] Czech characters display correctly
- [ ] Color coding works
- [ ] Tested in Chrome, Firefox, Safari, Edge
- [ ] Tested on mobile
- [ ] Loading indicator added for slow generation
- [ ] Error handling implemented
- [ ] Font fallback works if CDN fails
- [ ] User documentation updated
- [ ] Old V1 generator deprecated/removed

---

**Last updated:** January 4, 2026


