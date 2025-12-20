# Phase 6.1 - Plán vápnění - Implementation Summary ✅

## 📦 Co bylo implementováno

Kompletní stránka plánu vápnění s výpočtem potřeby, doporučením typu vápence, výběrem produktů a možností odeslání poptávky.

## 🗂️ Vytvořené soubory

### 1. **Databázová migrace**
```
lib/supabase/sql/
└── create_liming_products_table.sql       # 250+ řádků
```

**Tabulka:** `liming_products`
- 6 výchozích produktů (vápenatý, dolomitický, univerzální)
- Složení (% CaO, % MgO)
- Reaktivita (very_high/high/medium/low)
- Granulace a forma
- RLS policies

### 2. **Stránka plánu vápnění**
```
app/portal/pozemky/[id]/plan-vapneni/
└── page.tsx                                # 450+ řádků
```

**Server Component:**
- Fetch pozemku a rozboru
- Výpočet potřeby vápnění
- Doporučení typu vápence
- Fetch produktů z DB
- Empty state handling

### 3. **Komponenta výběru produktu**
```
components/portal/
└── LimingProductSelector.tsx               # 330+ řádků
```

**Client Component:**
- Radio button výběr produktu
- Výpočet potřebného množství pro každý produkt
- Kalkulace (t/ha × plocha)
- Přidání do košíku
- Odeslání poptávky

### 4. **Typové definice**
```
lib/types/database.ts
├── LimeProductType ('calcitic' | 'dolomite' | 'both')
├── Reactivity ('low' | 'medium' | 'high' | 'very_high')
├── StockStatus ('in_stock' | 'low_stock' | 'out_of_stock' | 'on_order')
└── liming_products table interface
```

### 5. **Dokumentace**
```
PHASE_6_1_LIMING_PLAN_SUMMARY.md           # Tento soubor
```

**Celkem:** ~1,030+ řádků kódu

---

## 🎯 Implementované funkce

### 1. **Přehled potřeby vápnění** ✅

**Zobrazení:**
- Aktuální pH (barevně podle kategorie)
- Cílové pH (6.5 pro ornou, 6.0 pro TTP)
- Rozdíl pH
- Potřeba CaO (t/ha a kg/ha)
- Celková potřeba pro pozemek (t)

**Výpočet:**
```typescript
const limeNeedKgHa = calculateLimeNeed(
  latestAnalysis.ph,
  parcel.soil_type,
  parcel.culture,
  targetPh
)
const totalTons = (limeNeedKgHa * parcel.area) / 1000
```

**Barevné odlišení:**
- Aktuální pH: Oranžová (potřeba vápnění)
- Cílové pH: Zelená (optimální)
- Potřeba CaO: Zelená karta
- Celková potřeba: Hnědá karta

### 2. **Doporučený typ vápence** ✅

**Logika:**
```typescript
const limeTypeRecommendation = selectLimeType(
  latestAnalysis.magnesium,
  latestAnalysis.magnesium_category,
  latestAnalysis.potassium,
  latestAnalysis.potassium_category
)
```

**Výstup:**
- `recommended_type`: 'calcitic' | 'dolomite' | 'either'
- `reason`: Textové zdůvodnění

**Zobrazení:**
- Velká barevná ikona (Ca nebo Ca+Mg)
- Název typu (Vápenatý/Dolomitický/Libovolný)
- Důvod doporučení
- Box s aktuálním Mg a K:Mg poměrem
- Barevné hodnocení poměru (zelená/žlutá/červená)

### 3. **Produkty Démon Agro** ✅

**6 výchozích produktů:**

| Produkt | Typ | CaO % | MgO % | Reaktivita |
|---------|-----|-------|-------|------------|
| Vápenec mletý - Vysokoreaktivní | calcitic | 52 | 0 | very_high |
| Dolomit mletý | dolomite | 30 | 18 | high |
| Granulovaný vápenec | calcitic | 50 | 0 | medium |
| Vápenec drcený | calcitic | 48 | 0 | medium |
| Dolomit granulovaný | dolomite | 32 | 16 | medium |
| Vápenec + Mg (hybridní) | both | 45 | 8 | high |

**Filtrace:**
- Pokud doporučen `calcitic` → zobrazí calcitic + both
- Pokud doporučen `dolomite` → zobrazí dolomite + both
- Pokud `either` → zobrazí všechny

**Pro každý produkt:**
- Radio button výběr
- Název a popis
- Typ badge
- Složení (% CaO, % MgO)
- Reaktivita (velmi vysoká/vysoká/střední/nízká)
- Granulace (0-0.5mm, 2-5mm, atd.)
- Forma (moučka, granulát, drcený, směs)
- **Potřebné množství:**
  - Výpočet: `quantity = limeNeedKgHa / (cao_content / 100) * area / 1000`
  - Zobrazení: X.XX t celkem (Y.YY t/ha × Z ha)
- Poznámky k aplikaci

### 4. **Kalkulace** ✅

**Zobrazení po výběru produktu:**
- Vybraný produkt (název)
- Množství (t celkem + t/ha)
- Cena: "Bude stanovena individuálně"
- Disclaimer: "Po odeslání poptávky vás budeme kontaktovat"

**Akce:**
- ✅ **"Přidat do poptávky"** → přidá do košíku (LimingCart context)
  - Success message (zelený banner, 3s)
  - Item obsahuje: parcelId, productId, quantity
- ✅ **"Odeslat poptávku"** → přidá do košíku + redirect na `/portal/poptavky/nova`

### 5. **Podmíněné zobrazení** ✅

**Pokud chybí rozbor:**
- Empty state s oranžovým warning ikonou
- Nadpis: "Chybí rozbor půdy"
- Vysvětlení
- CTA tlačítko: "Nahrát rozbor půdy" → `/portal/upload?parcel=[id]`

**Pokud pH >= cílové:**
- Zelený success message
- Nadpis: "Vápnění není potřeba"
- Vysvětlení
- Box s aktuálním stavem:
  - Aktuální pH (zelená)
  - Cílové pH
  - Kategorie
- Modrý info box s doporučením (kontrola každé 4 roky)

### 6. **Sidebar informace** ✅

**O výpočtu:**
- Vysvětlení metodiky
- Zmínka ÚKZÚZ
- Půdní typ a cílové pH

**Doporučený termín aplikace:**
- ✓ Podzim: Po sklizni, do konce října
- ✓ Jaro: Před setím, únor-březen
- ✗ Nevhodné: V zimě nebo na zmrzlou půdu

**Použitá data:**
- Datum rozboru
- Laboratoř (pokud je)
- Půdní typ (Lehká/Střední/Těžká)
- Kultura (Orná půda/TTP)

---

## 🗄️ Databázové změny

### Nová tabulka: `liming_products`

```sql
CREATE TABLE public.liming_products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('calcitic', 'dolomite', 'both')),
  cao_content DECIMAL(5,2) NOT NULL,
  mgo_content DECIMAL(5,2) DEFAULT 0,
  reactivity VARCHAR(20) CHECK (reactivity IN ('low', 'medium', 'high', 'very_high')),
  granulation VARCHAR(50),
  form VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  stock_status VARCHAR(20) DEFAULT 'in_stock',
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  notes TEXT,
  application_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Indexy:**
- `idx_liming_products_type` (type)
- `idx_liming_products_active` (is_active)
- `idx_liming_products_display_order` (display_order)

**RLS Policies:**
- Veřejné čtení aktivních produktů
- Admin může upravovat (role = 'admin')

**Trigger:**
- `update_liming_products_updated_at` (automatická aktualizace updated_at)

---

## 🎨 Design systém

### Barvy

**Typ vápence:**
- Vápenatý (calcitic): `bg-blue-500` (modrá)
- Dolomitický (dolomite): `bg-purple-500` (fialová)
- Univerzální (both): `bg-gray-500` (šedá)

**Stav:**
- Potřeba vápnění: Oranžová (aktuální pH)
- Optimální: Zelená (cílové pH, OK status)
- Warning: Žlutá (K:Mg varování)
- Kritické: Červená (K:Mg kritické)

**Produkty:**
- Vybraný: `border-primary-green bg-primary-green/5`
- Nevybraný: `border-gray-200 hover:border-gray-300`

**Karty:**
- Potřeba CaO: `bg-primary-green/10`
- Celková potřeba: `bg-primary-brown/10`
- Produktové množství: `bg-primary-green/10`

### Ikony (Lucide React)
- `ChevronLeft` - Zpět
- `Calculator` - Přehled potřeby
- `Info` - Informace
- `CheckCircle` - Vápnění není potřeba
- `AlertCircle` - Chybí rozbor
- `Package` - Produkty
- `ShoppingCart` - Košík/poptávka

### Responsive layout

**Desktop (> 1024px):**
- 3-column grid (2 + 1)
- Main content: 2 columns
- Sidebar: 1 column

**Tablet (768-1024px):**
- Single column
- Full-width cards

**Mobile (< 768px):**
- Single column
- Stacked elements
- Full-width buttons

---

## 🔧 Technické detaily

### Server Component (page.tsx)

```typescript
// 1. Auth check
const user = await requireAuth()

// 2. Fetch parcel
const { data: parcel } = await supabase
  .from('parcels')
  .select('*')
  .eq('id', params.id)
  .eq('user_id', user.id)
  .single()

// 3. Fetch latest analysis
const { data: analyses } = await supabase
  .from('soil_analyses')
  .select('*')
  .eq('parcel_id', params.id)
  .order('date', { ascending: false })
  .limit(1)

// 4. Calculate liming need
const limeNeedKgHa = calculateLimeNeed(...)
const limeTypeRec = selectLimeType(...)

// 5. Fetch products
const { data: products } = await supabase
  .from('liming_products')
  .select('*')
  .eq('is_active', true)
  .order('display_order')

// 6. Filter products by recommended type
const recommendedProducts = filterByType(products, limeTypeRec.recommended_type)

// 7. Render
```

### Client Component (LimingProductSelector.tsx)

```typescript
// State
const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
const [showSuccessMessage, setShowSuccessMessage] = useState(false)

// Context
const { addItem } = useLimingCart()

// Calculate quantity for each product
const calculateProductQuantity = (product) => {
  const quantityKgHa = limeNeedKgHa / (product.cao_content / 100)
  const totalKg = quantityKgHa * parcelArea
  return totalKg / 1000 // tons
}

// Add to cart
const handleAddToRequest = () => {
  addItem({
    id: `${parcelId}-${productId}-${Date.now()}`,
    fieldId: parcelId,
    productId: selectedProductId,
    quantity: calculateProductQuantity(selectedProduct),
  })
  setShowSuccessMessage(true)
}

// Submit request
const handleSubmitRequest = () => {
  handleAddToRequest()
  router.push('/portal/poptavky/nova')
}
```

### Výpočet množství produktu

**Vzorec:**
```
Potřeba CaO (kg/ha) = calculateLimeNeed(pH, soilType, culture, targetPh)

Potřeba produktu (kg/ha) = Potřeba CaO / (% CaO / 100)

Celková potřeba (t) = (Potřeba produktu × plocha) / 1000
```

**Příklad:**
```
Pozemek: 10 ha
pH: 5.3 → cílové pH: 6.5
Půdní typ: S (střední)
Potřeba CaO: 4,200 kg/ha

Produkt: Vápenec mletý (52% CaO)
Potřeba produktu: 4,200 / 0.52 = 8,077 kg/ha
Celková potřeba: 8.077 × 10 / 1000 = 80.77 t
```

---

## 🔄 Integrace

### S výpočtovými funkcemi
- `calculateLimeNeed()` z `lib/utils/calculations.ts`
- `selectLimeType()` z `lib/utils/calculations.ts`

### S košíkem (LimingCartContext)
- `addItem()` - přidá položku do košíku
- Item obsahuje: `{ id, fieldId, productId, quantity }`
- Context je Provider v layout (připraveno)

### S databází
- Čtení: `liming_products` (veřejné RLS)
- Čtení: `parcels` (user_id filter)
- Čtení: `soil_analyses` (parcel_id filter)

### S navigací
- Zpět: `/portal/pozemky/[id]`
- Upload: `/portal/upload?parcel=[id]`
- Nová poptávka: `/portal/poptavky/nova`

---

## 🧪 Testovací scénáře

### Test 1: Chybějící rozbor
```
1. Otevřít pozemek bez rozboru
2. Jít na tab "Plán vápnění"
3. ✓ Zobrazí empty state
4. ✓ Tlačítko "Nahrát rozbor" funguje
```

### Test 2: pH v normě
```
1. Pozemek s pH >= 6.5 (orná) nebo >= 6.0 (TTP)
2. Jít na tab "Plán vápnění"
3. ✓ Zobrazí "Vápnění není potřeba"
4. ✓ Zobrazí aktuální stav
5. ✓ Modrý info box s doporučením
```

### Test 3: Potřeba vápnění - kalcitický
```
1. Pozemek s pH 5.3, Mg kategorie D nebo vyšší
2. ✓ Zobrazí přehled potřeby (3 karty)
3. ✓ Doporučí vápenatý vápenec
4. ✓ Zobrazí filtrované produkty (calcitic + both)
5. ✓ Každý produkt má správný výpočet množství
```

### Test 4: Potřeba vápnění - dolomitický
```
1. Pozemek s pH 5.5, Mg kategorie N nebo VH
2. ✓ Doporučí dolomitický vápenec
3. ✓ Zdůvodnění: nedostatek Mg
4. ✓ Zobrazí filtrované produkty (dolomite + both)
```

### Test 5: Výběr produktu a kalkulace
```
1. Vybrat produkt (klik na kartu)
2. ✓ Karta se zvýrazní zeleně
3. ✓ Radio button naplněn
4. ✓ Kalkulace box zobrazí:
   - Název produktu
   - Množství (t celkem + t/ha)
   - "Cena bude stanovena individuálně"
5. ✓ Tlačítka aktivní
```

### Test 6: Přidání do košíku
```
1. Vybrat produkt
2. Kliknout "Přidat do poptávky"
3. ✓ Zelený success message (3s)
4. ✓ Item přidán do LimingCartContext
5. ✓ Tlačítka stále funkční (lze přidat vícekrát)
```

### Test 7: Odeslání poptávky
```
1. Vybrat produkt
2. Kliknout "Odeslat poptávku"
3. ✓ Item přidán do košíku
4. ✓ Redirect na /portal/poptavky/nova
```

### Test 8: Responzivita
```
1. Otevřít na mobile (< 768px)
2. ✓ Single column layout
3. ✓ Sidebar pod main content
4. ✓ Tlačítka full-width
5. ✓ Produktové karty stack vertically
```

---

## 📊 Statistiky kódu

| Soubor | Řádků | Typ |
|--------|-------|-----|
| create_liming_products_table.sql | 250+ | SQL |
| plan-vapneni/page.tsx | 450+ | TSX |
| LimingProductSelector.tsx | 330+ | TSX |
| database.ts (updates) | ~60 | TS |
| **CELKEM** | **~1,090** | |

---

## 🎯 Připraveno pro implementaci

### Fáze 6.2: Správa produktů (admin) ❌
- [ ] Admin stránka `/portal/admin/produkty-vapneni`
- [ ] CRUD operace pro liming_products
- [ ] Nahrávání obrázků
- [ ] Aktivace/deaktivace

### Fáze 6.3: Košík a poptávky ❌
- [ ] Zobrazení košíku (sidebar nebo stránka)
- [ ] Editace položek v košíku
- [ ] Formulář nové poptávky s košíkem
- [ ] Odeslání poptávky do DB

### Fáze 6.4: Multi-year plán vápnění ❌
- [ ] Strategie vápnění na 4-6 let
- [ ] Predikce pH po vápnění
- [ ] Timing doporučení
- [ ] Ekonomická optimalizace

---

## ✅ Completion Criteria

All implemented:
- [x] SQL migrace pro liming_products tabulku
- [x] 6 výchozích produktů
- [x] RLS policies
- [x] Typové definice v database.ts
- [x] Stránka plan-vapneni/page.tsx
- [x] Přehled potřeby (3 karty)
- [x] Doporučení typu vápence
- [x] K:Mg poměr zobrazení
- [x] Seznam produktů (filtrace podle typu)
- [x] Výpočet množství pro každý produkt
- [x] Radio button výběr
- [x] Kalkulace sekce
- [x] Přidání do košíku (LimingCart context)
- [x] Odeslání poptávky (redirect)
- [x] Empty state (chybí rozbor)
- [x] Conditional view (vápnění není potřeba)
- [x] Sidebar s informacemi
- [x] Doporučený termín aplikace
- [x] Responsive design
- [x] Czech localization

---

## 🏁 Status

**Phase 6.1 - Plán vápnění**: ✅ **COMPLETE**

All requirements met:
- Přehled potřeby vápnění ✅
- Doporučený typ vápence ✅
- Produkty Démon Agro ✅
- Kalkulace ✅
- Akce (košík, poptávka) ✅
- Conditional views ✅
- Responsive design ✅

---

**Implementation Date**: December 20, 2025  
**Implemented By**: AI Assistant (Claude Sonnet 4.5)  
**Phase**: 6.1 - Liming Plan  
**Status**: Production Ready ✅

**Code Statistics**:
- SQL Migration: 250+ lines
- Page Component: 450+ lines
- Product Selector: 330+ lines
- Type Definitions: 60+ lines
- Total: ~1,090 lines
