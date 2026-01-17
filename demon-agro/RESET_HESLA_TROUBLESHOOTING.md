# Troubleshooting - Reset hesla nefunguje

## Problém
Uživatel dostává chybu "odkaz není platný" i když link je čerstvý (5 minut).

## Diagnostika

### 1. Zkontrolovat formát URL v emailu

Link by měl vypadat:
```
http://localhost:3000/portal/reset-hesla#access_token=LONG_TOKEN_HERE&type=recovery&...
```

**NE:**
```
http://localhost:3000/portal/reset-hesla?error=access_denied&error_code=otp_expired
```

### 2. Manuální test z Supabase Dashboard

1. Otevřete **Supabase Dashboard**
2. **Authentication → Users**
3. Najděte uživatele `base.pavel.29@gmail.com`
4. Klikněte na `...` → **Send Password Reset Email**
5. Zkontrolujte email a zkuste link

### 3. Zkontrolovat Supabase Email Template

**V Supabase Dashboard:**
1. **Authentication → Email Templates → Reset Password**
2. Zkontrolujte, že máte správný link:

```html
<a href="{{ .ConfirmationURL }}">Změnit heslo</a>
```

**DŮLEŽITÉ:** Musí být `{{ .ConfirmationURL }}` (s tečkou!)

### 4. Zkontrolovat Site URL

**Authentication → URL Configuration:**
- Site URL: `http://localhost:3000` (BEZ lomítka na konci!)

### 5. SQL Diagnostic

Spusťte v Supabase SQL Editor:

```sql
-- Zkontrolovat uživatele
SELECT 
  id,
  email,
  email_confirmed_at,
  recovery_sent_at,
  confirmed_at
FROM auth.users
WHERE email = 'base.pavel.29@gmail.com';

-- Smazat staré recovery tokeny (pokud jsou)
UPDATE auth.users
SET recovery_token = NULL,
    recovery_sent_at = NULL
WHERE email = 'base.pavel.29@gmail.com';
```

### 6. Alternativní řešení - Admin Reset

Pokud reset link nefunguje, můžete implementovat admin reset:
1. Admin vygeneruje nové heslo
2. Admin nastaví heslo uživateli přes Supabase Admin API
3. Pošle email s novým heslem přes EmailJS

## Častá řešení

### A) Site URL má lomítko na konci
❌ `http://localhost:3000/`
✅ `http://localhost:3000`

### B) Email template má špatný link
❌ `{{ .SiteURL }}/reset`
✅ `{{ .ConfirmationURL }}`

### C) Více pokusů o reset
- Starý token ruší nový
- Řešení: Smazat všechny tokeny SQL dotazem výše

### D) Browser cache
- Zkusit inkognito režim
- Nebo jiný browser



