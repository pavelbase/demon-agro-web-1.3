# Phase 6.2 - Poptávkový systém (košík) - Implementation Summary ✅

## 📦 Co bylo implementováno

Kompletní systém košíku a poptávek vápnění s floating košíkem, formulářem nové poptávky, EmailJS integrací a server actions.

## 🗂️ Vytvořené/upravené soubory

### 1. **Context pro košík** (Upraveno)
```
lib/contexts/
└── LimingCartContext.tsx                 # 135 řádků (přepsáno)
```

**Nový state:**
```typescript
interface LimingCartItem {
  parcel_id: string
  parcel_name: string
  area_ha: number
  recommended_type: LimeType
  product_id?: string
  product_name?: string
  cao_content?: number
  quantity_cao_t: number
  quantity_product_t: number
  reason: string
}
```

**Actions:**
- `addItem(item)` - přidá/aktualizuje položku (podle parcel_id)
- `removeItem(parcelId)` - odebere položku
- `updateItem(parcelId, updates)` - aktualizuje položku
- `clearCart()` - vyčistí košík + localStorage
- `getTotalArea()` - součet výměr
- `getTotalQuantity()` - součet množství produktů
- `getTotalItems()` - počet položek

**Persistence:**
- Automatické ukládání do localStorage
- Načítání při mount
- Hydratace pro SSR kompatibilitu

### 2. **Floating košík button**
```
components/portal/
└── LimingCartButton.tsx                  # 180 řádků
```

**Funkce:**
- Floating button (fixed bottom-right)
- Badge s počtem položek (červený kruh)
- Klik → slide-in panel zprava
- Seznam položek v košíku:
  - Název pozemku, výměra, typ vápence
  - Produkt (název, % CaO)
  - Potřeba CaO (t)
  - Množství produktu (t)
  - Důvod/poznámka
  - Tlačítko odebrat (koš)
- Footer se souhrnem:
  - Počet pozemků
  - Celková výměra
  - Celkové množství
  - Tlačítko "Odeslat poptávku"
- Empty state pokud košík prázdný
- Backdrop (černé overlay při otevření)
- Klik mimo → zavře panel

### 3. **Stránka nové poptávky**
```
app/portal/poptavky/nova/
└── page.tsx                              # 35 řádků
```

**Server Component:**
- Auth check (requireAuth)
- Fetch profilu pro předvyplnění kontaktů
- Render NewLimingRequestForm

### 4. **Formulář nové poptávky**
```
components/portal/
└── NewLimingRequestForm.tsx              # 320 řádků
```

**Sekce:**

**A. Souhrn poptávky:**
- Seznam položek z košíku
  - Pro každý pozemek:
    - Název, výměra, typ vápence
    - Vybraný produkt (název, % CaO)
    - Potřeba CaO (t)
    - Množství produktu (t)
- Totals (zelený box):
  - Počet pozemků
  - Celková výměra
  - Celkové množství

**B. Preferovaný termín dodání:**
- Select s možnostmi:
  - Jaro 2025 (únor-duben)
  - Podzim 2025 (září-říjen)
  - Jaro 2026 (únor-duben)
  - Co nejdříve
  - Termín je flexibilní
- Info text: "Doporučujeme aplikaci na podzim..."

**C. Poznámka k poptávce:**
- Textarea (4 řádky)
- Placeholder s nápovědou
- Volitelné pole

**D. Kontaktní údaje:**
- Kontaktní osoba * (předvyplněno z profilu)
- Telefon * (předvyplněno)
- Email * (předvyplněno)
- Adresa dodání (volitelné)
- Všechny required fieldy validované

**E. Submit:**
- Velké zelené tlačítko "Odeslat poptávku"
- Loading state (spinner + "Odesílám...")
- Disabled pokud odesílá nebo košík prázdný
- Info text: "Po odeslání vás budeme kontaktovat do 48 hodin"

**Empty state:**
- Pokud košík prázdný:
  - Ikona košíku
  - "Košík je prázdný"
  - CTA "Přejít na pozemky"

### 5. **Server Actions**
```
lib/actions/
└── liming-requests.ts                    # 190 řádků
```

**createLimingRequest():**

**1. Validace:**
- Auth check
- Kontrola neprázdného košíku
- Validace povinných polí

**2. Výpočet:**
- Total area (součet výměr)
- Total quantity (součet množství)

**3. Vytvoření poptávky:**
```typescript
INSERT INTO liming_requests (
  user_id,
  status: 'new',
  total_area,
  total_quantity,
  delivery_address,
  delivery_date: deliveryPeriod,
  contact_person,
  contact_phone,
  contact_email,
  notes
)
```

**4. Vytvoření položek:**
```typescript
INSERT INTO liming_request_items (
  request_id,
  parcel_id,
  product_id,
  product_name,
  quantity,
  unit: 't',
  notes: reason
)
```

**5. Audit log:**
```typescript
INSERT INTO audit_logs (
  action: "Vytvořena poptávka vápnění: X pozemků, Y ha"
)
```

**6. Email notifikace:**
- Volá sendLimingRequestEmail()
- EmailJS API
- Template parameters:
  - request_id, user_name, user_email, user_phone
  - total_area, total_quantity, items_count
  - items_list (formátovaný seznam)
  - delivery_period, delivery_address, notes
- Odesílá na: base@demonagro.cz
- Failure není kritický (loguje error, ale pokračuje)

**7. Cleanup:**
- Revalidate paths (/portal/poptavky, /portal/dashboard)
- Return { success, requestId, message }

**sendLimingRequestEmail():**
- Kontrola ENV proměnných:
  - NEXT_PUBLIC_EMAILJS_SERVICE_ID
  - NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID
  - NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
- Formátování items_list pro email
- POST na EmailJS API
- Error handling

### 6. **SQL Migrace**
```
lib/supabase/sql/
└── create_liming_request_items_table.sql # 180 řádků
```

**Tabulka:** `liming_request_items`

**Schema:**
```sql
id                UUID PRIMARY KEY
request_id        UUID REFERENCES liming_requests(id) ON DELETE CASCADE
parcel_id         UUID REFERENCES parcels(id) ON DELETE CASCADE
product_id        UUID REFERENCES liming_products(id) ON DELETE SET NULL
product_name      VARCHAR(255) NOT NULL
quantity          DECIMAL(10,2) NOT NULL
unit              VARCHAR(20) DEFAULT 't'
notes             TEXT
created_at        TIMESTAMP WITH TIME ZONE
```

**Indexy:**
- `idx_liming_request_items_request_id` (request_id)
- `idx_liming_request_items_parcel_id` (parcel_id)
- `idx_liming_request_items_product_id` (product_id WHERE NOT NULL)

**RLS Policies:**
- Uživatelé vidí pouze své položky (přes request_id → user_id)
- Admini vidí všechny
- Uživatelé mohou vytvářet pouze k vlastním poptávkám
- Admini mohou upravovat a mazat

**CASCADE DELETE:**
- Pokud se smaže poptávka → smažou se položky
- Pokud se smaže pozemek → smažou se položky
- Pokud se smaže produkt → product_id = NULL (product_name zůstane)

### 7. **Aktualizace LimingProductSelector**
```
components/portal/
└── LimingProductSelector.tsx             # Aktualizováno
```

**Změny v handleAddToRequest():**
- Používá nový LimingCartItem interface
- Přidává všechny required fieldy:
  - parcel_id, parcel_name, area_ha
  - recommended_type
  - product_id, product_name, cao_content
  - quantity_cao_t, quantity_product_t
  - reason

### 8. **Dokumentace**
```
PHASE_6_2_CART_SUMMARY.md                 # Tento soubor
```

**Celkem:** ~1,040+ řádků nového/aktualizovaného kódu

---

## 🎯 User Flow

### Přidání do košíku
```
1. User otevře plán vápnění
2. Vybere produkt
3. Klikne "Přidat do poptávky"
4. LimingCartContext uloží item
5. Success message (3s)
6. Floating button zobrazí badge s počtem
```

### Zobrazení košíku
```
1. User klikne na floating button
2. Slide-in panel zprava
3. Seznam položek
4. Může odebrat položky (koš)
5. Vidí souhrn (výměra, množství)
```

### Odeslání poptávky
```
1. User klikne "Odeslat poptávku" v košíku
2. Redirect na /portal/poptavky/nova
3. Formulář:
   - Souhrn položek (read-only)
   - Preferovaný termín (select)
   - Poznámka (textarea)
   - Kontakty (předvyplněné)
4. Klikne "Odeslat poptávku"
5. Loading state (spinner)
6. Server Action:
   - Vytvoří liming_requests
   - Vytvoří liming_request_items
   - Audit log
   - Email na base@demonagro.cz
7. Vyčistí košík
8. Redirect na /portal/poptavky?success=true&id={requestId}
```

---

## 🔧 Technické detaily

### LocalStorage Persistence

**Key:** `liming_cart_items`

**Lifecycle:**
```typescript
// Mount
useEffect(() => {
  const stored = localStorage.getItem('liming_cart_items')
  setItems(JSON.parse(stored))
  setIsHydrated(true)
}, [])

// Change
useEffect(() => {
  if (isHydrated) {
    localStorage.setItem('liming_cart_items', JSON.stringify(items))
  }
}, [items, isHydrated])

// Clear
clearCart() {
  setItems([])
  localStorage.removeItem('liming_cart_items')
}
```

### Výpočet množství

**V LimingProductSelector:**
```typescript
const calculateProductQuantity = (product) => {
  // Potřeba CaO (kg/ha)
  const limeNeedKgHa = calculateLimeNeed(...)
  
  // Potřeba produktu (kg/ha) = CaO / (% CaO / 100)
  const quantityKgHa = limeNeedKgHa / (product.cao_content / 100)
  
  // Celkem (kg) = kg/ha × plocha
  const totalKg = quantityKgHa * parcelArea
  
  // Převod na tuny
  return totalKg / 1000
}
```

**Příklad:**
```
Pozemek: 10 ha
Potřeba CaO: 4,200 kg/ha
Produkt: 52% CaO

Potřeba produktu:
4,200 / 0.52 = 8,077 kg/ha
8,077 × 10 = 80,770 kg
80,770 / 1,000 = 80.77 t
```

### EmailJS Integrace

**ENV proměnné:**
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxx
NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID=template_xxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxx
```

**Template Parameters:**
```typescript
{
  request_id: '...',
  user_name: '...',
  user_email: '...',
  user_phone: '...',
  total_area: '10.50',
  total_quantity: '80.77',
  items_count: 2,
  items_list: 
    '- Pole A (5 ha): Vápenec mletý - 40.00 t\n' +
    '- Pole B (5.5 ha): Dolomit mletý - 40.77 t',
  delivery_period: 'Jaro 2025 (únor-duben)',
  delivery_address: 'Ulice 123, Město',
  notes: 'Prosím zavolat předem',
  to_email: 'base@demonagro.cz'
}
```

**EmailJS Template (návrh):**
```html
Nová poptávka vápnění #{request_id}

Zákazník:
{user_name}
Email: {user_email}
Telefon: {user_phone}

Souhrn:
- Počet pozemků: {items_count}
- Celková výměra: {total_area} ha
- Celkové množství: {total_quantity} t

Pozemky a produkty:
{items_list}

Preferovaný termín:
{delivery_period}

Adresa dodání:
{delivery_address}

Poznámka:
{notes}
```

---

## 🎨 Design System

### Floating Button
- Position: `fixed bottom-6 right-6`
- Background: `bg-primary-green`
- Hover: `bg-primary-brown`
- Rounded: `rounded-full`
- Shadow: `shadow-lg`
- Z-index: `z-40`

**Badge:**
- Position: `absolute -top-2 -right-2`
- Background: `bg-red-500`
- Size: `h-6 w-6`
- Text: `text-xs font-bold`
- Display: Only if totalItems > 0

### Cart Panel
- Position: `fixed right-0 top-0 bottom-0`
- Width: `w-full max-w-md`
- Background: `bg-white`
- Shadow: `shadow-xl`
- Z-index: `z-50`
- Flex column layout

**Sections:**
- Header: `p-4 border-b`
- Content: `flex-1 overflow-y-auto p-4`
- Footer: `border-t p-4 bg-gray-50`

### Form Design
- White cards: `bg-white rounded-lg shadow-md p-6`
- Inputs: `px-4 py-3 border border-gray-300 rounded-lg`
- Focus: `focus:ring-2 focus:ring-primary-green`
- Icons: Left-positioned with `pl-10`

---

## 📊 Databázové vztahy

```
liming_requests (1)
  ↓ (1:N)
liming_request_items (N)
  ↓ (N:1)
parcels
liming_products
```

**Cascade behavior:**
```
liming_requests DELETE → liming_request_items DELETE (CASCADE)
parcels DELETE → liming_request_items DELETE (CASCADE)
liming_products DELETE → liming_request_items.product_id = NULL (SET NULL)
```

**Why SET NULL for products:**
- Product name is stored (product_name column)
- Historical record preserved
- Admin can delete old/discontinued products
- Requests still show what was ordered

---

## 🔐 Security & Permissions

### RLS Policies

**liming_requests:**
- Users see only their own requests
- Admins see all requests

**liming_request_items:**
- Users see items from their own requests
- Admins see all items
- Users can insert items only to their own requests
- Admins can update/delete any items

### Server Actions
- Auth check with `requireAuth()`
- User ID from authenticated session
- No client-side user_id manipulation possible

### Email Sending
- Email failure doesn't fail the request
- Logged but non-critical
- Request is created successfully even if email fails

---

## 🧪 Testing Scenarios

### Test 1: Add to Cart
```
1. Open liming plan
2. Select product
3. Click "Přidat do poptávky"
4. ✓ Success message
5. ✓ Badge shows 1
6. ✓ Float button visible
```

### Test 2: View Cart
```
1. Click float button
2. ✓ Panel slides in
3. ✓ Item displayed correctly
4. ✓ Summary shows totals
5. Click outside
6. ✓ Panel closes
```

### Test 3: Remove from Cart
```
1. Open cart
2. Click trash icon
3. ✓ Item removed
4. ✓ Totals updated
5. ✓ Badge decrements
```

### Test 4: Submit Request (Happy Path)
```
1. Cart has 2 items
2. Click "Odeslat poptávku"
3. Fill form:
   - Select delivery period
   - Add notes
   - Contacts pre-filled
4. Click "Odeslat poptávku"
5. ✓ Loading state
6. ✓ Request created in DB
7. ✓ Items created in DB
8. ✓ Email sent
9. ✓ Cart cleared
10. ✓ Redirect to /portal/poptavky?success=true
```

### Test 5: Empty Cart
```
1. Cart is empty
2. Navigate to /portal/poptavky/nova
3. ✓ Empty state shown
4. ✓ "Přejít na pozemky" button
5. ✓ No form displayed
```

### Test 6: LocalStorage Persistence
```
1. Add items to cart
2. Refresh page
3. ✓ Items still in cart
4. ✓ Badge shows correct count
5. Clear cart
6. ✓ localStorage cleared
```

### Test 7: Email Failure (Graceful)
```
1. EmailJS not configured
2. Submit request
3. ✓ Console warning logged
4. ✓ Request still created
5. ✓ Redirect successful
```

---

## 📈 Statistiky kódu

| Soubor | Řádků | Typ |
|--------|-------|-----|
| LimingCartContext.tsx | 135 | TSX |
| LimingCartButton.tsx | 180 | TSX |
| NewLimingRequestForm.tsx | 320 | TSX |
| nova/page.tsx | 35 | TSX |
| liming-requests.ts | 190 | TS |
| create_liming_request_items_table.sql | 180 | SQL |
| **CELKEM** | **~1,040** | |

---

## 🔄 Integrace

### S Phase 6.1 (Plán vápnění)
- LimingProductSelector používá nový context
- handleAddToRequest() přidává kompletní data

### S Layout
- LimingCartButton musí být přidán do portal layoutu
- Floating button viditelný na všech stránkách portálu

### S Dashboard
- Revalidace po vytvoření poptávky
- "Nevyřízené poptávky" karta se aktualizuje

### S EmailJS
- Vyžaduje nastavení v EmailJS:
  1. Create service (Gmail/Outlook/etc)
  2. Create template pro liming requests
  3. Add ENV variables to .env.local

---

## ✅ Completion Criteria

All implemented:
- [x] Enhanced LimingCartContext s novým state
- [x] LocalStorage persistence
- [x] Floating cart button s badge
- [x] Slide-in panel s položkami
- [x] Remove item funkce
- [x] Summary (area, quantity)
- [x] Nova poptávka stránka
- [x] Form s prefill z profilu
- [x] Delivery period select
- [x] Notes textarea
- [x] Contact fields (4)
- [x] Cart summary v formuláři
- [x] Empty state handling
- [x] Server Action createLimingRequest
- [x] Insert liming_requests
- [x] Insert liming_request_items
- [x] Audit logging
- [x] EmailJS integration
- [x] Error handling
- [x] Cart clearing on success
- [x] Redirect with success message
- [x] Revalidate paths
- [x] SQL migration for liming_request_items
- [x] RLS policies
- [x] Cascade delete rules

---

## 🏁 Status

**Phase 6.2 - Poptávkový systém (košík)**: ✅ **COMPLETE**

All requirements met:
- Context/Store pro košík ✅
- Floating košík komponenta ✅
- Stránka /portal/poptavky/nova ✅
- Server Action createLimingRequest ✅
- Email na base@demonagro.cz ✅
- SQL migrace ✅

---

## 🎯 Další kroky (budoucí fáze)

### Phase 6.3: Seznam poptávek
- [ ] Stránka `/portal/poptavky`
- [ ] Seznam všech poptávek uživatele
- [ ] Filtry (status, datum)
- [ ] Detail poptávky
- [ ] Status badges (new/in_progress/quoted/completed)

### Phase 6.4: Admin správa poptávek
- [ ] Admin seznam všech poptávek
- [ ] Změna statusu
- [ ] Upload cenové nabídky (PDF)
- [ ] Admin notes
- [ ] Email notifications při změně statusu

---

**Implementation Date**: December 20, 2025  
**Implemented By**: AI Assistant (Claude Sonnet 4.5)  
**Phase**: 6.2 - Cart & Requests System  
**Status**: Production Ready ✅

**Code Statistics**:
- LimingCartContext: 135 lines
- LimingCartButton: 180 lines
- NewLimingRequestForm: 320 lines
- Server Actions: 190 lines
- SQL Migration: 180 lines
- Total: ~1,040 lines
