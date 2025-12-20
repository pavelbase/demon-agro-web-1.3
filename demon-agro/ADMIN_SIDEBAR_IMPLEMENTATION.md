# Admin Sidebar - Implementace ✅

## 📋 Přehled změn

Sidebar komponenta (`components/portal/Sidebar.tsx`) byla vylepšena pro lepší vizuální odlišení admin sekce.

---

## 🎯 Co bylo implementováno

### 1. ✅ Podmíněné zobrazení admin sekce

**Podmínka:** `{isAdmin && (...)}`

Admin sekce se zobrazuje **POUZE** když:
- Uživatel má v tabulce `profiles` nastavenou `role = 'admin'`
- Prop `isAdmin` je předáván z `app/portal/layout.tsx` (řádek 47)

```typescript
// Z app/portal/layout.tsx
const isAdmin = profile?.role === 'admin'
```

---

### 2. 🎨 Vizuální oddělení

#### A) Silnější horizontální čára
```tsx
<div className="my-4 border-t-2 border-gray-300" />
```

#### B) Hlavička s ikonou Shield
```tsx
<div className="flex items-center gap-2">
  <Shield className="h-4 w-4 text-red-600" />
  <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">
    Admin Zóna
  </h3>
</div>
```

---

### 3. 🔗 Admin navigační odkazy

Admin sekce obsahuje **8 odkazů**:

| Odkaz | URL | Ikona | Popis |
|-------|-----|-------|-------|
| **Přehled** | `/portal/admin` | `BarChart3` | Dashboard s statistikami |
| **Uživatelé** | `/portal/admin/uzivatele` | `Users` | Správa uživatelů |
| **Produkty hnojení** | `/portal/admin/produkty` | `Package` | Správa produktů hnojení |
| **Produkty vápnění** | `/portal/admin/produkty-vapneni` | `Package` | Správa produktů vápnění |
| **Poptávky** | `/portal/admin/poptavky` | `ClipboardList` | Správa poptávek |
| **Obrázky portálu** | `/portal/admin/obrazky-portalu` | `ImageIcon` | Správa obrázků |
| **Audit log** | `/portal/admin/audit-log` | `FileText` | Audit záznamy |
| **Statistiky** | `/portal/admin/statistiky` | `BarChart3` | Detailní statistiky |

---

### 4. 🎨 Barevné schéma

#### Běžná navigace (zelená)
- **Aktivní:** `bg-primary-green text-white`
- **Neaktivní:** `text-gray-700 hover:bg-gray-100`

#### Admin navigace (červená)
- **Aktivní:** `bg-red-600 text-white shadow-md`
- **Neaktivní:** `text-gray-700 hover:bg-red-50 hover:text-red-600`

Červená barva slouží jako **vizuální varování**, že uživatel pracuje s admin funkcemi.

---

## 🔒 Zabezpečení

Admin sekce má **3 úrovně zabezpečení**:

### 1. UI vrstva (Sidebar.tsx)
```tsx
{isAdmin && (
  // Admin sekce se nezobrazí běžným uživatelům
)}
```

### 2. Layout vrstva (app/portal/admin/layout.tsx)
```tsx
// Kontrola role v databázi
if (!profile || profile.role !== 'admin') {
  redirect('/portal/dashboard')
}
```

### 3. Middleware vrstva (middleware.ts)
```tsx
// Kontrola role v auth metadata
if (isAdminRoute && userRole !== 'admin') {
  return NextResponse.redirect(new URL('/portal/dashboard', request.url))
}
```

---

## 🧪 Testování

### Test 1: Běžný uživatel (role='user')
```
✅ Vidí pouze hlavní navigaci
✅ Admin Zóna je skrytá
✅ Pokus o přímý přístup na /portal/admin → redirect na /portal/dashboard
```

### Test 2: Admin uživatel (role='admin')
```
✅ Vidí hlavní navigaci
✅ Vidí Admin Zónu s oddělovačem a ikonou Shield
✅ Může přistupovat na všechny admin stránky
✅ Admin odkazy jsou červeně zvýrazněné
```

---

## 📝 SQL příkazy pro testování

### Nastavit uživatele jako admina

```sql
-- Metoda 1: Aktualizace v profiles tabulce
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'vas-email@example.com';

-- Metoda 2: Také aktualizovat v auth.users (pro middleware)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'vas-email@example.com';
```

### Vrátit uživatele zpět na běžnou roli

```sql
-- Vrátit na 'user'
UPDATE public.profiles
SET role = 'user'
WHERE email = 'vas-email@example.com';

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "user"}'::jsonb
WHERE email = 'vas-email@example.com';
```

### Zkontrolovat role všech uživatelů

```sql
SELECT 
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as meta_role,
  p.full_name,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY p.created_at DESC;
```

---

## 🔄 Tok ověření role

```
1. Uživatel se přihlásí
   ↓
2. app/portal/layout.tsx načte profil z DB
   ↓
3. Zkontroluje: profile?.role === 'admin'
   ↓
4. Předá prop isAdmin do PortalLayoutClient
   ↓
5. PortalLayoutClient předá isAdmin do Sidebar
   ↓
6. Sidebar zobrazí/skryje Admin Zónu
```

---

## 📁 Struktura souborů

```
demon-agro/
├── components/
│   └── portal/
│       └── Sidebar.tsx ← UPRAVENO ✅
├── app/
│   └── portal/
│       ├── layout.tsx ← Předává isAdmin prop
│       └── admin/
│           ├── layout.tsx ← Kontroluje roli
│           ├── page.tsx ← Dashboard
│           ├── uzivatele/
│           ├── produkty/
│           ├── produkty-vapneni/
│           ├── poptavky/
│           ├── obrazky-portalu/
│           ├── audit-log/
│           └── statistiky/
└── middleware.ts ← Kontroluje admin routy
```

---

## 🎉 Hotovo!

Admin sekce je nyní:
- ✅ Vizuálně odlišená (červená barva + Shield ikona)
- ✅ Zabezpečená na 3 úrovních
- ✅ Skrytá pro běžné uživatele
- ✅ Plně funkční pro admin uživatele

Pro zprovoznění stačí:
1. Spustit SQL příkaz výše (nastavit role='admin' v DB)
2. Obnovit stránku
3. Admin Zóna se automaticky zobrazí v sidebaru
