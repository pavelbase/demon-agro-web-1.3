# Onboarding Wizard - Quick Test Guide ⚡

Quick 5-minute test guide for the onboarding wizard.

## Prerequisites

1. **Database is set up** with required fields:
   - `must_change_password`
   - `onboarding_completed`
   - `ico`, `address`, `district` (optional fields)

2. **Test users exist** (create via SQL if needed):

```sql
-- Test User 1: No password change required
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'test1@demonagro.cz',
  crypt('Password123', gen_salt('bf')),
  now()
);

INSERT INTO public.profiles (id, email, must_change_password, onboarding_completed)
SELECT id, email, false, false
FROM auth.users
WHERE email = 'test1@demonagro.cz';

-- Test User 2: Must change password
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'test2@demonagro.cz',
  crypt('Password123', gen_salt('bf')),
  now()
);

INSERT INTO public.profiles (id, email, must_change_password, onboarding_completed)
SELECT id, email, true, false
FROM auth.users
WHERE email = 'test2@demonagro.cz';
```

## Quick Tests

### ✅ Test 1: Basic Flow (2 min)

**User**: `test1@demonagro.cz` / `Password123`

1. Login at `/portal/prihlaseni`
2. Should redirect to `/portal/onboarding`
3. See welcome screen with 3 features
4. Click "Pokračovat"
5. See company info form (NOT password form)
6. Enter company name: "Test Farm"
7. Click "Pokračovat"
8. See completion screen
9. Click "Přejít do portálu"
10. Should redirect to `/portal/dashboard`

**Expected Results:**
- ✅ Smooth animations between steps
- ✅ Progress bar updates correctly
- ✅ No errors in console
- ✅ Redirects to dashboard after completion

### ✅ Test 2: Password Change Flow (3 min)

**User**: `test2@demonagro.cz` / `Password123`

1. Login at `/portal/prihlaseni`
2. Should redirect to `/portal/onboarding`
3. See welcome screen
4. Click "Pokračovat"
5. See password change form
6. Try password "test" → Should show validation errors
7. Try password "Test1234" → Should show strength indicator
8. Enter password: "NewPass123"
9. Confirm password: "NewPass123"
10. Click "Pokračovat"
11. See company info form
12. Click "Přeskočit" (skip)
13. See completion screen
14. Click "Přejít do portálu"
15. Logout
16. Login with new password: "NewPass123"
17. Should go directly to dashboard (no onboarding)

**Expected Results:**
- ✅ Password validation works correctly
- ✅ Strength indicator shows correctly
- ✅ Can skip company info
- ✅ New password works for login
- ✅ No longer redirected to onboarding

### ✅ Test 3: District Selection (1 min)

1. Go to `/portal/onboarding` as new user
2. Navigate to company info step
3. Open "Okres" dropdown
4. Should see regions as optgroups
5. Should see all districts grouped by region
6. Select "Praha"
7. Submit form

**Expected Results:**
- ✅ Districts grouped by region
- ✅ All 14 regions visible
- ✅ Selection works correctly

### ✅ Test 4: Already Completed (30 sec)

1. Complete onboarding for a user
2. Try to access `/portal/onboarding` directly
3. Should immediately redirect to `/portal/dashboard`

**Expected Results:**
- ✅ Instant redirect
- ✅ No flash of onboarding content

### ✅ Test 5: Mobile Responsive (1 min)

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Go through onboarding flow
5. Check all steps

**Expected Results:**
- ✅ Content fits screen width
- ✅ Buttons are tappable
- ✅ Forms are usable
- ✅ Progress bar looks good

## Visual Checklist

### Welcome Screen
- [ ] Sparkles icon visible
- [ ] Title: "Vítejte v portálu Démon Agro!"
- [ ] 3 numbered features listed
- [ ] "Pokračovat" button with arrow

### Password Step (if applicable)
- [ ] Title: "Změňte si heslo"
- [ ] Two password inputs
- [ ] Requirements checklist (3 items)
- [ ] Strength indicator
- [ ] "Zpět" and "Pokračovat" buttons

### Company Info Step
- [ ] Title: "Informace o podniku"
- [ ] 5 form fields (1 required, 4 optional)
- [ ] District dropdown with regions
- [ ] "Zpět", "Přeskočit", "Pokračovat" buttons

### Completion Screen
- [ ] Green checkmark icon
- [ ] Title: "Vše je připraveno!"
- [ ] Cream-colored box with 4 next steps
- [ ] "Zpět" and "Přejít do portálu" buttons

### Progress Bar (all steps)
- [ ] Fixed at top
- [ ] Shows "Krok X z Y"
- [ ] Shows current step title
- [ ] Green progress bar animates

## Common Issues

### ❌ Stuck in redirect loop
**Cause**: Middleware not allowing `/portal/onboarding`  
**Fix**: Check `middleware.ts` includes onboarding in public routes:
```typescript
const publicRoutes = ['/portal', '/portal/prihlaseni', '/portal/reset-hesla', '/portal/onboarding']
```

### ❌ Password won't update
**Cause**: Supabase auth error  
**Fix**: Check Supabase logs in dashboard

### ❌ Districts not showing
**Cause**: Import error  
**Fix**: Verify `lib/constants/districts.ts` exists and is imported correctly

### ❌ Animations not smooth
**Cause**: CSS not loaded  
**Fix**: Check `app/globals.css` has animation keyframes

### ❌ Can't skip company info
**Cause**: Form requires company_name  
**Fix**: Click "Přeskočit" button, not "Pokračovat"

## Database Verification

After completing onboarding, verify in Supabase SQL Editor:

```sql
SELECT 
  email,
  company_name,
  ico,
  district,
  must_change_password,
  onboarding_completed
FROM public.profiles
WHERE email IN ('test1@demonagro.cz', 'test2@demonagro.cz');
```

**Expected:**
```
email                  | company_name | ico  | district | must_change | onboarding
-----------------------|-------------|------|----------|-------------|------------
test1@demonagro.cz     | Test Farm   | null | null     | false       | true
test2@demonagro.cz     | null        | null | null     | false       | true
```

## Quick Fix Commands

### Reset user onboarding status:
```sql
UPDATE public.profiles 
SET onboarding_completed = false, must_change_password = false
WHERE email = 'test1@demonagro.cz';
```

### Force password change:
```sql
UPDATE public.profiles 
SET must_change_password = true
WHERE email = 'test1@demonagro.cz';
```

### Clear company info:
```sql
UPDATE public.profiles 
SET company_name = null, ico = null, address = null, district = null
WHERE email = 'test1@demonagro.cz';
```

---

## Success Criteria ✅

All tests pass if:
- [ ] Welcome screen displays correctly
- [ ] Password step appears only when required
- [ ] Password validation works with real-time feedback
- [ ] Company info can be filled or skipped
- [ ] Districts dropdown has all regions
- [ ] Progress bar updates smoothly
- [ ] Animations work (slide left/right)
- [ ] Completion redirects to dashboard
- [ ] Re-accessing onboarding after completion redirects away
- [ ] Mobile layout is usable
- [ ] No console errors

**Time to complete**: ~5 minutes  
**Status**: Ready for testing ✅
