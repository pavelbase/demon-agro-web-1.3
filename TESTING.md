# Testovací scénáře - Převodní kalkulačka

## ✅ Automatický test - Build

**Status**: PASSED ✓

```
npm run build
```

Aplikace byla úspěšně zkompilována bez chyb.

## Manuální testovací scénáře

### 1. Základní převod
- [ ] Otevřít kalkulačku na /kalkulacka/prevodni
- [ ] Vybrat živinu Ca (vápník)
- [ ] Zadat 100 v poli Ca
- [ ] Ověřit, že výsledek zobrazuje 139.92 CaO
- [ ] Koeficient by měl zobrazovat 1.3992

### 2. Změna jednotek
- [ ] Zadat 100 kg/ha Ca
- [ ] Přepnout výstup na g/kg
- [ ] Ověřit, že hodnota se přepočítá (139.92 → 1399.2)

### 3. Prohození směru
- [ ] Zadat 100 Ca → CaO (výsledek 139.92)
- [ ] Kliknout na tlačítko prohození (šipky)
- [ ] Ověřit, že:
  - Směr je nyní CaO → Ca
  - Vstupní pole obsahuje 139.92
  - Výstupní pole obsahuje 100
  - Koeficient se změnil na 0.7147

### 4. Vápník - všechny směry převodu
- [ ] Ca → CaO (koeficient 1.3992)
- [ ] Ca → CaCO₃ (koeficient 2.4973)
- [ ] CaO → Ca (koeficient 0.7147)
- [ ] CaO → CaCO₃ (koeficient 1.7848)
- [ ] CaCO₃ → Ca (koeficient 0.4005)
- [ ] CaCO₃ → CaO (koeficient 0.5603)

### 5. Ostatní živiny

#### Hořčík (Mg)
- [ ] Mg → MgO: 100 → 165.82 (koeficient 1.6582)
- [ ] MgO → Mg: 100 → 60.31 (koeficient 0.6031)

#### Draslík (K)
- [ ] K → K₂O: 100 → 120.46 (koeficient 1.2046)
- [ ] K₂O → K: 100 → 83.02 (koeficient 0.8302)

#### Síra (S)
- [ ] S → SO₃: 100 → 249.72 (koeficient 2.4972)
- [ ] SO₃ → S: 100 → 40.05 (koeficient 0.4005)

#### Fosfor (P)
- [ ] P → P₂O₅: 100 → 229.14 (koeficient 2.2914)
- [ ] P₂O₅ → P: 100 → 43.64 (koeficient 0.4364)

#### Dusík (N)
- [ ] N → NO₃: 100 → 442.68 (koeficient 4.4268)
- [ ] NO₃ → N: 100 → 22.59 (koeficient 0.2259)

### 6. Responzivita - Desktop
- [ ] Otevřít na desktop (1920x1080)
- [ ] Ověřit, že živiny jsou v jednom řádku
- [ ] Ověřit, že kalkulátor je v 2 sloupcích
- [ ] Dropdown menu se rozbaluje při hoveru
- [ ] Všechny prvky mají správné rozestupy

### 7. Responzivita - Tablet
- [ ] Otevřít na tablet (768px)
- [ ] Ověřit, že živiny jsou ve 3 sloupcích
- [ ] Ověřit, že kalkulátor se přizpůsobil

### 8. Responzivita - Mobil
- [ ] Otevřít na mobil (375px)
- [ ] Ověřit, že živiny jsou ve 2 sloupcích
- [ ] Ověřit, že kalkulátor je vertikální (stacked)
- [ ] Dotyková oblast tlačítek min. 44×44px
- [ ] Hamburger menu funguje
- [ ] Dropdown položky se zobrazují po kliknutí

### 9. Navigace
- [ ] Ověřit, že všechny položky navigace fungují:
  - Domů
  - Řešení (dropdown: Vápnění, Hnojení, Rozbory)
  - Rádce
  - Kalkulačka (dropdown: Kalkulačka vápnění, Převodní kalkulačka)
  - O nás
  - Kontakt
  - Nezávazná poptávka (CTA tlačítko)

### 10. Validace
- [ ] Prázdný vstup → výstup zobrazí "—"
- [ ] Záporné číslo → přijímá pouze kladná čísla (min="0")
- [ ] Text místo čísla → ignoruje se

### 11. Vizuální styl
- [ ] Barvy odpovídají zadání:
  - Primární hnědá #5C4033
  - Béžová #C9A77C
  - Krémová #F5F1E8 (pozadí)
  - Zelená #4A7C59 (CTA)
- [ ] Živiny mají správné barvy:
  - Ca: modrá (#0EA5E9)
  - Mg: zelená (#10B981)
  - K: fialová (#8B5CF6)
  - S: žlutá (#EAB308)
  - P: oranžová (#F97316)
  - N: růžová (#EC4899)
- [ ] Zaoblené rohy (rounded-2xl, rounded-3xl)
- [ ] Jemné stíny (shadow-warm)
- [ ] Plynulé přechody (transition-all duration-300)

### 12. Přístupnost
- [ ] Všechny inputy mají labels
- [ ] Dostatečný kontrast textu
- [ ] Tlačítka mají aria-label kde potřeba
- [ ] Navigace funguje klávesnicí (Tab)

### 13. Tabulka koeficientů
- [ ] Zobrazuje všechny živiny
- [ ] Správné hodnoty koeficientů
- [ ] Čitelné formátování (font-mono pro čísla)
- [ ] Hover efekt na řádcích

### 14. Info box
- [ ] Vysvětluje důvod převodů
- [ ] Obsahuje praktický příklad
- [ ] Dobře čitelný text

## Testovací příkazy

```bash
# Instalace závislostí
npm install

# Vývojový server
npm run dev

# Build
npm run build

# Produkční server
npm start

# Linting
npm run lint
```

## Známé omezení

- Kalkulačka vápnění je zatím placeholder (v plánu pro budoucí verzi)
