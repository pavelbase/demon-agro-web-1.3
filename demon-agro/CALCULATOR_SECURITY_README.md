# 🔒 Zabezpečení kalkulačky - Rychlý průvodce

## 📋 Shrnutí

Implementováno vícevrstvé zabezpečení veřejné kalkulačky proti zneužívání:

✅ **Vylepšená validace emailu** - regex kontrola platnosti  
✅ **Server-side tracking** - databázové sledování použití  
✅ **Rate limiting podle IP** - max 3 výpočty/24h  
✅ **Omezení podle emailu** - 1 výpočet/30 dní  

## 🚀 Rychlé nasazení

### 1. Spustit SQL migraci
```bash
# Otevřít Supabase Dashboard → SQL Editor
# Zkopírovat a spustit obsah souboru:
demon-agro/lib/supabase/sql/create_calculator_usage_table.sql
```

### 2. Ověřit environment variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # ⚠️ DŮLEŽITÉ - musí být nastaveno!
```

### 3. Build a deploy
```bash
npm run build
# nebo deploy na Vercel
```

### 4. Testování
```bash
# Lokální test
BASE_URL=http://localhost:3000 node scripts/test-calculator-security.js

# Produkční test
BASE_URL=https://demonagro.cz node scripts/test-calculator-security.js

# Test včetně rate limiting
BASE_URL=http://localhost:3000 node scripts/test-calculator-security.js --rate-limit
```

## 📁 Změněné/Vytvořené soubory

### Nové soubory
- ✅ `lib/supabase/sql/create_calculator_usage_table.sql` - DB migrace
- ✅ `app/api/calculator/check-usage/route.ts` - API kontrola
- ✅ `app/api/calculator/record-usage/route.ts` - API záznam
- ✅ `scripts/test-calculator-security.js` - Test script
- ✅ `CALCULATOR_SECURITY_IMPLEMENTATION.md` - Detailní dokumentace
- ✅ `CALCULATOR_SECURITY_README.md` - Tento soubor

### Upravené soubory
- ✅ `app/(public)/kalkulacka/page.tsx` - Frontend s API integrací

## 🧪 Manuální testování

### Test 1: Neplatný email
1. Otevřít kalkulačku: https://demonagro.cz/kalkulacka
2. Vyplnit formulář s emailem `a@a`
3. ✅ Měla by se zobrazit chyba: "Zadejte platnou emailovou adresu..."

### Test 2: Duplicitní email
1. Vyplnit kalkulačku s platným emailem
2. Odeslat výpočet
3. Zkusit znovu se stejným emailem
4. ✅ Měla by se zobrazit chyba: "Na tento email již byl odeslán výsledek..."

### Test 3: Rate limit
1. Vyplnit kalkulačku 3× s různými emaily
2. Zkusit 4. výpočet
3. ✅ Měla by se zobrazit chyba: "Byl překročen denní limit..."

## 📊 Monitoring

### Supabase Dashboard
```sql
-- Použití za poslední 24 hodin
SELECT COUNT(*) FROM calculator_usage 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Nejaktivnější IP adresy
SELECT ip_address, COUNT(*) as count 
FROM calculator_usage 
GROUP BY ip_address 
ORDER BY count DESC 
LIMIT 10;
```

## ⚙️ Konfigurace

### Změna rate limitu
Upravit v SQL funkci `check_calculator_ip_rate_limit`:
```sql
-- Aktuálně: 3 za 24 hodin
RETURN usage_count >= 3;

-- Změnit na např. 5 za 24 hodin:
RETURN usage_count >= 5;
```

### Změna periody emailu
Upravit v SQL funkci `check_calculator_email_usage`:
```sql
-- Aktuálně: 30 dní
AND created_at > NOW() - INTERVAL '30 days';

-- Změnit na např. 7 dní:
AND created_at > NOW() - INTERVAL '7 days';
```

## 🆘 Troubleshooting

### API vrací 500 chybu
- ✅ Zkontrolovat `SUPABASE_SERVICE_ROLE_KEY` v environment variables
- ✅ Ověřit, že SQL migrace byla spuštěna
- ✅ Zkontrolovat Supabase logs

### Validace nefunguje
- ✅ Vymazat cache prohlížeče
- ✅ Zkontrolovat Network tab v DevTools
- ✅ Ověřit, že API endpointy jsou dostupné

### Rate limit se neresetuje
- ✅ Funkce používá 24hodinové okno, ne půlnoc
- ✅ Pro reset smazat záznamy z `calculator_usage` tabulky

## 📞 Podpora

Pro uživatele, kteří potřebují více výpočtů:
- 📧 Email: base@demonagro.cz
- 📱 Telefon: +420 731 734 907
- 🌐 Registrace do portálu: https://demonagro.cz/auth/register

## 📚 Další dokumentace

Detailní dokumentace: `CALCULATOR_SECURITY_IMPLEMENTATION.md`

---

**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Status:** ✅ Připraveno k nasazení

