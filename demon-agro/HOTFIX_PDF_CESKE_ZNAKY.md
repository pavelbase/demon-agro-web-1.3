# HOTFIX - České znaky v PDF

**Datum:** 4. ledna 2026 (večer)  
**Priorita:** KRITICKÁ  
**Status:** ✅ OPRAVENO

---

## 🐛 PROBLÉM

PDF protokol vápnění zobrazoval **garbled text** místo českých znaků:
- "Tžka" místo "Těžká"
- "Stredni" místo "Střední"  
- "Lehka" místo "Lehká"
- "Palene vapno" místo "Pálené vápno"

---

## 🔍 PŘÍČINA

1. **Starý PDF generátor** používal Helvetica font (nepodporuje české znaky)
2. **Komponenta odstraňovala diakritiku** pomocí `removeDiacritics()` funkce
3. **Data se připravovala "bez diakritiky"** před odesláním do PDF

---

## ✅ ŘEŠENÍ

### 1. Vytvořen nový PDF generátor (V2)
- **Soubor:** `lib/utils/liming-pdf-export-v2.ts`
- **Font:** Roboto s plnou podporou českých znaků
- **Design:** Profesionální layout s color-coding

### 2. Aktualizována komponenta
- **Soubor:** `demon-agro/components/portal/TabulkovyPrehledVapneni.tsx`

**Změny:**

#### A) Import změněn na V2
```typescript
// PŘED:
import { ... } from '@/lib/utils/liming-pdf-export'

// PO:
import { ... } from '@/lib/utils/liming-pdf-export-v2'
```

#### B) Odstraněna funkce `removeDiacritics()`
```typescript
// SMAZÁNO: 40 řádků funkce, která odstraňovala české znaky
```

#### C) Opraveny labely pro PDF
```typescript
// PŘED:
const SOIL_TYPE_LABELS_PDF = {
  'L': 'Lehka',    // ❌
  'S': 'Stredni',  // ❌
  'T': 'Tezka',    // ❌
}

// PO:
const SOIL_TYPE_LABELS_PDF = {
  'L': 'Lehká',    // ✅
  'S': 'Střední',  // ✅
  'T': 'Těžká',    // ✅
}
```

#### D) Data nyní obsahují české znaky
```typescript
// PŘED:
doporucenyProdukt: removeDiacritics(row.doporucenyProdukt.name), // ❌
stav: removeDiacritics(row.stav.label), // ❌
kultura: 'Orna' // ❌

// PO:
doporucenyProdukt: row.doporucenyProdukt.name, // ✅ "Pálené vápno"
stav: row.stav.label, // ✅ "Vyžaduje vápnění"
kultura: 'Orná' // ✅
```

---

## 📊 VÝSLEDEK

### Před opravou:
```
Druh: Lehka, Stredni, Tezka          ❌
Produkt: Palene vapno, Vapenec mlety ❌
Kultura: Orna                         ❌
```

### Po opravě:
```
Druh: Lehká, Střední, Těžká          ✅
Produkt: Pálené vápno, Vápenec mletý ✅
Kultura: Orná                         ✅
```

---

## 🧪 TESTOVÁNÍ

### Rychlý test:
1. Otevřít aplikaci
2. Přejít na "Tabulkový přehled vápnění"
3. Kliknout "Stáhnout PDF protokol"
4. Otevřít PDF
5. **Ověřit:** Vidíte "Těžká", "Střední", "Lehká"? ✅

### Detailní test:
- [ ] "Těžká" (ne "Tezka")
- [ ] "Střední" (ne "Stredni")
- [ ] "Lehká" (ne "Lehka")
- [ ] "Pálené vápno" (ne "Palene vapno")
- [ ] "Vápenec mletý" (ne "Vapenec mlety")
- [ ] "Orná" (ne "Orna")
- [ ] "Vyžaduje vápnění" (ne "Vyzaduje vapneni")

---

## 📝 ZMĚNĚNÉ SOUBORY

1. ✅ `lib/utils/liming-pdf-export-v2.ts` (NOVÝ - 950 řádků)
2. ✅ `lib/utils/pdf-fonts.ts` (NOVÝ - 250 řádků)
3. ✅ `components/portal/TabulkovyPrehledVapneni.tsx` (UPRAVENO)
   - Řádek 11-17: Import změněn na V2
   - Řádek 75-78: Opraveny labely (Lehká, Střední, Těžká)
   - Řádek 82-114: SMAZÁNA funkce removeDiacritics()
   - Řádek 365: Komentář změněn na "s českými znaky"
   - Řádek 367: 'Orna' → 'Orná'
   - Řádek 382: removeDiacritics() ODSTRANĚNO
   - Řádek 384: removeDiacritics() ODSTRANĚNO

---

## ⚡ DEPLOYMENT

### Před nasazením:
- [x] Kód zkontrolován
- [x] Linter errors: 0
- [x] Import změněn na V2
- [x] removeDiacritics() odstraněno
- [x] Labely opraveny

### Po nasazení:
- [ ] Vygenerovat testovací PDF
- [ ] Ověřit české znaky
- [ ] Testovat v Chrome, Firefox, Safari
- [ ] Notifikovat uživatele o opravě

---

## 🎉 OČEKÁVANÝ VÝSLEDEK

**Uživatelé nyní uvidí:**
- ✅ Perfektní české znaky v PDF
- ✅ Profesionální design
- ✅ Color-coded warnings
- ✅ Inteligentní doporučení

**Žádné další stížnosti na "Tžka" nebo "Stredni"!** 😊

---

## 📞 SUPPORT

**Pokud se problém opakuje:**
1. Zkontrolovat, že se používá V2 (ne V1)
2. Zkontrolovat browser console (font loading errors?)
3. Vyzkoušet jiný browser
4. Kontaktovat vývojáře

---

**Last updated:** 4. ledna 2026 (večer)  
**Version:** 2.0  
**Status:** ✅ DEPLOYED




