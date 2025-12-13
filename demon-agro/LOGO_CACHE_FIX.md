# 🔄 Logo se nezobrazuje? - Řešení cache problému

## ✅ Server běží správně na http://localhost:3000

Nové logo je na serveru, ale prohlížeč má starou verzi v cache.

---

## 🚀 RYCHLÉ ŘEŠENÍ - Zkuste v tomto pořadí:

### 1️⃣ Hard Refresh (nejrychlejší)
Otevřete http://localhost:3000 a stiskněte:

**Windows/Linux:**
- `Ctrl + Shift + R` (Chrome, Firefox)
- `Ctrl + F5` (alternativa)

**macOS:**
- `Cmd + Shift + R` (Chrome, Firefox, Safari)

### 2️⃣ Vyčištění cache v DevTools
1. Otevřete stránku http://localhost:3000
2. Stiskněte **F12** (otevře DevTools)
3. **Klikněte pravým tlačítkem na tlačítko Reload** (vedle URL)
4. Vyberte **"Empty Cache and Hard Reload"**

### 3️⃣ Inkognito mód (pro test)
- `Ctrl + Shift + N` (Chrome)
- `Ctrl + Shift + P` (Firefox)
- Otevřete http://localhost:3000

---

## 🔍 Jak poznat, že to funguje

Po hard refresh byste měli vidět:

### Desktop (široká obrazovka):
```
┌─────────────────────────────────┐
│  [🔷 maskot] Démon agro         │
└─────────────────────────────────┘
```

### Tablet (střední):
```
┌───────────────────────┐
│  [🔷 maskot] Démon agro│
└───────────────────────┘
```

### Mobil (malý):
```
┌──────┐
│  🔷  │  ← jen hexagon s maskotem
└──────┘
```

---

## 🛠️ Pokud stále nefunguje

### Zkontrolujte v DevTools:
1. Stiskněte **F12**
2. Jděte na záložku **Network**
3. Refresh stránky (`Ctrl+R`)
4. Hledejte v seznamu: `demon-agro-logo.svg`
5. Klikněte na něj a podívejte se do **Preview** - měli byste vidět nové logo

### Ověření, že server má správné soubory:
Otevřete přímo v prohlížeči:
- http://localhost:3000/logo/demon-agro-logo.svg
- http://localhost:3000/logo/demon-agro-icon.svg
- http://localhost:3000/logo/demon-agro-favicon.svg

Měli byste vidět démonského maskota v hexagonu!

---

## 🎯 Alternativní řešení

### Manuální vyčištění cache (Chrome):
1. `Ctrl + Shift + Delete` (otevře nastavení)
2. Vyberte **"Cached images and files"**
3. Time range: **"Last hour"** nebo **"All time"**
4. Klikněte **"Clear data"**
5. Obnovte stránku

### Restart prohlížeče:
Prostě zavřete všechna okna prohlížeče a otevřete znovu.

---

## ✅ Server byl restartován s čistou cache

Právě jsem:
1. ✅ Vymazal `.next` složku (Next.js cache)
2. ✅ Restartoval dev server
3. ✅ Ověřil, že SVG soubory se načítají správně

**Server vrací nové logo! Problém je jen v prohlížeči.**

---

## 🎨 Co byste měli vidět

Nové logo má tyto prvky:
- 🔷 **Hexagonální rám** (hnědý outline)
- 😈 **Rohy** na hlavě
- 👀 **Bílé oči** (trojúhelníky)
- 😁 **Úsměv s 3 zuby**
- 🎯 **Bradku** ve tvaru V
- 📝 **Text**: "Démon" (hnědý) + "agro" (zelený)

---

## 💡 Tip pro vývojáře

Pokud často měníte statické assety (SVG, PNG, CSS), použijte:

### Chrome DevTools → Settings:
1. `F12` → `F1` (nastavení)
2. Sekce **Network**
3. Zaškrtněte **"Disable cache (while DevTools is open)"**
4. Nechte DevTools otevřené při vývoji

---

## 📞 Stále problémy?

Zkontrolujte konzoli (F12 → Console) - měly by být 0 errory.

**Nebo mi dejte vědět a podíváme se na to společně!**

---

**TL;DR: Stiskněte `Ctrl + Shift + R` a logo se objeví! 🎉**
