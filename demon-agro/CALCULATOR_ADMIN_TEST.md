# 🧪 Kalkulačka Admin - Testovací Návod

**Čas:** ~10 minut  
**Cíl:** Ověřit, že kalkulačka ukládá data do DB a admin je může prohlížet

---

## ⚙️ Příprava (DŮLEŽITÉ!)

### 1. Spustit SQL migraci

Otevřít Supabase SQL Editor a spustit:

```sql
-- Soubor: lib/supabase/sql/add_calculator_results_column.sql

ALTER TABLE public.calculator_usage
ADD COLUMN IF NOT EXISTS calculation_results JSONB;

ALTER TABLE public.calculator_usage
ADD COLUMN IF NOT EXISTS viewed_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_calculator_usage_marketing_consent
ON public.calculator_usage((calculation_data->>'marketing_consent'))
WHERE (calculation_data->>'marketing_consent') = 'true';

CREATE INDEX IF NOT EXISTS idx_calculator_usage_created_desc
ON public.calculator_usage(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calculator_usage_unviewed
ON public.calculator_usage(viewed_by_admin)
WHERE viewed_by_admin = false;
```

### 2. Ověřit, že dev server běží

```bash
cd demon-agro
npm run dev
```

Server by měl běžet na: **http://localhost:3001**

---

## 🧮 Test 1: Vyplnit kalkulačku

### Krok 1: Otevřít kalkulačku
- URL: `http://localhost:3001/kalkulacka`
- Měla by se zobrazit stránka s nadpisem "Kalkulačka vápnění"

### Krok 2: Vyplnit formulář

**Krok 1 - Výběr typu půdy:**
- Vybrat: **Střední (hlinitá)**
- Kliknout: **Další**

**Krok 2 - Zadání hodnot:**
- pH: `5.2`
- P (mg/kg): `80`
- K (mg/kg): `150`
- Mg (mg/kg): `60`
- Ca (mg/kg): `1200`
- S (mg/kg): `15`
- Kliknout: **Další**

**Krok 3 - Kontaktní údaje:**
- Jméno: `Jan Testovací`
- Email: `test@example.com` (použijte REÁLNÝ email pro test!)
- Telefon: `+420 123 456 789`
- Firma: `Testovací farma s.r.o.`
- ✅ Zaškrtnout: **Souhlasím s marketingovou komunikací**
- Kliknout: **Vypočítat**

### Krok 3: Ověřit výsledek

**Na obrazovce by se mělo zobrazit:**
- ✅ Výsledky kalkulace
- ✅ Alert: "Výsledky odeslány na váš email"
- ✅ Potřeba CaO (např. "2.5 t/ha")
- ✅ Tabulka s živinami

**V emailu by měl dorazit:**
- ✅ Email s předmětem "Výsledky kalkulace vápnění - Démon agro"
- ✅ Obsahuje typ půdy, pH, potřebu CaO
- ✅ Obsahuje souhrn živin

---

## 👨‍💼 Test 2: Prohlédnout v admin panelu

### Krok 1: Přihlásit se jako admin
- URL: `http://localhost:3001/portal/dashboard`
- Přihlásit se účtem s `role = 'admin'`

### Krok 2: Otevřít kalkulace
- V levém menu kliknout: **Kalkulace** (ikona kalkulačky)
- URL: `http://localhost:3001/portal/admin/kalkulace`

### Krok 3: Ověřit statistiky

**Měly by se zobrazit 3 karty:**
- **Celkem kalkulací**: Minimálně 1
- **Neprohlédnuté**: Minimálně 1 (nová kalkulace)
- **Souhlas s marketingem**: Minimálně 1 (pokud jste zaškrtli)

### Krok 4: Ověřit tabulku

**Měla by se zobrazit tabulka s kalkulací:**
- ✅ Datum: Dnešní datum a čas
- ✅ Kontakt: "Jan Testovací", "test@example.com"
- ✅ Půda & pH: "S", "pH: 5,20"
- ✅ Potřeba CaO: Např. "2,50 t/ha"
- ✅ Marketing: Zelený badge "Ano"
- ✅ Stav: Oranžový text "Nové" s ikonou oka
- ✅ Řádek má modré pozadí (neprohlédnuté)

### Krok 5: Otevřít detail
- Kliknout na **ikonu oka** u kalkulace
- Měl by se otevřít modal

**V modalu by se mělo zobrazit:**
- ✅ **Kontaktní údaje**: Jméno, Email, Telefon, Firma
- ✅ **Metadata**: Datum, IP adresa, Marketing souhlas: Ano
- ✅ **Vstupní údaje**: Typ půdy S, pH 5,20, P 80, K 150, Mg 60, Ca 1200, S 15
- ✅ **Výsledky vápnění**: Potřeba CaO, Optimální pH rozmezí, Doporučené množství
- ✅ **Výsledky živin**: Tabulka s P, K, Mg, Ca, S (třída, stav, deficit)
- ✅ **Poznámka admina**: Prázdné textarea

### Krok 6: Přidat poznámku
- Do textarea napsat: `Kontaktovat zákazníka ohledně nabídky`
- Kliknout: **Uložit poznámku**
- Modal by se měl zavřít
- Stránka by se měla obnovit

### Krok 7: Ověřit označení jako prohlédnuté
- Kalkulace by už **NEMĚLA** mít modré pozadí
- Stav by měl být: ✅ "Prohlédnuto" (šedý text s checkmarkem)
- Statistika "Neprohlédnuté" by měla klesnout o 1

### Krok 8: Otevřít detail znovu
- Kliknout na ikonu oka
- V poznámce admina by mělo být: `Kontaktovat zákazníka ohledně nabídky`

---

## 📊 Test 3: Filtry a export

### Krok 1: Test filtrů

**Search:**
- Do pole "Hledat" napsat: `Jan`
- Měla by se zobrazit kalkulace s "Jan Testovací"
- Napsat: `test@example.com`
- Měla by se zobrazit stejná kalkulace

**Viewed filter:**
- Vybrat: **Neprohlédnuté**
- Kalkulace by **NEMĚLA** být vidět (už je prohlédnutá)
- Vybrat: **Prohlédnuté**
- Kalkulace by **MĚLA** být vidět

**Marketing filter:**
- Vybrat: **Souhlas s marketingem**
- Kalkulace by **MĚLA** být vidět (zaškrtli jsme souhlas)

### Krok 2: Export Excel
- Kliknout: **Export Excel** (modrý button)
- Měl by se stáhnout soubor: `kalkulace_2026-01-06.xlsx`
- Otevřít v Excelu/LibreOffice
- Měla by být tabulka s daty:
  - Datum, Email, Jméno, Firma, Telefon
  - Typ půdy, pH, P, K, Mg
  - Potřeba CaO
  - Marketing souhlas: Ano
  - Prohlédnuto: Ano
  - Poznámka admina: "Kontaktovat zákazníka ohledně nabídky"

---

## 🗄️ Test 4: Ověřit databázi

### Otevřít Supabase SQL Editor

```sql
-- Zobrazit poslední kalkulaci
SELECT 
  id,
  email,
  calculation_data->>'jmeno' as jmeno,
  calculation_data->>'firma' as firma,
  calculation_data->>'marketing_consent' as marketing,
  calculation_results->>'vstup' as vstup,
  viewed_by_admin,
  admin_notes,
  created_at
FROM calculator_usage
ORDER BY created_at DESC
LIMIT 1;
```

**Mělo by se zobrazit:**
- ✅ Email: `test@example.com`
- ✅ Jméno: `Jan Testovací`
- ✅ Firma: `Testovací farma s.r.o.`
- ✅ Marketing: `true`
- ✅ Vstup: JSON s pH, P, K, Mg, atd.
- ✅ viewed_by_admin: `true`
- ✅ admin_notes: `Kontaktovat zákazníka ohledně nabídky`
- ✅ created_at: Dnešní datum

---

## ✅ Checklist úspěšného testu

- [ ] Kalkulačka se zobrazí a funguje
- [ ] Po výpočtu se zobrazí výsledky
- [ ] Email dorazil na zadanou adresu
- [ ] Admin panel zobrazuje kalkulaci v tabulce
- [ ] Statistiky jsou správné
- [ ] Detail modal zobrazuje všechny údaje
- [ ] Lze přidat admin poznámku
- [ ] Označení jako prohlédnuté funguje
- [ ] Filtry fungují (search, viewed, marketing)
- [ ] Export Excel funguje a obsahuje správná data
- [ ] Data jsou v databázi (SQL query)

---

## 🐛 Pokud něco nefunguje

### Email se neodeslal
1. Zkontrolovat console v prohlížeči (F12)
2. Měla by být chyba od EmailJS
3. Ověřit EmailJS dashboard (quota, service status)
4. I když email selže, kalkulace by se měla uložit do DB!

### Kalkulace není v admin panelu
1. Zkontrolovat, že SQL migrace byla spuštěna
2. Zkontrolovat databázi (SQL query výše)
3. Zkontrolovat server logs (`npm run dev` terminal)
4. Zkontrolovat console v prohlížeči

### Admin panel zobrazuje "Unauthorized"
1. Ověřit, že uživatel má `role = 'admin'`
2. SQL query: `SELECT role FROM profiles WHERE email = 'vase@email.cz'`
3. Pokud není admin, nastavit: `UPDATE profiles SET role = 'admin' WHERE email = 'vase@email.cz'`

---

## 🎉 Hotovo!

Pokud všechny testy prošly, implementace je **funkční** a **připravená k produkci**! 🚀

**Další kroky:**
1. Spustit SQL migraci na produkční databázi
2. Otestovat na produkci s reálným emailem
3. Monitorovat příchozí kalkulace
4. Kontaktovat zákazníky s marketing souhlasem

---

**Test Date**: January 6, 2026  
**Status**: Ready for Testing ✅

