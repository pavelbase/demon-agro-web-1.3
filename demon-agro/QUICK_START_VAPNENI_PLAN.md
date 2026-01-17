# 🚀 QUICK START: Systém plánování vápnění

## Rychlý průvodce spuštěním

### Krok 1: Spuštění databázové migrace

```bash
# Přejdi do složky projektu
cd demon-agro

# Spusť SQL migraci pro vytvoření tabulek
# MOŽNOST A: Pomocí psql (pokud máš přímý přístup)
psql -h <SUPABASE_HOST> -U postgres -d postgres -f lib/supabase/sql/create_liming_plans.sql

# MOŽNOST B: Pomocí Supabase Dashboard
# 1. Otevři Supabase Dashboard
# 2. Přejdi na SQL Editor
# 3. Zkopíruj obsah souboru lib/supabase/sql/create_liming_plans.sql
# 4. Spusť dotaz

# MOŽNOST C: Pomocí Supabase CLI (doporučeno)
supabase db push
```

### Krok 2: Naplnění produktů

```bash
# Vlož základní vápenné produkty
psql -h <SUPABASE_HOST> -U postgres -d postgres -f lib/supabase/sql/insert_lime_products.sql

# Nebo přes Dashboard (SQL Editor)
```

### Krok 3: Testování kalkulátoru (volitelné)

```bash
# Spusť testovací script pro ověření výpočtů
npx tsx test-liming-plan.ts
```

**Očekávaný výstup:**
```
============================================================
TEST 1: Lehká půda, pH 5.0 → 6.0, Mg 76 (nízké)
============================================================

📊 VÝSLEDKY:
✓ Celková potřeba Ca: 15.00 t (1.50 t/ha)
✓ Celková potřeba CaO: 21.00 t (2.10 t/ha)
✓ Počet aplikací: 2

📅 APLIKACE:

1. Aplikace:
   Rok: 2026
   Období: podzim
   Produkt: Dolomit mletý (30% CaO, 18% MgO)
   Dávka: 3.67 t/ha (celkem 36.7 t)
   CaO: 1.10 t/ha
   MgO: 0.66 t/ha
   pH změna: 5.0 → 5.4
   Mg změna: → 604 mg/kg
   Doporučení: Kriticky nízké Mg - dolomit NUTNÝ

2. Aplikace:
   Rok: 2029
   Období: podzim
   Produkt: Dolomit mletý (30% CaO, 18% MgO)
   Dávka: 3.33 t/ha (celkem 33.3 t)
   CaO: 1.00 t/ha
   MgO: 0.60 t/ha
   pH změna: 5.4 → 5.9
   Mg změna: → 1084 mg/kg
   Doporučení: Nízké Mg - doporučen dolomit

⚠️  UPOZORNĚNÍ:
   - Doporučeny kontrolní rozbory 1 rok po každé aplikaci
   - Pozor: Plán nedosahuje cílového pH (zbývá 0.11 t CaO/ha). Možná je cílové pH příliš vysoké.
```

### Krok 4: Spuštění aplikace

```bash
# Vývoj
npm run dev

# Produkce
npm run build
npm start
```

### Krok 5: První test v UI

1. **Otevři prohlížeč:** http://localhost:3000
2. **Přihlaš se** jako testovací uživatel
3. **Vytvoř testovací pozemek:**
   - Název: "Test vápnění"
   - Výměra: 10 ha
   - Půdní typ: S (střední)
4. **Vytvoř půdní rozbor:**
   - pH: 5.0
   - Mg: 76 mg/kg
5. **Přejdi na plán vápnění:**
   - `/portal/pozemky/[id]/plan-vapneni`
6. **Vygeneruj plán:**
   - Cílové pH: 6.5
   - Klikni "Vygenerovat plán"
7. **Ověř výsledek:**
   - Měly by se zobrazit 2-3 aplikace
   - První by měla být dolomit (kvůli nízkému Mg)
   - Interval 3 roky mezi aplikacemi
8. **Exportuj do Excelu:**
   - Klikni "Exportovat do Excelu"
   - Ověř 3 listy: Souhrn, Časový plán, Upozornění

---

## ✅ Checklist před spuštěním

- [ ] Tabulky vytvořeny (liming_plans, liming_applications)
- [ ] Produkty naplněny (min. 2: vápenec + dolomit)
- [ ] Tabulka lime_products má sloupce cao_content, mgo_content, moisture, particles
- [ ] RLS politiky aktivní
- [ ] Test script prošel (volitelné)
- [ ] Aplikace běží na dev serveru

---

## 🐛 Rychlé řešení problémů

### "Tabulka už existuje"
```sql
DROP TABLE IF EXISTS liming_applications CASCADE;
DROP TABLE IF EXISTS liming_plans CASCADE;
-- Pak znovu spusť migraci
```

### "Žádné produkty k dispozici"
```sql
SELECT * FROM lime_products WHERE is_active = true;
-- Pokud prázdné, spusť insert_lime_products.sql
```

### "RLS blokuje přístup"
```sql
-- Zkontroluj vlastnictví pozemku
SELECT * FROM parcels WHERE user_id = '<tvuj_user_id>';
```

### "Excel export nefunguje"
```bash
# Ověř instalaci xlsx
npm list xlsx
# Pokud chybí:
npm install xlsx
```

---

## 📞 Potřebuješ pomoc?

1. Přečti si detailní dokumentaci: `SYSTEM_PLANOVANI_VAPNENI.md`
2. Zkontroluj SQL logy v Supabase Dashboard
3. Zkontroluj browser console pro chyby
4. Spusť test script: `npx tsx test-liming-plan.ts`

---

**Vytvořeno:** 2026-01-03  
**Čas instalace:** ~10 minut  
**Obtížnost:** Středně pokročilá




