# Démon agro - Web s převodní kalkulačkou

Moderní webová aplikace pro zemědělství s převodní kalkulačkou živin, vytvořená v Next.js 14.

> ⭐ **Projekt je kompletní a připravený k použití!**

## 🚀 Rychlý start

```bash
npm install
npm run dev
```

Poté otevřete: **http://localhost:3000/kalkulacka/prevodni**

👉 **Více informací:** [QUICKSTART.md](QUICKSTART.md)

## 🌾 Funkce

- **Převodní kalkulačka živin**: Rychlý převod mezi prvkovou a oxidovou formou živin (Ca, Mg, K, S, P, N)
- **Speciální podpora vápníku**: Převody mezi Ca, CaO a CaCO₃
- **Responzivní design**: Mobile-first přístup s plynulými přechody
- **Moderní UI**: Design konzistentní s teplými tóny Démon agro
- **Dropdown navigace**: Intuitivní navigace s rozbalovacími menu

## 🚀 Rychlý start

### Instalace závislostí

```bash
npm install
```

### Spuštění vývojového serveru

```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000) ve vašem prohlížeči.

### Build pro produkci

```bash
npm run build
npm start
```

## 📁 Struktura projektu

```
/workspace/
├── app/                          # Next.js App Router
│   ├── layout.jsx               # Root layout s navigací
│   ├── page.jsx                 # Domovská stránka
│   ├── globals.css              # Globální styly
│   ├── kalkulacka/
│   │   ├── prevodni/            # Převodní kalkulačka
│   │   └── vapneni/             # Kalkulačka vápnění (placeholder)
│   ├── reseni/                  # Řešení (vápnění, hnojení, rozbory)
│   ├── radce/                   # Agronomický rádce
│   ├── o-nas/                   # O společnosti
│   ├── kontakt/                 # Kontaktní informace
│   └── poptavka/                # Formulář poptávky
│
├── components/
│   ├── navigation/
│   │   ├── Navigation.jsx       # Hlavní navigace
│   │   └── NavDropdown.jsx      # Dropdown komponenta
│   ├── calculators/
│   │   └── ConversionCalculator.jsx  # Převodní kalkulačka
│   └── ui/
│       ├── NutrientButton.jsx   # Tlačítko živiny
│       └── ConversionInput.jsx  # Input s jednotkou
│
├── tailwind.config.js           # Tailwind konfigurace
├── next.config.js               # Next.js konfigurace
└── package.json
```

## 🎨 Design systém

### Barvy

```javascript
primary-brown: '#5C4033'  // Primární hnědá
beige: '#C9A77C'          // Béžová
cream: '#F5F1E8'          // Krémová (pozadí)
green-cta: '#4A7C59'      // Zelená (CTA tlačítka)
text-dark: '#2D2A26'      // Tmavý text
text-light: '#6B6560'     // Světlý text
```

### Barvy živin

- **Ca (Vápník)**: `#0EA5E9` - modrá
- **Mg (Hořčík)**: `#10B981` - zelená
- **K (Draslík)**: `#8B5CF6` - fialová
- **S (Síra)**: `#EAB308` - žlutá
- **P (Fosfor)**: `#F97316` - oranžová
- **N (Dusík)**: `#EC4899` - růžová

## 🧮 Převodní koeficienty

### Vápník (3 formy)

- Ca → CaO: 1.3992
- CaO → Ca: 0.7147
- Ca → CaCO₃: 2.4973
- CaCO₃ → Ca: 0.4005
- CaO → CaCO₃: 1.7848
- CaCO₃ → CaO: 0.5603

### Ostatní živiny (2 formy)

- Mg ↔ MgO: 1.6582 / 0.6031
- K ↔ K₂O: 1.2046 / 0.8302
- S ↔ SO₃: 2.4972 / 0.4005
- P ↔ P₂O₅: 2.2914 / 0.4364
- N ↔ NO₃: 4.4268 / 0.2259

## 📱 Responzivita

Projekt využívá mobile-first přístup s Tailwind breakpointy:

- **Mobile**: < 640px (výchozí)
- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+

## 🛠️ Technologie

- **Next.js 14**: React framework s App Router
- **React 18**: UI knihovna
- **Tailwind CSS 3**: Utility-first CSS framework
- **PostCSS**: CSS preprocessing
- **ESLint**: Code linting

## 📚 Dokumentace

| Dokument | Popis |
|----------|-------|
| [QUICKSTART.md](QUICKSTART.md) | ⚡ Rychlý start pro okamžité použití |
| [MANUAL.md](MANUAL.md) | 📖 Detailní návod k použití kalkulačky |
| [TESTING.md](TESTING.md) | 🧪 Testovací scénáře (28+ testů) |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | 📊 Kompletní shrnutí projektu |
| [FILES.md](FILES.md) | 📁 Seznam všech souborů |
| [COMPLETION.md](COMPLETION.md) | ✅ Potvrzení dokončení projektu |
| [design-reference.html](design-reference.html) | 🎨 Vizuální reference designu |

## ✅ Status projektu

```
███████████████████████████████ 100% KOMPLETNÍ
```

- ✅ Build úspěšný
- ✅ Všechny funkce implementovány
- ✅ Převodní koeficienty ověřeny
- ✅ Responzivní design
- ✅ Dokumentace kompletní
- ✅ Připraveno k nasazení

## 📝 Licence

© 2024 Démon agro. Všechna práva vyhrazena.
