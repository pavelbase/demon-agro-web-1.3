# 📝 Automatické pojmenování obrázků produktů

## 🎯 Jak to funguje

Když nahrajete obrázek u produktu, systém **automaticky vytvoří název souboru** podle názvu produktu.

---

## ✨ Příklady pojmenování

### Před nahráním:
```
Název produktu: "Vápenec mletý"
Nahraný soubor: image.jpg
```

### Po nahrání:
```
Soubor se uloží jako: vapenec-mlety-1732567890123.jpg
```

### Více příkladů:

| Název produktu | Nahraný soubor | Uložený jako |
|----------------|----------------|--------------|
| Vápenec mletý | foto.jpg | `vapenec-mlety-1732567890.jpg` |
| Dolomit | produkt.png | `dolomit-1732567891.png` |
| Síran vápenatý | image.jpg | `siran-vapenaty-1732567892.jpg` |
| Draselná sůl | DSC001.jpg | `draselna-sul-1732567893.jpg` |
| Síran hořečnatý | photo.jpg | `siran-horecnaty-1732567894.jpg` |
| Komplexní rozbor půdy | test.jpg | `komplexni-rozbor-pudy-1732567895.jpg` |
| GPS mapování | mapa.png | `gps-mapovani-1732567896.png` |

---

## 🔧 Co systém dělá s názvem

### 1. **Odstranění diakritiky**
```
ě → e
š → s
č → c
ř → r
ž → z
ý → y
á → a
í → i
é → e
ú/ů → u
ó → o
```

### 2. **Převod na malá písmena**
```
Vápenec Mletý → vapenec mlety
```

### 3. **Nahrazení mezer a speciálních znaků pomlčkou**
```
vápenec mletý → vapenec-mlety
```

### 4. **Přidání timestamp pro unikátnost**
```
vapenec-mlety → vapenec-mlety-1732567890123
```

### 5. **Zachování přípony souboru**
```
vapenec-mlety-1732567890123 + .jpg → vapenec-mlety-1732567890123.jpg
```

---

## 📁 Kam se soubory ukládají

Všechny nahrané obrázky produktů se ukládají do:
```
demon-agro/public/images/uploads/
```

### Struktura:
```
public/
└── images/
    └── uploads/
        ├── vapenec-mlety-1732567890.jpg
        ├── dolomit-1732567891.jpg
        ├── siran-vapenaty-1732567892.jpg
        ├── draselna-sul-1732567893.jpg
        └── ...
```

---

## 🎯 Výhody

### ✅ **Přehlednost**
- Ihned poznáte, který obrázek patří kterému produktu
- Není třeba hledat v náhodných číslech

### ✅ **Organizace**
- Soubory jsou seřazené podle názvu
- Snadné najít v souborovém systému

### ✅ **Bezpečnost**
- Diakritika a speciální znaky odstraněny
- Žádné problémy s URL nebo servery

### ✅ **Unikátnost**
- Timestamp zajišťuje, že se soubory nepřepíší
- I když nahrajete 2x stejný produkt, budou to různé soubory

---

## 🔍 Praktický příklad

### Postup:

1. **Admin panel** → Produkty → **Přidat produkt**

2. **Vyplníte název:**
   ```
   Název: Vápenec mletý Premium
   ```

3. **Nahrajete fotku:**
   - Přetáhnete `baleni_vapna.jpg`

4. **Systém automaticky:**
   - Vezme název: "Vápenec mletý Premium"
   - Převede: "vapenec-mlety-premium"
   - Přidá timestamp: "vapenec-mlety-premium-1732567890"
   - Zachová příponu: "vapenec-mlety-premium-1732567890.jpg"
   - Uloží do: `/public/images/uploads/vapenec-mlety-premium-1732567890.jpg`

5. **V produktu se uloží:**
   ```
   URL: /images/uploads/vapenec-mlety-premium-1732567890.jpg
   ```

6. **Na webu se zobrazí:**
   - Obrázek se načte z této URL
   - Návštěvníci vidí fotku produktu

---

## 🆚 Porovnání

### Staré pojmenování (náhodné):
```
1732567890123-image.jpg
1732567890456-photo.png
1732567890789-DSC001.jpg
```
❌ Nevíte, co je na obrázcích

### Nové pojmenování (podle produktu):
```
vapenec-mlety-1732567890.jpg
dolomit-1732567891.jpg
siran-vapenaty-1732567892.jpg
```
✅ Okamžitě poznáte obsah

---

## 🛠️ Technické detaily

### Sanitizace názvu (kód):
```javascript
const sanitizedName = productName
  .toLowerCase()                    // Malá písmena
  .normalize('NFD')                 // Rozložit diakritiku
  .replace(/[\u0300-\u036f]/g, '') // Odstranit diakritiku
  .replace(/[^a-z0-9]+/g, '-')     // Nahradit nealfanumerické pomlčkou
  .replace(/^-+|-+$/g, '');        // Odstranit pomlčky z okrajů
```

### Vytvoření finálního názvu:
```javascript
const filename = `${sanitizedName}-${timestamp}.${fileExtension}`;
```

---

## 📋 Pravidla pojmenování

### ✅ Povolené znaky ve finálním názvu:
- Malá písmena `a-z`
- Čísla `0-9`
- Pomlčka `-`
- Tečka `.` (jen před příponou)

### ❌ Nepovolené (automaticky se odstraní):
- Velká písmena (převedou se na malá)
- Diakritika (ě→e, š→s, atd.)
- Mezery (nahradí se pomlčkou)
- Speciální znaky `!@#$%^&*()+=[]{}|\\;:'",<>?/`

---

## 💡 Tipy

### 1. **Používejte smysluplné názvy produktů**
```
✅ Dobrý název: "Vápenec mletý"
   → soubor: vapenec-mlety-xxx.jpg

❌ Špatný název: "Produkt 1"
   → soubor: produkt-1-xxx.jpg
```

### 2. **Přejmenujte produkt před nahráním fotky**
Pokud měníte název produktu, fotka se přejmenuje jen při novém nahrání.

### 3. **Staré fotky zůstávají**
Když nahrajete novou fotku, stará se nesmaže. Můžete ji ručně smazat z `/public/images/uploads/` pokud chcete.

---

## 🔄 Fallback (záložní řešení)

### Co když produkt nemá název?

Pokud nahrajete obrázek, ale produkt ještě nemá vyplněný název:
```
→ Použije se původní název souboru
→ Např: 1732567890-image.jpg
```

Doporučujeme: **Nejdřív vyplňte název, pak nahrajte fotku!**

---

## 📊 Souhrn

| Feature | Status |
|---------|--------|
| Automatické pojmenování | ✅ |
| Odstranění diakritiky | ✅ |
| Malá písmena | ✅ |
| Bez mezer | ✅ |
| Timestamp pro unikátnost | ✅ |
| Zachování přípony | ✅ |
| Bezpečné znaky | ✅ |

---

## 🎉 Výsledek

**Místo:**
```
1732567890-IMG_0234.jpg
1732567891-DSC_4567.jpg
1732567892-photo.png
```

**Máte:**
```
vapenec-mlety-1732567890.jpg
dolomit-1732567891.jpg
siran-vapenaty-1732567892.jpg
```

**Jasné, přehledné, profesionální!** 🚀

---

## 📞 Potřebujete pomoc?

- 📧 Email: base@demonagro.cz
- 📞 Telefon: +420 731 734 907
