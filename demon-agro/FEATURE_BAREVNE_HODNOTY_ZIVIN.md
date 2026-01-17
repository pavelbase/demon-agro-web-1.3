# Barevné zobrazení hodnot živin v tabulkovém přehledu vápnění

## 📋 Přehled změn

Datum: 4. ledna 2026

Byla implementována funkcionalita barevného zobrazení hodnot živin (Ca, Mg, K, P, S) v tabulkovém přehledu plánu vápnění podle stejné metodiky, která se používá ve zdravotní kartě půdy.

## 🎯 Cíl

Vizuálně odlišit hodnoty živin podle jejich kategorie, aby uživatelé mohli okamžitě identifikovat problematické hodnoty (červeně = nízké, oranžově = vyhovující, zeleně = dobré, modře = vysoké, fialově = velmi vysoké).

## 📁 Upravené soubory

### 1. `components/portal/TabulkovyPrehledVapneni.tsx`

**Změny:**

1. **Import nového typu a funkce:**
```typescript
import type { ..., NutrientCategory } from '@/lib/types/database'
import { categorizeNutrient } from '@/lib/utils/soil-categories'
```

2. **Přidána funkce `getNutrientTextColor()`:**
```typescript
function getNutrientTextColor(category: NutrientCategory | null): string {
  if (!category) return 'text-gray-600'
  
  switch (category) {
    case 'nizky':
      return 'text-[#ef4444]' // Červená - Nízký
    case 'vyhovujici':
      return 'text-[#f97316]' // Oranžová - Vyhovující
    case 'dobry':
      return 'text-[#22c55e]' // Zelená - Dobrý
    case 'vysoky':
      return 'text-[#3b82f6]' // Modrá - Vysoký
    case 'velmi_vysoky':
      return 'text-[#8b5cf6]' // Fialová - Velmi vysoký
    default:
      return 'text-gray-600'
  }
}
```

3. **Upraveno zobrazení sloupců Ca, Mg, K, P, S:**
   - Každá hodnota je nyní dynamicky obarvena podle své kategorie
   - Použito `categorizeNutrient()` pro určení kategorie
   - Použito `getNutrientTextColor()` pro získání odpovídající barvy
   - Přidána třída `font-semibold` pro lepší viditelnost

## 🎨 Barevná metodika

Barevné zobrazení odpovídá metodice používané ve zdravotní kartě půdy (`ParcelHealthCard.tsx`):

| Kategorie | Barva | Hex kód | Význam |
|-----------|-------|---------|--------|
| **Nízký** | 🔴 Červená | #ef4444 | Nutná vysoká dávka hnojení |
| **Vyhovující** | 🟠 Oranžová | #f97316 | Zvýšená dávka doporučena |
| **Dobrý** | 🟢 Zelená | #22c55e | Optimální stav - udržovací hnojení |
| **Vysoký** | 🔵 Modrá | #3b82f6 | Snížená dávka nebo omezit hnojení |
| **Velmi vysoký** | 🟣 Fialová | #8b5cf6 | Omezit hnojení, legislativní limity |

## 📊 Kategorizace živin

Kategorie se určují podle:

### Ca (Vápník)
Jednotná škála pro všechny půdy:
- Nízký: ≤ 1499 mg/kg → 🔴
- Vyhovující: 1500-2500 mg/kg → 🟠
- Dobrý: 2501-4000 mg/kg → 🟢
- Vysoký: 4001-6000 mg/kg → 🔵
- Velmi vysoký: > 6000 mg/kg → 🟣

### Mg (Hořčík)
Závisí na typu půdy:
- **Lehká (L)**: 80 / 135 / 200 / 300 / 300+
- **Střední (S)**: 105 / 160 / 250 / 380 / 380+
- **Těžká (T)**: 120 / 220 / 350 / 550 / 550+

### K (Draslík)
Závisí na typu půdy:
- **Lehká (L)**: 80 / 135 / 200 / 300 / 300+
- **Střední (S)**: 105 / 160 / 250 / 380 / 380+
- **Těžká (T)**: 170 / 260 / 400 / 600 / 600+

### P (Fosfor)
Závisí na typu půdy:
- **Lehká (L)**: 50 / 80 / 125 / 170 / 170+
- **Střední (S)**: 100 / 160 / 250 / 350 / 350+
- **Těžká (T)**: 105 / 170 / 300 / 450 / 450+

### S (Síra)
Jednotná škála pro všechny půdy:
- Nízký: ≤ 9 mg/kg → 🔴
- Vyhovující: 10-14 mg/kg → 🟠
- Dobrý: 15-24 mg/kg → 🟢
- Vysoký: 25-39 mg/kg → 🔵
- Velmi vysoký: ≥ 40 mg/kg → 🟣

## 🔍 Příklad použití

V tabulce:
```
| Ca (mg/kg) | Mg (mg/kg) | K (mg/kg) | P (mg/kg) | S (mg/kg) |
|------------|------------|-----------|-----------|-----------|
| 688 🔴     | 124 🟠     | 290 🟢    | 132 🔵    | 21.9 🟢   |
```

- **Ca = 688 mg/kg** → červeně (nízký obsah, < 1500)
- **Mg = 124 mg/kg** → oranžově (vyhovující pro střední půdu)
- **K = 290 mg/kg** → zeleně (dobrý)
- **P = 132 mg/kg** → modře (vysoký)
- **S = 21.9 mg/kg** → zeleně (dobrý)

## ✅ Testování

1. Otevřete stránku **Plány vápnění** (`/portal/plany-vapneni`)
2. Přepněte na záložku **"Tabulkový přehled"**
3. Zkontrolujte, že hodnoty Ca, Mg, K, P, S jsou barevně rozlišené
4. Ověřte, že barvy odpovídají kategorii (nízké hodnoty červeně, atd.)
5. Zkontrolujte, že hodnoty s "-" (chybějící data) jsou šedé

## 📚 Související soubory

- `lib/utils/soil-categories.ts` - Funkce `categorizeNutrient()`
- `components/portal/ParcelHealthCard.tsx` - Původní implementace barevné metodiky
- `lib/kalkulace.ts` - Definice kategorií a mezních hodnot

## 🎯 Výhody

1. **Rychlá identifikace problémů** - Červené hodnoty okamžitě upozorní na nízký obsah živin
2. **Konzistence** - Stejná barevná logika jako ve zdravotní kartě
3. **Lepší UX** - Vizuální indikátory jsou intuitivnější než číselné hodnoty
4. **Profesionální vzhled** - Shoduje se s metodikou používanou v agronomické praxi

## 🔄 Budoucí vylepšení

- [ ] Přidat tooltip s vysvětlením kategorie při najetí myší na hodnotu
- [ ] Přidat legendu barev pod tabulku
- [ ] Zvážit přidání ikon vedle hodnot (⚠ pro nízké, ✓ pro optimální)




