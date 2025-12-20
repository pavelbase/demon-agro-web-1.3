# Phase 8.1 - PDF Export - Quick Test Guide

**Status:** ✅ Implementováno  
**Datum:** 20. prosince 2025

---

## 🚀 Quick Start

### 1. Ověření instalace
```bash
cd /workspace/demon-agro
npm list jspdf jspdf-autotable
```

**Expected output:**
```
├── jspdf@2.5.2
└── jspdf-autotable@3.8.4
```

✅ **Hotovo** - Dependencies jsou nainstalovány

---

## 🧪 Testovací workflow

### Scénář 1: Export základního plánu (Typ A)

**Setup:**
1. Přihlásit se jako běžný uživatel
2. Navigovat na: `/portal/pozemky/[id]/plan-hnojeni`
3. Ujistit se, že pozemek má:
   - ✅ Rozbor půdy
   - ❌ Žádný osevní postup
   - ❌ Žádná historie hnojení

**Test steps:**
1. Na stránce plánu hnojení vidíte badge **"Typ A - Základní"**
2. V pravém sidebaru klikněte **"Exportovat do PDF"**
3. Tlačítko zobrazí spinner: "Generuji PDF..."
4. Po 1-2 sekundách se otevře Save dialog
5. Soubor se jmenuje: `Plan_hnojeni_[název]_[rok]_[datum].pdf`

**Expected PDF obsahuje:**
- ✅ Header s "DÉMON AGRO" logem (zelený placeholder)
- ✅ Nadpis "Plán hnojení"
- ✅ Datum vygenerování
- ✅ Sekce "Informace o pozemku" (gray box)
- ✅ Tabulka "Aktuální stav půdy" (pH, P, K, Mg, Ca)
- ✅ Sekce "Doporučení vápnění" (pokud pH < cíl)
- ✅ Tabulka "Doporučené dávky živin" (P₂O₅, K₂O, MgO, S)
- ✅ Varování (pokud existují, barevné boxy)
- ❌ ŽÁDNÁ 4letá predikce
- ✅ Footer s kontakty a disclaimerem

---

### Scénář 2: Export pokročilého plánu (Typ C)

**Setup:**
1. Pozemek s:
   - ✅ Rozbor půdy
   - ✅ Osevní postup (4+ roky)
   - ✅ Historie hnojení (3+ roky)

**Test steps:**
1. Badge zobrazuje **"Typ C - Profesionální"**
2. Na stránce vidíte graf predikce
3. Klikněte **"Exportovat do PDF"**

**Expected PDF obsahuje:**
- ✅ Vše z Scénáře 1 +
- ✅ Tabulka "4letá predikce" (Year, pH, P, K, Mg, S)
- ✅ Poznámka: "Predikce jsou orientační..."
- ✅ Více stran (pokud obsah dlouhý)
- ✅ Čísla stran: "Strana 1 z 2", "Strana 2 z 2"

---

### Scénář 3: Test error handling

**Test 1: Kliknutí během loading**
1. Klikněte "Exportovat do PDF"
2. Během generování znovu klikněte
3. **Expected:** Tlačítko je disabled, nelze kliknout znovu

**Test 2: Simulace chyby**
1. (V dev tools) Simulujte síťovou chybu
2. **Expected:** Červený error box pod tlačítkem s popisem chyby

---

## 🎨 Visual Checklist

Otevřete PDF a zkontrolujte:

### Layout:
- [ ] Logo (placeholder) vlevo nahoře
- [ ] Nadpis "Plán hnojení" uprostřed
- [ ] Datum vpravo nahoře
- [ ] Marginy 15 mm ze všech stran
- [ ] Stránky velikost A4

### Barvy:
- [ ] Header zelený (#4A7C59)
- [ ] Tabulky headers zelené
- [ ] Kategorie barevně kódované:
  - Červená: Nízký, Velmi hluboko
  - Žlutá: Vysoký, Velmi vysoký
  - Zelená: Dobrý, Neutrální
- [ ] Varování boxes barevné (červená/žlutá/modrá)

### České texty:
- [ ] Datum: "20. prosince 2025" (ne "December 20, 2025")
- [ ] Čísla: "1 234,56" (ne "1,234.56")
- [ ] Kategorie: "Velmi vysoký" (ne "Very high")
- [ ] Půdní druh: "Lehká/Střední/Těžká"
- [ ] Kultura: "Orná půda" nebo "TTP"

### Tabulky:
- [ ] Hlavičky zelené s bílým textem
- [ ] Alternate rows světle šedé
- [ ] Ohraničení správné
- [ ] Text není ořezaný
- [ ] Čísla zarovnaná vpravo

### Footer:
- [ ] "Vygenerováno portálem Démon Agro"
- [ ] Email: base@demonagro.cz
- [ ] Telefon: +420 731 734 907
- [ ] Disclaimer italic
- [ ] Čísla stran (vpravo dole)

---

## 🐛 Known Issues to Check

### Issue 1: Text overflow
**Symptom:** Text přetéká mimo stránku  
**Check:** Dlouhý `lime_reasoning` text  
**Expected:** Automatický wrap (splitTextToSize)

### Issue 2: Missing categories
**Symptom:** Kategorie zobrazují "-"  
**Check:** Rozbor bez některých hodnot  
**Expected:** Graceful fallback na "-"

### Issue 3: Page numbers
**Symptom:** Čísla stran chybí nebo špatně  
**Check:** Multi-page PDF  
**Expected:** "Strana 1 z 2" na každé stránce

---

## 📱 Browser Testing

### Desktop:
- [ ] Chrome (latest) - Download + View
- [ ] Firefox (latest) - Download + View
- [ ] Safari (macOS) - Download + View
- [ ] Edge - Download + View

### Mobile:
- [ ] Chrome Android - Download to Files
- [ ] Safari iOS - Download to Files
- [ ] Verify file opens in PDF reader

---

## 🔍 Console Check

Otevřete Browser Console (F12) během exportu:

**Expected messages:**
```
PDF exported successfully: Plan_hnojeni_Pole_A_HY2025_26_2025-12-20.pdf
```

**No errors expected!**

---

## ✅ Definition of Done

PDF export je hotový pokud:

- [x] Tlačítko "Exportovat do PDF" existuje
- [x] Kliknutí spustí loading spinner
- [x] PDF se vygeneruje za < 3 sekundy
- [x] Save dialog se otevře automaticky
- [x] PDF obsahuje všech 8 sekcí (pro Typ A/B)
- [x] PDF obsahuje predikce tabulku (pro Typ C)
- [x] České texty jsou správné
- [x] Barvy odpovídají brand guideline
- [x] Tabulky jsou čitelné
- [x] Footer má kontakty + disclaimer
- [x] Multi-page funguje (čísla stran)
- [x] Error handling zobrazí chyby
- [x] Žádné console errors

---

## 🚨 Fallback & Edge Cases

### Edge Case 1: Žádné varování
**Scenario:** Ideální půda, žádné problémy  
**Expected:** Sekce "Upozornění" neexistuje v PDF

### Edge Case 2: pH >= cíl (žádné vápnění)
**Scenario:** Půda má dostatečné pH  
**Expected:** Sekce "Doporučení vápnění" neexistuje

### Edge Case 3: Velmi dlouhý seznam varování
**Scenario:** 15+ varování  
**Expected:** Automatická nová stránka, čísla stran "1 z 3", "2 z 3", ...

### Edge Case 4: Chybějící data (null values)
**Scenario:** Rozbor bez Ca, N  
**Expected:** Hodnota zobrazuje "-", žádné chyby

---

## 🎯 Performance Targets

- **Generation time:** < 2 seconds (Typ A/B)
- **Generation time:** < 3 seconds (Typ C with predictions)
- **File size:** 50-100 KB (depending on content)
- **Memory usage:** < 10 MB (browser heap)

---

## 📊 Test Results Template

```markdown
## Test Results - Phase 8.1

**Tester:** [Jméno]
**Date:** [Datum]
**Browser:** Chrome 120 / Firefox 121 / Safari 17

### Functional Tests:
- [ ] Export Typ A - OK / FAIL
- [ ] Export Typ C - OK / FAIL
- [ ] Loading state - OK / FAIL
- [ ] Error handling - OK / FAIL
- [ ] Multi-page - OK / FAIL

### Visual Tests:
- [ ] Logo - OK / FAIL
- [ ] Colors - OK / FAIL
- [ ] Czech texts - OK / FAIL
- [ ] Tables - OK / FAIL
- [ ] Footer - OK / FAIL

### Browser Tests:
- [ ] Chrome - OK / FAIL
- [ ] Firefox - OK / FAIL
- [ ] Safari - OK / FAIL
- [ ] Mobile - OK / FAIL

### Issues Found:
1. [popis issue]
2. [popis issue]

### Overall Status: PASS / FAIL
```

---

## 🏁 Ready for Production?

**Checklist před nasazením:**
- [ ] Všechny testy prošly
- [ ] Žádné console errors
- [ ] PDF se otevírá v Adobe Reader
- [ ] České texty zkontrolovány
- [ ] Brand colors správné
- [ ] Performance OK (< 3s)
- [ ] Error handling funguje
- [ ] Mobile download funguje

**Pokud všechny checky ✅ → Production Ready! 🚀**

---

**Last Updated:** 20. prosince 2025  
**Phase:** 8.1 - PDF Export  
**Status:** ✅ Implementováno
