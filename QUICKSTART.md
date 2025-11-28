# 🚀 RYCHLÝ START

## Pro ty, kdo chtějí kalkulačku rychle spustit

### 1️⃣ Nainstalujte závislosti

```bash
npm install
```

### 2️⃣ Spusťte vývojový server

```bash
npm run dev
```

### 3️⃣ Otevřete prohlížeč

**Kalkulačka:**
```
http://localhost:3000/kalkulacka/prevodni
```

**Domovská stránka:**
```
http://localhost:3000
```

---

## ⚡ Ještě rychlejší

Spusťte náš start script:

```bash
./start.sh
```

nebo

```bash
bash start.sh
```

---

## 🧮 Jak používat kalkulačku

1. **Vyberte živinu** (Ca, Mg, K, S, P, N)
2. **Zadejte hodnotu** do vstupního pole
3. **Vyberte jednotku** (%, kg/ha, kg/t, g/kg, mg/kg)
4. **Výsledek** se zobrazí automaticky

### Pro vápník (Ca):
- Vyberte směr převodu z dropdown menu
- Máte 6 možností: Ca ↔ CaO ↔ CaCO₃

### Pro ostatní živiny:
- Směr se zobrazí automaticky (např. Mg → MgO)
- Klikněte na tlačítko se šipkami pro prohození

---

## 📱 Testování na mobilu

### Lokální síť
1. Zjistěte IP adresu počítače:
   ```bash
   # Linux/Mac
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. Na mobilu otevřete:
   ```
   http://[VAŠE-IP]:3000/kalkulacka/prevodni
   ```

---

## 🏗️ Build pro produkci

```bash
npm run build
npm start
```

---

## 📚 Více informací

- **Kompletní dokumentace:** `README.md`
- **Návod k použití:** `MANUAL.md`
- **Testování:** `TESTING.md`
- **Přehled projektu:** `PROJECT_SUMMARY.md`

---

## 🆘 Problémy?

### Port 3000 už je obsazený?
```bash
PORT=3001 npm run dev
```

### Build selhává?
```bash
rm -rf .next
npm run build
```

### Node.js není nainstalovaný?
Stáhněte z: https://nodejs.org/ (doporučená verze: 18+)

---

## ✅ Úspěch vypadá takto:

```
✓ Compiled successfully
✓ Ready in 2.5s
✓ Local: http://localhost:3000
```

**Nyní otevřete prohlížeč a jděte na:**
```
http://localhost:3000/kalkulacka/prevodni
```

---

## 🎯 Co můžete vyzkoušet hned:

### Test 1: Základní převod
```
Vstup: 100 kg/ha Ca
Výstup: 139.92 kg/ha CaO
```

### Test 2: Vápník → uhličitan
```
Vstup: 100 % Ca
Směr: Ca → CaCO₃
Výstup: 249.73 % CaCO₃
```

### Test 3: Draslík
```
Vstup: 50 kg/ha K
Výstup: 60.23 kg/ha K₂O
```

---

**Hotovo! Aplikace běží a je připravená k použití! 🎉**
