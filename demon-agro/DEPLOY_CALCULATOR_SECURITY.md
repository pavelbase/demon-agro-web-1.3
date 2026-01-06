# 🚀 Nasazení zabezpečení kalkulačky - Krok za krokem

## ⏱️ Odhadovaný čas: 10-15 minut

---

## Krok 1: Příprava (2 min)

### 1.1 Ověřit environment variables

Zkontrolovat, že v `.env.local` (lokálně) a v produkčním prostředí jsou nastaveny:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ KRITICKÉ!
```

**⚠️ DŮLEŽITÉ:** `SUPABASE_SERVICE_ROLE_KEY` musí být nastaven!

### 1.2 Najít service role key

1. Otevřít [Supabase Dashboard](https://app.supabase.com)
2. Vybrat projekt
3. Settings → API
4. Zkopírovat "service_role" key (secret)
5. Přidat do environment variables

---

## Krok 2: Databázová migrace (3 min)

### 2.1 Otevřít Supabase SQL Editor

1. Přihlásit se do [Supabase Dashboard](https://app.supabase.com)
2. Vybrat projekt
3. Kliknout na **SQL Editor** v levém menu
4. Kliknout na **New query**

### 2.2 Spustit migraci

1. Otevřít soubor: `demon-agro/lib/supabase/sql/create_calculator_usage_table.sql`
2. Zkopírovat **celý obsah** souboru
3. Vložit do SQL Editoru
4. Kliknout na **Run** (nebo Ctrl+Enter)
5. ✅ Mělo by se zobrazit: "Success. No rows returned"

### 2.3 Ověřit vytvoření

Spustit v SQL Editoru:

```sql
-- Ověřit tabulku
SELECT * FROM calculator_usage LIMIT 1;

-- Ověřit funkce
SELECT proname FROM pg_proc 
WHERE proname LIKE 'check_calculator%' 
   OR proname LIKE 'record_calculator%';
```

✅ Měly by se zobrazit 3 funkce:
- `check_calculator_email_usage`
- `check_calculator_ip_rate_limit`
- `record_calculator_usage`

---

## Krok 3: Build a deploy (5 min)

### 3.1 Lokální test (volitelné)

```bash
# V terminálu v root složce projektu
cd demon-agro
npm run dev

# V druhém terminálu
BASE_URL=http://localhost:3000 node scripts/test-calculator-security.js
```

### 3.2 Build

```bash
npm run build
```

✅ Build by měl proběhnout bez chyb

### 3.3 Deploy

#### Vercel (doporučeno)
```bash
vercel --prod
```

Nebo přes Vercel Dashboard:
1. Git push do main/master
2. Vercel automaticky deployuje
3. ⚠️ Nezapomenout nastavit `SUPABASE_SERVICE_ROLE_KEY` v Vercel Environment Variables!

#### Jiný hosting
```bash
# Podle vašeho hostingu
npm run start
```

---

## Krok 4: Testování (5 min)

### 4.1 Automatický test

```bash
# Test produkce
BASE_URL=https://demonagro.cz node scripts/test-calculator-security.js
```

Očekávaný výstup:
```
✅ API endpoint je dostupný
✅ a@a - správně zamítnuto
✅ test@example.com - správně přijato
✅ První použití - povoleno
✅ Druhé použití - správně zamítnuto
```

### 4.2 Manuální test

#### Test A: Neplatný email
1. Otevřít https://demonagro.cz/kalkulacka
2. Vyplnit formulář až ke kroku 3
3. Zadat email: `a@a`
4. ✅ Měla by se zobrazit červená chyba pod emailem

#### Test B: Duplicitní email
1. Vyplnit kalkulačku s platným emailem (např. `test123@example.com`)
2. Odeslat výpočet
3. Obnovit stránku (F5)
4. Vyplnit znovu se stejným emailem
5. ✅ Měla by se zobrazit chyba: "Na tento email již byl odeslán výsledek..."

#### Test C: Rate limiting
1. Vyplnit kalkulačku 3× s různými emaily
2. Zkusit 4. výpočet
3. ✅ Měla by se zobrazit chyba: "Byl překročen denní limit..."

---

## Krok 5: Monitoring (2 min)

### 5.1 Zkontrolovat záznamy

V Supabase SQL Editoru:

```sql
-- Počet použití za poslední 24 hodin
SELECT COUNT(*) as usage_count
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Poslední použití
SELECT 
  email,
  ip_address,
  created_at
FROM calculator_usage
ORDER BY created_at DESC
LIMIT 10;
```

### 5.2 Nastavit alerting (volitelné)

Vytvořit Supabase webhook nebo cron job pro monitoring:

```sql
-- Příklad: Denní report
SELECT 
  COUNT(*) as total_usage,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT ip_address) as unique_ips
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## ✅ Checklist dokončení

Po dokončení všech kroků zkontrolovat:

- [ ] ✅ Environment variables nastaveny (včetně SERVICE_ROLE_KEY)
- [ ] ✅ SQL migrace spuštěna v Supabase
- [ ] ✅ Tabulka `calculator_usage` existuje
- [ ] ✅ 3 PostgreSQL funkce vytvořeny
- [ ] ✅ Aplikace deployována
- [ ] ✅ Automatický test prošel
- [ ] ✅ Manuální test A (neplatný email) ✅
- [ ] ✅ Manuální test B (duplicitní email) ✅
- [ ] ✅ Manuální test C (rate limiting) ✅
- [ ] ✅ Monitoring funguje
- [ ] ✅ Tým informován o změnách

---

## 🆘 Troubleshooting

### Problém: API vrací 500 chybu

**Řešení:**
1. Zkontrolovat Supabase logs: Dashboard → Logs → API
2. Ověřit `SUPABASE_SERVICE_ROLE_KEY` v environment variables
3. Ověřit, že SQL migrace byla spuštěna
4. Restartovat aplikaci

### Problém: Funkce neexistují

**Řešení:**
1. Zkontrolovat v Supabase SQL Editoru:
```sql
SELECT proname FROM pg_proc WHERE proname LIKE '%calculator%';
```
2. Pokud nejsou, znovu spustit SQL migraci

### Problém: Validace nefunguje

**Řešení:**
1. Vymazat cache prohlížeče (Ctrl+Shift+Delete)
2. Zkontrolovat Network tab v DevTools
3. Ověřit, že API endpointy odpovídají (status 200/400)

### Problém: Rate limit se neresetuje

**Řešení:**
- Rate limit používá **klouzavé 24hodinové okno**, ne půlnoc
- Pro manuální reset:
```sql
DELETE FROM calculator_usage WHERE ip_address = 'your-ip';
```

### Problém: Vercel deploy selhává

**Řešení:**
1. Zkontrolovat build logs
2. Ověřit, že všechny dependencies jsou v `package.json`
3. Zkontrolovat, že `SUPABASE_SERVICE_ROLE_KEY` je nastaven v Vercel Environment Variables

---

## 📞 Podpora

### Pro technické problémy:
- 📧 Kontaktovat vývojový tým
- 📚 Dokumentace: `CALCULATOR_SECURITY_IMPLEMENTATION.md`

### Pro uživatele kalkulačky:
- 📧 Email: base@demonagro.cz
- 📱 Telefon: +420 731 734 907

---

## 📚 Další dokumentace

- **Detailní dokumentace:** `CALCULATOR_SECURITY_IMPLEMENTATION.md`
- **Rychlý průvodce:** `CALCULATOR_SECURITY_README.md`
- **Přehled změn:** `CALCULATOR_SECURITY_CHANGES.md`

---

**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Odhadovaný čas nasazení:** 10-15 minut  
**Obtížnost:** ⭐⭐☆☆☆ (Střední)

---

## 🎉 Gratulujeme!

Po dokončení všech kroků je zabezpečení kalkulačky plně funkční a chráněné proti zneužívání.

