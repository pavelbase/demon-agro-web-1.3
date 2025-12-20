# Dashboard - Quick Test Guide ⚡

Quick 5-minute test guide for the portal dashboard.

## Prerequisites

1. **Server is running**: `npm run dev`
2. **User is authenticated**
3. **Database has profiles table**

## Quick Tests

### ✅ Test 1: Empty Dashboard (1 min)

**Setup**: New user with no data

1. Login to portal
2. Should redirect to `/portal/dashboard`

**Expected Results:**
- ✅ Welcome section with "Dobrý den, [name]!"
- ✅ Czech date (e.g., "pátek 19. prosince 2025")
- ✅ 4 stat cards all showing 0
- ✅ No "Pozemky vyžadující pozornost" section
- ✅ 3 quick action buttons visible
- ✅ Empty activity state showing
- ✅ "Nahrát první rozbor" CTA button
- ✅ No console errors

### ✅ Test 2: With Data (2 min)

**Setup**: User with parcels and analyses

1. Add test parcels via SQL:
```sql
-- Add parcel
INSERT INTO public.parcels (user_id, name, area, cadastral_number, soil_type, culture)
VALUES (
  '[your-user-id]',
  'Dolní pole',
  15.50,
  '123-456/1',
  'S',
  'orna'
);

-- Add soil analysis
INSERT INTO public.soil_analyses (
  parcel_id,
  analysis_date,
  ph,
  p,
  p_category,
  k,
  k_category,
  mg,
  mg_category
)
VALUES (
  '[parcel-id]',
  '2023-06-15',
  5.2,
  45,
  'D',
  120,
  'D',
  80,
  'D'
);
```

2. Reload dashboard

**Expected Results:**
- ✅ "Počet pozemků" shows 1
- ✅ "Celková výměra" shows 15,50 ha
- ✅ "Vyžadují pozornost" shows 1 (pH < 5.5)
- ✅ Attention section visible
- ✅ Parcel card shows "Nízké pH (5.2)"
- ✅ Badge is red (high severity)

### ✅ Test 3: Attention Severity (1 min)

**Test High Severity (pH < 5.5)**:
```sql
-- Parcel with low pH
UPDATE public.soil_analyses 
SET ph = 5.2 
WHERE id = '[analysis-id]';
```
- ✅ Red badge
- ✅ Shows "Nízké pH (5.2)"

**Test Medium Severity (old analysis)**:
```sql
-- Analysis from 5 years ago
UPDATE public.soil_analyses 
SET analysis_date = '2019-01-01' 
WHERE id = '[analysis-id]';
```
- ✅ Orange badge
- ✅ Shows "Rozbor starý 5 let"

**Test Low Severity (low nutrients)**:
```sql
-- Low P category
UPDATE public.soil_analyses 
SET p_category = 'N' 
WHERE id = '[analysis-id]';
```
- ✅ Yellow badge
- ✅ Shows "Nízká zásobenost (P)"

### ✅ Test 4: Quick Actions (30 sec)

1. Click "Nahrát rozbor"
   - ✅ Goes to `/portal/upload`
   
2. Go back, click "Přidat pozemek"
   - ✅ Goes to `/portal/pozemky?action=add`
   
3. Go back, click "Vytvořit poptávku"
   - ✅ Goes to `/portal/poptavky/nova`

### ✅ Test 5: Activity Timeline (1 min)

**Setup**: Add audit logs
```sql
INSERT INTO public.audit_logs (user_id, action, table_name)
VALUES 
  ('[user-id]', 'Vytvořen nový pozemek', 'parcels'),
  ('[user-id]', 'Nahrán rozbor půdy', 'soil_analyses'),
  ('[user-id]', 'Vytvořena poptávka', 'liming_requests');
```

**Expected Results:**
- ✅ Activity section shows entries
- ✅ Time ago displays (e.g., "Před 2 h")
- ✅ Table names translated to Czech
- ✅ Green dot indicators

### ✅ Test 6: Mobile Responsive (1 min)

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro

**Expected Results:**
- ✅ Stat cards stack vertically
- ✅ Quick actions stack
- ✅ Attention cards full width
- ✅ Text is readable
- ✅ Buttons are tappable
- ✅ No horizontal scroll

## Visual Checklist

### Welcome Section
- [ ] Gradient background (green to brown)
- [ ] White text
- [ ] Greeting with company/full name
- [ ] Czech date format

### Quick Stats
- [ ] 4 cards in a row (desktop)
- [ ] Each card has:
  - [ ] Icon (different color for each)
  - [ ] Large number
  - [ ] Label
  - [ ] Description
  - [ ] Colored left border

### Attention Section (if parcels exist)
- [ ] Heading with AlertTriangle icon
- [ ] "Zobrazit vše" link (if > 5 parcels)
- [ ] Each card shows:
  - [ ] Parcel name
  - [ ] Area and cadastral number
  - [ ] Colored badge with reason
  - [ ] Chevron right icon
- [ ] Clickable (hover effect)

### Quick Actions
- [ ] 3 cards
- [ ] Each has:
  - [ ] Colored icon circle
  - [ ] Bold title
  - [ ] Gray description
  - [ ] Hover border effect

### Activity Timeline
- [ ] If no activity: Empty state with CTA
- [ ] If activity: List with:
  - [ ] Green dots
  - [ ] Action text
  - [ ] Table name (Czech)
  - [ ] Time ago

## Database Verification

### Check user has data:
```sql
-- Check parcels
SELECT COUNT(*) FROM public.parcels WHERE user_id = '[user-id]';

-- Check analyses
SELECT 
  p.name,
  sa.analysis_date,
  sa.ph,
  sa.p_category,
  sa.k_category,
  sa.mg_category
FROM public.parcels p
LEFT JOIN public.soil_analyses sa ON sa.parcel_id = p.id
WHERE p.user_id = '[user-id]';

-- Check requests
SELECT COUNT(*) 
FROM public.liming_requests 
WHERE user_id = '[user-id]' 
  AND status IN ('new', 'in_progress');

-- Check audit logs
SELECT * 
FROM public.audit_logs 
WHERE user_id = '[user-id]' 
ORDER BY created_at DESC 
LIMIT 5;
```

## Common Issues

### ❌ Stats show 0 but data exists
**Cause**: Queries filtering by wrong user_id  
**Fix**: Check authentication, verify user.id in logs

### ❌ Attention section not showing
**Cause**: No parcels meet criteria  
**Fix**: 
- Add parcel with pH < 5.5
- Add parcel with old analysis (> 4 years)
- Add parcel with low nutrients (N or VH category)

### ❌ Czech date not formatting correctly
**Cause**: Browser locale issue  
**Fix**: Should work in all modern browsers, check console for errors

### ❌ Time ago shows wrong values
**Cause**: Timezone mismatch  
**Fix**: Ensure dates in database are UTC

### ❌ Activity timeline always empty
**Cause**: No audit_logs entries  
**Fix**: 
1. Check audit_logs table exists
2. Verify audit logging is working
3. Add test entries manually

### ❌ Quick action links don't work
**Cause**: Routes not implemented yet  
**Expected**: Some routes are placeholders, will be implemented in later phases

## Performance Check

### Load Time
- Dashboard should load in < 1 second
- Queries should be fast (indexed on user_id)

### Database Queries
```sql
-- Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'parcels';
SELECT * FROM pg_indexes WHERE tablename = 'soil_analyses';
SELECT * FROM pg_indexes WHERE tablename = 'liming_requests';
SELECT * FROM pg_indexes WHERE tablename = 'audit_logs';
```

## Success Criteria ✅

All tests pass if:
- [ ] Dashboard loads without errors
- [ ] Welcome section displays correctly
- [ ] All 4 stat cards show
- [ ] Stats calculate correctly from data
- [ ] Attention section shows when applicable
- [ ] Severity colors are correct
- [ ] Quick actions link properly
- [ ] Activity timeline displays
- [ ] Empty states show appropriately
- [ ] Mobile layout works
- [ ] No console errors

**Time to complete**: ~5 minutes  
**Status**: Ready for testing ✅

---

## Test Data Setup (Optional)

### Complete Test Dataset
```sql
-- 1. Add 3 parcels
INSERT INTO public.parcels (user_id, name, area, cadastral_number, soil_type, culture)
VALUES 
  ('[user-id]', 'Dolní pole', 15.50, '123-456/1', 'S', 'orna'),
  ('[user-id]', 'Horní pole', 23.75, '123-456/2', 'T', 'orna'),
  ('[user-id]', 'Louka', 8.20, '123-456/3', 'L', 'ttp');

-- 2. Add analyses (one with low pH, one old, one with low nutrients)
INSERT INTO public.soil_analyses (parcel_id, analysis_date, ph, p, p_category, k, k_category, mg, mg_category)
VALUES 
  ('[parcel1-id]', '2024-06-15', 5.2, 45, 'D', 120, 'D', 80, 'D'),
  ('[parcel2-id]', '2019-01-01', 6.5, 55, 'D', 130, 'D', 90, 'D'),
  ('[parcel3-id]', '2024-08-20', 7.0, 25, 'N', 80, 'VH', 60, 'N');

-- 3. Add liming request
INSERT INTO public.liming_requests (user_id, status, created_at)
VALUES ('[user-id]', 'new', now());

-- 4. Add audit logs
INSERT INTO public.audit_logs (user_id, action, table_name, created_at)
VALUES 
  ('[user-id]', 'Vytvořen nový pozemek', 'parcels', now() - interval '2 hours'),
  ('[user-id]', 'Nahrán rozbor půdy', 'soil_analyses', now() - interval '1 day'),
  ('[user-id]', 'Vytvořena poptávka', 'liming_requests', now() - interval '3 days');
```

After running this SQL:
- ✅ 3 parcels, total 47.45 ha
- ✅ 3 parcels needing attention (various reasons)
- ✅ 1 pending request
- ✅ 3 activity entries
