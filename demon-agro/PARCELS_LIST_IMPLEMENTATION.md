# Parcels List - Implementation Documentation

## 📋 Overview

Complete parcels management page at `/portal/pozemky` with table, filters, modals for CRUD operations, and Excel export.

## 🎯 Features

### 1. **Parcels Table**

**Columns**:
- **Kód**: Cadastral number (optional)
- **Název**: Parcel name (clickable link to detail)
- **Výměra (ha)**: Area in hectares (right-aligned, 2 decimals)
- **Půdní druh**: Soil type (L/S/T - Light/Medium/Heavy)
- **Kultura**: Culture (Orná půda / TTP)
- **pH**: Latest pH value from soil analysis
- **Stav**: Status indicator with color and reason
- **Akce**: Actions (Detail, Edit, Delete icons)

**Status Indicators**:
- 🟢 **OK** (green): No issues
- 🟡 **Warning** (yellow): Missing analysis, old analysis (>4 years), low nutrients
- 🔴 **Critical** (red): pH < 5.5

### 2. **Filters**

**Search**:
- By cadastral number or parcel name
- Real-time filtering
- Icon: Search glass

**Culture Filter**:
- Všechny kultury (all)
- Orná půda (arable land)
- TTP (permanent grassland)

**Status Filter**:
- Všechny stavy (all)
- Aktivní (active) - *currently all are active, can be extended*

**Problems Only**:
- Checkbox to show only parcels with warnings or critical status
- Helpful for quick issue identification

### 3. **Action Buttons**

**Přidat pozemek** (green):
- Opens modal to add new parcel
- Icon: Plus

**Export Excel** (blue):
- Downloads all filtered parcels to .xlsx file
- Filename: `pozemky_YYYY-MM-DD.xlsx`
- Icon: Download
- Includes: Code, Name, Area, Soil Type, Culture, pH, P, K, Mg, Status, Notes

### 4. **Pagination**

- 20 parcels per page
- Shows: "Zobrazeno 1 - 20 z 45"
- Previous/Next buttons
- Current page indicator
- Only shown if more than 20 parcels

### 5. **Empty State**

When no parcels exist:
- Icon: Alert triangle (gray)
- Heading: "Zatím nemáte žádné pozemky"
- Description: "Přidejte první pozemek nebo nahrajte rozbory půdy."
- Two CTA buttons:
  - "Přidat pozemek" → Opens modal
  - "Nahrát rozbory" → Goes to `/portal/upload`

## 🏗️ Architecture

### Server Component (page.tsx)
```typescript
export default async function PozemkyPage() {
  // 1. Require authentication
  const user = await requireAuth()
  
  // 2. Fetch parcels with latest analysis (nested query)
  const parcels = await supabase
    .from('parcels')
    .select('*, soil_analyses(*)')
    .eq('user_id', user.id)
  
  // 3. Process data to determine status
  const parcelsWithStatus = parcels.map(processParcelStatus)
  
  // 4. Pass to client component
  return <ParcelsTable parcels={parcelsWithStatus} />
}
```

### Client Component (ParcelsTable.tsx)
```typescript
export function ParcelsTable({ parcels }) {
  // State: filters, pagination, modals
  // Computed: filtered and paginated parcels
  // Handlers: CRUD operations, export
  // Render: table, filters, modals
}
```

### Server Actions (parcels.ts)
```typescript
export async function createParcel(data) { ... }
export async function updateParcel(id, data) { ... }
export async function deleteParcel(id) { ... }
```

## 📊 Status Determination Logic

```typescript
function determineStatus(parcel) {
  if (!parcel.latest_analysis) {
    return { status: 'warning', reason: 'Chybí rozbor' }
  }
  
  const analysisAge = calculateAge(parcel.latest_analysis.analysis_date)
  
  // Critical: Low pH
  if (parcel.latest_analysis.ph < 5.5) {
    return { 
      status: 'critical', 
      reason: `pH ${parcel.latest_analysis.ph.toFixed(1)}` 
    }
  }
  
  // Warning: Old analysis
  if (analysisAge > 4) {
    return { 
      status: 'warning', 
      reason: `Rozbor ${analysisAge} let` 
    }
  }
  
  // Warning: Low nutrients
  if (hasLowNutrients(parcel.latest_analysis)) {
    return { 
      status: 'warning', 
      reason: 'Nízké živiny' 
    }
  }
  
  return { status: 'ok', reason: 'OK' }
}
```

## 💾 Database Operations

### Create Parcel
```sql
INSERT INTO parcels (user_id, name, area, cadastral_number, soil_type, culture, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
```

### Update Parcel
```sql
UPDATE parcels
SET name = $2, area = $3, cadastral_number = $4, soil_type = $5, culture = $6, notes = $7, updated_at = now()
WHERE id = $1 AND user_id = $8
RETURNING *;
```

### Delete Parcel
```sql
DELETE FROM parcels
WHERE id = $1 AND user_id = $2;
```

**Note**: Currently hard delete. Can be changed to soft delete (archived flag) if needed.

### Audit Logging
All CRUD operations are logged to `audit_logs` table:
```sql
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
VALUES (...);
```

## 🎨 Design System

### Colors
- **Primary Green** (#4A7C59): Add button, action icons, focus states
- **Primary Brown** (#5C4033): Hover states
- **Blue** (#3B82F6): Export button, detail icon
- **Red** (#EF4444): Delete button, critical status
- **Yellow** (#EAB308): Warning status
- **Green** (#10B981): OK status

### Icons (Lucide React)
- `Plus` - Add parcel
- `Search` - Search filter
- `Filter` - Filter dropdown
- `Download` - Export Excel
- `Upload` - Import from LPIS (future)
- `Eye` - View detail
- `Edit` - Edit parcel
- `Trash2` - Delete parcel
- `X` - Close modal
- `ChevronLeft`, `ChevronRight` - Pagination
- `AlertTriangle` - Empty state, delete confirmation

### Typography
- **Headings**: Bold, dark gray
- **Table Headers**: Uppercase, small, gray
- **Table Data**: Regular, dark gray
- **Links**: Primary green, hover brown

## 📋 Forms & Validation

### Parcel Schema (Zod)
```typescript
export const parcelSchema = z.object({
  name: z.string().min(1, 'Název pozemku je povinný'),
  area: z.number().positive('Výměra musí být kladné číslo'),
  cadastralNumber: z.string().optional(),
  soilType: z.enum(['L', 'S', 'T'], {
    required_error: 'Vyberte typ půdy',
  }),
  culture: z.enum(['orna', 'ttp'], {
    required_error: 'Vyberte kulturu',
  }),
  notes: z.string().optional(),
})
```

### Add Parcel Modal
```
┌─────────────────────────────────┐
│  Přidat pozemek            [X]  │
├─────────────────────────────────┤
│  Název pozemku *                │
│  [________________]             │
│                                 │
│  Výměra (ha) *                  │
│  [________________]             │
│                                 │
│  Kód / KÚ                       │
│  [________________]             │
│                                 │
│  Půdní druh *                   │
│  [Lehká ▼]                      │
│                                 │
│  Kultura *                      │
│  [Orná půda ▼]                  │
│                                 │
│  Poznámky                       │
│  [________________]             │
│  [________________]             │
│  [________________]             │
│                                 │
│         [Zrušit] [Přidat]       │
└─────────────────────────────────┘
```

### Edit Parcel Modal
Same fields as Add Modal, pre-filled with existing data.

### Delete Confirmation Modal
```
┌─────────────────────────────────┐
│  ⚠  Smazat pozemek              │
├─────────────────────────────────┤
│  Opravdu chcete smazat pozemek  │
│  "Dolní pole"? Tato akce je     │
│  nevratná a smaže také všechny  │
│  související rozbory a data.    │
│                                 │
│         [Zrušit] [Smazat]       │
└─────────────────────────────────┘
```

## 📦 Excel Export

### Implementation
```typescript
function handleExportExcel() {
  const data = filteredParcels.map(p => ({
    'Kód': p.cadastral_number || '-',
    'Název': p.name,
    'Výměra (ha)': p.area,
    'Půdní druh': SOIL_TYPE_LABELS[p.soil_type],
    'Kultura': p.culture === 'orna' ? 'Orná půda' : 'TTP',
    'pH': p.latest_analysis?.ph?.toFixed(1) || '-',
    'P': p.latest_analysis?.p || '-',
    'K': p.latest_analysis?.k || '-',
    'Mg': p.latest_analysis?.mg || '-',
    'Stav': p.status_reason || 'OK',
    'Poznámky': p.notes || '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pozemky')
  
  // Set column widths
  ws['!cols'] = [...]
  
  XLSX.writeFile(wb, `pozemky_${date}.xlsx`)
}
```

### Column Widths
- Kód: 15 characters
- Název: 25 characters
- Výměra: 12 characters
- Půdní druh: 15 characters
- Kultura: 12 characters
- pH/P/K/Mg: 8 characters each
- Stav: 20 characters
- Poznámky: 30 characters

## 📱 Responsive Design

### Desktop (> 1024px)
- Full table width
- All columns visible
- Filters in one row

### Tablet (768px - 1024px)
- Scrollable table (horizontal)
- Filters stack (2x2 grid)
- Modal full width

### Mobile (< 768px)
- Scrollable table
- Filters stack (1 column)
- Modal full screen
- Buttons stack vertically

## 🔐 Security

### Authentication
- `requireAuth()` ensures user is logged in
- Redirects to login if not authenticated

### Authorization
- All queries filtered by `user_id`
- Update/Delete check ownership before executing
- Users cannot access other users' parcels

### Input Validation
- Zod schema validation on client and server
- Server Actions validate user_id
- SQL injection protection via Supabase

## 🧪 Testing Scenarios

### Test 1: Empty State
1. Login as new user (no parcels)
2. ✅ Empty state shows
3. ✅ "Přidat pozemek" button visible
4. ✅ "Nahrát rozbory" button visible

### Test 2: Add Parcel
1. Click "Přidat pozemek"
2. ✅ Modal opens
3. Fill form (name required, area required)
4. Click "Přidat"
5. ✅ Parcel added to table
6. ✅ Modal closes
7. ✅ Success (no error)

### Test 3: Edit Parcel
1. Click edit icon on parcel
2. ✅ Modal opens with pre-filled data
3. Change name
4. Click "Uložit změny"
5. ✅ Parcel updated in table
6. ✅ Modal closes

### Test 4: Delete Parcel
1. Click delete icon on parcel
2. ✅ Confirmation modal opens
3. Click "Smazat"
4. ✅ Parcel removed from table
5. ✅ Modal closes

### Test 5: Filters
1. Add 5+ parcels (mixed cultures, statuses)
2. Search by name
   - ✅ Only matching parcels show
3. Filter by culture (Orná)
   - ✅ Only arable land parcels show
4. Check "Pouze problémové"
   - ✅ Only parcels with warnings/critical show
5. Clear filters
   - ✅ All parcels show again

### Test 6: Pagination
1. Add 25 parcels
2. ✅ Page shows "1 - 20 z 25"
3. ✅ Next button enabled
4. Click next
5. ✅ Shows "21 - 25 z 25"
6. ✅ Previous button enabled
7. Click previous
8. ✅ Back to first page

### Test 7: Export Excel
1. Click "Export Excel"
2. ✅ File downloads
3. Open file
4. ✅ All filtered parcels included
5. ✅ Columns correctly formatted
6. ✅ Czech headers

### Test 8: Status Indicators
1. Create parcel with pH 5.2
2. ✅ Status shows red "pH 5.2"
3. Create parcel with 5-year-old analysis
4. ✅ Status shows yellow "Rozbor 5 let"
5. Create parcel with no analysis
6. ✅ Status shows yellow "Chybí rozbor"

### Test 9: Mobile Responsive
1. Open on mobile device
2. ✅ Table scrollable
3. ✅ Filters stack
4. ✅ Modals full screen
5. ✅ Buttons tappable

## 🐛 Troubleshooting

### Issue: Parcels not showing
**Cause**: Not authenticated or wrong user_id  
**Fix**: Check `requireAuth()` is working

### Issue: Status always "Chybí rozbor"
**Cause**: Nested query not fetching soil_analyses  
**Fix**: Verify Supabase query includes soil_analyses

### Issue: Export button does nothing
**Cause**: xlsx library not installed  
**Fix**: `npm install xlsx`

### Issue: Modal won't close
**Cause**: State not updating  
**Fix**: Check `setShowAddModal(false)` is called

### Issue: Filters not working
**Cause**: `useMemo` dependencies missing  
**Fix**: Verify all filter states in dependency array

### Issue: Pagination showing wrong count
**Cause**: `filteredParcels` vs `parcels`  
**Fix**: Use `filteredParcels.length` for pagination

## 🎯 Future Enhancements

### Phase 4 (Optional)
- [ ] Bulk operations (select multiple, delete/export)
- [ ] Import from LPIS (CSV/XLS upload)
- [ ] Advanced sorting (by name, area, pH, etc.)
- [ ] Column visibility toggle
- [ ] Save filter presets
- [ ] Map view (integrate with GPS)
- [ ] Soft delete (archived flag instead of hard delete)
- [ ] Restore deleted parcels
- [ ] Parcel grouping/tagging
- [ ] Print view
- [ ] Copy parcel to create similar

### Phase 5 (Optional)
- [ ] Drag & drop reordering
- [ ] Inline editing (click to edit)
- [ ] Keyboard shortcuts
- [ ] Advanced search (by pH range, area range, etc.)
- [ ] Batch import from multiple sources
- [ ] Integration with cadastral office API
- [ ] Automated status notifications

## 📊 Performance Considerations

### Current Implementation
- Fetches all parcels at once
- Client-side filtering and pagination
- Good for < 100 parcels per user

### Optimization for Large Datasets (100+ parcels)
- Server-side pagination
- Search as separate query
- Consider infinite scroll
- Add indexes on commonly filtered columns

### Database Indexes
```sql
CREATE INDEX idx_parcels_user_id ON parcels(user_id);
CREATE INDEX idx_parcels_created_at ON parcels(created_at DESC);
CREATE INDEX idx_soil_analyses_parcel_id ON soil_analyses(parcel_id);
CREATE INDEX idx_soil_analyses_date ON soil_analyses(analysis_date DESC);
```

## ✅ Completion Criteria

All implemented:
- [x] Table with 8 columns
- [x] 4 filters (search, culture, status, problems)
- [x] Add parcel modal with validation
- [x] Edit parcel modal
- [x] Delete confirmation modal
- [x] Excel export
- [x] Pagination (20 per page)
- [x] Empty state
- [x] Status indicators (ok/warning/critical)
- [x] Server Component + Client Component
- [x] Server Actions for CRUD
- [x] Responsive design
- [x] Audit logging

## 🏁 Status

**Phase 3.1 - Parcels List**: ✅ **COMPLETE**

All requirements met:
- Tabulka pozemků ✅
- Filtry ✅
- Tlačítka (přidat, export) ✅
- Prázdný stav ✅
- Stránkování ✅
- Modal přidat ✅
- Modal upravit ✅
- Modal smazat ✅
- Excel export ✅
- React Hook Form + Zod ✅

---

**Implementation Date**: December 19, 2025  
**Phase**: 3.1 - Parcels List  
**Status**: Ready for Testing ✅

**Code Statistics**:
- ParcelsTable.tsx: 832 lines
- parcels.ts (Server Actions): 205 lines
- page.tsx (Server Component): 85 lines
- Total: 1,122 lines of code
