# ⚡ Rychlá oprava - Poptávky vápnění nefungují

## 🎯 Problém
Chyba: **"Nepodařilo se vytvořit poptávku"**

## ✅ Řešení (3 minuty)

### 1️⃣ Otevřete Supabase
- Přihlaste se na [supabase.com](https://supabase.com)
- Vyberte projekt Démon Agro
- Klikněte na **SQL Editor** v levém menu

### 2️⃣ Spusťte SQL skript
1. Otevřete soubor: `lib/supabase/sql/create_liming_requests_table.sql`
2. **Zkopírujte celý obsah** (Ctrl+A, Ctrl+C)
3. **Vložte do SQL Editoru** v Supabase (Ctrl+V)
4. **Klikněte na RUN** (nebo Ctrl+Enter)

### 3️⃣ Ověření
Po spuštění uvidíte výpis:
- ✅ Strukturu tabulky (16 sloupců)
- ✅ Indexy (3 indexy)
- ✅ RLS policies (6 policies)
- ✅ Trigger

### 4️⃣ Test
1. Obnovte stránku s poptávkou (F5)
2. Zkuste odeslat poptávku znovu
3. ✅ **Hotovo!**

---

## 📚 Detailní dokumentace
Viz: `FIX_LIMING_REQUESTS_CONTACT_FIELDS.md`

## 🐛 Technické detaily
- **Příčina**: Tabulka `liming_requests` neexistovala nebo měla neúplnou strukturu
- **Řešení**: SQL skript vytvoří kompletní tabulku s všemi sloupci
- **Bezpečné**: Nepřepíše existující data

