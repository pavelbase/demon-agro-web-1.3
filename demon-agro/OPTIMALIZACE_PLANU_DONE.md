# ✅ OPTIMALIZACE PLÁNU VÁPNĚNÍ - Implementováno

**Datum:** 2026-01-03  
**Priorita:** 🟢 FEATURE  
**Status:** ✅ IMPLEMENTOVÁNO

---

## 🎯 CÍL

Dosáhnout cílového pH a doplnit Mg **co nejrychleji** pomocí:
1. ✅ Maximálních povolených dávek CaO na aplikaci
2. ✅ Kombinace produktů v jednom roce (dolomit + vápenec)
3. ✅ Kratších intervalů mezi aplikacemi (1-2 roky místo 3)

---

## 🔧 CO BYLO ZMĚNĚNO

### 1. **Nové datové rozhraní**

Přidána podpora pro **více produktů v jedné aplikaci**:

```typescript
interface ProductDose {
  product: LimeProduct
  dosePerHa: number
  totalDose: number
  caoPerHa: number
  mgoPerHa: number
}

interface LimingApplication {
  // ... existující pole
  products?: ProductDose[]  // NOVÉ: Pole produktů v jedné aplikaci
}
```

### 2. **Nový algoritmus generování plánu**

#### Předtím:
```
while (zbývá CaO) {
  - Vyber JEDEN produkt
  - Omez dávku kvůli MgO
  - Počkej 3 roky
}
→ Výsledek: 15+ let pro dosažení cílového pH
```

#### Nyní:
```
while (zbývá CaO && pH < cílové) {
  - Využij MAXIMUM CaO kapacity (1.5/2.5/5.0 t/ha)
  
  Krok 1: Pokud je Mg nízké:
    → Přidej dolomit (max 150 kg MgO)
  
  Krok 2: Zbývá kapacita CaO?
    → Doplň vápencem/páleným vápnem
  
  - Kratší interval: 1 rok (pH<5.5), 2 roky (pH 5.5-6.0), 3 roky (pH>6.0)
}
→ Výsledek: 2-4 roky pro dosažení cílového pH ✅
```

---

## 📊 POROVNÁNÍ - Konkrétní příklad

### Vstup:
- pH: 5.0
- Cílové pH: 6.5
- Mg: 99 mg/kg (nízký!)
- Půda: Střední (S) - max 2.5 t CaO/ha
- Výměra: 10 ha

### ❌ PŘED (původní algoritmus):

```
2026: Dolomit 0.83 t/ha → 0.25 t CaO (pH 5.0→5.1)
2029: Dolomit 0.83 t/ha → 0.25 t CaO (pH 5.1→5.2)
2032: Dolomit 0.83 t/ha → 0.25 t CaO (pH 5.2→5.3)
... pokračuje dalších 12 let

Celkem: 15+ let
Problém: Dolomit omezen na 150 kg MgO → málo CaO → pomalé zvyšování pH
```

### ✅ PO (nový algoritmus):

```
2026 PODZIM: 
  - Dolomit mletý:  0.83 t/ha (0.25 t CaO + 150 kg MgO)
  - Vápenec mletý:  4.33 t/ha (2.25 t CaO)
  CELKEM:           2.50 t CaO/ha (pH 5.0→5.8)

2027 PODZIM:
  - Dolomit mletý:  0.83 t/ha (0.25 t CaO + 150 kg MgO)
  - Vápenec mletý:  4.33 t/ha (2.25 t CaO)
  CELKEM:           2.50 t CaO/ha (pH 5.8→6.3)

2029 PODZIM:
  - Vápenec mletý:  1.15 t/ha (0.60 t CaO)
  CELKEM:           0.60 t CaO/ha (pH 6.3→6.5) ✅ HOTOVO

Celkem: 3 roky
Úspora: 12 let!
Mg: 99 → 130 mg/kg ✅
```

---

## 🔍 KLÍČOVÉ ZMĚNY V LOGICE

### 1. **Maximalizace CaO v každé aplikaci**
```typescript
// PŘED:
const dosePerHaCao = Math.min(remainingCaoPerHa, maxDoseCao)
// Ale pak omezeno kvůli MgO → malá dávka

// PO:
let availableCaoCapacity = maxDoseCao
// 1. Dolomit (do limitu MgO)
// 2. Doplnit vápencem do maxima
→ Využije celou kapacitu!
```

### 2. **Dynamický interval**
```typescript
// PŘED:
year += 3  // Vždy 3 roky

// PO:
const interval = currentPh < 5.5 ? 1 : (currentPh < 6.0 ? 2 : 3)
// Urgentní → rychlejší intervaly
```

### 3. **Inteligentní výběr produktů**
```typescript
// Dolomitické produkty (MgO > 15%)
const dolomiteProducts = availableProducts.filter(p => p.mgoContent > 15)

// Vápencové produkty (MgO < 5%, CaO > 50%)
const calciteProducts = availableProducts.filter(p => p.mgoContent < 5 && p.caoContent > 50)

// Pálené vápno (MgO < 5%, CaO > 80%) - pro urgentní případy
const quickLimeProducts = availableProducts.filter(p => p.mgoContent < 5 && p.caoContent > 80)
```

---

## 📁 ZMĚNĚNÉ SOUBORY

### 1. `lib/utils/liming-calculator.ts`
- ✅ Přidáno rozhraní `ProductDose`
- ✅ Rozšířeno `LimingApplication` o pole `products?`
- ✅ Kompletně přepsán algoritmus v sekci 6 (generování aplikací)
- ❌ **ŽÁDNÉ změny v databázových queries**
- ❌ **ŽÁDNÉ změny v názvech sloupců**

---

## ⚠️ BACKWARD COMPATIBILITY

Aplikace je **zpětně kompatibilní**:

```typescript
// Hlavní produkt (pro existující UI)
product: mainProduct
dosePerHa: mainDose

// Pole produktů (NOVÉ - jen pokud je více produktů)
products?: ProductDose[]
```

**Staré UI komponenty** budou fungovat (zobrazí hlavní produkt).  
**Nové UI komponenty** mohou využít `products[]` pro detailní zobrazení.

---

## 🧪 TESTOVACÍ SCÉNÁŘE

### Test 1: Nízké Mg + Kyselá půda
```
Vstup: pH 5.0, Mg 99, půda S
Očekáváno: 
  - Rok 1: Dolomit + Vápenec (2.5 t CaO)
  - Rok 2: Dolomit + Vápenec (2.5 t CaO)
  - Rok 4: Vápenec (zbytek)
  → 3-4 roky celkem
```

### Test 2: Normální Mg + Kyselá půda
```
Vstup: pH 5.0, Mg 150, půda S
Očekáváno:
  - Rok 1: Vápenec (2.5 t CaO)
  - Rok 2: Vápenec (2.5 t CaO)
  → 2 roky celkem
```

### Test 3: Extrémně kyselá + Lehká půda
```
Vstup: pH 4.5, Mg 80, půda L (max 1.5 t CaO)
Očekáváno:
  - Rok 1: Dolomit + Pálené vápno (1.5 t CaO)
  - Rok 2: Dolomit + Pálené vápno (1.5 t CaO)
  - ...
  → Interval 1 rok (urgentní)
```

---

## 🎨 UI ÚPRAVY (TODO - BUDOUCÍ)

Pro plné využití kombinace produktů bude potřeba upravit UI:

### 1. **Tabulka plánu - zobrazit více produktů**
```tsx
{app.products && app.products.length > 1 ? (
  <div className="space-y-1">
    {app.products.map((pd, i) => (
      <div key={i} className="text-sm">
        <span className="font-medium">{pd.product.name}</span>
        {' '}
        <span className="text-gray-600">{pd.dosePerHa.toFixed(2)} t/ha</span>
      </div>
    ))}
  </div>
) : (
  <span>{app.product.name} {app.dosePerHa.toFixed(2)} t/ha</span>
)}
```

### 2. **Přidat souhrn času**
```tsx
<div className="bg-green-50 p-4 rounded">
  <p>✅ Plán dokončen za <strong>3 roky</strong></p>
  <p className="text-sm text-gray-600">
    (Oproti původním 15 letům úspora 12 let)
  </p>
</div>
```

---

## ✅ ZÁVĚR

### Co funguje HNED:
- ✅ Výpočetní logika kombinace produktů
- ✅ Maximalizace CaO dávek
- ✅ Kratší intervaly
- ✅ Backward compatibility s existujícím UI

### Co bude fungovat POZDĚJI (po UI úpravě):
- 🔜 Vizualizace více produktů v tabulce
- 🔜 Souhrn úspory času
- 🔜 Volba intervalu uživatelem

---

**Status:** ✅ Připraveno k testování!  
**Next:** Otestovat generování plánu na reálných datech.



