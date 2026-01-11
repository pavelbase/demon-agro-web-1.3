# 🔧 EmailJS - Oprava pro client-side volání

**Datum:** 6. ledna 2026  
**Problém:** EmailJS blokoval volání ze serveru (API routes)  
**Řešení:** Přesunuto na client-side (browser)

---

## ❌ Původní problém

EmailJS API vrací chybu při volání ze serveru:
```
Error: EmailJS error: Forbidden - API calls are disabled for non-browser applications
```

**Důvod:** EmailJS je primárně určeno pro použití z browseru, ne ze server-side kódu.

---

## ✅ Řešení

### 1. **Vytvořen nový modul pro client-side emaily**

**Soubor:** `lib/utils/email-client.ts`

Obsahuje funkce:
- `sendWelcomeEmailClient()` - Odeslání welcome emailu
- `sendPasswordResetEmailClient()` - Odeslání reset emailu

**Klíčové vlastnosti:**
- Používá `@emailjs/browser` package
- Volá se z React komponent (client-side)
- Má přístup k `window.location.origin`

### 2. **Upraveny API endpointy**

#### `/api/admin/users/create`
**Změna:** Místo odesílání emailu vrací data pro client:
```typescript
return NextResponse.json({
  success: true,
  userId: authData.user.id,
  email,
  displayName: company_name,
  temporaryPassword: password,
  message: 'Uživatel byl vytvořen',
})
```

#### `/api/admin/users/reset-password`
**Změna:** Vrací data pro client-side email:
```typescript
return NextResponse.json({
  success: true,
  message: 'Heslo bylo resetováno',
  email: targetUser.email,
  displayName,
  temporaryPassword: newPassword,
})
```

### 3. **Upraveny React komponenty**

#### `CreateUserModal.tsx`
Po úspěšném vytvoření uživatele:
1. Zavolá API endpoint (vytvoří uživatele)
2. **Z browseru** zavolá `sendWelcomeEmailClient()`
3. Pokud email selže, zobrazí heslo v alertu

#### `UsersTable.tsx` (Reset hesla)
Po úspěšném resetu hesla:
1. Zavolá API endpoint (resetuje heslo)
2. **Z browseru** zavolá `sendPasswordResetEmailClient()`
3. Pokud email selže, zobrazí heslo v alertu

---

## 📋 Výhody tohoto řešení

✅ **Funguje s EmailJS** - Volání z browseru je podporováno  
✅ **Bezpečné** - Heslo se vrací pouze přes HTTPS  
✅ **Fallback** - Pokud email selže, admin vidí heslo  
✅ **Audit log** - Stále se loguje na serveru  
✅ **Uživatelsky přívětivé** - Jasné hlášky o úspěchu/chybě

---

## 🔒 Bezpečnostní poznámky

### Je bezpečné posílat heslo do browseru?

**Ano, za těchto podmínek:**

1. ✅ **HTTPS** - Komunikace je šifrovaná
2. ✅ **Admin only** - Pouze admin má přístup k těmto endpointům
3. ✅ **Okamžité odeslání** - Heslo se ihned pošle emailem a nezůstává v browseru
4. ✅ **Dočasné** - Heslo je zobrazeno pouze v případě selhání emailu
5. ✅ **Auth check** - API endpoint kontroluje admin roli

### Co se stalo se server-side emailem?

**Původní soubor:** `lib/utils/email.ts`  
**Status:** Stále existuje, ale není používán pro Welcome a Reset emaily

**Použití:** Pouze pro liming request notifikace (admin notifikace), které se posílají z API route, ne z user akce.

---

## 🧪 Testování

### Test 1: Vytvoření uživatele
1. Přihlaste se jako admin
2. Klikněte "Vytvořit uživatele"
3. Vyplňte formulář
4. Odešlete
5. ✅ Měl by přijít email s přihlašovacími údaji

### Test 2: Reset hesla
1. Přihlaste se jako admin
2. U existujícího uživatele klikněte na žlutou ikonu klíče
3. Potvrďte reset
4. ✅ Měl by přijít email s novým heslem

### Test 3: Fallback (pokud email selže)
Pokud EmailJS není nakonfigurován nebo selže:
- ✅ Zobrazí se alert s heslem
- ✅ Admin může heslo zkopírovat a poslat manuálně

---

## 📝 Konfigurace

Ujistěte se, že máte v `.env.local`:

```env
# EmailJS - Základní nastavení
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# EmailJS - Templates
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=vas_template_id
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=vas_template_id
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=vas_template_id

# Optional
NEXT_PUBLIC_APP_URL=https://portal.demonagro.cz
```

---

## 🔄 Migrace z původního řešení

### Co bylo změněno:

| Soubor | Změna |
|--------|-------|
| `app/api/admin/users/create/route.ts` | Odstraněn import `sendWelcomeEmail`, vrací data místo odesílání |
| `app/api/admin/users/reset-password/route.ts` | Odstraněn import `sendPasswordResetEmail`, vrací data |
| `components/admin/CreateUserModal.tsx` | Přidáno volání `sendWelcomeEmailClient()` |
| `components/admin/UsersTable.tsx` | Přidáno volání `sendPasswordResetEmailClient()` |
| `lib/utils/email-client.ts` | **NOVÝ** - Client-side email funkce |

### Co zůstalo beze změny:

- ✅ Databázové operace (vytvoření uživatele, reset hesla)
- ✅ Audit logging
- ✅ Admin kontroly a bezpečnost
- ✅ UI/UX flow

---

## 📚 Související dokumentace

- [`EMAILJS_PORTAL_SETUP_MASTER.md`](EMAILJS_PORTAL_SETUP_MASTER.md) - Kompletní EmailJS setup
- [`EMAILJS_ENV_SETUP.md`](EMAILJS_ENV_SETUP.md) - Environment variables
- [`EMAILJS_WELCOME_TEMPLATE.md`](EMAILJS_WELCOME_TEMPLATE.md) - Welcome email template
- [`EMAILJS_PASSWORD_RESET_TEMPLATE.md`](EMAILJS_PASSWORD_RESET_TEMPLATE.md) - Reset email template

---

**Status:** ✅ Implementováno a funkční  
**Testováno:** 6. ledna 2026


