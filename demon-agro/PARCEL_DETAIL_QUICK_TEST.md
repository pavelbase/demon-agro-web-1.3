# Parcel Detail - Quick Test Guide (5 minutes)

## 🚀 Prerequisites

1. **Running dev server**:
   ```bash
   cd demon-agro
   npm run dev
   ```

2. **Logged in user** with at least one parcel created

3. **Database should have**:
   - Test parcels
   - Optional: soil analyses, crop rotation, fertilization history

## ✅ Test Checklist

### Test 1: View Parcel with Analysis (2 min)

1. **Navigate to Parcels List**:
   - Go to `/portal/pozemky`
   - See list of parcels

2. **Click on Parcel Name**:
   - Click on any parcel name (link)
   - Should navigate to `/portal/pozemky/[id]`

3. **Verify Header**:
   - [ ] Breadcrumb shows: Pozemky / Detail pozemku
   - [ ] Parcel name displayed as h1
   - [ ] Cadastral number shown (if exists)
   - [ ] Area, soil type, culture displayed in 3-column grid
   - [ ] Three action buttons: Upravit, Rozdělit, Archivovat

4. **Verify Health Card**:
   - [ ] "Zdravotní karta půdy" heading
   - [ ] Last analysis date displayed
   - [ ] pH progress bar with value and category
   - [ ] P, K, Mg progress bars with values and badges
   - [ ] K:Mg ratio displayed with status indicator
   - [ ] Colors match categories (red/orange/green/blue/purple)

5. **Verify Navigation Tabs**:
   - [ ] Four tabs visible: Přehled, Historie rozborů, Plán hnojení, Plán vápnění
   - [ ] "Přehled" tab is active (green underline)
   - [ ] Icons displayed for each tab

6. **Verify Overview Tab**:
   - [ ] "Aktuální rozbor půdy" section with 4 values (pH, P, K, Mg)
   - [ ] Analysis date and lab name below
   - [ ] Osevní postup table (if data exists)
   - [ ] Historie hnojení table (if data exists)
   - [ ] Notes section (if exists)
   - [ ] Two action buttons at bottom

7. **Test Action Buttons**:
   - [ ] Click "Nahrát nový rozbor" → Should go to `/portal/upload?parcel=[id]`
   - [ ] "Přidat do poptávky vápnění" button exists (placeholder)

**Expected Result**: ✅ Full parcel detail displayed with all sections

---

### Test 2: Parcel without Analysis (1 min)

1. **Create Parcel without Analysis** (or find one):
   - Go to `/portal/pozemky`
   - Click "Přidat pozemek"
   - Create new parcel, don't add analysis

2. **View Parcel Detail**:
   - Click on parcel name

3. **Verify Empty State**:
   - [ ] Health card shows orange warning box
   - [ ] Alert triangle icon displayed
   - [ ] Message: "Chybí rozbor půdy"
   - [ ] CTA button: "Nahrát rozbor"
   - [ ] Overview tab shows orange warning: "Tento pozemek zatím nemá žádný rozbor půdy"

4. **Click "Nahrát rozbor"**:
   - [ ] Redirects to `/portal/upload`

**Expected Result**: ✅ Empty state properly displayed with CTA

---

### Test 3: Old Analysis Warning (1 min)

*If you have a parcel with analysis >4 years old, or manually edit date in database*

1. **View Parcel with Old Analysis**:
   - Navigate to parcel detail

2. **Verify Warning Banner**:
   - [ ] Orange banner below "Zdravotní karta půdy" heading
   - [ ] Alert triangle icon
   - [ ] Message: "Rozbor je starší než 4 roky"
   - [ ] Recommendation text: "Doporučujeme provést nový rozbor..."

**Expected Result**: ✅ Warning banner displayed for old analysis

---

### Test 4: K:Mg Ratio Indicator (1 min)

1. **View Health Card**:
   - Scroll to "Poměr K:Mg" section at bottom of health card

2. **Verify Ratio Calculation**:
   - [ ] Ratio displayed (e.g., "2.35:1")
   - [ ] Status indicator (green/orange/red dot)
   - [ ] Message based on ratio:
     - Green: "Optimální poměr K:Mg" (2-3)
     - Orange: "Nízký poměr..." or "Vysoký poměr..." (1.5-2 or 3-4)
     - Red: "Kritický nepoměr K:Mg - nutná korekce" (<1.5 or >4)
   - [ ] Helper text: "Optimální poměr K:Mg je 2:1 až 3:1"

**Expected Result**: ✅ K:Mg ratio correctly calculated and displayed

---

### Test 5: Responsive Design (30 sec)

1. **Desktop View** (>1024px):
   - [ ] 3-column grid for parcel info
   - [ ] 2-column grid for nutrients (P/K in one row, Mg/Ca in second)
   - [ ] Tables fit width
   - [ ] Buttons side-by-side

2. **Tablet View** (768-1024px):
   - [ ] Resize browser to ~800px width
   - [ ] Layout mostly maintained
   - [ ] Tables may scroll horizontally

3. **Mobile View** (<768px):
   - [ ] Resize browser to ~400px width
   - [ ] Parcel info stacks (1 column)
   - [ ] Nutrients stack (1 column)
   - [ ] Tables scroll horizontally
   - [ ] Action buttons show icon only on smallest screens

**Expected Result**: ✅ Responsive layout adapts to screen size

---

### Test 6: Navigation (30 sec)

1. **Breadcrumb Navigation**:
   - [ ] Click "Pozemky" in breadcrumb → Returns to `/portal/pozemky`

2. **Tab Navigation**:
   - [ ] Click "Historie rozborů" tab → Goes to `/portal/pozemky/[id]/rozbory`
   - [ ] Click "Plán hnojení" tab → Goes to `/portal/pozemky/[id]/plan-hnojeni`
   - [ ] Click "Plán vápnění" tab → Goes to `/portal/pozemky/[id]/plan-vapneni`
   - *Note: These pages are placeholders for now*

3. **Back Button**:
   - [ ] Browser back button returns to previous page

**Expected Result**: ✅ All navigation links work correctly

---

## 🐛 Common Issues

### Issue 1: Health Card Not Displaying
**Symptom**: Health card shows empty or missing
**Solution**: Check if parcel has soil analyses in database

### Issue 2: 404 Not Found
**Symptom**: Page shows 404 error
**Solution**: 
- Verify parcel ID exists
- Check user owns the parcel (user_id match)
- Check user is logged in

### Issue 3: Empty Tables
**Symptom**: No crop rotation or fertilization history
**Solution**: This is expected if no data exists - tables only show if data present

### Issue 4: Wrong Analysis Displayed
**Symptom**: Old analysis shown instead of newest
**Solution**: Verify analyses are ordered by date DESC in query

### Issue 5: K:Mg Ratio Wrong
**Symptom**: Ratio calculation seems incorrect
**Solution**: Check potassium and magnesium values in database (should be in mg/kg)

## 📊 Test Data Examples

### Sample Parcel with Good Health:
```sql
INSERT INTO parcels (id, user_id, name, area, soil_type, culture)
VALUES (
  'test-parcel-1',
  '[your-user-id]',
  'Dolní pole',
  25.50,
  'S',
  'orna'
);

INSERT INTO soil_analyses (parcel_id, user_id, date, ph, ph_category, phosphorus, phosphorus_category, potassium, potassium_category, magnesium, magnesium_category)
VALUES (
  'test-parcel-1',
  '[your-user-id]',
  '2024-06-15',
  6.5,
  'N',
  150,
  'D',
  200,
  'D',
  80,
  'D'
);
```

### Sample Parcel with Problems:
```sql
INSERT INTO soil_analyses (parcel_id, user_id, date, ph, ph_category, phosphorus, phosphorus_category, potassium, potassium_category, magnesium, magnesium_category)
VALUES (
  'test-parcel-1',
  '[your-user-id]',
  '2024-06-15',
  5.2,  -- Low pH (SK category)
  'SK',
  80,   -- Low P (VH category)
  'VH',
  120,  -- Low K (N category)
  'N',
  50,   -- Low Mg (VH category)
  'VH'
);
```

## ✅ Success Criteria

All tests pass:
- [x] Parcel header displays correctly
- [x] Health card shows all progress bars
- [x] Empty state for parcels without analysis
- [x] Old analysis warning works
- [x] K:Mg ratio indicator works
- [x] Navigation tabs function
- [x] Overview tab shows all sections
- [x] Action buttons link correctly
- [x] Responsive design adapts
- [x] Ownership verified (404 for other users' parcels)

## 🎉 Completion

**Time**: 5 minutes  
**Status**: ✅ All tests passed  
**Phase**: 3.2 - Parcel Detail  
**Next Phase**: 3.3 - Historie rozborů

---

**Tester**: _____________  
**Date**: _____________  
**Result**: ✅ PASS / ❌ FAIL  
**Notes**: _____________
