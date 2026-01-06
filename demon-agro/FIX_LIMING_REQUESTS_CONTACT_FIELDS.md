# Fix: Chybějící tabulka/sloupce liming_requests

## 🐛 Problém

Při odesílání poptávky vápnění se zobrazuje chyba:
```
Error creating request: {
  code: 'PGRST204',
  message: "Could not find the 'delivery_address' column of 'liming_requests' in the schema cache"
}
```
nebo podobné chyby s jinými sloupci (`contact_email`, `contact_person`, atd.)

## 🔍 Příčina

Tabulka `liming_requests` v databázi buď neexistuje vůbec, nebo má neúplnou strukturu.

## ✅ Řešení

Spusťte SQL skript, který vytvoří/opraví tabulku s kompletní strukturou.

### Krok 1: Otevřete Supabase SQL Editor

1. Přihlaste se do Supabase Dashboard
2. Vyberte projekt
3. V levém menu klikněte na **SQL Editor**

### Krok 2: Spusťte SQL skript

**DŮLEŽITÉ: Použijte tento soubor:**
```
lib/supabase/sql/create_liming_requests_table.sql
```

1. Otevřete soubor: `lib/supabase/sql/create_liming_requests_table.sql`
2. Zkopírujte **celý obsah** souboru (všech ~240 řádků)
3. Vložte do SQL Editoru v Supabase
4. Klikněte na **Run** (nebo Ctrl+Enter)

### Krok 3: Ověření

Po spuštění SQL skriptu byste měli vidět:
1. **Výpis struktury tabulky** - všechny sloupce včetně:
   - `delivery_address`
   - `contact_person`
   - `contact_phone`
   - `contact_email`
   - `notes`
   - a další...

2. **Výpis indexů** - měly by být vytvořeny indexy na `user_id`, `status`, `created_at`

3. **Výpis RLS policies** - mělo by být 6 policies

4. **Počet záznamů** - `requests_count`

### Krok 4: Test

1. Obnovte stránku s poptávkou vápnění
2. Zkuste odeslat poptávku znovu
3. Mělo by to nyní fungovat ✅

## 📋 Struktura tabulky liming_requests

| Sloupec | Typ | Popis |
|---------|-----|-------|
| `id` | UUID | Primární klíč |
| `user_id` | UUID | Reference na auth.users |
| `status` | VARCHAR(50) | Stav (new, in_progress, quoted, completed, cancelled) |
| `total_area` | DECIMAL(10,2) | Celková výměra v ha |
| `total_quantity` | DECIMAL(10,2) | Celkové množství v t |
| `delivery_address` | TEXT | Dodací adresa |
| `delivery_date` | VARCHAR(100) | Požadované datum dodání |
| `contact_person` | VARCHAR(255) | Jméno kontaktní osoby |
| `contact_phone` | VARCHAR(50) | Telefonní číslo |
| `contact_email` | VARCHAR(255) | Email |
| `notes` | TEXT | Poznámky od uživatele |
| `admin_notes` | TEXT | Interní poznámky administrátora |
| `quote_amount` | DECIMAL(10,2) | Částka nabídky |
| `quote_pdf_url` | TEXT | URL na PDF nabídku |
| `created_at` | TIMESTAMP | Datum vytvoření |
| `updated_at` | TIMESTAMP | Datum poslední úpravy (auto) |

## 🔒 Bezpečnost

SQL skript je **bezpečný**:
- Používá `CREATE TABLE IF NOT EXISTS` - pokud tabulka existuje, nic se nepřepíše
- Používá `CREATE INDEX IF NOT EXISTS` - indexy se nepřepíší
- Používá `DROP POLICY IF EXISTS` před vytvořením - zajistí správné policies
- **NEMAZÁNÍ DAT**: Pokud tabulka už existuje s daty, data zůstanou zachována

⚠️ **Poznámka**: Pokud potřebujete tabulku úplně znovu vytvořit (vymazat existující data), 
odkomentujte řádek `DROP TABLE IF EXISTS public.liming_requests CASCADE;` na začátku SQL souboru.

## 📝 Poznámky

Po spuštění této migrace bude systém poptávek vápnění plně funkční včetně:
- Ukládání kontaktních informací
- Poznámek k poptávce
- Admin funkcí (nabídky, interní poznámky)

## ⚙️ Pokud tabulka existuje, ale chybí jen některé sloupce

Pokud tabulka `liming_requests` už existuje, ale chybí jen některé sloupce, použijte alternativní skript:
```
lib/supabase/sql/add_contact_fields_to_liming_requests.sql
```

Tento skript **bezpečně přidá pouze chybějící sloupce** bez ovlivnění existujících dat.

---

## ✅ Opravené problémy v kódu

**1. Chybějící `await` v Server Actions:**
- ✅ `lib/actions/liming-requests.ts` (řádek 29) - přidán `await` před `createClient()`
- ✅ `lib/actions/admin-audit.ts` (řádek 14) - přidán `await` před `createClient()`

**2. Chybějící databázová tabulka:**
- 📝 **Potřebuje spustit SQL skript** - viz instrukce výše

---

## 🎯 Shrnutí

Po spuštění SQL skriptu `create_liming_requests_table.sql` bude:
- ✅ Tabulka `liming_requests` vytvořena/opravena s kompletní strukturou
- ✅ Všechny potřebné indexy vytvořeny
- ✅ RLS policies nastaveny (ochrana dat)
- ✅ Trigger pro automatickou aktualizaci `updated_at`
- ✅ Systém poptávek vápnění plně funkční

