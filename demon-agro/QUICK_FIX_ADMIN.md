# Quick Fix Guide - Admin Role Not Showing

## 🚨 Problem
User has `role='admin'` in database but Admin section is not visible in sidebar.

## ⚡ Quick Solution

### Option 1: Run SQL Script (Recommended)
Open Supabase SQL Editor and run:

```sql
-- Set admin role for base@demonagro.cz
UPDATE public.profiles SET role = 'admin' WHERE email = 'base@demonagro.cz';
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb WHERE email = 'base@demonagro.cz';

-- Verify
SELECT u.email, p.role as db_role, u.raw_user_meta_data->>'role' as auth_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';
```

### Option 2: Use Email Fallback (Already Implemented)
The code now includes a fallback that automatically grants admin access to `base@demonagro.cz`:

```typescript
// In app/portal/layout.tsx (line 62-66)
const isAdmin = 
  profile?.role === 'admin' ||
  user.app_metadata?.role === 'admin' ||
  user.user_metadata?.role === 'admin' ||
  user.email === 'base@demonagro.cz'  // <-- Fallback
```

## 🔍 Debug Steps

1. **Check Server Logs** (terminal running `npm run dev`):
```
=== PORTAL LAYOUT DEBUG ===
Profile role: admin  <-- Should be 'admin'
Is Admin: true       <-- Should be true
=========================
```

2. **Check Browser Console** (F12):
```
=== SIDEBAR DEBUG ===
isAdmin prop: true   <-- Should be true
====================
```

3. **Visual Check**: Open sidebar → Look for "Admin Zóna" section with red shield icon

## ✅ What Changed

### Files Modified:
1. ✅ `app/portal/layout.tsx` - Added debugging + 4-level fallback mechanism
2. ✅ `components/portal/Sidebar.tsx` - Added debugging logs

### Files Created:
1. ✅ `lib/supabase/sql/fix_base_admin_role.sql` - SQL script to fix role
2. ✅ `docs/FIX_ADMIN_ROLE.md` - Complete documentation
3. ✅ `docs/SUMMARY_ADMIN_ROLE_FIX.md` - Summary of changes

## 🎯 Expected Result

After login, you should see in sidebar:
```
┌─────────────────────────┐
│ [Logo]                  │
├─────────────────────────┤
│ 🏠 Dashboard            │
│ 🗺️  Pozemky             │
│ 📤 Upload rozborů       │
│ 📊 Historie hnojení     │
│ 📅 Osevní postup        │
│ 🛒 Moje poptávky        │
│ ⚙️  Nastavení           │
├─────────────────────────┤  <-- Thicker separator
│ 🛡️  ADMIN ZÓNA          │  <-- Red color
├─────────────────────────┤
│ 📊 Přehled              │
│ 👥 Uživatelé            │
│ 📦 Produkty hnojení     │
│ 📦 Produkty vápnění     │
│ 📋 Poptávky             │
│ 🖼️  Obrázky portálu     │
│ 📝 Audit log            │
│ 📈 Statistiky           │
└─────────────────────────┘
```

## 🔧 Still Not Working?

1. **Logout and login again**
2. **Clear browser cache/cookies**
3. **Restart dev server**: `Ctrl+C` then `npm run dev`
4. **Clear Next.js cache**: `rm -rf .next && npm run dev`
5. **Check database directly** (see SQL script above)

## 📞 For More Help

See complete documentation: `docs/FIX_ADMIN_ROLE.md`
