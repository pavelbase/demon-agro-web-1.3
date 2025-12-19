# Middleware Test Examples

Test scenarios for route protection middleware.

## Test Setup

1. Start dev server:
```bash
npm run dev
```

2. Open browser to http://localhost:3000

## Test Scenarios

### ✅ Scenario 1: Public Routes (No Auth Required)

**Test 1.1: Portal landing page**
```
URL: http://localhost:3000/portal
Expected: Shows landing page (200 OK)
Auth: Not required
```

**Test 1.2: Login page**
```
URL: http://localhost:3000/portal/prihlaseni
Expected: Shows login form (200 OK)
Auth: Not required
```

**Test 1.3: Reset password page**
```
URL: http://localhost:3000/portal/reset-hesla
Expected: Shows reset password form (200 OK)
Auth: Not required
```

### 🔒 Scenario 2: Protected Routes (Auth Required)

**Test 2.1: Dashboard without auth**
```
URL: http://localhost:3000/portal/dashboard
Expected: Redirects to /portal/prihlaseni?redirect=/portal/dashboard
Auth: Not logged in
```

**Test 2.2: Pozemky without auth**
```
URL: http://localhost:3000/portal/pozemky
Expected: Redirects to /portal/prihlaseni?redirect=/portal/pozemky
Auth: Not logged in
```

**Test 2.3: Dashboard with auth**
```
URL: http://localhost:3000/portal/dashboard
Expected: Shows dashboard (200 OK)
Auth: Logged in as regular user
```

### 👑 Scenario 3: Admin Routes (Admin Role Required)

**Test 3.1: Admin page without auth**
```
URL: http://localhost:3000/portal/admin
Expected: Redirects to /portal/prihlaseni?redirect=/portal/admin
Auth: Not logged in
```

**Test 3.2: Admin page as regular user**
```
URL: http://localhost:3000/portal/admin
Expected: Redirects to /portal/dashboard
Auth: Logged in as regular user (role: user)
```

**Test 3.3: Admin page as admin**
```
URL: http://localhost:3000/portal/admin
Expected: Shows admin dashboard (200 OK)
Auth: Logged in as admin (role: admin)
```

**Test 3.4: Admin users page as regular user**
```
URL: http://localhost:3000/portal/admin/uzivatele
Expected: Redirects to /portal/dashboard
Auth: Logged in as regular user
```

### 🔄 Scenario 4: Redirect After Login

**Test 4.1: Already logged in user visits login**
```
URL: http://localhost:3000/portal/prihlaseni
Expected: Redirects to /portal/dashboard
Auth: Already logged in
```

**Test 4.2: Login with redirect parameter**
```
1. Visit: http://localhost:3000/portal/pozemky (not logged in)
2. Redirects to: /portal/prihlaseni?redirect=/portal/pozemky
3. Login successfully
4. Expected: Redirects to /portal/pozemky
```

## Manual Testing Steps

### Setup Test Users

1. **Create regular user**:
```bash
# In your app, use admin client
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()
await supabase.auth.admin.createUser({
  email: 'user@test.com',
  password: 'testuser123',
  email_confirm: true,
  user_metadata: {
    role: 'user',
    full_name: 'Test User'
  }
})
```

2. **Create admin user**:
```bash
# In Supabase SQL Editor or via admin client
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@demonagro.cz';
```

### Testing Flow

1. **Test public access** (incognito/private window):
   - Visit /portal → ✅ Should work
   - Visit /portal/prihlaseni → ✅ Should work
   - Visit /portal/dashboard → ❌ Should redirect to login

2. **Test regular user access**:
   - Login as user@test.com
   - Visit /portal/dashboard → ✅ Should work
   - Visit /portal/pozemky → ✅ Should work
   - Visit /portal/admin → ❌ Should redirect to dashboard

3. **Test admin access**:
   - Login as admin@demonagro.cz
   - Visit /portal/dashboard → ✅ Should work
   - Visit /portal/admin → ✅ Should work
   - Visit /portal/admin/uzivatele → ✅ Should work

## Automated Testing (Optional)

Create test file `__tests__/middleware.test.ts`:

```typescript
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

describe('Middleware', () => {
  it('allows public routes', async () => {
    const req = new NextRequest('http://localhost:3000/portal')
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })

  it('redirects unauthenticated users', async () => {
    const req = new NextRequest('http://localhost:3000/portal/dashboard')
    const res = await middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/portal/prihlaseni')
  })

  // Add more tests...
})
```

## Browser Console Testing

Open browser console and check:

```javascript
// Check current user
const { data } = await supabase.auth.getUser()
console.log('User:', data.user)
console.log('Role:', data.user?.user_metadata?.role)

// Check session
const { data: session } = await supabase.auth.getSession()
console.log('Session:', session)
```

## Expected Behavior Summary

| Route | No Auth | User Auth | Admin Auth |
|-------|---------|-----------|------------|
| `/portal` | ✅ Show | ✅ Show | ✅ Show |
| `/portal/prihlaseni` | ✅ Show | → Dashboard | → Dashboard |
| `/portal/dashboard` | → Login | ✅ Show | ✅ Show |
| `/portal/pozemky` | → Login | ✅ Show | ✅ Show |
| `/portal/admin` | → Login | → Dashboard | ✅ Show |
| `/portal/admin/*` | → Login | → Dashboard | ✅ Show |

## Troubleshooting

### Issue: Middleware not running
- Check that `middleware.ts` is in root directory
- Check matcher config: `matcher: ['/portal/:path*']`
- Restart dev server

### Issue: Always redirects to login
- Check `.env.local` has correct Supabase credentials
- Check session is being created properly
- Open browser DevTools → Application → Cookies
- Should see Supabase auth cookies

### Issue: Admin check not working
- Verify user has `role: 'admin'` in user_metadata
- Run SQL query to check:
  ```sql
  SELECT email, raw_user_meta_data->>'role' as role
  FROM auth.users
  WHERE email = 'your-email@example.com';
  ```

### Issue: Redirect loop
- Check public routes array includes correct paths
- Make sure login page is in public routes
- Clear browser cookies and try again
