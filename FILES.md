# Démon agro - Seznam souborů projektu

## 📦 Konfigurace (kořen projektu)

| Soubor | Popis |
|--------|-------|
| `package.json` | NPM dependencies a scripty |
| `package-lock.json` | Locked versions dependencies |
| `next.config.js` | Next.js konfigurace |
| `tailwind.config.js` | Tailwind CSS + custom barvy |
| `postcss.config.js` | PostCSS konfigurace |
| `jsconfig.json` | Path aliasing (@/) |
| `.eslintrc.json` | ESLint pravidla |
| `.gitignore` | Git ignore rules |
| `.env.example` | Příklad env proměnných |

## 📄 Dokumentace

| Soubor | Popis |
|--------|-------|
| `README.md` | Hlavní dokumentace projektu |
| `PROJECT_SUMMARY.md` | Kompletní shrnutí projektu |
| `MANUAL.md` | Návod k použití kalkulačky |
| `TESTING.md` | Testovací scénáře |
| `design-reference.html` | Vizuální reference designu |

## 🎨 App (Next.js App Router)

### Root

| Soubor | Popis |
|--------|-------|
| `app/layout.jsx` | Root layout s navigací a footerem |
| `app/page.jsx` | Domovská stránka |
| `app/globals.css` | Globální styly + Tailwind |

### Kalkulačky

| Soubor | Popis |
|--------|-------|
| `app/kalkulacka/prevodni/page.jsx` | ⭐ **Převodní kalkulačka živin** |
| `app/kalkulacka/vapneni/page.jsx` | Kalkulačka vápnění (placeholder) |

### Řešení

| Soubor | Popis |
|--------|-------|
| `app/reseni/vapneni/page.jsx` | Stránka vápnění půd |
| `app/reseni/hnojeni/page.jsx` | Stránka hnojení |
| `app/reseni/rozbory/page.jsx` | Stránka rozborů půd |

### Ostatní stránky

| Soubor | Popis |
|--------|-------|
| `app/radce/page.jsx` | Agronomický rádce |
| `app/o-nas/page.jsx` | O společnosti |
| `app/kontakt/page.jsx` | Kontaktní informace |
| `app/poptavka/page.jsx` | Formulář poptávky |

## 🧩 Komponenty

### Navigace

| Soubor | Popis |
|--------|-------|
| `components/navigation/Navigation.jsx` | Hlavní navigace s dropdown menu |
| `components/navigation/NavDropdown.jsx` | Reusable dropdown komponenta |

### Kalkulačky

| Soubor | Popis |
|--------|-------|
| `components/calculators/ConversionCalculator.jsx` | ⭐ **Hlavní komponenta převodní kalkulačky** |

### UI komponenty

| Soubor | Popis |
|--------|-------|
| `components/ui/NutrientButton.jsx` | Tlačítko pro výběr živiny |
| `components/ui/ConversionInput.jsx` | Input pole s výběrem jednotky |

## 📊 Celková statistika

- **Celkem souborů:** 30+
- **React komponenty:** 8
- **Stránky:** 11
- **Konfigurační soubory:** 7
- **Dokumentační soubory:** 5

## 🎯 Klíčové komponenty pro kalkulačku

### 1. ConversionCalculator.jsx (hlavní komponenta)
**Velikost:** ~400+ řádků
**Funkce:**
- State management (useState)
- Výpočty (useMemo)
- Převodní koeficienty
- UI pro všechny živiny
- Speciální logika pro vápník
- Tabulka koeficientů
- Info box

### 2. NutrientButton.jsx
**Velikost:** ~50 řádků
**Funkce:**
- Zobrazení živiny s barvou
- Aktivní stav
- Hover efekty

### 3. ConversionInput.jsx
**Velikost:** ~50 řádků
**Funkce:**
- Numerický input
- Výběr jednotky
- Read-only režim pro výstup

### 4. Navigation.jsx
**Velikost:** ~150 řádků
**Funkce:**
- Desktop navigace
- Mobile hamburger menu
- Dropdown integrace

## 🔧 Použité technologie

- **Framework:** Next.js 14.2
- **UI Library:** React 18.3
- **Styling:** Tailwind CSS 3.4
- **Build Tool:** Webpack (Next.js internal)
- **Package Manager:** npm

## 📈 Build výstup

```
Route (app)                              Size     First Load JS
├ ○ /                                    161 B          87.4 kB
├ ○ /kalkulacka/prevodni                 3.93 kB        91.2 kB  ⭐
├ ○ /kalkulacka/vapneni                  161 B          87.4 kB
├ ○ /kontakt                             161 B          87.4 kB
├ ○ /o-nas                               161 B          87.4 kB
├ ○ /poptavka                            1.01 kB        88.3 kB
├ ○ /radce                               161 B          87.4 kB
├ ○ /reseni/hnojeni                      161 B          87.4 kB
├ ○ /reseni/rozbory                      161 B          87.4 kB
└ ○ /reseni/vapneni                      161 B          87.4 kB

○  (Static) - Všechny stránky pre-rendered
```

## 🚀 Příkazy

```bash
# Development
npm install          # Instalace dependencies
npm run dev         # Vývojový server (port 3000)

# Production
npm run build       # Build pro produkci
npm start           # Spuštění produkční verze

# Kvalita kódu
npm run lint        # ESLint check
```

---

**Poznámka:** Všechny soubory jsou připraveny a funkční. Build proběhl úspěšně bez chyb.
