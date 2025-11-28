# Démon agro - Návod k použití

## 📦 Instalace a spuštění

### 1. Instalace závislostí

```bash
npm install
```

Toto nainstaluje všechny potřebné balíčky:
- Next.js 14.2.0
- React 18.3.1
- Tailwind CSS 3.4.3
- PostCSS + Autoprefixer
- ESLint

### 2. Spuštění vývojového serveru

```bash
npm run dev
```

Aplikace bude dostupná na [http://localhost:3000](http://localhost:3000)

### 3. Build pro produkci

```bash
npm run build
```

Vytvoří optimalizovanou produkční verzi aplikace.

### 4. Spuštění produkční verze

```bash
npm start
```

Spustí produkční server (nejprve je potřeba provést build).

## 🧭 Navigace v aplikaci

### Hlavní sekce

- **Domů** (`/`) - Domovská stránka
- **Řešení** (dropdown menu)
  - Vápnění půd (`/reseni/vapneni`)
  - Hnojení (`/reseni/hnojeni`)
  - Rozbory půd (`/reseni/rozbory`)
- **Rádce** (`/radce`) - Agronomický rádce
- **Kalkulačka** (dropdown menu)
  - Kalkulačka vápnění (`/kalkulacka/vapneni`) - *placeholder*
  - **Převodní kalkulačka** (`/kalkulacka/prevodni`) - ⭐ **HLAVNÍ FUNKCE**
- **O nás** (`/o-nas`)
- **Kontakt** (`/kontakt`)
- **Nezávazná poptávka** (`/poptavka`) - Formulář

## 🧮 Převodní kalkulačka

### Přístup

Navigujte na: **Kalkulačka → Převodní kalkulačka**

nebo přímo: `/kalkulacka/prevodni`

### Funkce

#### 1. Výběr živiny
Klikněte na jednu ze 6 živin:
- 🔵 **Ca** - Vápník (speciální - 3 formy)
- 🟢 **Mg** - Hořčík
- 🟣 **K** - Draslík
- 🟡 **S** - Síra
- 🟠 **P** - Fosfor
- 🟣 **N** - Dusík

#### 2. Výběr směru převodu

**Pro vápník (Ca):**
- Vyberte jeden z 6 směrů v dropdown menu:
  - Ca → CaO
  - Ca → CaCO₃
  - CaO → Ca
  - CaO → CaCO₃
  - CaCO₃ → Ca
  - CaCO₃ → CaO

**Pro ostatní živiny:**
- Směr se zobrazí automaticky (např. Mg → MgO)
- Prohoďte směr tlačítkem se šipkami

#### 3. Zadání hodnoty
- Zadejte číslo do vstupního pole
- Vyberte jednotku (%, kg/ha, kg/t, g/kg, mg/kg)
- Výsledek se vypočítá automaticky

#### 4. Prohození směru
- Klikněte na tlačítko se šipkami uprostřed
- Vstup a výstup se prohodí včetně hodnot

#### 5. Změna výstupní jednotky
- Vyberte jinou jednotku pro výstup
- Výsledek se automaticky přepočítá

### Praktické příklady

#### Příklad 1: Základní převod Ca → CaO
```
Vstup: 100 kg/ha Ca
Výstup: 139.92 kg/ha CaO
Koeficient: 1.3992
```

#### Příklad 2: Převod s různými jednotkami
```
Vstup: 150 mg/kg Ca
Výstup: 374.90 mg/kg CaCO₃
Koeficient: 2.4973
```

#### Příklad 3: Převod draslíku
```
Vstup: 50 % K
Výstup: 60.23 % K₂O
Koeficient: 1.2046
```

## 📱 Responzivita

Aplikace je optimalizována pro všechny zařízení:

- **Mobil** (< 640px): Vertikální rozložení, hamburger menu
- **Tablet** (640px - 1024px): Částečně horizontální rozložení
- **Desktop** (> 1024px): Plné horizontální rozložení, dropdown hover efekty

## 🎨 Design

### Barevné schéma

**Hlavní barvy:**
- Primární hnědá: `#5C4033`
- Béžová: `#C9A77C`
- Krémová (pozadí): `#F5F1E8`
- Zelená (CTA): `#4A7C59`

**Barvy živin:**
- Ca: `#0EA5E9` (modrá)
- Mg: `#10B981` (zelená)
- K: `#8B5CF6` (fialová)
- S: `#EAB308` (žlutá)
- P: `#F97316` (oranžová)
- N: `#EC4899` (růžová)

### Typografie
- Font: Inter (system fallback)
- Nadpisy: font-weight 700, tracking-tight
- Text: font-weight 400, leading-relaxed

### Zaoblení a stíny
- Komponenty: `rounded-2xl` až `rounded-3xl`
- Stíny: `shadow-warm`, `shadow-warm-lg`
- Přechody: `transition-all duration-300`

## 🧪 Testování

Spusťte testovací scénáře podle `TESTING.md`

```bash
# Lint check
npm run lint

# Build test
npm run build

# Manual testing
npm run dev
# Poté otevřete prohlížeč a testujte podle TESTING.md
```

## 📊 Převodní koeficienty - Reference

### Vápník (Ca) - 3 formy
| Směr | Koeficient |
|------|------------|
| Ca → CaO | 1.3992 |
| CaO → Ca | 0.7147 |
| Ca → CaCO₃ | 2.4973 |
| CaCO₃ → Ca | 0.4005 |
| CaO → CaCO₃ | 1.7848 |
| CaCO₃ → CaO | 0.5603 |

### Hořčík (Mg)
| Směr | Koeficient |
|------|------------|
| Mg → MgO | 1.6582 |
| MgO → Mg | 0.6031 |

### Draslík (K)
| Směr | Koeficient |
|------|------------|
| K → K₂O | 1.2046 |
| K₂O → K | 0.8302 |

### Síra (S)
| Směr | Koeficient |
|------|------------|
| S → SO₃ | 2.4972 |
| SO₃ → S | 0.4005 |

### Fosfor (P)
| Směr | Koeficient |
|------|------------|
| P → P₂O₅ | 2.2914 |
| P₂O₅ → P | 0.4364 |

### Dusík (N)
| Směr | Koeficient |
|------|------------|
| N → NO₃ | 4.4268 |
| NO₃ → N | 0.2259 |

## 🚀 Nasazení

### Vercel (doporučeno pro Next.js)

1. Připojte repozitář k Vercel účtu
2. Vercel automaticky detekuje Next.js
3. Deploy se provede automaticky při push

### Jiné platformy

```bash
npm run build
npm start
```

Aplikace běží na portu 3000 (nebo PORT env proměnné).

## 📝 Licence

© 2024 Démon agro. Všechna práva vyhrazena.

## 🆘 Podpora

Pro dotazy nebo problémy kontaktujte:
- Email: info@demonagro.cz
- Telefon: +420 XXX XXX XXX
