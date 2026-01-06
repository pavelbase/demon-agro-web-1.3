# FIX: Oprava chyby při ukládání plánů vápnění

## 🔴 PROBLÉM

Při vytváření plánu vápnění se objevuje chyba:

```
Error inserting applications: {
  code: '23503',
  message: 'insert or update on table "liming_applications" violates foreign key constraint "liming_applications_lime_product_id_fkey"',
  details: 'Key is not present in table "lime_products".'
}
```

## 🔍 PŘÍČINA

Foreign key constraint v tabulce `liming_applications` odkazuje na **neexistující** tabulku `lime_products` místo správné tabulky `liming_products`.

Toto je chyba v databázovém schématu, kterou je potřeba opravit přímo v databázi.

## ✅ ŘEŠENÍ

### Varianta A: Přes Supabase Dashboard (DOPORUČENO)

1. Otevřete Supabase Dashboard: https://supabase.com/dashboard
2. Vyberte projekt `demon-agro`
3. V levém menu klikněte na **SQL Editor**
4. Vytvořte nový query
5. Zkopírujte a vložte následující SQL:

```sql
-- ============================================================================
-- OPRAVA: Foreign key constraint v liming_applications
-- ============================================================================

-- 1. Odstranit špatný constraint
ALTER TABLE liming_applications 
DROP CONSTRAINT IF EXISTS liming_applications_lime_product_id_fkey;

-- 2. Vytvořit nový správný constraint
ALTER TABLE liming_applications
ADD CONSTRAINT liming_applications_liming_product_id_fkey
FOREIGN KEY (lime_product_id) 
REFERENCES liming_products(id) 
ON DELETE SET NULL;

-- 3. Ověření
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'liming_applications'::regclass
  AND contype = 'f'
  AND conname LIKE '%lime_product%';
```

6. Klikněte na **RUN** (nebo Ctrl+Enter)
7. Měli byste vidět výsledek:

```
constraint_name                              | table_name           | referenced_table
---------------------------------------------|----------------------|-------------------
liming_applications_liming_product_id_fkey   | liming_applications  | liming_products
```

### Varianta B: Přes psql (pokud máte přímý přístup)

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  -f lib/supabase/sql/fix_liming_applications_constraint.sql
```

### Varianta C: Přes API endpoint (debugování)

1. Přihlaste se do portálu
2. Otevřete v prohlížeči: http://localhost:3000/api/admin/debug-liming-db
3. Uvidíte diagnostiku všech tabulek a doporučení

## 📝 PO OPRAVĚ

1. Zkuste znovu vytvořit plán vápnění v detailu pozemku
2. Mělo by fungovat bez chyb
3. Tento soubor můžete smazat (už nebude potřeba)
4. Diagnostický endpoint můžete smazat: `app/api/admin/debug-liming-db/route.ts`

## 🧪 TESTOVÁNÍ

Po aplikaci opravy vyzkoušejte:

1. Otevřete detail pozemku s rozboreme půdy
2. Přejděte na tab "Plán vápnění"
3. Klikněte na "Generovat plán" nebo tlačítko pro vytvoření plánu
4. Plán by se měl úspěšně uložit do databáze

## 📚 KONTEXT

Tato chyba vznikla kvůli nesrovnalosti v názvech tabulek:
- Správný název: `liming_products` ✅
- Špatná reference: `lime_products` ❌

SQL migrace `create_liming_plans.sql` obsahuje správný název, ale constraint v databázi byl vytvořen s nesprávným odkazem.

---

**Autor:** AI Assistant  
**Datum:** 2026-01-03  
**Status:** ✅ Připraveno k použití


