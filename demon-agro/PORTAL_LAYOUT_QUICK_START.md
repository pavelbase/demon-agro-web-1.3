# Portal Layout - Quick Start Guide 🚀

Rychlý průvodce pro testování a použití portal layoutu.

## ⚡ Quick Test (5 minut)

### 1. Příprava

```bash
# Ujisti se, že máš:
✓ SQL migrace spuštěny (profiles table)
✓ Test uživatele (user@test.cz / testuser123)
✓ Admin uživatele (admin@test.cz / admin123)
✓ Dev server běží: npm run dev
```

### 2. Test Desktop Layout

**A. Přihlášení jako běžný uživatel:**
```
1. Go to: http://localhost:3000/portal/prihlaseni
2. Login: user@test.cz / testuser123
3. Mělo by redirectnout na: /portal/dashboard

Očekávaný výsledek:
✓ Sidebar vlevo (viditelný)
✓ Logo Démon Agro nahoře v sidebar
✓ 7 navigačních položek (Dashboard → Nastavení)
✓ Logout tlačítko dole
✗ ŽÁDNÁ admin sekce

✓ Header nahoře
✓ Page title: "Dashboard"
✓ Avatar vpravo (iniciály)
✓ User info: jméno + email

✓ Dashboard obsah:
  - "Vítejte zpět! 👋"
  - 4 statistiky karty
  - 3 quick action karty
```

**B. Test navigace:**
```
Klikni postupně na:
1. Pozemky → URL: /portal/pozemky, Title: "Moje pozemky"
2. Upload → URL: /portal/upload, Title: "Upload rozborů půdy"
3. Historie hnojení → URL změněno, Title změněn
4. Dashboard → zpět na hlavní

Očekávané:
✓ Active item má zelenou barvu (bg-primary-green)
✓ Hover efekt na ostatních (hover:bg-gray-100)
✓ Ikony se zobrazují správně
```

**C. Přihlášení jako admin:**
```
1. Klik "Odhlásit se" v sidebar
2. Login: admin@test.cz / admin123
3. Dashboard se zobrazí

Nově viditelné:
✓ Oddělovač (border-t)
✓ "ADMINISTRACE" label
✓ 8 admin položek (Přehled → Statistiky)
✓ Admin items mají hnědou barvu když active (bg-primary-brown)
```

### 3. Test Mobile Layout

**A. Resize browser na < 1024px:**
```
Nebo otevři DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)

Očekávané:
✓ Sidebar je skrytý
✓ Hamburger menu (☰) je viditelný vlevo nahoře
✓ Page title je zkrácený
✓ User info je skrytý (pouze avatar)
```

**B. Test hamburger menu:**
```
1. Klik na hamburger (☰)
   ✓ Sidebar slides in zleva
   ✓ Dark backdrop se zobrazí
   ✓ X button nahoře vpravo v sidebaru

2. Klik na backdrop (mimo sidebar)
   ✓ Sidebar se zavře
   ✓ Backdrop zmizí

3. Otevři znovu, klik na X button
   ✓ Sidebar se zavře

4. Otevři znovu, klik na navigační item
   ✓ Sidebar se zavře
   ✓ Page se změní
```

## 📱 Visual Checklist

### Desktop (≥1024px)

```
┌────────────────────────────────────────┐
│ ┌──────┬───────────────────────────┐  │
│ │ Logo │ Dashboard    User Info [A]│  │ ← Header
│ │──────┼───────────────────────────┤  │
│ │      │                           │  │
│ │ •    │   Page Content            │  │
│ │ •    │                           │  │
│ │ •    │   - Cards                 │  │
│ │ ...  │   - Stats                 │  │
│ │      │   - Actions               │  │
│ │──────│                           │  │
│ │Admin │                           │  │
│ │──────│                           │  │
│ │Logout│                           │  │
│ └──────┴───────────────────────────┘  │
└────────────────────────────────────────┘

Checklist:
□ Sidebar width: 256px (16rem)
□ Sidebar bg: white
□ Active item: green
□ Header sticky: yes
□ Max-width: 80rem (7xl)
□ Padding: responsive
```

### Mobile (<1024px)

```
Closed:
┌────────────────────────┐
│ [☰] Title        [A]  │ ← Header
├────────────────────────┤
│                        │
│   Page Content         │
│   (full width)         │
│                        │
└────────────────────────┘

Open:
┌────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Backdrop
│ ▓▓┌─────────┐▓▓▓▓▓▓▓▓ │
│ ▓▓│Logo  [X]│▓▓▓▓▓▓▓▓ │
│ ▓▓│•        │▓▓▓▓▓▓▓▓ │
│ ▓▓│•        │▓▓▓▓▓▓▓▓ │
│ ▓▓│Logout   │▓▓▓▓▓▓▓▓ │
│ ▓▓└─────────┘▓▓▓▓▓▓▓▓ │
└────────────────────────┘

Checklist:
□ Sidebar: fixed position
□ Sidebar: z-index 50
□ Backdrop: z-index 40
□ Backdrop: black opacity-50
□ Click backdrop → close
□ Click X → close
□ Click nav → close
```

## 🧪 Complete Test Flow

### Test 1: Regular User Journey

```
1. Open: http://localhost:3000/portal/prihlaseni
   ✓ Clean layout (no sidebar, no header)

2. Login: user@test.cz / testuser123
   ✓ Redirect to dashboard
   ✓ Full layout appears
   ✓ Sidebar visible (desktop)
   ✓ Header shows "Dashboard"
   ✓ Avatar shows "US" or initials

3. Navigate to Pozemky:
   ✓ URL changes to /portal/pozemky
   ✓ Header title: "Moje pozemky"
   ✓ Sidebar active: Pozemky (green)
   ✓ Content area shows "Pozemky" placeholder

4. Navigate to Nastavení:
   ✓ URL: /portal/nastaveni
   ✓ Title: "Nastavení"
   ✓ Active state moves

5. Click Logout:
   ✓ Redirects to /portal/prihlaseni
   ✓ Layout changes to minimal (no sidebar)
```

### Test 2: Admin User Journey

```
1. Login: admin@test.cz / admin123
   ✓ Dashboard loads

2. Check sidebar:
   ✓ 7 main nav items
   ✓ Separator line
   ✓ "ADMINISTRACE" label
   ✓ 8 admin nav items
   ✓ Logout at bottom

3. Navigate to admin pages:
   a) /portal/admin
      ✓ Title: "Administrace"
      ✓ Active: brown color (bg-primary-brown)
   
   b) /portal/admin/uzivatele
      ✓ Title: "Správa uživatelů"
      ✓ Active: brown
   
   c) Back to /portal/dashboard
      ✓ Title: "Dashboard"
      ✓ Active: green (main nav)
```

### Test 3: Responsive Behavior

```
Desktop (>1024px):
1. Sidebar always visible
2. No hamburger button
3. Full user info in header
4. Wide layout

Tablet (768px - 1023px):
1. Hamburger appears
2. Sidebar hidden by default
3. User info hidden
4. Narrower content

Mobile (<768px):
1. Hamburger visible
2. Sidebar overlay
3. Only avatar in header
4. Single column content
5. Touch-friendly sizes
```

## 🎨 Style Verification

### Colors

```typescript
// Check in browser DevTools:

Active Main Item:
  bg: #4A7C59 (primary-green)
  text: #FFFFFF (white)

Active Admin Item:
  bg: #5C4033 (primary-brown)
  text: #FFFFFF (white)

Hover:
  bg: #F3F4F6 (gray-100)

Avatar:
  bg: #4A7C59 (primary-green)
  text: #FFFFFF (white)

Page Background:
  bg: #F9FAFB (gray-50)
```

### Spacing

```css
Sidebar width: 256px (16rem)
Header height: auto (content-based)
Main padding: 32px (2rem on desktop)
Card gap: 24px (1.5rem)
```

## 🔧 Troubleshooting

### Issue: Sidebar nezobrazuje ikony

**Check:**
1. Jsou Lucide React ikony nainstalovány?
```bash
npm list lucide-react
# Mělo by zobrazit verzi
```

2. Importují se správně?
```typescript
import { Home, Map } from 'lucide-react'
```

### Issue: Active state nefunguje

**Check pathname:**
```typescript
// V komponentě přidej:
console.log('Current pathname:', pathname)
console.log('Checking href:', href)
console.log('Is active:', isActive(href))
```

**Očekávané:**
- `/portal/dashboard` active pouze když pathname === `/portal/dashboard`
- `/portal/pozemky` active když pathname starts with `/portal/pozemky`

### Issue: Admin sekce není viditelná

**Check profile role:**
```sql
-- V Supabase SQL Editor:
SELECT email, role FROM public.profiles WHERE email = 'admin@test.cz';
-- Mělo by vrátit role = 'admin'
```

**Check in browser:**
```typescript
// DevTools Console:
// Layout by měl passar isAdmin prop
```

### Issue: Mobile sidebar se neotevírá

**Check state:**
```typescript
// V PortalLayoutClient přidej:
console.log('Sidebar open:', sidebarOpen)
```

**Check z-index:**
- Backdrop: z-40
- Sidebar: z-50
- Nic jiného by nemělo mít vyšší z-index

### Issue: Logout nefunguje

**Check server action:**
```typescript
// lib/actions/auth.ts
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/portal/prihlaseni')
}
```

## 📋 Component Props Quick Ref

### Sidebar
```typescript
<Sidebar
  isAdmin={true}        // Show admin section
  onClose={() => {}}    // Close callback (mobile)
  isMobile={true}       // Show X button
/>
```

### Header
```typescript
<Header
  user={{
    email: 'user@test.cz',
    profile: { full_name: 'Jan Novák', company_name: 'Firma' }
  }}
  pageTitle="Dashboard"
  onMenuClick={() => {}}  // Open mobile menu
/>
```

## 🎯 Expected Behavior Summary

| Action | Desktop | Mobile |
|--------|---------|--------|
| Open /portal/prihlaseni | Clean layout | Clean layout |
| Login success | Show sidebar | Hide sidebar |
| Click hamburger | N/A | Open sidebar |
| Click nav item | Change page | Close sidebar + change |
| Click logout | Redirect login | Redirect login |
| Resize < 1024px | Hide sidebar | N/A |
| Resize > 1024px | Show sidebar | N/A |

## ✅ Final Checklist

### Desktop
- [ ] Sidebar visible
- [ ] Logo clickable
- [ ] All nav items work
- [ ] Active state correct
- [ ] Admin section (admin only)
- [ ] Logout works
- [ ] Header shows title
- [ ] User info visible
- [ ] Avatar shows initials
- [ ] Company name (if exists)

### Mobile
- [ ] Sidebar hidden
- [ ] Hamburger visible
- [ ] Hamburger opens sidebar
- [ ] Backdrop appears
- [ ] Click backdrop closes
- [ ] Click X closes
- [ ] Click nav closes
- [ ] Header compact
- [ ] Avatar only

### Auth
- [ ] Unpublished → minimal layout
- [ ] Logged in → full layout
- [ ] Regular user → no admin section
- [ ] Admin user → admin section visible

### Responsive
- [ ] Desktop: sidebar always visible
- [ ] Tablet: hamburger menu
- [ ] Mobile: overlay sidebar
- [ ] Breakpoints work
- [ ] Content responsive

---

**Test Time**: ~10 minut pro complete test  
**Quick Test**: ~3 minuty pro basic flow  
**Status**: ✅ Ready for testing  
**URL**: http://localhost:3000/portal/dashboard (after login)
