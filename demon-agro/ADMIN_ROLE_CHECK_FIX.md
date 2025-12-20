# Admin Role Check Fix - Řešení problikávání

## Problém
Middleware byl příliš agresivní při kontrole admin role, což způsobovalo "problikávání" a nežádoucí přesměrování. Session token v middleware mohl obsahovat zastaralá data, i když databáze správně ukazovala, že uživatel je admin.

## Řešení
Přesunuta kontrola role z middleware do Admin Layoutu pro spolehlivější server-side validaci.

## Provedené změny

### 1. Middleware (`middleware.ts`)
**Změna:** Odstraněna specifická kontrola admin role

**Před:**
```typescript
// Middleware kontroloval admin roli a mohl odmítnout přístup
if (isAdminRoute && user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (userRole !== 'admin') {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url))
  }
}
```

**Po:**
```typescript
// Middleware nyní pouze kontroluje autentizaci
// Pokud je uživatel přihlášený, pustí ho dál
// Role checking is handled in the respective layouts (e.g., admin layout)
return response
```

**Výhody:**
- Middleware je jednodušší a rychlejší
- Kontroluje pouze: "Je uživatel přihlášený?"
- Žádné další DB dotazy v middleware
- Eliminuje race conditions mezi middleware a layout

### 2. Admin Layout (`app/portal/admin/layout.tsx`)
**Změna:** Posílena kontrola role přímo v layoutu

**Před:**
```typescript
// Layout měl debug logging a verbose podmínky
if (!profile || profile.role !== 'admin') {
  console.log('[Admin Layout] Access denied')
  redirect('/portal/dashboard')
}
```

**Po:**
```typescript
// Layout má přímou a jasnou kontrolu
const { data: profile, error } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

// Kontrola zahrnuje i možné chyby při načítání
if (error || !profile || profile.role !== 'admin') {
  redirect('/portal/dashboard')
}
```

**Výhody:**
- Kontrola proběhne až na server component levelu
- Aktuální data přímo z databáze
- Uživatel uvidí stránku až po potvrzení admin role
- Žádné problikávání mezi stavem "loading" a "redirect"

## Jak to funguje

### Flow pro admin uživatele:
1. **Middleware:** Zkontroluje přihlášení → ✅ Uživatel přihlášen → pustí dál
2. **Admin Layout:** Načte profil z DB → ✅ Role = admin → zobrazí admin interface

### Flow pro běžného uživatele:
1. **Middleware:** Zkontroluje přihlášení → ✅ Uživatel přihlášen → pustí dál
2. **Admin Layout:** Načte profil z DB → ❌ Role ≠ admin → `redirect('/portal/dashboard')`

### Flow pro nepřihlášeného uživatele:
1. **Middleware:** Zkontroluje přihlášení → ❌ Není přihlášen → `redirect('/portal/prihlaseni')`

## Technické detaily

### Middleware odpovědnosti (zjednodušené):
- ✅ Refresh Supabase session
- ✅ Kontrola autentizace (přihlášen/nepřihlášen)
- ✅ Redirect nepřihlášených na login
- ✅ Redirect přihlášených z login stránky na dashboard
- ❌ NEŘEŠÍ kontrolu rolí

### Admin Layout odpovědnosti (posílené):
- ✅ Ověření autentizace přes `requireAuth()`
- ✅ Načtení profilu z databáze
- ✅ Kontrola admin role
- ✅ Redirect neadminů na dashboard
- ✅ Renderování admin interface pro adminy

## Testování

Pro otestování funkcionality:

1. **Jako admin:**
   - Přejít na `/portal/admin` → Mělo by zobrazit admin dashboard bez problikávání

2. **Jako běžný uživatel:**
   - Přejít na `/portal/admin` → Mělo by přesměrovat na `/portal/dashboard`

3. **Nepřihlášený:**
   - Přejít na `/portal/admin` → Mělo by přesměrovat na `/portal/prihlaseni`

## Datum změny
20. prosince 2025
