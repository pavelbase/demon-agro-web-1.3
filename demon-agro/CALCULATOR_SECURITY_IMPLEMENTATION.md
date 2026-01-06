# Zabezpečení veřejné kalkulačky - Implementace

**Datum:** 6. ledna 2026  
**Účel:** Zabránit zneužívání veřejné kalkulačky na demonagro.cz/kalkulacka

## 🎯 Problém

Původní implementace umožňovala obejít omezení "jeden výpočet na uživatele" zadáním nesmyslného emailu (např. "a@a"). Zabezpečení bylo pouze na úrovni localStorage v prohlížeči.

## ✅ Řešení

Implementováno vícevrstvé zabezpečení:

### 1. **Vylepšená validace emailu (Frontend)**
- Použit robustní regex pro validaci emailové adresy
- Kontroluje správný formát domény (min. 2 znaky v TLD)
- Vyžaduje platné znaky před a po @

```typescript
const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
```

### 2. **Server-side sledování (Backend)**
- Nová databázová tabulka `calculator_usage`
- Ukládá: email, IP adresu, user agent, timestamp
- Nemožné obejít vymazáním localStorage nebo použitím inkognito

### 3. **Rate Limiting podle IP adresy**
- Maximum 3 výpočty za 24 hodin z jedné IP
- Chrání proti automatizovanému zneužívání
- Funguje i když uživatel mění email

### 4. **Omezení podle emailu**
- Jeden email = jeden výpočet za 30 dní
- Kontrola case-insensitive (email@test.cz = EMAIL@TEST.CZ)
- Uživatel je vyzván ke kontaktu pro další výpočty

## 📁 Vytvořené soubory

### SQL Migrace
```
demon-agro/lib/supabase/sql/create_calculator_usage_table.sql
```
- Vytváří tabulku `calculator_usage`
- Definuje indexy pro rychlé vyhledávání
- Obsahuje 3 PostgreSQL funkce:
  - `check_calculator_email_usage(email)` - kontrola emailu
  - `check_calculator_ip_rate_limit(ip)` - kontrola IP limitu
  - `record_calculator_usage(...)` - záznam použití

### API Endpointy
```
demon-agro/app/api/calculator/check-usage/route.ts
demon-agro/app/api/calculator/record-usage/route.ts
```

#### POST `/api/calculator/check-usage`
**Účel:** Kontrola, zda uživatel může použít kalkulačku

**Request:**
```json
{
  "email": "uzivatel@example.com"
}
```

**Response (povoleno):**
```json
{
  "allowed": true,
  "message": "Můžete pokračovat s výpočtem"
}
```

**Response (zakázáno - email):**
```json
{
  "allowed": false,
  "reason": "email_used",
  "message": "Na tento email již byl odeslán výsledek kalkulace..."
}
```

**Response (zakázáno - rate limit):**
```json
{
  "allowed": false,
  "reason": "rate_limit",
  "message": "Byl překročen denní limit použití kalkulačky..."
}
```

#### POST `/api/calculator/record-usage`
**Účel:** Záznam úspěšného použití kalkulačky

**Request:**
```json
{
  "email": "uzivatel@example.com",
  "calculationData": {
    "typPudy": "S",
    "pH": 6.5,
    "jmeno": "Jan Novák",
    "firma": "Farma s.r.o.",
    "telefon": "+420123456789",
    "marketing_consent": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-of-record"
}
```

### Frontend změny
```
demon-agro/app/(public)/kalkulacka/page.tsx
```
- Async validace emailu s voláním API
- Záznam použití po úspěšném výpočtu
- Fail-open strategie (při výpadku API uživatel může pokračovat)
- Lepší error handling

## 🔧 Nasazení

### Krok 1: Spustit SQL migraci
1. Přihlásit se do Supabase Dashboard
2. Otevřít SQL Editor
3. Spustit obsah souboru `create_calculator_usage_table.sql`
4. Ověřit, že tabulka a funkce byly vytvořeny

### Krok 2: Ověřit environment variables
Ujistit se, že jsou nastaveny:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Krok 3: Deploy aplikace
```bash
npm run build
# nebo deploy na Vercel/hosting
```

### Krok 4: Testování
Viz sekce níže.

## 🧪 Testování

### Test 1: Validace emailu
❌ Neplatné emaily (měly by být zamítnuty):
- `a@a`
- `test@`
- `@test.com`
- `test@test`
- `test..test@test.com`

✅ Platné emaily:
- `uzivatel@example.com`
- `jan.novak@firma.cz`
- `test123@test-domain.co.uk`

### Test 2: Omezení podle emailu
1. Vyplnit kalkulačku s emailem `test@example.com`
2. Odeslat výpočet
3. Zkusit znovu se stejným emailem
4. ✅ Měla by se zobrazit chyba: "Na tento email již byl odeslán výsledek..."

### Test 3: Rate limiting podle IP
1. Vyplnit kalkulačku 3× s různými emaily
2. Zkusit 4. výpočet
3. ✅ Měla by se zobrazit chyba: "Byl překročen denní limit..."

### Test 4: Obcházení localStorage
1. Vyplnit kalkulačku a odeslat
2. Otevřít Developer Tools → Application → Local Storage
3. Vymazat `kalkulace` klíč
4. Zkusit znovu se stejným emailem
5. ✅ Měla by se zobrazit chyba (server-side kontrola)

### Test 5: Inkognito režim
1. Vyplnit kalkulačku v normálním okně
2. Otevřít inkognito okno
3. Zkusit se stejným emailem
4. ✅ Měla by se zobrazit chyba (server-side kontrola)

## 📊 Monitoring a Analytics

### Sledování použití
Admini mohou sledovat použití kalkulačky v Supabase:

```sql
-- Počet použití za poslední 24 hodin
SELECT COUNT(*) as usage_count
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Top 10 nejpoužívanějších IP adres
SELECT ip_address, COUNT(*) as count
FROM calculator_usage
GROUP BY ip_address
ORDER BY count DESC
LIMIT 10;

-- Použití podle času (pro detekci botů)
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as usage_count
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

### Detekce podezřelé aktivity
```sql
-- IP adresy s více než 5 různými emaily za 24h (možný bot)
SELECT 
  ip_address,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) as total_attempts
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(DISTINCT email) > 5
ORDER BY unique_emails DESC;
```

## 🔒 Bezpečnostní poznámky

1. **Service Role Key** - používá se pouze na serveru, nikdy v klientském kódu
2. **RLS Policies** - tabulka `calculator_usage` je chráněna, jen admini mohou číst
3. **IP Anonymizace** - zvážit anonymizaci IP adres pro GDPR (např. maskovat poslední oktet)
4. **Rate Limiting** - aktuální limit 3/24h je rozumný, lze upravit v SQL funkci
5. **Email Retention** - zvážit automatické mazání záznamů starších než 90 dní

## 🚀 Možná budoucí vylepšení

1. **CAPTCHA** - přidat reCAPTCHA pro extra ochranu proti botům
2. **Email Verification** - ověřit email před odesláním výsledků
3. **Honeypot Field** - skryté pole pro detekci botů
4. **Fingerprinting** - pokročilejší identifikace zařízení (canvas, WebGL)
5. **Admin Dashboard** - UI pro sledování a správu použití kalkulačky
6. **Whitelist** - možnost povolit konkrétní IP/emaily bez omezení
7. **Blacklist** - možnost zablokovat konkrétní IP/emaily

## 📞 Kontakt pro více výpočtů

Uživatelé, kteří potřebují více výpočtů, jsou vyzváni ke kontaktu:
- Email: base@demonagro.cz
- Telefon: +420 731 734 907
- Nebo registrace do portálu pro neomezený přístup

## ✅ Checklist nasazení

- [ ] Spustit SQL migraci v Supabase
- [ ] Ověřit environment variables
- [ ] Deploy aplikace
- [ ] Test validace emailu
- [ ] Test omezení podle emailu
- [ ] Test rate limiting podle IP
- [ ] Test obcházení localStorage
- [ ] Test inkognito režimu
- [ ] Nastavit monitoring/alerting
- [ ] Aktualizovat dokumentaci pro zákazníky
- [ ] Informovat tým o změnách

---

**Status:** ✅ Implementováno a připraveno k nasazení  
**Autor:** AI Assistant  
**Revize:** 1.0

