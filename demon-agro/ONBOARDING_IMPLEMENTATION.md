# Onboarding Wizard - Implementation Documentation

## 📋 Overview

Multi-step onboarding wizard that guides new users through account setup, ensuring they complete required tasks before accessing the portal.

## 🎯 Features

### 1. **Multi-Step Flow**
- **Step 0**: Welcome screen with portal overview
- **Step 1** (conditional): Password change if `must_change_password === true`
- **Step 2**: Company information (optional, can be skipped)
- **Step 3**: Completion screen with next steps

### 2. **Smart Routing**
- Only authenticated users can access onboarding
- If `onboarding_completed === true` and `must_change_password === false`, redirect to dashboard
- After completion, redirect to `/portal/dashboard`

### 3. **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- Real-time validation with visual feedback
- Password strength indicator

### 4. **Company Information**
- Company name (required)
- IČO (optional)
- Address (optional)
- District selection with grouped regions (optional)
- Phone (optional)

### 5. **UX Enhancements**
- Progress bar showing current step
- Smooth animations between steps (slide-in-right/left)
- Ability to skip optional steps
- Loading states for all actions
- Error handling with user-friendly messages

## 🏗️ Architecture

### Files Created

```
app/portal/onboarding/
├── page.tsx                           # Server Component - fetches profile, handles auth
components/portal/
├── OnboardingWizard.tsx              # Client Component - wizard logic & UI
lib/actions/
├── onboarding.ts                     # Server Actions for onboarding operations
lib/constants/
├── districts.ts                      # Czech districts data
lib/supabase/sql/
├── update_profiles_company_info.sql  # Migration for company fields
```

### Component Structure

```
OnboardingPage (Server Component)
├── Fetches authenticated user
├── Loads user profile
├── Checks onboarding status
└── Renders OnboardingWizard

OnboardingWizard (Client Component)
├── Manages step navigation
├── Handles form state with React Hook Form + Zod
├── Calls Server Actions for mutations
└── Displays appropriate step based on state
```

## 🔧 Technical Implementation

### 1. Server Component (page.tsx)

```typescript
export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/portal/prihlaseni')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed && !profile?.must_change_password) {
    redirect('/portal/dashboard')
  }

  return <OnboardingWizard profile={profile} />
}
```

**Why Server Component?**
- Secure authentication check on server
- Fetch profile data before rendering
- Conditional redirects based on state

### 2. Client Component (OnboardingWizard.tsx)

**State Management:**
- `currentStep`: Current wizard step (0-3)
- `isLoading`: Loading state for async operations
- `error`: Error message display
- `direction`: Animation direction ('forward' or 'backward')

**Forms:**
- **Password Form**: Uses `passwordSchema` with Zod validation
- **Company Form**: Uses `companySchema` with Zod validation

**Navigation:**
- `nextStep()`: Move forward
- `prevStep()`: Move backward
- `skipStep()`: Skip optional steps

### 3. Server Actions (onboarding.ts)

#### `updatePasswordOnboarding(newPassword: string)`
- Updates user password via Supabase Auth
- Sets `must_change_password = false` in profile
- Returns `{ success: boolean, error?: string }`

#### `updateCompanyInfo(data: CompanyFormData)`
- Updates company fields in profiles table
- Validates required fields
- Returns `{ success: boolean, error?: string }`

#### `completeOnboarding()`
- Sets `onboarding_completed = true`
- Sets `must_change_password = false` (safety)
- Redirects to `/portal/dashboard`

### 4. Czech Districts Data (districts.ts)

Comprehensive list of all 77 Czech districts grouped by 14 regions:

```typescript
export const CZECH_DISTRICTS = [
  { value: 'praha', label: 'Praha', region: 'Hlavní město Praha' },
  // ... 76 more districts
] as const

export function getDistrictsByRegion() {
  // Returns districts grouped by region
}
```

**Why districts?**
- For calculating shipping zones
- Used in liming request pricing
- Optional field in onboarding

## 🎨 UI/UX Design

### Progress Bar
- Fixed at top of screen
- Shows "Krok X z Y" and current step title
- Visual progress indicator with green bar

### Step Animations
```css
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Password Strength Indicator
```typescript
getPasswordStrength(password) {
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  if (password.length >= 12) strength++
  
  // Returns: { strength: 1-4, label: 'Slabé/Střední/Dobré/Silné', color: 'bg-...' }
}
```

### Design System Colors
- Primary Green: `#4A7C59` (buttons, accents)
- Primary Brown: `#6B4423` (hover states)
- Primary Cream: `#F5F1E8` (backgrounds)
- Gray scales for text and borders

## 🔐 Security & Validation

### Password Validation
```typescript
const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Heslo musí mít alespoň 8 znaků')
    .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno')
    .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jedno číslo'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
})
```

### Company Info Validation
```typescript
const companySchema = z.object({
  company_name: z.string().min(1, 'Název firmy je povinný'),
  ico: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
})
```

## 🗄️ Database Schema

### Required Migrations

1. **Auth Fields** (should already exist from Phase 1.3):
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
```

2. **Company Info Fields** (new):
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ico VARCHAR(20);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS district VARCHAR(100);
```

Run the migration:
```bash
# In Supabase SQL Editor
psql < lib/supabase/sql/update_profiles_company_info.sql
```

## 🧪 Testing Guide

### Test Scenario 1: New User (No Password Change Required)
1. Create test user with `must_change_password = false`
2. Login → Should redirect to `/portal/onboarding`
3. See welcome screen
4. Click "Pokračovat"
5. See company info form (no password step)
6. Fill company name, skip others
7. Click "Pokračovat"
8. See completion screen
9. Click "Přejít do portálu"
10. ✅ Should redirect to dashboard
11. ✅ `onboarding_completed` should be `true`

### Test Scenario 2: New User (Must Change Password)
1. Create test user with `must_change_password = true`
2. Login → Should redirect to `/portal/onboarding`
3. See welcome screen
4. Click "Pokračovat"
5. See password change form
6. Try weak password → Should see validation errors
7. Enter strong password
8. Confirm password
9. Click "Pokračovat"
10. See company info form
11. Fill required fields
12. Click "Pokračovat"
13. See completion screen
14. Click "Přejít do portálu"
15. ✅ Should redirect to dashboard
16. ✅ `must_change_password` should be `false`
17. ✅ `onboarding_completed` should be `true`

### Test Scenario 3: Skip Optional Step
1. Follow Test Scenario 1
2. At company info step, click "Přeskočit"
3. Should skip to completion screen
4. ✅ Company info should remain `null`

### Test Scenario 4: Back Navigation
1. Start onboarding
2. Go through steps using "Pokračovat"
3. At any step, click "Zpět"
4. ✅ Should return to previous step
5. ✅ Form data should be preserved
6. ✅ Animation should slide from left

### Test Scenario 5: Already Completed
1. User with `onboarding_completed = true`
2. Try to access `/portal/onboarding`
3. ✅ Should redirect to `/portal/dashboard`

## 🚀 Deployment Checklist

- [ ] Run database migration for company info fields
- [ ] Verify middleware allows `/portal/onboarding` for authenticated users
- [ ] Test all scenarios above
- [ ] Verify animations work smoothly
- [ ] Test mobile responsive design
- [ ] Check password strength indicator
- [ ] Verify district dropdown shows all regions
- [ ] Test error handling
- [ ] Verify loading states
- [ ] Check accessibility (keyboard navigation, screen readers)

## 🎯 Next Steps

After onboarding is complete, users can:
1. **Add parcels** (`/portal/pozemky`)
2. **Upload soil analyses** (`/portal/upload`)
3. **Create fertilization plans** (from parcel detail)
4. **Create liming requests** (`/portal/poptavky/nova`)

## 📝 Notes

- **Onboarding is skippable for company info** - users can complete it later in settings
- **Password change is mandatory** if `must_change_password === true`
- **District selection** is optional but recommended for accurate shipping calculations
- **Progress is saved** - if user refreshes, they start from beginning but can skip completed steps
- **Mobile-friendly** - all steps are responsive and work on small screens

## 🐛 Troubleshooting

### Issue: Stuck on onboarding after completion
**Solution**: Check `onboarding_completed` flag in database:
```sql
SELECT id, email, onboarding_completed, must_change_password 
FROM public.profiles 
WHERE email = 'user@example.com';
```

### Issue: Password won't update
**Solution**: Check Supabase Auth logs for errors. Common causes:
- Password doesn't meet minimum requirements
- Session expired

### Issue: Districts not showing
**Solution**: Verify `CZECH_DISTRICTS` constant is imported correctly:
```typescript
import { CZECH_DISTRICTS, getDistrictsByRegion } from '@/lib/constants/districts'
```

### Issue: Animations not working
**Solution**: Check `globals.css` includes animation keyframes:
```css
@keyframes slide-in-right { /* ... */ }
@keyframes slide-in-left { /* ... */ }
```

## 🎨 Customization

### Add New Step
1. Add step to `steps` array in OnboardingWizard
2. Create new form schema with Zod
3. Add conditional rendering in render method
4. Create Server Action for data persistence
5. Update progress calculation

### Change Password Requirements
Edit `passwordSchema` in `OnboardingWizard.tsx`:
```typescript
password: z.string()
  .min(12, 'Minimum 12 characters')  // Change minimum
  .regex(/[!@#$%]/, 'Must include special character')  // Add requirement
```

### Modify Districts
Edit `CZECH_DISTRICTS` in `lib/constants/districts.ts` to add/remove districts.

---

**Implementation Date**: December 2025  
**Phase**: 1.6 - Onboarding Wizard  
**Status**: ✅ Complete
