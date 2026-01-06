# Rychlý testovací návod - Poptávkový systém vápnění

## ⚡ 5minutový test

### Příprava
1. Spusť dev server: `npm run dev`
2. Přihlaš se do portálu
3. Ujisti se, že máš alespoň jeden pozemek s plánem vápnění

---

## 🧪 Test 1: Přidání plánu z detailu (2 min)

**Kroky:**
1. Naviguj na: `/portal/pozemky`
2. Vyber pozemek s ikonou ✨ (Sparkles) = má plán vápnění
3. Klikni na ikonu nebo přejdi na "Plán vápnění"
4. Najdi zelené tlačítko **"Přidat do poptávky"** vedle "Exportovat do Excelu"
5. Klikni na tlačítko
6. **Očekávané:** Zobrazí se zelený box s checkboxy pro výběr roků
7. Vyber některé roky aplikace
8. Klikni "Potvrdit výběr"

**Ověření:**
- ✅ Zobrazil se toast "✅ Přidáno do poptávky (X aplikace)"
- ✅ V levém sidebaru u "Moje poptávky" se objevil červený badge s číslicí
- ✅ Zelený box se zavřel

---

## 🧪 Test 2: Hromadné přidání (1 min)

**Kroky:**
1. Naviguj na: `/portal/plany-vapneni`
2. Najdi bílý box s checkboxem "Vybrat vše"
3. Vyber několik plánů pomocí checkboxů vlevo
4. Klikni **"Přidat vybrané do poptávky"** vpravo nahoře

**Ověření:**
- ✅ Toast: "✅ Přidáno X plánů do poptávky"
- ✅ Badge v sidebaru se zvýšil
- ✅ Checkboxy se odškrtly

**Alternativa:**
- Klikni na ikonu košíku 🛒 u jednotlivého plánu
- Toast: "✅ Přidáno do poptávky"

---

## 🧪 Test 3: Košík a badge (1 min)

**Kroky:**
1. Najdi plovoucí zelené tlačítko košíku v pravém dolním rohu
2. Všimni si červeného badge s počtem položek
3. Klikni na košík

**Ověření:**
- ✅ Vysunutý panel zprava s položkami
- ✅ Každá položka obsahuje:
  - Název pozemku
  - Kód parcely (pokud existuje)
  - Rok(y) aplikace
  - Produkt a množství
- ✅ Footer s celkovými statistikami
- ✅ Tlačítko "Odeslat poptávku"

---

## 🧪 Test 4: Odhadované ceny (30 sec)

**Kroky:**
1. Otevři detail plánu vápnění (`/portal/pozemky/[id]/plan-vapneni`)
2. V tabulce plánu najdi sloupec **"Odhadovaná cena"**
3. Scroll dolů k řádku **CELKEM**

**Ověření:**
- ✅ Každá aplikace má zobrazenu cenu (např. "24 000 Kč")
- ✅ V řádku CELKEM je součet všech cen
- ✅ Hover nad info ikonou (ⓘ) u hlavičky zobrazí tooltip

**Příklady cen:**
- Vápenec mletý: ~600 Kč/t
- Dolomit mletý: ~800 Kč/t
- Pálené vápno: ~2500 Kč/t

---

## 🧪 Test 5: UX vylepšení (1 min)

### 5a) Poslední rozbor v přehledu pozemků

**Kroky:**
1. Naviguj na: `/portal/pozemky`
2. Najdi sloupec **"Poslední rozbor"**

**Ověření:**
- ✅ Zobrazeno datum posledního rozboru
- ✅ Pod datem text "(před X roky)"
- ✅ Barva podle stáří:
  - 🟢 Zelená: < 4 roky
  - 🟠 Oranžová: 4-6 let
  - 🔴 Červená: > 6 let nebo "Chybí"

### 5b) Kód parcely v souhrnu plánů

**Kroky:**
1. Naviguj na: `/portal/plany-vapneni`
2. Prohlédni názvy pozemků

**Ověření:**
- ✅ Formát: "Název pozemku • Kód parcely"
- ✅ Pokud kód neexistuje, zobrazí se pouze název

### 5c) Draslík (K) v použitých datech

**Kroky:**
1. Otevři detail plánu vápnění
2. Scroll dolů k sekci **"📊 Použitá data z půdního rozboru"**

**Ověření:**
- ✅ 5 sloupců: Datum, pH, Mg, **K** (nové!), Půdní typ
- ✅ Hodnota draslíku zobrazena v mg/kg

### 5d) Platnost rozboru

**Kroky:**
1. Naviguj na: `/portal/pozemky/[id]/rozbory`
2. Najdi badge **"Aktuální"** u nejnovějšího rozboru

**Ověření:**
- ✅ Text: "Aktuální (další rozbor doporučen 2028)"
- ✅ Rok je vypočítán jako +4 roky od data rozboru

### 5e) Trendy v rozborech

**Kroky:**
1. Na stránce rozborů najdi pozemek s více než jedním rozborem
2. Prohlédni hodnoty pH, P, K, Mg

**Ověření:**
- ✅ Vedle hodnoty šipka trendu:
  - ↗️ TrendingUp (zelená) = hodnota vzrostla
  - ↘️ TrendingDown (červená) = hodnota klesla
  - → Minus (šedá) = hodnota stagnuje (< 2% změna)
- ✅ Pod hodnotou text s rozdílem (např. "+12 mg/kg")
- ✅ Hover nad šipkou zobrazí tooltip s přesnou změnou a procentem

### 5f) Tooltip u doporučení produktu

**Kroky:**
1. V detailu plánu vápnění najdi hlavičku sloupce **"Doporučení"**
2. Najdi info ikonu (ⓘ) vedle názvu
3. Najdi myší na ikonu (hover)

**Ověření:**
- ✅ Zobrazí se tmavý tooltip s textem:
  - "Dolomit: při nízkém Mg (< 120 mg/kg)"
  - "Pálené vápno: pro rychlý účinek při pH < 5.0"
  - "Vápenec: pro postupné zvyšování pH"

---

## 🎯 Checklist rychlého testu

- [ ] Přidání plánu z detailu funguje
- [ ] Hromadné přidání funguje
- [ ] Badge v sidebaru se aktualizuje
- [ ] Košík se otevírá a zobrazuje položky
- [ ] Toast notifikace fungují
- [ ] Odhadované ceny se zobrazují
- [ ] Sloupec "Poslední rozbor" má správné barvy
- [ ] Kód parcely se zobrazuje v souhrnu
- [ ] Draslík (K) je v použitých datech
- [ ] Platnost rozboru je zobrazena
- [ ] Trendy se zobrazují u starších rozborů
- [ ] Tooltip u doporučení funguje

---

## 🐛 Pokud něco nefunguje

### Problem: Badge se neaktualizuje
**Řešení:** Refresh stránku, badge používá React Context

### Problem: Toast se nezobrazuje
**Řešení:** Zkontroluj, že `<Toaster />` je v `PortalLayoutClient.tsx`

### Problem: "Cannot find module react-hot-toast"
**Řešení:** 
```bash
cd demon-agro
npm install react-hot-toast
```

### Problem: Data se neukládají do košíku
**Řešení:** Zkontroluj konzoli prohlížeče, localStorage může být zablokován

### Problem: Ceny se nezobrazují
**Řešení:** Zkontroluj, že `liming-prices.ts` existuje v `lib/constants/`

---

## 📝 Poznámky

- Data v košíku přežijí refresh stránky (uloženo v localStorage)
- Badge se aktualizuje automaticky při změně košíku
- Trendy se zobrazují pouze pokud existuje předchozí rozbor
- Ceny jsou orientační a nezahrnují dopravu a aplikaci

---

## ✅ Hotovo!

Pokud všechny testy prošly, implementace je funkční a připravená k použití! 🎉


