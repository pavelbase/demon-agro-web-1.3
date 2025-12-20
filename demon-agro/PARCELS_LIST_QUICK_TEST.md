# Parcels List - Quick Test Guide ⚡

Quick 5-minute test guide for parcels list page.

## Prerequisites

1. **Server running**: `npm run dev`
2. **User authenticated**
3. **Database has parcels table**

## Quick Tests

### ✅ Test 1: Empty State (30 sec)

**Setup**: New user with no parcels

1. Login and go to `/portal/pozemky`
2. ✅ Should see empty state
3. ✅ Icon: Alert triangle (gray)
4. ✅ Text: "Zatím nemáte žádné pozemky"
5. ✅ Two buttons: "Přidat pozemek" and "Nahrát rozbory"

### ✅ Test 2: Add Parcel (1 min)

1. Click "Přidat pozemek"
2. ✅ Modal opens
3. Fill form:
   - Název: "Dolní pole"
   - Výměra: 15.50
   - Kód: "123-456/1"
   - Půdní druh: "Střední"
   - Kultura: "Orná půda"
4. Click "Přidat pozemek"
5. ✅ Modal closes
6. ✅ Parcel appears in table
7. ✅ Status shows "Chybí rozbor" (yellow)

### ✅ Test 3: Table Display (30 sec)

After adding 1+ parcels:

**Header:**
- ✅ "Pozemky" heading
- ✅ Count: "Celkem X pozemků, XX.XX ha"
- ✅ "Přidat pozemek" button (green)
- ✅ "Export Excel" button (blue)

**Table:**
- ✅ 8 columns visible
- ✅ Parcel name is clickable link
- ✅ Area right-aligned with 2 decimals
- ✅ Status badge colored (green/yellow/red)
- ✅ 3 action icons (Eye, Edit, Trash)

### ✅ Test 4: Edit Parcel (1 min)

1. Click edit icon (pencil) on parcel
2. ✅ Modal opens with pre-filled data
3. Change name to "Horní pole"
4. Change area to 20.00
5. Click "Uložit změny"
6. ✅ Modal closes
7. ✅ Changes reflected in table
8. ✅ Name updated
9. ✅ Area updated

### ✅ Test 5: Delete Parcel (1 min)

1. Click delete icon (trash) on parcel
2. ✅ Confirmation modal opens
3. ✅ Shows parcel name in warning
4. ✅ Text: "Tato akce je nevratná..."
5. Click "Zrušit"
6. ✅ Modal closes, parcel still there
7. Click delete again
8. Click "Smazat"
9. ✅ Modal closes
10. ✅ Parcel removed from table

### ✅ Test 6: Filters (1 min)

**Setup**: Add 5+ parcels with mixed data

**Search:**
1. Type parcel name in search box
2. ✅ Table filters in real-time
3. ✅ Only matching parcels show
4. Clear search
5. ✅ All parcels show again

**Culture Filter:**
1. Select "Orná půda"
2. ✅ Only arable land parcels show
3. Select "TTP"
4. ✅ Only grassland parcels show
5. Select "Všechny kultury"
6. ✅ All show again

**Problems Only:**
1. Check "Pouze problémové"
2. ✅ Only parcels with warnings/critical show
3. Uncheck
4. ✅ All show again

### ✅ Test 7: Pagination (1 min)

**Setup**: Add 25+ parcels

1. ✅ Shows "Zobrazeno 1 - 20 z 25"
2. ✅ Pagination controls visible
3. Click "Next" (right arrow)
4. ✅ Shows "Zobrazeno 21 - 25 z 25"
5. ✅ Shows remaining parcels
6. Click "Previous" (left arrow)
7. ✅ Back to first page

### ✅ Test 8: Export Excel (30 sec)

1. Click "Export Excel" button
2. ✅ File downloads
3. ✅ Filename: `pozemky_YYYY-MM-DD.xlsx`
4. Open file in Excel/LibreOffice
5. ✅ All parcels included
6. ✅ Headers in Czech
7. ✅ Data formatted correctly
8. ✅ Columns: Kód, Název, Výměra, Půdní druh, Kultura, pH, P, K, Mg, Stav, Poznámky

### ✅ Test 9: Status Indicators (1 min)

**Critical (Red):**
1. Create parcel with soil analysis pH 5.2:
```sql
INSERT INTO soil_analyses (parcel_id, analysis_date, ph)
VALUES ('[parcel-id]', '2024-06-15', 5.2);
```
2. Reload page
3. ✅ Status badge is red
4. ✅ Shows "pH 5.2"

**Warning (Yellow - Old):**
1. Update analysis date to 5 years ago:
```sql
UPDATE soil_analyses 
SET analysis_date = '2019-01-01' 
WHERE parcel_id = '[parcel-id]';
```
2. Reload page
3. ✅ Status badge is yellow
4. ✅ Shows "Rozbor 5 let"

**Warning (Yellow - No Analysis):**
1. Parcel without any analysis
2. ✅ Status badge is yellow
3. ✅ Shows "Chybí rozbor"

### ✅ Test 10: Mobile Responsive (1 min)

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro

**Expected:**
- ✅ Table scrolls horizontally
- ✅ Filters stack vertically
- ✅ Buttons stack on mobile
- ✅ Modal is full screen
- ✅ Form fields full width
- ✅ Text readable
- ✅ Buttons tappable

## Visual Checklist

### Header
- [ ] "Pozemky" heading (bold, large)
- [ ] Count text (gray)
- [ ] "Přidat pozemek" button (green, with + icon)
- [ ] "Export Excel" button (blue, with download icon)

### Filters
- [ ] Search input (with magnifying glass icon)
- [ ] Culture dropdown
- [ ] Status dropdown
- [ ] "Pouze problémové" checkbox

### Table
- [ ] 8 columns
- [ ] Header row (gray background)
- [ ] Alternating row hover (light gray)
- [ ] Status badges colored
- [ ] Action icons (3)
- [ ] Parcel name links (green, clickable)

### Pagination (if > 20 parcels)
- [ ] "Zobrazeno X - Y z Z" text
- [ ] Previous button (left arrow)
- [ ] Page indicator
- [ ] Next button (right arrow)

### Add Modal
- [ ] Title: "Přidat pozemek"
- [ ] Close X button
- [ ] 6 form fields
- [ ] Required fields marked with *
- [ ] "Zrušit" button (gray)
- [ ] "Přidat pozemek" button (green)

### Edit Modal
- [ ] Title: "Upravit pozemek"
- [ ] Pre-filled fields
- [ ] "Uložit změny" button (green)

### Delete Modal
- [ ] Alert triangle icon (red)
- [ ] Title: "Smazat pozemek"
- [ ] Warning text with parcel name
- [ ] "Zrušit" button (gray)
- [ ] "Smazat" button (red)

## Common Issues

### ❌ Table not showing
**Cause**: No parcels or authentication issue  
**Fix**: Check user is logged in, add test parcels

### ❌ Modal won't close
**Cause**: Click handler not firing  
**Fix**: Click the X button or "Zrušit"

### ❌ Export button does nothing
**Cause**: xlsx library issue  
**Fix**: Check browser console for errors

### ❌ Filters not working
**Cause**: State not updating  
**Fix**: Check React DevTools, verify state changes

### ❌ Status shows wrong color
**Cause**: Status logic issue  
**Fix**: Check analysis data in database

### ❌ Pagination not appearing
**Cause**: Less than 20 parcels  
**Fix**: Add more parcels (or reduce ITEMS_PER_PAGE for testing)

## Database Test Data

### Create 3 Test Parcels

```sql
-- Parcel 1: Normal
INSERT INTO public.parcels (user_id, name, area, cadastral_number, soil_type, culture)
VALUES ('[user-id]', 'Dolní pole', 15.50, '123-456/1', 'S', 'orna');

-- Parcel 2: Critical pH
INSERT INTO public.parcels (user_id, name, area, cadastral_number, soil_type, culture)
VALUES ('[user-id]', 'Horní pole', 23.75, '123-456/2', 'T', 'orna');

-- Add critical analysis
INSERT INTO public.soil_analyses (parcel_id, analysis_date, ph, p, p_category, k, k_category, mg, mg_category)
VALUES ('[parcel2-id]', '2024-06-15', 5.2, 45, 'D', 120, 'D', 80, 'D');

-- Parcel 3: Old analysis
INSERT INTO public.parcels (user_id, name, area, cadastral_number, soil_type, culture)
VALUES ('[user-id]', 'Louka', 8.20, '123-456/3', 'L', 'ttp');

-- Add old analysis
INSERT INTO public.soil_analyses (parcel_id, analysis_date, ph, p, p_category, k, k_category, mg, mg_category)
VALUES ('[parcel3-id]', '2019-01-01', 6.5, 55, 'D', 130, 'D', 90, 'D');
```

After running SQL:
- ✅ 3 parcels total
- ✅ 1 with missing analysis (yellow)
- ✅ 1 with critical pH (red)
- ✅ 1 with old analysis (yellow)

## Success Criteria ✅

All tests pass if:
- [ ] Empty state displays correctly
- [ ] Can add new parcel via modal
- [ ] Table shows all columns
- [ ] Can edit parcel via modal
- [ ] Can delete parcel with confirmation
- [ ] Search filter works
- [ ] Culture filter works
- [ ] Problems-only filter works
- [ ] Pagination works (if 20+ parcels)
- [ ] Excel export downloads
- [ ] Status indicators show correct colors
- [ ] Mobile responsive
- [ ] No console errors

**Time to complete**: ~5 minutes  
**Status**: Ready for testing ✅
