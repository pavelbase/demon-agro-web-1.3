# Reset Password Implementation ✅

## 🎉 Implementováno

Kompletní funkce pro reset hesla s pokročilou validací a user-friendly UX.

## 📦 Vytvořené/Aktualizované soubory

### 1. Reset Password Page - `app/portal/reset-hesla/page.tsx` (480 řádků)

**Features:**
- ✅ Token validace (URL params i hash)
- ✅ Loading stav při validaci
- ✅ Formulář s novým heslem
- ✅ Pokročilá validace hesla
- ✅ Password strength indicator
- ✅ Real-time validace požadavků
- ✅ Success screen s auto-redirect
- ✅ Error handling (neplatný/expirovaný token)

### 2. Validation Schema Update - `lib/utils/validations.ts`

**newPasswordSchema:**
```typescript
password: z.string()
  .min(8, 'Heslo musí mít alespoň 8 znaků')
  .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno')
  .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jedno číslo')
```

### 3. Login Page Update - `app/portal/prihlaseni/page.tsx`

**Přidáno:**
- ✅ Success message display
- ✅ Check pro `?message=password_changed` v URL
- ✅ Zelený success banner

## 🎯 Implementované funkce

### Token Validation

**Podporované formáty:**

1. **URL Query Params** (starší formát):
   ```
   /portal/reset-hesla?token=xxx&type=recovery
   ```

2. **URL Hash** (Supabase PKC formát):
   ```
   /portal/reset-hesla#access_token=xxx&type=recovery
   ```

3. **Settings Change** (přihlášený uživatel):
   ```
   /portal/reset-hesla?change_password=true
   ```

### Password Requirements

| Požadavek | Validace | Error message |
|-----------|----------|---------------|
| Min délka | 8 znaků | "Heslo musí mít alespoň 8 znaků" |
| Velké písmeno | `/[A-Z]/` | "Musí obsahovat alespoň jedno velké písmeno" |
| Číslo | `/[0-9]/` | "Musí obsahovat alespoň jedno číslo" |
| Shoda | password === confirm | "Hesla se neshodují" |

### Password Strength Indicator

**Výpočet síly:**
```typescript
Slabé:   0-1 bodů (červená)
Střední: 2 body   (žlutá)
Dobré:   3 body   (zelená)
Silné:   4+ bodů  (tmavě zelená)

Body za:
+ 8+ znaků
+ Velké písmeno
+ Číslo
+ Speciální znak (bonus)
+ 12+ znaků (bonus)
```

### Real-time Validation Display

Vizuální checklist požadavků:
```
○ Minimálně 8 znaků      → ✓ (zelená když splněno)
○ Alespoň jedno velké    → ✓
○ Alespoň jedno číslo    → ✓
```

## 🔄 User Flow

### Flow 1: Reset z emailu

```
1. User klikne "Zapomněl jsem heslo"
   ↓
2. Zadá email
   ↓
3. Supabase pošle email s linkem
   ↓
4. User klikne link → /portal/reset-hesla?token=xxx&type=recovery
   ↓
5. Page: Validuje token (loading spinner)
   ↓
6. Token validní? ─NO→ Chyba: "Neplatný odkaz"
   ↓ YES
7. Zobrazí formulář
   ↓
8. User zadá nové heslo
   - Real-time validace
   - Strength indicator
   - Requirements checklist
   ↓
9. Klikne "Změnit heslo"
   ↓
10. Supabase: updateUser({ password })
    ↓
11. Success screen (3 sec)
    ↓
12. Redirect → /portal/prihlaseni?message=password_changed
    ↓
13. Login page: Zobrazí zelený banner "Heslo změněno" ✅
```

### Flow 2: Expirovaný token

```
1. User otevře starý reset link
   ↓
2. Token validace
   ↓
3. Token expirovaný (60 min)
   ↓
4. Zobrazí error screen:
   - Červený X icon
   - "Odkaz není platný"
   - "Odkaz mohl vypršet (platnost 60 minut)"
   - Tlačítko "Zpět na přihlášení"
```

### Flow 3: Chybné heslo

```
1-7. [same as Flow 1]
8. User zadá heslo:
   - "Test123" ✓ (splňuje požadavky)
   - "test123" ✗ (chybí velké písmeno)
   - "Test" ✗ (krátké, chybí číslo)
   - "testtest" ✗ (chybí velké i číslo)
   ↓
9. Formulář zobrazí chyby:
   - Pod inputem: konkrétní error
   - Checklist: červené ○ u nesplněných
   - Submit disabled dokud není validní
```

## 🎨 UI Components

### Password Requirements Checklist

```jsx
<ul className="text-xs space-y-1">
  <li className={hasMinLength ? 'text-green-600' : 'text-gray-500'}>
    {hasMinLength ? '✓' : '○'} Minimálně 8 znaků
  </li>
  <li className={hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
    {hasUpperCase ? '✓' : '○'} Alespoň jedno velké písmeno
  </li>
  <li className={hasNumber ? 'text-green-600' : 'text-gray-500'}>
    {hasNumber ? '✓' : '○'} Alespoň jedno číslo
  </li>
</ul>
```

### Password Strength Bar

```jsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className={`h-2 rounded-full ${strengthColor}`}
    style={{ width: `${strength}%` }}
  />
</div>
```

### Success Screen

```
┌─────────────────────────────────────┐
│        [Démon Agro Logo]           │
│                                     │
│         Heslo změněno               │
│   Vaše heslo bylo úspěšně změněno  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │        [✓ icon]             │   │
│  │                              │   │
│  │   Úspěšně dokončeno!        │   │
│  │                              │   │
│  │   Vaše heslo bylo změněno.  │   │
│  │   Za chvíli budete          │   │
│  │   přesměrováni...           │   │
│  │                              │   │
│  │   Přihlásit se nyní →       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Error Screen (Neplatný token)

```
┌─────────────────────────────────────┐
│        [Démon Agro Logo]           │
│                                     │
│        Neplatný odkaz               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │        [✗ icon]             │   │
│  │                              │   │
│  │   Odkaz není platný         │   │
│  │                              │   │
│  │   Neplatný nebo chybějící   │   │
│  │   odkaz pro obnovení hesla. │   │
│  │   Odkaz mohl vypršet.       │   │
│  │                              │   │
│  │   [Zpět na přihlášení]     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🧪 Test Cases

### Test 1: Validní token + správné heslo

```
Input: Token = valid, Password = "Test1234"
Expected:
✓ Token validuje se úspěšně
✓ Formulář se zobrazí
✓ Password splňuje všechny požadavky
✓ Checklist: všechny ✓ zelené
✓ Strength: "Dobré" (zelená)
✓ Submit aktivní
✓ Po odeslání: Success screen
✓ Redirect na login s success message
```

### Test 2: Expirovaný token

```
Input: Token = expired (>60 min old)
Expected:
✓ Loading spinner
✓ Token validace failne
✓ Error screen: "Odkaz není platný"
✓ Tlačítko "Zpět na přihlášení"
✗ Formulář se nezobrazí
```

### Test 3: Slabé heslo

```
Input: Password = "test"
Expected:
✗ Chyba: "Heslo musí mít alespoň 8 znaků"
✗ Checklist: Červené ○
✗ Strength: N/A (příliš krátké)
✗ Submit disabled

Input: Password = "testtest"
Expected:
✗ Chyba: "Heslo musí obsahovat alespoň jedno velké písmeno"
✗ Checklist: 1 ✓, 2 ○
✗ Strength: "Slabé" (červená)

Input: Password = "TestTest"
Expected:
✗ Chyba: "Heslo musí obsahovat alespoň jedno číslo"
✗ Checklist: 2 ✓, 1 ○
✗ Strength: "Střední" (žlutá)
```

### Test 4: Hesla se neshodují

```
Input:
  Password = "Test1234"
  Confirm = "Test12345"
Expected:
✗ Chyba u confirm: "Hesla se neshodují"
✗ Submit disabled
```

### Test 5: Bez tokenu

```
URL: /portal/reset-hesla (žádné params)
Expected:
✓ Loading spinner
✗ Error screen: "Neplatný odkaz"
✗ Formulář se nezobrazí
```

### Test 6: Success message na login

```
URL: /portal/prihlaseni?message=password_changed
Expected:
✓ Zelený banner nahoře
✓ Text: "Vaše heslo bylo úspěšně změněno..."
✓ Login formulář funguje normálně
```

## 📝 Error Messages

### Token Errors
- `Neplatný nebo chybějící odkaz pro obnovení hesla. Odkaz mohl vypršet (platnost 60 minut).`

### Password Validation Errors
- `Heslo musí mít alespoň 8 znaků`
- `Heslo musí obsahovat alespoň jedno velké písmeno`
- `Heslo musí obsahovat alespoň jedno číslo`
- `Hesla se neshodují`

### Update Errors
- `Nepodařilo se změnit heslo. Zkuste to prosím znovu.`
- `Došlo k neočekávané chybě. Zkuste to prosím znovu.`

### Success Messages
- `Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit.` (na login page)
- `Vaše heslo bylo změněno. Za chvíli budete přesměrováni...` (success screen)

## 🔧 Configuration

### Supabase Email Template

```html
<h2>Reset hesla</h2>
<p>Obdrželi jste žádost o reset hesla.</p>
<p><a href="{{ .ConfirmationURL }}">Změnit heslo</a></p>
<p>Odkaz je platný 60 minut.</p>
<p>Pokud jste o reset nežádali, ignorujte tento email.</p>
```

### Token Expiration

**Default:** 60 minut

**Změna v Supabase:**
- Dashboard → Settings → Auth
- "Mailer" section
- "Reset Password" → "Expiration Time"

## 🎯 Password Strength Examples

| Heslo | Délka | Velké | Číslo | Speciální | Síla | Barva |
|-------|-------|-------|-------|-----------|------|-------|
| `test` | ✗ | ✗ | ✗ | ✗ | N/A | - |
| `testtest` | ✓ | ✗ | ✗ | ✗ | Slabé | Červená |
| `TestTest` | ✓ | ✓ | ✗ | ✗ | Střední | Žlutá |
| `Test1234` | ✓ | ✓ | ✓ | ✗ | Dobré | Zelená |
| `Test@1234` | ✓ | ✓ | ✓ | ✓ | Silné | Tmavě zelená |
| `MyPassw0rd!` | ✓ | ✓ | ✓ | ✓ | Silné | Tmavě zelená |
| `VeryStr0ng!Pass` | ✓ (12+) | ✓ | ✓ | ✓ | Silné | Tmavě zelená |

## 💡 UX Features

### Real-time Feedback
```
User píše: "t"
→ Checklist: všechny ○ červené

User píše: "te"
→ Checklist: stejné

User píše: "Test"
→ Checklist: Velké ✓ zelená, ostatní ○

User píše: "Test1"
→ Checklist: Velké ✓, Číslo ✓, Délka ○

User píše: "Test1234"
→ Checklist: všechny ✓ zelené
→ Strength bar: "Dobré" 75% zelená
→ Submit enabled
```

### Auto-redirect Countdown
- Success screen se zobrazí 3 sekundy
- Pak auto-redirect na login
- User může kliknout "Přihlásit se nyní" dřív

### Suspense Boundary
- Celá stránka je wrapped v `<Suspense>`
- Fallback: loading spinner
- Prevents hydration issues s `useSearchParams`

## 🚀 Quick Test

### Manual Test Flow

1. **Spusť dev server:**
   ```bash
   npm run dev
   ```

2. **Request reset:**
   - Go to: http://localhost:3000/portal/prihlaseni
   - Klik "Zapomněl jsem heslo"
   - Zadej: user@test.cz
   - Klik "Odeslat odkaz"

3. **Get reset URL:**
   ```bash
   # V Supabase SQL Editor:
   SELECT recovery_token FROM auth.users WHERE email = 'user@test.cz';
   ```

4. **Open reset page:**
   ```
   http://localhost:3000/portal/reset-hesla?token=RECOVERY_TOKEN&type=recovery
   ```

5. **Test různá hesla:**
   - "test" → Chyby
   - "testtest" → Chybí velké/číslo
   - "TestTest" → Chybí číslo
   - "Test1234" → ✓ Validní

6. **Změň heslo:**
   - Zadej: "Test1234" (2x)
   - Klik "Změnit heslo"
   - Success screen → redirect
   - Login page: zelený banner

7. **Přihlas se:**
   - Email: user@test.cz
   - Password: Test1234
   - Mělo by fungovat ✓

## ✅ Checklist

### Implementation
- [x] Reset password page UI
- [x] Token validation (URL + hash)
- [x] Password validation (8 chars, uppercase, number)
- [x] Real-time requirements checklist
- [x] Password strength indicator
- [x] Error handling (invalid/expired token)
- [x] Success screen with auto-redirect
- [x] Success message on login page
- [x] Loading states
- [x] Suspense boundary
- [x] Mobile responsive

### Testing
- [ ] Test s validním tokenem
- [ ] Test s expirovaným tokenem
- [ ] Test bez tokenu
- [ ] Test všech password validací
- [ ] Test password strength indicator
- [ ] Test success flow
- [ ] Test redirect na login
- [ ] Test success message
- [ ] Test mobile responsive

### Documentation
- [x] Implementation guide
- [x] Test cases
- [x] Error messages
- [x] UX features
- [x] Flow diagrams

---

**Status**: ✅ Plně implementováno a připraveno k testování  
**Datum**: 19.12.2025  
**Features**: Token validation, pokročilá validace, strength indicator, real-time feedback  
**Test URL**: http://localhost:3000/portal/reset-hesla?token=xxx&type=recovery
