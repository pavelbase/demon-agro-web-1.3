# ✅ Testovací checklist: České znaky v PDF

**Co testujeme:** Zobrazení diakritiky v PDF protokolu vápnění

---

## 🔧 Příprava

### 1. Vyčistit vše
```powershell
# V root složce projektu:
cd demon-agro
Remove-Item -Recurse -Force .next
```

### 2. Restartovat dev server
```powershell
npm run dev
```
Mělo by běžet na `http://localhost:3001` (nebo 3000)

### 3. Vyčistit browser cache
- **Chrome/Edge:** Ctrl+Shift+Delete → Vymazat cache
- **Firefox:** Ctrl+Shift+Delete → Vymazat cache
- Nebo použít **Incognito/Private okno**

---

## 🧪 Test #1: Konzole

1. Otevřít **DevTools** (F12)
2. Otevřít tab **Console**
3. Přejít na stránku s tabulkovým přehledem vápnění
4. Kliknout na tlačítko **"Exportovat PDF"**

### ✅ Očekávaný výstup v konzoli:
```
📥 Trying to load Roboto font from: /fonts/Roboto-Regular.ttf
⚠️ Failed to load font from /fonts/Roboto-Regular.ttf: [chyba]
📥 Trying to load Roboto font from: https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Regular.ttf
✅ Roboto font loaded successfully from: https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Regular.ttf
✅ Czech characters (ěščřžýáíéúůďťň) will display correctly!
```

### ❌ Pokud vidíte:
```
❌ CRITICAL: Failed to load Roboto font
❌ Czech characters WILL NOT display correctly!
```
→ **Problém s CDN**, zkontrolujte síťové připojení nebo firewall.

---

## 🧪 Test #2: Vizuální kontrola PDF

Otevřít vygenerované PDF a zkontrolovat:

### ✅ Sloupec "Druh" (Typ půdy):
- [ ] "**Lehká**" (ne "Lehka")
- [ ] "**Střední**" (ne "Stredni")
- [ ] "**Těžká**" (ne "Tezka")

### ✅ Sloupec "Doporučený produkt":
- [ ] "**Pálené vápno**" (ne "Palene vapno")
- [ ] "**Vápenec mletý**" (ne "Vapenec mlety")
- [ ] "**Dolomit mletý**" (pokud se zobrazuje)

### ✅ Hlavička tabulky:
- [ ] "**Kód pozemku**" (ne "Kod pozemku")
- [ ] "**Výměra**" (ne "Vymera")
- [ ] "**CaO (t/ha)**" (správný formát)

### ✅ Sloupec "Kultura":
- [ ] "**Orná**" (ne "Orna")

### ✅ Nadpisy:
- [ ] "**PROTOKOL DOPORUČENÍ VÁPNĚNÍ A VÝŽIVY ROSTLIN**"
- [ ] "**Zemědělský podnik**"
- [ ] "**Celková výměra**"
- [ ] "**Průměrné pH**"

---

## 🧪 Test #3: Profesionalita layoutu

### ✅ Design checklist:
- [ ] Barevná hlavička (dark green) s logem "DÉMON AGRO"
- [ ] Tabulka má zebra striping (střídavé barvy řádků)
- [ ] pH hodnoty jsou barevně označeny (červená/žlutá/zelená)
- [ ] Čísla jsou zarovnána doprava
- [ ] Footer má čísla stránek ("Strana X z Y")
- [ ] Sekce "SOUHRN" má barevné boxy
- [ ] Poznámky jsou čitelné a formátované

---

## 📸 Porovnání před/po

### ❌ Staré PDF (před opravou):
```
Druh: Lehka, Stredni, Tezka
Produkt: Palene vapno, Vapenec mlety
Hlavička: Kod pozemku, Vymera
```

### ✅ Nové PDF (po opravě):
```
Druh: Lehká, Střední, Těžká
Produkt: Pálené vápno, Vápenec mletý
Hlavička: Kód pozemku, Výměra
```

---

## 🚨 Co dělat, když test selže?

### Problém: Konzole ukazuje font loaded, ale PDF má stále "Lehka"
→ **Cache v prohlížeči.** Zkuste:
```javascript
// V konzoli prohlížeče:
localStorage.clear()
sessionStorage.clear()
// Pak F5 (hard refresh)
```

### Problém: Konzole ukazuje "CRITICAL: Failed to load font"
→ **Síťový problém.** Zkuste:
1. Zkontrolovat síťovou konektivitu
2. Zkontrolovat firewall/antivirus
3. Stáhnout font ručně do `public/fonts/Roboto-Regular.ttf` (viz `public/fonts/README.md`)

### Problém: PDF se vůbec nevygeneruje
→ **JavaScript error.** Zkontrolujte konzoli pro chyby.

---

## 📝 Výsledek testu

Po dokončení všech testů vyplňte:

- [ ] ✅ Test #1: Konzole - Font se načetl
- [ ] ✅ Test #2: Vizuální kontrola - Všechny české znaky OK
- [ ] ✅ Test #3: Layout - Profesionální design

**Pokud jsou všechny checkboxy zaškrtnuté → HOTFIX ÚSPĚŠNÝ! 🎉**



