# Onboarding Wizard - Deployment Checklist

## Pre-Deployment

### 1. Database Migrations ⚠️ REQUIRED

Run these SQL scripts in Supabase SQL Editor in order:

```sql
-- Step 1: Add company info fields to profiles table
-- File: lib/supabase/sql/update_profiles_company_info.sql
```

```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ico VARCHAR(20);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS district VARCHAR(100);

COMMENT ON COLUMN public.profiles.ico IS 'IČO - Czech business identification number';
COMMENT ON COLUMN public.profiles.address IS 'Company address';
COMMENT ON COLUMN public.profiles.district IS 'District for shipping zone calculation';
```

**Verify**:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('ico', 'address', 'district');
```

Expected result: 3 rows (ico, address, district)

### 2. Create Test Users (Optional)

For testing, create test users:

```sql
-- File: lib/supabase/sql/create_onboarding_test_users.sql
-- Creates 3 test users:
-- 1. test.onboarding1@demonagro.cz (no password change)
-- 2. test.onboarding2@demonagro.cz (must change password)
-- 3. test.onboarding3@demonagro.cz (already completed)
```

### 3. Environment Variables

Verify these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ppsldvsodvcbxecxjssf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_n6hPY5tPwwV1WiuMWe1eMQ_UYcvGHg7
SUPABASE_SERVICE_ROLE_KEY=sb_secret_7jGi1dDwoDOE24C_jObZuA_Yssmi6t2
```

## Deployment Steps

### 1. Install Dependencies (if needed)

```bash
cd demon-agro
npm install
```

All required dependencies were already installed in Phase 0.1:
- ✅ react-hook-form
- ✅ @hookform/resolvers
- ✅ zod
- ✅ lucide-react
- ✅ @supabase/supabase-js
- ✅ @supabase/ssr

### 2. Build Check

```bash
npm run build
```

**Expected**: Build should succeed without errors in onboarding files.

**Known Issues**: There may be pre-existing TypeScript errors in other files (e.g., `kalkulacka/page.tsx`). These are not related to onboarding implementation.

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Test Onboarding Flow

#### Test 1: No Password Change (2 min)
1. Login as `test.onboarding1@demonagro.cz` / `TestPass123`
2. Should redirect to `/portal/onboarding`
3. See welcome screen → Click "Pokračovat"
4. See company info form
5. Enter company name → Click "Pokračovat"
6. See completion screen → Click "Přejít do portálu"
7. ✅ Should redirect to `/portal/dashboard`

#### Test 2: Must Change Password (3 min)
1. Login as `test.onboarding2@demonagro.cz` / `TempPass123`
2. Should redirect to `/portal/onboarding`
3. See welcome screen → Click "Pokračovat"
4. See password form
5. Enter new password (min 8 chars, 1 uppercase, 1 number)
6. Confirm password → Click "Pokračovat"
7. See company info → Click "Přeskočit"
8. See completion → Click "Přejít do portálu"
9. Logout and login with new password
10. ✅ Should go directly to dashboard

#### Test 3: Already Completed (30 sec)
1. Login as `test.onboarding3@demonagro.cz` / `TestPass123`
2. ✅ Should redirect directly to `/portal/dashboard`
3. Try accessing `/portal/onboarding` manually
4. ✅ Should redirect to dashboard

#### Test 4: Mobile Responsive (1 min)
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or similar
4. Go through onboarding flow
5. ✅ All steps should be usable on mobile

## Post-Deployment Verification

### 1. Check Database Updates

After completing onboarding with test users, verify in Supabase:

```sql
SELECT 
  email,
  company_name,
  ico,
  address,
  district,
  phone,
  must_change_password,
  onboarding_completed
FROM public.profiles
WHERE email LIKE 'test.onboarding%@demonagro.cz';
```

**Expected**:
- User 1: `onboarding_completed = true`, `must_change_password = false`, company_name filled
- User 2: `onboarding_completed = true`, `must_change_password = false`, new password works
- User 3: `onboarding_completed = true` (unchanged)

### 2. Check Middleware

Verify `/portal/onboarding` route protection:

```bash
# Unauthenticated user
curl -I http://localhost:3000/portal/onboarding
# Expected: 307 redirect to /portal/prihlaseni

# Authenticated user (use browser with active session)
# Expected: 200 OK, onboarding page rendered
```

### 3. Check Animations

Visual check in browser:
- [ ] Progress bar animates smoothly
- [ ] Steps slide in from right when going forward
- [ ] Steps slide in from left when going backward
- [ ] Password strength indicator updates in real-time
- [ ] No layout shift or flashing

### 4. Check Console

Open browser DevTools Console:
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No Supabase auth errors

## Rollback Plan

If issues occur, rollback is simple:

### 1. Revert Code Changes

```bash
git checkout HEAD -- app/portal/onboarding/page.tsx
git checkout HEAD -- components/portal/OnboardingWizard.tsx
git checkout HEAD -- lib/actions/onboarding.ts
git checkout HEAD -- lib/constants/districts.ts
git checkout HEAD -- lib/types/database.ts
git checkout HEAD -- app/globals.css
git checkout HEAD -- middleware.ts
```

### 2. Database Rollback

If you need to remove the new columns:

```sql
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS ico;

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS address;

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS district;
```

**⚠️ Warning**: This will delete all data in these columns!

## Common Issues & Solutions

### Issue: "Cannot find module '@/lib/constants/districts'"
**Solution**: Restart dev server
```bash
# Kill dev server (Ctrl+C)
npm run dev
```

### Issue: Stuck in onboarding loop
**Solution**: Check `onboarding_completed` flag in database
```sql
UPDATE public.profiles 
SET onboarding_completed = true
WHERE email = 'your.email@example.com';
```

### Issue: Password won't update
**Solution**: Check Supabase logs
1. Go to Supabase Dashboard
2. Check "Logs" → "Auth" for error messages
3. Verify password meets all requirements (8 chars, uppercase, number)

### Issue: Districts not showing in dropdown
**Solution**: Verify import
```typescript
// In OnboardingWizard.tsx
import { CZECH_DISTRICTS, getDistrictsByRegion } from '@/lib/constants/districts'
```

### Issue: Animations not smooth
**Solution**: Verify CSS is loaded
```bash
# Check that globals.css includes animations
grep -A 5 "@keyframes slide-in-right" app/globals.css
```

## Monitoring

After deployment, monitor:

1. **Supabase Auth Logs**
   - Check for password update errors
   - Look for failed login attempts

2. **Profile Updates**
   - Monitor `onboarding_completed` flag changes
   - Check `must_change_password` is set to false after password change

3. **User Feedback**
   - Are users completing onboarding?
   - Are there dropoffs at specific steps?

## Success Metrics

After 1 week of production:
- [ ] X% of new users complete onboarding
- [ ] Average time to complete: < 2 minutes
- [ ] < 5% dropout rate
- [ ] Zero critical errors in Supabase logs

## Cleanup Test Data

After testing, remove test users:

```sql
-- Delete test users
DELETE FROM public.profiles 
WHERE email LIKE 'test.onboarding%@demonagro.cz';

DELETE FROM auth.users 
WHERE email LIKE 'test.onboarding%@demonagro.cz';
```

## Files to Commit

```bash
git add app/portal/onboarding/page.tsx
git add components/portal/OnboardingWizard.tsx
git add lib/actions/onboarding.ts
git add lib/constants/districts.ts
git add lib/types/database.ts
git add lib/supabase/sql/update_profiles_company_info.sql
git add lib/supabase/sql/create_onboarding_test_users.sql
git add app/globals.css
git add middleware.ts
git add ONBOARDING_IMPLEMENTATION.md
git add ONBOARDING_QUICK_TEST.md
git add ONBOARDING_DEPLOYMENT_CHECKLIST.md
git add PHASE_1_6_SUMMARY.md

git commit -m "feat: implement onboarding wizard (Phase 1.6)

- Multi-step wizard with progress bar
- Conditional password change step
- Company info form with Czech districts
- Form validation with Zod
- Password strength indicator
- Smooth slide animations
- Skip optional steps functionality
- Database migration for company info fields
- Comprehensive documentation and test guides"
```

---

## ✅ Deployment Complete

Once all checkboxes are ticked:
- [ ] Database migrations applied
- [ ] Test users created
- [ ] Build succeeds
- [ ] All test scenarios pass
- [ ] Mobile responsive verified
- [ ] No console errors
- [ ] Database updates confirmed
- [ ] Animations work smoothly
- [ ] Documentation reviewed

**Status**: Ready for Production ✅

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Sign-off**: _________________
