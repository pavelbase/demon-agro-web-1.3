# Auth Quick Start Guide 🚀

Rychlý průvodce nastavením a testováním přihlašovacího systému.

## ⚡ Rychlé spuštění (5 minut)

### 1. Aktualizuj databázi

```bash
# V Supabase Dashboard → SQL Editor
# Zkopíruj a spusť celý soubor:
lib/supabase/sql/update_profiles_auth_fields.sql
```

To přidá do `profiles` tabulky:
- `is_active` (boolean)
- `must_change_password` (boolean)
- `onboarding_completed` (boolean)

### 2. Vytvoř test uživatele

```bash
# V Supabase Dashboard → SQL Editor
# Zkopíruj a spusť:
lib/test/create-test-user.sql
```

To vytvoří 5 test uživatelů:

| Email | Heslo | Role | Účel |
|-------|-------|------|------|
| `user@test.cz` | `testuser123` | user | Běžný aktivní uživatel |
| `admin@test.cz` | `admin123` | admin | Admin s plným přístupem |
| `inactive@test.cz` | `inactive123` | user | Neaktivní účet (test chyby) |
| `changepass@test.cz` | `changepass123` | user | Musí změnit heslo |
| `onboarding@test.cz` | `onboarding123` | user | Nedokončený onboarding |

### 3. Spusť dev server

```bash
cd demon-agro
npm run dev
```

### 4. Testuj přihlášení

Otevři: http://localhost:3000/portal/prihlaseni

#### Test 1: Úspěšné přihlášení
```
Email: user@test.cz
Password: testuser123
✅ Očekávaný výsledek: Redirect na /portal/dashboard
```

#### Test 2: Admin přihlášení
```
Email: admin@test.cz
Password: admin123
✅ Očekávaný výsledek: Redirect na /portal/dashboard
   (může přistupovat na /portal/admin)
```

#### Test 3: Neaktivní účet
```
Email: inactive@test.cz
Password: inactive123
❌ Očekávaný výsledek: Chyba "Váš účet je deaktivován"
```

#### Test 4: Musí změnit heslo
```
Email: changepass@test.cz
Password: changepass123
⚠️ Očekávaný výsledek: Redirect na /portal/nastaveni?change_password=true
```

#### Test 5: Nedokončený onboarding
```
Email: onboarding@test.cz
Password: onboarding123
⚠️ Očekávaný výsledek: Redirect na /portal/onboarding
```

#### Test 6: Špatné přihlašovací údaje
```
Email: user@test.cz
Password: wrongpassword
❌ Očekávaný výsledek: Chyba "Nesprávný email nebo heslo"
```

## 📧 Testování Reset Hesla

### 1. Konfigurace Supabase Email

**V Supabase Dashboard:**
1. Go to: **Authentication** → **Email Templates**
2. Klikni na **"Reset Password"**
3. Aktualizuj template:

```html
<h2>Reset hesla</h2>
<p>Obdrželi jste žádost o reset hesla pro váš účet na Démon Agro portálu.</p>
<p>Klikněte na následující odkaz pro vytvoření nového hesla:</p>
<p><a href="{{ .ConfirmationURL }}">Změnit heslo</a></p>
<p>Pokud jste o reset hesla nežádali, tento email ignorujte.</p>
<p>Odkaz je platný 60 minut.</p>
<br>
<p>S pozdravem,<br>Tým Démon Agro</p>
```

4. **Nastav Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: Přidej `http://localhost:3000/portal/reset-hesla`

### 2. Test Reset Flow

```
1. Jdi na: http://localhost:3000/portal/prihlaseni
2. Klikni: "Zapomněl jsem heslo"
3. Zadej: user@test.cz
4. Klikni: "Odeslat odkaz"
5. Zkontroluj: Supabase Dashboard → Authentication → Users → Logs
6. (V produkci by přišel email, v dev můžeš vidět URL v logách)
7. Otevři reset URL: /portal/reset-hesla?token=xxx&type=recovery
8. Zadej nové heslo (min 8 znaků)
9. Potvrzení hesla
10. Klikni: "Změnit heslo"
✅ Mělo by říct "Heslo změněno" a redirectnout na dashboard
```

### 3. Test Reset v Dev (bez emailu)

Pokud nechceš nastavovat SMTP:

```sql
-- V Supabase SQL Editor, najdi reset token:
SELECT 
  email,
  recovery_token,
  recovery_sent_at
FROM auth.users 
WHERE email = 'user@test.cz';

-- Použij recovery_token v URL:
-- http://localhost:3000/portal/reset-hesla?token=RECOVERY_TOKEN&type=recovery
```

## 🎨 UI Preview

### Přihlašovací stránka
```
┌─────────────────────────────────────┐
│                                     │
│        [Démon Agro Logo]           │
│                                     │
│         Přihlášení                  │
│    Přihlaste se do svého účtu      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Email                        │   │
│  │ [vas@email.cz          ]    │   │
│  │                              │   │
│  │ Heslo                        │   │
│  │ [••••••••              ]    │   │
│  │                              │   │
│  │         Zapomněl jsem heslo │   │
│  │                              │   │
│  │    [ Přihlásit se ]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Ještě nemáte účet? Kontaktujte nás│
│        ← Zpět na hlavní stránku    │
└─────────────────────────────────────┘
```

### Zapomenuté heslo
```
┌─────────────────────────────────────┐
│        [Démon Agro Logo]           │
│                                     │
│       Obnovení hesla                │
│  Zadejte email pro reset odkazu     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Email                        │   │
│  │ [vas@email.cz          ]    │   │
│  │                              │   │
│  │    [ Odeslat odkaz ]        │   │
│  │                              │   │
│  │    ← Zpět na přihlášení     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Reset hesla
```
┌─────────────────────────────────────┐
│        [Démon Agro Logo]           │
│                                     │
│          Nové heslo                 │
│      Zadejte své nové heslo         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Nové heslo                   │   │
│  │ [••••••••              ]    │   │
│  │ Heslo musí mít alespoň 8 znaků │ │
│  │                              │   │
│  │ Potvrzení hesla              │   │
│  │ [••••••••              ]    │   │
│  │                              │   │
│  │    [ Změnit heslo ]         │   │
│  └─────────────────────────────┘   │
│                                     │
│      ← Zpět na přihlášení          │
└─────────────────────────────────────┘
```

## 🔧 Troubleshooting

### Problém: "Cannot find module '@/lib/actions/auth'"

**Řešení:**
```bash
# Restartuj dev server
npm run dev
```

### Problém: Middleware redirect loop

**Řešení:**
```typescript
// Zkontroluj middleware.ts:
const publicRoutes = [
  '/portal',
  '/portal/prihlaseni',
  '/portal/reset-hesla'
]
// Musí obsahovat /portal/prihlaseni!
```

### Problém: "Column does not exist: is_active"

**Řešení:**
```bash
# Spusť SQL migrace:
# lib/supabase/sql/update_profiles_auth_fields.sql
```

### Problém: Email se neposílá

**Řešení:**
1. Zkontroluj Supabase Dashboard → Settings → Auth → Email
2. V dev: použij Supabase URL z logs
3. V prod: nastav SMTP server

### Problém: Token expired

**Řešení:**
- Reset token je platný 60 minut
- Po expiraci: znovu požádej o reset

## 📝 Checklist před produkci

### Supabase Configuration
- [ ] Aktualizovat Site URL na produkční doménu
- [ ] Přidat produkční redirect URLs
- [ ] Nastavit SMTP server pro emaily
- [ ] Aktualizovat email templates
- [ ] Otestovat email delivery

### Security
- [ ] Změnit test hesla
- [ ] Odstranit nebo deaktivovat test účty
- [ ] Povolit pouze HTTPS
- [ ] Nastavit rate limiting
- [ ] Zkontrolovat RLS policies

### Testing
- [ ] Test všech login paths
- [ ] Test reset hesla flow
- [ ] Test error messages
- [ ] Test na mobilních zařízeních
- [ ] Test accessibility (keyboard navigation)

## 🎯 Co je implementováno

### ✅ Login Flow
- Email + heslo formulář
- React Hook Form + Zod validace
- Loading stav s animací
- Specific error messages
- Profile status checks (is_active, must_change_password, onboarding_completed)
- Smart redirects

### ✅ Forgot Password
- Email input
- Success message (no enumeration)
- Email s reset linkem

### ✅ Reset Password
- Token validace
- Nové heslo formulář
- Potvrzení hesla
- Success screen s auto-redirect

### ✅ Security
- Supabase Auth
- Password hashing (bcrypt)
- Token-based reset
- RLS policies
- Middleware protection

### ✅ UX
- Brand colors (green/brown)
- Responzivní design
- Clear error messages (česky)
- Loading states
- Success confirmations
- Keyboard navigation

## 📚 Další kroky

1. **Implementovat Onboarding** (`/portal/onboarding`)
   - Welcome screen
   - Company info
   - Terms acceptance

2. **Implementovat Dashboard** (`/portal/dashboard`)
   - User overview
   - Quick actions
   - Recent activity

3. **Implementovat Nastavení** (`/portal/nastaveni`)
   - Profile edit
   - Password change
   - Preferences

4. **Add Features (Optional)**
   - "Remember me" checkbox
   - Social login (Google, etc.)
   - Two-factor authentication
   - Login history
   - Session management

## 🔗 Links

- Login: http://localhost:3000/portal/prihlaseni
- Reset: http://localhost:3000/portal/reset-hesla
- Dashboard: http://localhost:3000/portal/dashboard (protected)
- Admin: http://localhost:3000/portal/admin (admin only)

## 📞 Support

Pokud narazíš na problém:
1. Zkontroluj konzoli browseru (F12)
2. Zkontroluj terminal (server logs)
3. Zkontroluj Supabase Dashboard → Logs
4. Přečti si AUTH_IMPLEMENTATION.md pro detaily

---

**Ready to go!** 🚀 Přihlašovací systém je plně funkční a připravený k použití.
