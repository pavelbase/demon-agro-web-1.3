# 🔧 HOTFIX: Oprava načítání fontu pro české znaky v PDF

**Datum:** 4. ledna 2026  
**Priorita:** 🔴 CRITICAL  
**Status:** ✅ OPRAVENO

---

## 🐛 Problém

PDF výstup protokolu vápnění **nezobrazoval české znaky** správně:
- ❌ "Lehka" místo "Lehká"
- ❌ "Stredni" místo "Střední"
- ❌ "Tezka" místo "Těžká"
- ❌ "Palene vapno" místo "Pálené vápno"
- ❌ "Vapenec mlety" místo "Vápenec mletý"
- ❌ atd.

## 🔍 Root Cause Analysis

### Chyba #1: Nesprávný formát fontu
```typescript
// ❌ PŘED: Pokus načíst WOFF font
const fontResponse = await fetch('https://fonts.gstatic.com/.../KFOmCnqEu92Fr1Mu4mxK.woff')
doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')  // ← ale deklaroval jako TTF!
```

**Problém:** jsPDF **NEPODPORUJE** WOFF formát, jen TTF!  
Font se nepodařilo načíst → spadl do default Helvetica → žádné diakritiky.

### Chyba #2: Nespolehlivý CDN
- Google Fonts primárně servíruje WOFF2 pro web
- GitHub raw má CORS omezení
- Jeden zdroj = riziko selhání

## ✅ Řešení

### 1. Správný formát
```typescript
// ✅ PO: Načítání TTF fontu
const fontUrls = [
  '/fonts/Roboto-Regular.ttf',                    // Local first (fastest)
  'https://cdn.jsdelivr.net/gh/google/fonts...',  // jsDelivr CDN
  'https://raw.githack.com/google/fonts...'       // Fallback proxy
]
```

### 2. Multi-source strategie
- Zkusí **3 zdroje** postupně
- První úspěšný = použit
- Lokální soubor má prioritu (0ms latence)

### 3. Detailní logging
```typescript
console.log('✅ Roboto font loaded successfully from: [URL]')
console.log('✅ Czech characters (ěščřžýáíéúůďťň) will display correctly!')
```

## 📂 Změněné soubory

### `lib/utils/liming-pdf-export-v2.ts`
- ✅ Opravena URL fontu (WOFF → TTF)
- ✅ Přidán fallback mechanismus (3 zdroje)
- ✅ Zlepšen error handling
- ✅ Přidán detailní logging

### `public/fonts/README.md` (nový)
- ✅ Instrukce pro lokální font (optional, pro rychlost)
- ✅ Vysvětlení, proč je font potřeba

## 🧪 Testování

1. **Vyčistit cache:**
   ```powershell
   Remove-Item -Recurse -Force demon-agro\.next
   ```

2. **Restartovat dev server:**
   ```powershell
   npm run dev
   ```

3. **Vygenerovat PDF a zkontrolovat konzoli:**
   - Mělo by vypsat: `✅ Roboto font loaded successfully from: [URL]`
   - Pokud ne, zobrazí se: `❌ CRITICAL: Failed to load Roboto font`

4. **Zkontrolovat PDF:**
   - Všechny české znaky mají diakritiku
   - "Lehká", "Střední", "Těžká" místo "Lehka", "Stredni", "Tezka"
   - "Pálené vápno" místo "Palene vapno"

## 📊 Očekávaný výsledek

### Před opravou:
```
Druh     | Doporučený produkt
---------|-------------------
Lehka    | Palene vapno       ❌
Stredni  | Vapenec mlety      ❌
Tezka    | -                  ❌
```

### Po opravě:
```
Druh     | Doporučený produkt
---------|-------------------
Lehká    | Pálené vápno       ✅
Střední  | Vápenec mletý      ✅
Těžká    | -                  ✅
```

## ⚠️ Poznámky

1. **První generování PDF** může trvat o **1-2 sekundy déle**, protože musí stáhnout font z CDN (~120KB).
2. **Font se cachuje v prohlížeči**, takže další generování jsou okamžitá.
3. **Pro produkci:** Doporučujeme umístit `Roboto-Regular.ttf` do `public/fonts/` pro nulovou latenci.

## 🔗 Související

- [HOTFIX_PDF_CESKE_ZNAKY.md](./HOTFIX_PDF_CESKE_ZNAKY.md) - Předchozí oprava mapování dat
- [PDF_V2_SUMMARY.md](./PDF_V2_SUMMARY.md) - Refactoring PDF generátoru
- [KRITICKA_OPRAVA_JEDNOTEK_VAPNENI.md](./KRITICKA_OPRAVA_JEDNOTEK_VAPNENI.md) - Oprava jednotek




