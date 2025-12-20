# Portal Layout Implementation ✅

## 🎉 Implementováno

Kompletní layout systém pro portál s sidebar navigací, headerem a responzivním designem.

## 📦 Vytvořené soubory

### 1. Layout Components (4 soubory)

#### `app/portal/layout.tsx`
**Server Component - Layout wrapper**
- Načte aktuálního uživatele
- Pro nepřihlášené: minimální layout (pouze children)
- Pro přihlášené: načte profil a render client layout
- Kontrola admin role

#### `components/portal/PortalLayoutClient.tsx`
**Client Component - Main layout orchestrator**
- Spravuje sidebar state (open/close)
- Page title mapping
- Responsive layout (desktop + mobile)
- Mobile overlay backdrop

#### `components/portal/Sidebar.tsx`
**Sidebar navigation**
- Logo Démon Agro
- Navigační menu s ikonami
- Admin sekce (conditional)
- Logout tlačítko
- Active state highlighting
- Mobile close button

#### `components/portal/Header.tsx`
**Top header bar**
- Mobile hamburger menu
- Page title
- Company name
- User info (jméno, email)
- Avatar s iniciály

### 2. Updated Pages

#### `app/portal/dashboard/page.tsx`
**Dashboard placeholder**
- Uvítací zpráva
- Quick stats (4 karty)
- Quick actions (3 tlačítka)
- Responsive grid

## 🎨 Design Struktura

### Layout Hierarchy

```
┌─────────────────────────────────────────────┐
│ app/portal/layout.tsx (Server)             │
│ ├─ No user? → children only                │
│ └─ Has user? → PortalLayoutClient          │
│    ├─ Sidebar (desktop)                    │
│    ├─ Sidebar (mobile overlay)             │
│    └─ Main Content                         │
│       ├─ Header                            │
│       └─ Page Content                      │
└─────────────────────────────────────────────┘
```

### Desktop Layout (≥1024px)

```
┌───────────────────────────────────────────────────┐
│ ┌────────┬────────────────────────────────────┐  │
│ │        │ Header                             │  │
│ │        │ [Page Title]      [User Info] [A] │  │
│ │        ├────────────────────────────────────┤  │
│ │ Side-  │                                    │  │
│ │ bar    │                                    │  │
│ │        │        Page Content                │  │
│ │ [Logo] │                                    │  │
│ │        │                                    │  │
│ │ • Home │                                    │  │
│ │ • Map  │                                    │  │
│ │ ...    │                                    │  │
│ │        │                                    │  │
│ │ ─────  │                                    │  │
│ │ Admin  │                                    │  │
│ │ ─────  │                                    │  │
│ │        │                                    │  │
│ │ Logout │                                    │  │
│ └────────┴────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

### Mobile Layout (<1024px)

```
Closed Sidebar:
┌────────────────────────────┐
│ [☰] Page Title      [A]   │ ← Header
├────────────────────────────┤
│                            │
│      Page Content          │
│                            │
│                            │
└────────────────────────────┘

Open Sidebar (overlay):
┌────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Backdrop
│ ▓▓┌───────────┐▓▓▓▓▓▓▓▓▓ │
│ ▓▓│ [Logo] [X]│▓▓▓▓▓▓▓▓▓ │
│ ▓▓├───────────┤▓▓▓▓▓▓▓▓▓ │
│ ▓▓│ • Home    │▓▓▓▓▓▓▓▓▓ │
│ ▓▓│ • Map     │▓▓▓▓▓▓▓▓▓ │
│ ▓▓│ ...       │▓▓▓▓▓▓▓▓▓ │
│ ▓▓│ Logout    │▓▓▓▓▓▓▓▓▓ │
│ ▓▓└───────────┘▓▓▓▓▓▓▓▓▓ │
└────────────────────────────┘
```

## 🧭 Navigace

### Main Navigation Items

| Icon | Label | Route | Popis |
|------|-------|-------|-------|
| 🏠 Home | Dashboard | `/portal/dashboard` | Přehled |
| 🗺️ Map | Pozemky | `/portal/pozemky` | Seznam pozemků |
| ⬆️ Upload | Upload rozborů | `/portal/upload` | Nahrát PDF |
| 📊 History | Historie hnojení | `/portal/historie-hnojeni` | Historie |
| 📅 Calendar | Osevní postup | `/portal/osevni-postup` | Plodiny |
| 🛒 ShoppingCart | Moje poptávky | `/portal/poptavky` | Poptávky |
| ⚙️ Settings | Nastavení | `/portal/nastaveni` | Profil |

### Admin Navigation Items (pouze admin)

| Icon | Label | Route | Popis |
|------|-------|-------|-------|
| 📊 BarChart3 | Přehled | `/portal/admin` | Admin dashboard |
| 👥 Users | Uživatelé | `/portal/admin/uzivatele` | Správa users |
| 📦 Package | Produkty hnojení | `/portal/admin/produkty` | Hnojiva |
| 📦 Package | Produkty vápnění | `/portal/admin/produkty-vapneni` | Vápno |
| 📋 ClipboardList | Poptávky | `/portal/admin/poptavky` | Všechny |
| 🖼️ Image | Obrázky portálu | `/portal/admin/obrazky-portalu` | Média |
| 📄 FileText | Audit log | `/portal/admin/audit-log` | Logy |
| 📈 BarChart3 | Statistiky | `/portal/admin/statistiky` | Stats |

## 🎯 Features

### Active State Highlighting

**Main navigation:**
- Active: `bg-primary-green text-white`
- Hover: `hover:bg-gray-100`

**Admin navigation:**
- Active: `bg-primary-brown text-white`
- Hover: `hover:bg-gray-100`

### Avatar Initials

```typescript
// Logic:
1. If full_name exists: take first letter of each word
   "Jan Novák" → "JN"
2. If only email: take first 2 chars
   "user@test.cz" → "US"
3. Always uppercase, max 2 letters
```

### Page Title Mapping

```typescript
const pageTitles = {
  '/portal/dashboard': 'Dashboard',
  '/portal/pozemky': 'Moje pozemky',
  '/portal/upload': 'Upload rozborů půdy',
  // ... atd
}

// Fallback for dynamic routes:
// /portal/pozemky/123 → uses parent '/portal/pozemky'
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 1024px` | Sidebar hidden, hamburger button visible |
| `≥ 1024px` | Sidebar always visible, hamburger hidden |

### Mobile Sidebar

**States:**
1. **Closed** (default)
   - Sidebar off-screen
   - Hamburger visible

2. **Open**
   - Sidebar slides in from left
   - Dark backdrop overlay
   - Click backdrop → close
   - Click X button → close
   - Click nav link → close

## 📱 Responsive Breakpoints

```css
/* Mobile: < 768px */
- Single column layout
- Hamburger menu
- Avatar only (no text)
- Compact header

/* Tablet: 768px - 1023px */
- Still uses hamburger
- User info hidden

/* Desktop: ≥ 1024px */
- Sidebar visible
- Full user info
- Max width: 7xl (80rem)
```

## 🎨 Styling

### Colors (Brand)

```typescript
// From tailwind.config.ts
primary: {
  brown: '#5C4033',   // Admin items, dark
  beige: '#C9A77C',   // Accent
  cream: '#F5F1E8',   // Background, hover
  green: '#4A7C59',   // Main items, active
}

// Additional
bg-gray-50   // Page background
bg-white     // Cards, sidebar, header
border-gray-200  // Borders
```

### Spacing

```
Sidebar:
- Width: 16rem (256px)
- Padding: 1rem (16px)
- Logo padding: 1.5rem (24px)

Header:
- Height: auto
- Padding: 1rem lg:2rem

Main Content:
- Max width: 7xl (80rem)
- Padding: 1rem lg:2rem
```

## 🔐 Auth Logic

### Layout Rendering Logic

```typescript
// In app/portal/layout.tsx (Server)

const user = await getCurrentUser()

if (!user) {
  // Nepřihlášený → minimal layout
  return <>{children}</>
}

// Přihlášený → fetch profile
const profile = await fetchProfile(user.id)
const isAdmin = profile?.role === 'admin'

// Render full layout
return <PortalLayoutClient user={...} isAdmin={isAdmin}>
  {children}
</PortalLayoutClient>
```

### Conditional Rendering

**Admin sekce:**
```typescript
{isAdmin && (
  <>
    <Separator />
    <AdminNavigation />
  </>
)}
```

## 📋 Page Title Examples

| URL | Title |
|-----|-------|
| `/portal/dashboard` | Dashboard |
| `/portal/pozemky` | Moje pozemky |
| `/portal/pozemky/123` | Moje pozemky (fallback) |
| `/portal/admin` | Administrace |
| `/portal/admin/uzivatele` | Správa uživatelů |
| `/portal/admin/uzivatele/456` | Správa uživatelů (fallback) |

## 🧪 Testing Checklist

### Desktop Tests
- [ ] Sidebar je viditelný
- [ ] Logo je klikací → /portal/dashboard
- [ ] Navigační položky fungují
- [ ] Active state se zobrazuje správně
- [ ] Admin sekce se zobrazuje pouze pro adminy
- [ ] Logout tlačítko funguje
- [ ] Header zobrazuje správný title
- [ ] User info se zobrazuje
- [ ] Avatar zobrazuje správné iniciály
- [ ] Company name se zobrazuje (pokud existuje)

### Mobile Tests
- [ ] Sidebar je skrytý defaultně
- [ ] Hamburger menu je viditelné
- [ ] Klik na hamburger → sidebar se otevře
- [ ] Backdrop se zobrazí
- [ ] Klik na backdrop → sidebar se zavře
- [ ] Klik na X → sidebar se zavře
- [ ] Klik na nav link → sidebar se zavře
- [ ] Header je responzivní
- [ ] User info je skrytý na mobilech

### Auth Tests
- [ ] Nepřihlášený user → minimal layout
- [ ] Přihlášený user → full layout
- [ ] Regular user → žádná admin sekce
- [ ] Admin user → admin sekce visible
- [ ] Logout → redirect na login

### Navigation Tests
- [ ] Všechny main nav linky fungují
- [ ] Všechny admin nav linky fungují (admin)
- [ ] Active highlighting funguje
- [ ] Hover states fungují
- [ ] Mobile nav close after click

## 💡 Usage Examples

### Adding New Page

1. **Add to page titles:**
```typescript
// In PortalLayoutClient.tsx
const pageTitles = {
  // ... existing
  '/portal/new-page': 'Nová stránka',
}
```

2. **Add to navigation (optional):**
```typescript
// In Sidebar.tsx
const mainNavItems = [
  // ... existing
  { href: '/portal/new-page', label: 'Nová stránka', icon: IconName },
]
```

3. **Create page:**
```typescript
// app/portal/new-page/page.tsx
import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function NewPage() {
  const user = await requireAuth()
  return <div>Nová stránka</div>
}
```

### Custom Page Title (dynamic)

```typescript
// In your page component
export const metadata = {
  title: 'Custom Title',
}

// Or use dynamic title in PortalLayoutClient
// by passing it via searchParams or context
```

## 🚀 Performance

### Optimizations

1. **Server Components**
   - Layout je Server Component
   - Fetch data na serveru
   - No client-side fetch for auth

2. **Client Components**
   - Pouze interaktivní části (sidebar toggle, nav)
   - Minimal JavaScript

3. **Image Optimization**
   - Next.js Image component pro logo
   - Lazy loading

## 📝 Components API

### Sidebar Props

```typescript
interface SidebarProps {
  isAdmin: boolean      // Show admin section
  onClose?: () => void  // Close callback (mobile)
  isMobile?: boolean    // Show close button
}
```

### Header Props

```typescript
interface HeaderProps {
  user: {
    email: string
    profile: Profile | null
  }
  pageTitle: string
  onMenuClick: () => void  // Open mobile sidebar
}
```

### PortalLayoutClient Props

```typescript
interface PortalLayoutClientProps {
  user: {
    email: string
    profile: Profile | null
  }
  isAdmin: boolean
  children: React.ReactNode
}
```

## ✅ Status

| Feature | Status | Testing |
|---------|--------|---------|
| Server Layout | ✅ Done | ⏳ Pending |
| Client Layout | ✅ Done | ⏳ Pending |
| Sidebar Navigation | ✅ Done | ⏳ Pending |
| Header | ✅ Done | ⏳ Pending |
| Mobile Responsive | ✅ Done | ⏳ Pending |
| Active States | ✅ Done | ⏳ Pending |
| Admin Conditional | ✅ Done | ⏳ Pending |
| Logout | ✅ Done | ⏳ Pending |
| Dashboard Placeholder | ✅ Done | ⏳ Pending |

## 🎯 Next Steps

1. ⏳ Test desktop layout
2. ⏳ Test mobile layout
3. ⏳ Test admin visibility
4. ⏳ Implement individual pages
5. ⏳ Add breadcrumbs (optional)
6. ⏳ Add notifications icon (optional)

---

**Status**: ✅ Plně implementováno a ready for testing  
**Components**: 4 main + 1 updated page  
**Features**: Sidebar, Header, Mobile hamburger, Active states, Admin conditional  
**Design**: Brand colors, Lucide icons, Responsive
