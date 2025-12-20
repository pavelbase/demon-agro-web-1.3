# Phase 6.3 - Seznam poptávek uživatele - Implementation Summary ✅

## 📦 Co bylo implementováno

Kompletní stránka se seznamem poptávek vápnění s tabulkou, status badges, detailním modalem a empty state.

## 🗂️ Vytvořené soubory

### 1. **Stránka seznamu poptávek**
```
app/portal/poptavky/
└── page.tsx                              # 95 řádků
```

**Server Component:**
- Auth check (requireAuth)
- Fetch poptávek s vnořeným dotazem na items
- Query: `liming_requests.select('*, liming_request_items(*)')`
- Order by created_at DESC
- Success message handling (po vytvoření poptávky)
- Empty state nebo tabulka

### 2. **Tabulka poptávek**
```
components/portal/
└── LimingRequestsTable.tsx               # 180 řádků
```

**Client Component:**
- Desktop tabulka (responsive)
- Mobile karty (< md breakpoint)
- 6 sloupců:
  1. Datum vytvoření (s ikonou kalendáře)
  2. Počet pozemků (z items.length)
  3. Celková výměra (total_area ha)
  4. Celkové množství (total_quantity t)
  5. Status (barevný badge)
  6. Akce (tlačítko Detail)
- Hover efekty na řádcích
- Klik na Detail → otevře modal

**Mobile verze:**
- Karty místo tabulky
- 2-column grid (počet/výměra, množství)
- Status badge nahoře
- Tlačítko "Zobrazit detail" dole

### 3. **Detail modal**
```
components/portal/
└── LimingRequestDetailModal.tsx          # 280 řádků
```

**Features:**

**A. Header:**
- Název "Detail poptávky"
- ID poptávky (zkrácené, 8 znaků)
- Status badge (barevný)
- Tlačítko zavřít (X)
- Sticky position

**B. Basic Info (3 karty):**
- Datum vytvoření (formátováno česky s časem)
- Celková výměra (zelené číslo)
- Celkové množství (hnědé číslo)

**C. Seznam pozemků a produktů:**
- Nadpis s ikonou Package
- Pro každý item:
  - Číslo + parcel_id (zkrácené)
  - Název produktu
  - Množství (t) - zelené, bold
- Šedé karty s borderem

**D. Kontaktní údaje:**
- Nadpis s ikonou User
- Grid 2 sloupce:
  - Kontaktní osoba (User icon)
  - Telefon (Phone icon, klikací tel: link)
  - Email (Mail icon, klikací mailto: link)
  - Adresa dodání (MapPin icon, multiline)

**E. Preferovaný termín:**
- Zobrazení pouze pokud delivery_date existuje
- Překlad kódů na české texty:
  - spring_2025 → "Jaro 2025 (únor-duben)"
  - autumn_2025 → "Podzim 2025 (září-říjen)"
  - asap → "Co nejdříve"
  - atd.

**F. Poznámka uživatele:**
- Zobrazení pouze pokud notes existuje
- MessageSquare icon
- Šedý box s whitespace-pre-wrap

**G. Cenová nabídka (pokud status = quoted):**
- Zelený box (bg-green-50)
- DollarSign icon (zelená)
- Nabídnutá cena (quote_amount):
  - Formátováno česky s mezerami
  - Velké číslo (3xl, bold)
  - Info: "Cena je orientační a nezahrnuje DPH"
- PDF ke stažení (pokud quote_pdf_url):
  - FileText icon
  - Link na download
  - Target="_blank", rel="noopener noreferrer"

**H. Admin poznámka:**
- Zobrazení pouze pokud admin_notes existuje
- FileText icon (modrá)
- Modrý box (bg-blue-50)
- Whitespace-pre-wrap

**I. Footer:**
- Sticky position (bottom-0)
- Šedé pozadí
- Tlačítko "Zavřít"

**Modal behavior:**
- Černý backdrop (bg-black/50)
- Click mimo → zavře
- Click na X → zavře
- Max-width: 4xl
- Max-height: 90vh, scrollable
- Centrované

### 4. **Dokumentace**
```
PHASE_6_3_REQUESTS_LIST_SUMMARY.md        # Tento soubor
```

**Celkem:** ~555 řádků nového kódu

---

## 🎯 Statusy a barvy

```typescript
const STATUS_CONFIG = {
  new: {
    label: 'Nová',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_progress: {
    label: 'Zpracovává se',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  quoted: {
    label: 'Nacenéno',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  completed: {
    label: 'Dokončeno',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  cancelled: {
    label: 'Zrušeno',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
}
```

**Badge design:**
- `inline-flex items-center`
- `px-2.5 py-0.5` (desktop), `px-3 py-1` (modal)
- `rounded-full`
- `text-xs font-medium` (desktop), `text-sm` (modal)
- `border` (stejná barva jako pozadí)

---

## 🎨 Features Detail

### Success Message
Po vytvoření poptávky (redirect z /nova):
```
URL: /portal/poptavky?success=true&id={requestId}

Zobrazí:
- Zelený box (bg-green-50)
- CheckCircle icon
- "Poptávka byla úspěšně odeslána!"
- "Budeme vás kontaktovat do 48 hodin"
- Číslo poptávky (prvních 8 znaků ID)
```

### Empty State
Pokud `requests.length === 0`:
```jsx
<Package icon (h-20, text-gray-300) />
<h2>"Zatím nemáte žádné poptávky"</h2>
<p>Vysvětlující text</p>
<Buttons>
  - "Přejít na pozemky" (outlined, primary-green)
  - "Nová poptávka" (filled, primary-green)
</Buttons>
```

### Desktop Tabulka
- Min-width: full
- Divide-y na řádcích
- Thead: bg-gray-50
- Tbody: bg-white
- Hover: bg-gray-50 transition

**Sloupce:**
1. Datum - flex items-center, Calendar icon
2. Počet - font-medium
3. Výměra - .toFixed(2) ha
4. Množství - font-medium, .toFixed(2) t
5. Status - rounded-full badge
6. Akce - text-primary-green hover:text-primary-brown

### Mobile Karty
- Padding: p-4
- Divide-y mezi kartami
- Flex justify-between pro header
- Grid 2 columns pro data
- Full-width button dole

---

## 🔧 Technické detaily

### Data Fetching (Server Component)

```typescript
const { data: requests } = await supabase
  .from('liming_requests')
  .select(`
    *,
    liming_request_items (
      id,
      parcel_id,
      product_name,
      quantity,
      unit
    )
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

**Výhody vnořeného dotazu:**
- Jeden HTTP request místo N+1
- Items jsou již v request.liming_request_items
- Type-safe díky TypeScript

### Date Formatting

```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// V modalu:
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
```

**Výstup:**
- Tabulka: "20.12.2025"
- Modal: "20.12.2025 14:35"

### State Management

```typescript
const [selectedRequest, setSelectedRequest] = useState<LimingRequest | null>(null)

// Open modal
onClick={() => setSelectedRequest(request)}

// Close modal
onClose={() => setSelectedRequest(null)}

// Conditional render
{selectedRequest && (
  <LimingRequestDetailModal
    request={selectedRequest}
    onClose={() => setSelectedRequest(null)}
  />
)}
```

---

## 📱 Responsive Design

### Breakpoints

**Desktop (>= md = 768px):**
- Tabulka viditelná (`hidden md:block`)
- 6 sloupců
- Hover efekty

**Mobile (< md):**
- Karty viditelné (`md:hidden`)
- Stack layout
- Touch-friendly buttons

### Modal

**All sizes:**
- Min-height: full
- Items-center justify-center
- Padding: p-4
- Max-width: 4xl (56rem)
- Max-height: 90vh

**Scrolling:**
- Outer div: `overflow-y-auto`
- Inner div: `overflow-y-auto` on modal
- Sticky header & footer

---

## 🔄 User Flow

### Zobrazení seznamu
```
1. User naviguje na /portal/poptavky
2. Server fetch poptávek + items
3. Pokud empty → Empty state
4. Pokud data → Tabulka/Karty
5. User vidí všechny poptávky seřazené od nejnovější
```

### Otevření detailu
```
1. User klikne "Detail" nebo kartu
2. setSelectedRequest(request)
3. Modal se otevře (fade in + scale)
4. User vidí všechny informace
5. User klikne "Zavřít" nebo mimo → onClose()
6. Modal se zavře
```

### Po vytvoření poptávky
```
1. User odešle poptávku v /nova
2. Server vytvoří request
3. Redirect → /portal/poptavky?success=true&id={requestId}
4. Success message se zobrazí (zelený box)
5. Nová poptávka je v seznamu (nahoře)
```

---

## 🎨 Design System

### Colors

**Status badges:**
- new: Modrá (blue-100/800/200)
- in_progress: Žlutá (yellow-100/800/200)
- quoted: Zelená (green-100/800/200)
- completed: Šedá (gray-100/800/200)
- cancelled: Červená (red-100/800/200)

**Empty state:**
- Icon: text-gray-300
- Text: text-gray-600
- Buttons: primary-green

**Success message:**
- Background: bg-green-50
- Border: border-green-200
- Text: text-green-900/800
- Icon: text-green-600

### Icons (Lucide React)

**Page:**
- Plus, Package, Calendar, CheckCircle

**Table:**
- Eye, Calendar, MapPin

**Modal:**
- X, Calendar, User, Phone, Mail, MapPin
- Package, MessageSquare, FileText, DollarSign

### Typography

**Headings:**
- h1: `text-3xl font-bold`
- h2: `text-2xl font-bold`
- h3: `text-lg font-semibold`

**Table:**
- Headers: `text-xs font-medium uppercase tracking-wider`
- Data: `text-sm`

**Modal:**
- Content: `text-gray-700`
- Labels: `text-sm text-gray-600`

---

## 🧪 Testing Scenarios

### Test 1: Empty State
```
1. New user with no requests
2. Navigate to /portal/poptavky
3. ✓ Empty state visible
4. ✓ Package icon displayed
5. ✓ Two buttons work
```

### Test 2: List View
```
1. User with 3 requests
2. Navigate to /portal/poptavky
3. ✓ Table shows 3 rows
4. ✓ Status badges correct colors
5. ✓ Dates formatted correctly
6. ✓ Totals calculated correctly
```

### Test 3: Detail Modal
```
1. Click "Detail" on request
2. ✓ Modal opens
3. ✓ All sections visible
4. ✓ Items list shows all products
5. ✓ Contact info displayed
6. Click outside
7. ✓ Modal closes
```

### Test 4: Status = quoted
```
1. Request with status "quoted"
2. Open detail
3. ✓ Green "Nacenéno" badge
4. ✓ Cenová nabídka section visible
5. ✓ Quote amount formatted
6. ✓ PDF link (if exists) clickable
```

### Test 5: Success Message
```
1. Create new request
2. Redirect to /portal/poptavky?success=true&id=xxx
3. ✓ Green success message
4. ✓ Request ID shown
5. ✓ New request in list (top)
```

### Test 6: Mobile Responsive
```
1. Open on mobile (< 768px)
2. ✓ Cards displayed (not table)
3. ✓ All info visible
4. ✓ "Zobrazit detail" button works
5. ✓ Modal full-screen
```

### Test 7: Admin Notes
```
1. Request with admin_notes
2. Open detail
3. ✓ Blue section visible
4. ✓ Admin notes displayed
5. ✓ Whitespace preserved
```

---

## 📊 Statistiky kódu

| Soubor | Řádků | Typ |
|--------|-------|-----|
| poptavky/page.tsx | 95 | TSX |
| LimingRequestsTable.tsx | 180 | TSX |
| LimingRequestDetailModal.tsx | 280 | TSX |
| **CELKEM** | **~555** | |

---

## 🔄 Integrace

### S Phase 6.2 (Košík & Nová poptávka)
- Redirect z /nova po úspěchu
- Success message s ID
- Nová poptávka okamžitě v seznamu

### S Database
- Query: liming_requests + nested liming_request_items
- Filter by user_id (RLS)
- Order by created_at DESC

### S Admin (budoucí)
- Admin může měnit status
- Admin může přidat quote_amount
- Admin může nahrát quote_pdf_url
- Admin může přidat admin_notes

---

## 🎯 Future Enhancements (není v této fázi)

### Phase 6.4: Filtry
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Search by ID

### Phase 6.5: Actions
- [ ] Cancel request (user, status = new)
- [ ] Download quote PDF (if exists)
- [ ] Reorder (create new request from existing)

### Phase 6.6: Admin
- [ ] Admin view all requests
- [ ] Change status
- [ ] Upload quote PDF
- [ ] Add admin notes
- [ ] Send notifications

---

## ✅ Completion Criteria

All implemented:
- [x] Stránka /portal/poptavky/page.tsx
- [x] Server Component s data fetching
- [x] Success message handling
- [x] Empty state s 2 CTA buttons
- [x] LimingRequestsTable komponenta
- [x] Desktop tabulka (6 sloupců)
- [x] Mobile karty (responsive)
- [x] Status badges (5 statusů, barevné)
- [x] LimingRequestDetailModal
- [x] Modal s backdrop
- [x] Basic info (3 karty)
- [x] Seznam items
- [x] Kontaktní údaje
- [x] Preferovaný termín
- [x] Poznámka uživatele
- [x] Cenová nabídka (if quoted)
- [x] Admin poznámka (if exists)
- [x] Sticky header & footer
- [x] Czech date formatting
- [x] Responsive design
- [x] Close on outside click

---

## 🏁 Status

**Phase 6.3 - Seznam poptávek uživatele**: ✅ **COMPLETE**

All requirements met:
- Seznam mých poptávek ✅
- Tabulka se 6 sloupci ✅
- Status badges (5 barev) ✅
- Detail poptávky (modal) ✅
- Všechny informace ✅
- Seznam pozemků ✅
- Poznámky (user + admin) ✅
- Cenová nabídka (if quoted) ✅
- Prázdný stav ✅
- Akce "Nová poptávka" ✅

---

**Implementation Date**: December 20, 2025  
**Implemented By**: AI Assistant (Claude Sonnet 4.5)  
**Phase**: 6.3 - Requests List  
**Status**: Production Ready ✅

**Code Statistics**:
- page.tsx: 95 lines
- LimingRequestsTable: 180 lines
- LimingRequestDetailModal: 280 lines
- Total: ~555 lines
