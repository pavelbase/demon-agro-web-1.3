# Reset Password - Quick Test Guide 🧪

5-minutový test guide pro funkci reset hesla.

## ⚡ Quick Test (bez emailu)

### 1. Příprava

```bash
# Spusť dev server
cd demon-agro
npm run dev
```

### 2. Test: Validní token

**A. Získej reset token z DB:**
```sql
-- V Supabase SQL Editor:
SELECT 
  email,
  recovery_token,
  recovery_sent_at
FROM auth.users 
WHERE email = 'user@test.cz';
```

**B. Otevři reset URL:**
```
http://localhost:3000/portal/reset-hesla?token=RECOVERY_TOKEN&type=recovery
```

**C. Test formulář:**

| Test | Input | Očekávaný výsledek |
|------|-------|-------------------|
| 1. Krátké heslo | `Test` | ✗ "Musí mít alespoň 8 znaků" |
| 2. Bez velkého | `test1234` | ✗ "Musí obsahovat velké písmeno" |
| 3. Bez čísla | `TestTest` | ✗ "Musí obsahovat číslo" |
| 4. Validní | `Test1234` | ✓ Všechny ✓ zelené |
| 5. Neshodují se | Pass: `Test1234`, Confirm: `Test123` | ✗ "Hesla se neshodují" |
| 6. Success | Pass + Confirm: `Test1234` | ✓ Success screen → redirect |

### 3. Test: Neplatný token

```
http://localhost:3000/portal/reset-hesla?token=invalid&type=recovery
```

**Očekáváno:**
- ✓ Loading spinner
- ✓ Error screen: "Odkaz není platný"
- ✓ Tlačítko "Zpět na přihlášení"

### 4. Test: Bez tokenu

```
http://localhost:3000/portal/reset-hesla
```

**Očekáváno:**
- ✓ Loading spinner
- ✓ Error screen: "Neplatný odkaz"

### 5. Test: Success message na login

```
http://localhost:3000/portal/prihlaseni?message=password_changed
```

**Očekáváno:**
- ✓ Zelený banner nahoře
- ✓ Text: "Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit."

## 📱 Visual Tests

### Test Password Strength Indicator

**Test inputs a očekávané výsledky:**

```
Input: "t"
Checklist: ○ ○ ○ (všechny červené)
Strength: N/A

Input: "testtest"
Checklist: ✓ ○ ○ (8 chars: ✓, velké: ○, číslo: ○)
Strength: Slabé (červená) 25%

Input: "TestTest"
Checklist: ✓ ✓ ○ (8 chars: ✓, velké: ✓, číslo: ○)
Strength: Střední (žlutá) 50%

Input: "Test1234"
Checklist: ✓ ✓ ✓ (všechny splněny)
Strength: Dobré (zelená) 75%

Input: "Test@1234"
Checklist: ✓ ✓ ✓ (všechny splněny)
Strength: Silné (tmavě zelená) 100%
```

### Test Real-time Validation

**Postup:**
1. Focus na password input
2. Začni psát pomalu: `T` → `e` → `s` → `t` → `1` → `2` → `3` → `4`
3. Sleduj checklist - měl by se měnit real-time
4. Sleduj strength bar - měl by růst

**Očekávané chování:**
- After `T`: Velké ✓ (zelená)
- After `Test`: Velké ✓ (zelená), ostatní ○
- After `Test1`: Velké ✓, Číslo ✓
- After `Test1234`: Všechny ✓ (zelené), Submit enabled

## 🧪 Complete Flow Test

### Test 1: Happy Path

```
1. Otevři: http://localhost:3000/portal/prihlaseni
   ✓ Vidíš login formulář

2. Klik: "Zapomněl jsem heslo"
   ✓ Zobrazí se email input

3. Zadej: user@test.cz
   ✓ Email je validní

4. Klik: "Odeslat odkaz"
   ✓ Success: "Email odeslán"

5. (V produkci by přišel email, v dev použij SQL)
   ✓ Zkopíruj recovery_token z DB

6. Otevři: /portal/reset-hesla?token=TOKEN&type=recovery
   ✓ Loading → Formulář se zobrazí

7. Zadej password: "Test1234"
   ✓ Checklist: všechny ✓
   ✓ Strength: "Dobré" (zelená)

8. Zadej confirm: "Test1234"
   ✓ Hesla se shodují

9. Klik: "Změnit heslo"
   ✓ Loading spinner
   ✓ Success screen
   ✓ Auto-redirect (3 sec)

10. Na login page:
    ✓ Zelený banner: "Heslo změněno"

11. Přihlaš se:
    Email: user@test.cz
    Password: Test1234
    ✓ Přihlášení úspěšné → Dashboard
```

### Test 2: Error Path - Slabé heslo

```
1-6. [stejné jako Test 1]

7. Zadej password: "test"
   ✗ Error: "Musí mít alespoň 8 znaků"
   ✗ Checklist: všechny ○ červené
   ✗ Submit disabled

8. Změň na: "testtest"
   ✗ Error: "Musí obsahovat velké písmeno"
   ✗ Checklist: Délka ✓, ostatní ○
   ✗ Strength: "Slabé" (červená)

9. Změň na: "TestTest"
   ✗ Error: "Musí obsahovat číslo"
   ✗ Checklist: Délka ✓, Velké ✓, Číslo ○
   ✗ Strength: "Střední" (žlutá)

10. Změň na: "Test1234"
    ✓ Všechny validace OK
    ✓ Submit enabled
```

### Test 3: Error Path - Expirovaný token

```
1. Vygeneruj reset (nebo použij starý >60 min)

2. Počkej 60+ minut (nebo použij starý token)

3. Otevři reset URL s expirovaným tokenem

4. Výsledek:
   ✓ Loading spinner
   ✓ Error screen
   ✓ "Odkaz není platný"
   ✓ "Odkaz mohl vypršet (platnost 60 minut)"
   ✓ Tlačítko "Zpět na přihlášení"
   ✗ Formulář se nezobrazí
```

## 📋 Checklist pro manual testing

### UI Tests
- [ ] Logo se zobrazuje správně
- [ ] Formulář je centrovaný
- [ ] Inputy mají správné placeholdery
- [ ] Labels jsou čitelné
- [ ] Tlačítka mají hover efekt
- [ ] Barvy odpovídají brand (green/brown)
- [ ] Checklist je viditelný a čitelný
- [ ] Strength bar se zobrazuje
- [ ] Success screen vypadá dobře
- [ ] Error screen vypadá dobře

### Validation Tests
- [ ] Min 8 znaků funguje
- [ ] Velké písmeno se kontroluje
- [ ] Číslo se kontroluje
- [ ] Shoda hesel funguje
- [ ] Real-time validace funguje
- [ ] Error messages se zobrazují správně

### Flow Tests
- [ ] Token validace funguje
- [ ] Loading states se zobrazují
- [ ] Success redirect funguje
- [ ] Success message na login funguje
- [ ] Error screen pro invalid token funguje
- [ ] Zpět na login odkaz funguje

### Mobile Tests
- [ ] Formulář je responzivní
- [ ] Checklist je čitelný na mobilu
- [ ] Strength bar je viditelný
- [ ] Tlačítka jsou dostatečně velká
- [ ] Text je čitelný

### Edge Cases
- [ ] Token bez type=recovery → error
- [ ] Velmi dlouhé heslo (100+ chars)
- [ ] Speciální znaky v hesle
- [ ] Copy-paste hesla
- [ ] Browser autofill
- [ ] Keyboard navigation (Tab)

## 🐛 Common Issues & Solutions

### Issue: "Odkaz není platný" hned

**Možné příčiny:**
1. Token není v URL
2. Type není "recovery"
3. Token už byl použitý

**Řešení:**
```bash
# Vygeneruj nový token:
# 1. Jdi na login
# 2. Klik "Zapomněl jsem heslo"
# 3. Zadej email
# 4. Získej nový token z DB
```

### Issue: Heslo se nezmění

**Check:**
```sql
-- V Supabase SQL Editor:
SELECT email, updated_at 
FROM auth.users 
WHERE email = 'user@test.cz';

-- Mělo by se updated_at změnit po reset
```

### Issue: Success message se nezobrazuje

**Check URL:**
```
✓ Correct: /portal/prihlaseni?message=password_changed
✗ Wrong: /portal/prihlaseni (bez message param)
```

### Issue: Strength indicator nefunguje

**Check:**
1. Píšeš do password inputu?
2. Watch hook funguje? (console.log password value)
3. getPasswordStrength() se volá?

## 📸 Expected Screens

### 1. Loading (Validace tokenu)
```
[Loading spinner]
Ověřování odkazu...
```

### 2. Formulář (Validní token)
```
┌────────────────────────────┐
│ [Logo]                     │
│ Nové heslo                 │
│ Zadejte své nové heslo     │
│                            │
│ ┌────────────────────────┐ │
│ │ Nové heslo             │ │
│ │ [••••••••]            │ │
│ │                        │ │
│ │ Požadavky:             │ │
│ │ ✓ Min 8 znaků          │ │
│ │ ✓ Velké písmeno        │ │
│ │ ✓ Číslo                │ │
│ │                        │ │
│ │ Síla: Dobré [====  ]  │ │
│ │                        │ │
│ │ Potvrzení              │ │
│ │ [••••••••]            │ │
│ │                        │ │
│ │ [Změnit heslo]        │ │
│ └────────────────────────┘ │
│                            │
│ ← Zpět na přihlášení      │
└────────────────────────────┘
```

### 3. Success
```
┌────────────────────────────┐
│ [Logo]                     │
│ Heslo změněno              │
│ Bylo úspěšně změněno       │
│                            │
│ ┌────────────────────────┐ │
│ │        [✓]             │ │
│ │  Úspěšně dokončeno!    │ │
│ │  Heslo bylo změněno.   │ │
│ │  Za chvíli budete...   │ │
│ │                        │ │
│ │  Přihlásit se nyní →   │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

### 4. Error (Neplatný token)
```
┌────────────────────────────┐
│ [Logo]                     │
│ Neplatný odkaz             │
│                            │
│ ┌────────────────────────┐ │
│ │        [✗]             │ │
│ │  Odkaz není platný     │ │
│ │  Odkaz mohl vypršet    │ │
│ │  (platnost 60 minut)   │ │
│ │                        │ │
│ │  [Zpět na přihlášení] │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

### 5. Login s success message
```
┌────────────────────────────┐
│ [Logo]                     │
│ Přihlášení                 │
│                            │
│ ┌────────────────────────┐ │
│ │ [✓] Vaše heslo bylo    │ │
│ │     úspěšně změněno.   │ │
│ │     Nyní se můžete     │ │
│ │     přihlásit.         │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ Email                  │ │
│ │ [              ]       │ │
│ │ ...                    │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

## ✅ Final Checklist

Před označením jako "Done":

- [ ] Všechny UI testy prošly
- [ ] Všechny validation testy prošly
- [ ] Všechny flow testy prošly
- [ ] Mobile responsive funguje
- [ ] Edge cases jsou ošetřeny
- [ ] Error messages jsou v češtině
- [ ] Success messages fungují
- [ ] Auto-redirect funguje
- [ ] Strength indicator funguje
- [ ] Real-time checklist funguje

---

**Test Time**: ~10 minut pro complete test  
**Quick Test**: ~3 minuty pro basic flow  
**Status**: ✅ Ready for testing
