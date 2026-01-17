# Přidání vlastního fontu pro PDF Export

## Problém
jsPDF v základu neumí zobrazovat české znaky (č, ř, ž, š, ý, á, í, é, ů, ú, ň, ť, ď). Znaky jsou buď nahrazeny čtverečky nebo automaticky převedeny na ASCII verze (např. "Střední" → "Stredni").

## Řešení
Přidat vlastní font (např. **Roboto** nebo **Open Sans**) do jsPDF, který podporuje Unicode a české znaky.

---

## 📋 Krok za krokem - Jak přidat font

### **Krok 1: Stáhněte font**
Doporučujeme **Roboto-Regular.ttf** z Google Fonts:
- 🔗 [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)
- Klikněte na **"Download family"**
- Rozbalte soubor a najděte `Roboto-Regular.ttf`

**Alternativa:** Open Sans, Lato, nebo jakýkoli jiný .ttf font s podporou latinky rozšířené (Latin Extended-A).

---

### **Krok 2: Převeďte font na Base64**

#### **Varianta A: Online konvertor (rychlé)**
1. Jděte na: [Base64 Guru - File to Base64](https://base64.guru/converter/encode/file)
2. Nahrajte `Roboto-Regular.ttf`
3. Klikněte **"Encode file to Base64"**
4. Zkopírujte celý Base64 string (začíná `AAEAAAASAQAABAAgR0RFRg...`)

#### **Varianta B: Node.js script (pro větší projekty)**
```javascript
// convert-font.js
const fs = require('fs');

const fontPath = './Roboto-Regular.ttf';
const fontBuffer = fs.readFileSync(fontPath);
const base64Font = fontBuffer.toString('base64');

fs.writeFileSync('./roboto-base64.txt', base64Font);
console.log('✅ Font converted! See roboto-base64.txt');
```

Spustit: `node convert-font.js`

---

### **Krok 3: Vložte Base64 do kódu**

Otevřete soubor:
```
demon-agro/lib/utils/kalkulacka-ztrat-pdf-export.ts
```

Najděte sekci:
```typescript
const ROBOTO_FONT_BASE64 = `
/* 
 * TODO: INSERT ROBOTO-REGULAR.TTF BASE64 STRING HERE
 * Example: data:font/ttf;base64,AAEAAAASAQAABAAgR0RFRg...
 * 
 * Until then, we'll use removeAccents() as fallback
 */
`
```

**Nahraďte TODO komentář** vaším Base64 stringem:
```typescript
const ROBOTO_FONT_BASE64 = `AAEAAAASAQAABAAgR0RFRgAACvQAAAxAAAAAHGZwZ21iLvX5AAAXsAAAA...` 
// (celý váš Base64 string, může být i několik tisíc znaků)
```

---

### **Krok 4: Odkomentujte aktivaci fontu**

Ve stejném souboru (`kalkulacka-ztrat-pdf-export.ts`), ve funkci `generateKalkulackaZtratPDF()`, najděte:

```typescript
  // ============================================================================
  // SETUP CUSTOM FONT (uncomment when Base64 font is added)
  // ============================================================================
  // const fontLoaded = addCustomFont(doc)
  // if (!fontLoaded) {
  //   console.warn('Using default helvetica font with accent removal')
  // }
```

**Odkomentujte tyto řádky:**
```typescript
  // ============================================================================
  // SETUP CUSTOM FONT
  // ============================================================================
  const fontLoaded = addCustomFont(doc)
  if (!fontLoaded) {
    console.warn('Using default helvetica font with accent removal')
  }
```

---

### **Krok 5: Aktualizujte setFont volání (volitelné)**

Pokud chcete používat vlastní font všude v PDF, najděte všechna:
```typescript
doc.setFont('helvetica', 'bold')
doc.setFont('helvetica', 'normal')
```

A změňte na:
```typescript
doc.setFont('Roboto', 'bold')    // nebo jen 'Roboto' pokud bold není k dispozici
doc.setFont('Roboto', 'normal')
```

**Poznámka:** Pokud to neuděláte, font se nastaví automaticky při zavolání `addCustomFont()` a bude se používat všude.

---

### **Krok 6: Testování**

1. Restartujte dev server (pokud je spuštěn):
   ```bash
   npm run dev
   ```

2. Jděte do kalkulačky ztrát
3. Klikněte **"Export PDF"**
4. Otevřete stažené PDF
5. Ověřte, že české znaky jsou správně zobrazeny:
   - ✅ "Střední" (ne "Stredni")
   - ✅ "Návratnost" (ne "Navratnost")
   - ✅ "Vápnění" (ne "Vapneni")

---

## ⚠️ Poznámky

### Velikost souboru
- Base64 font přidá ~50-150 KB do bundle
- Pro produkci zvažte lazy loading nebo CDN hosting fontu

### Alternativy k Base64
Pokud je Base64 moc velký, můžete font načíst z URL:
```typescript
// Místo Base64 string:
const fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf'

async function addCustomFontFromURL(doc: jsPDF): Promise<boolean> {
  try {
    const response = await fetch(fontUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = arrayBufferToBase64(arrayBuffer)
    
    doc.addFileToVFS('Roboto-Regular.ttf', base64)
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
    doc.setFont('Roboto')
    
    return true
  } catch (error) {
    console.error('Failed to load font from URL:', error)
    return false
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
```

---

## 🆘 Troubleshooting

### Problém: "Font not found" error
**Řešení:** Zkontrolujte, že název fontu v `addFont()` odpovídá názvu v `setFont()`:
```typescript
doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')  // Druhý parametr
doc.setFont('Roboto')  // Musí být stejný
```

### Problém: Znaky jsou stále bez diakritiky
**Řešení:** 
1. Ověřte, že `addCustomFont(doc)` je skutečně zavolán
2. Zkontrolujte console - mělo by tam být: `✅ Custom font loaded successfully`
3. Pokud tam je warning, font se nenačetl - zkontrolujte Base64 string

### Problém: PDF je příliš velký
**Řešení:** Použijte subset fontu (pouze české znaky):
- Jděte na [FontSquirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)
- Nahrajte Roboto-Regular.ttf
- Vyberte "Expert" mode
- V "Subsetting" vyberte "Custom"
- Zadejte znaky: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?()-áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ`
- Stáhněte a převeďte na Base64

---

## 📚 Další zdroje

- [jsPDF Documentation - Custom Fonts](https://github.com/parallax/jsPDF#use-of-unicode-characters--utf-8)
- [Google Fonts](https://fonts.google.com/)
- [Base64 Guru Converter](https://base64.guru/converter/encode/file)
- [FontSquirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)

---

**Vytvořeno:** 15.01.2026  
**Autor:** Senior Frontend Developer  
**Verze:** 2.0

