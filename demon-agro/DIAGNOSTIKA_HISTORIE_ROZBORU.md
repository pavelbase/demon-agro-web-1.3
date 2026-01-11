# 🔍 DIAGNOSTIKA: Proč stránka "Historie rozborů" nefunguje?

## Možné příčiny a řešení

### ❓ Příčina 1: Stále není spuštěna databázová migrace
**Důsledek:** Rozbory se neuložily kvůli chybě pH constraint.

**Jak zkontrolovat:**
Podívejte se do terminálu na řádek 963 v `terminals/15.txt`:
```
❌ Chyb: 8
```

To znamená, že 8 rozborů se NEULOŽILO kvůli chybě:
```
violates check constraint "soil_analyses_ph_category_check"
```

**✅ ŘEŠENÍ:**
1. Otevřete Supabase Dashboard → SQL Editor
2. Spusťte SQL z `lib/supabase/sql/update_ph_category_constraint.sql`
3. Potom znovu nahrajte PDF s rozbory

---

### ❓ Příčina 2: Data nejsou v databázi
**Důsledek:** Stránka zobrazuje "Zatím žádné rozbory".

**Jak zkontrolovat:**
1. Otevřete Supabase Dashboard
2. Jděte na Table Editor → `soil_analyses`
3. Zkontrolujte, jestli tam jsou nějaké záznamy

**✅ ŘEŠENÍ:**
Pokud nejsou data:
- Spusťte NEJDŘÍV databázovou migraci (viz Příčina 1)
- Pak nahrajte PDF s rozbory znovu

---

### ❓ Příčina 3: Browser cache
**Důsledek:** Prohlížeč má uložený starý JavaScript.

**✅ ŘEŠENÍ:**
1. Stiskněte `Ctrl + Shift + R` (hard refresh)
2. Nebo smažte cache prohlížeče

---

## 🎯 Postup řešení krok za krokem

### Krok 1: Zkontrolujte, jestli jste spustili migraci
```sql
-- Spusťte v Supabase SQL Editor:
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'soil_analyses_ph_category_check';
```

**Očekávaný výsledek:**
```
CHECK ((ph_category = ANY (ARRAY['EK'::text, 'SK'::text, 'N'::text, 'SZ'::text, 'EZ'::text])))
```

❌ **Pokud je jiný výsledek** → SPUSŤTE MIGRACI!

### Krok 2: Zkontrolujte data v databázi
```sql
-- Spusťte v Supabase SQL Editor:
SELECT COUNT(*) as pocet_rozboru 
FROM soil_analyses 
WHERE parcel_id = 'VAŠ_PARCEL_ID';
```

❌ **Pokud je 0** → Nahrajte rozbory znovu (po migraci!)

### Krok 3: Zkontrolujte browser console
1. Otevřete stránku "Historie rozborů"
2. Otevřete Developer Tools (F12)
3. Podívejte se do Console
4. Jsou tam nějaké červené chyby?

---

## 🚨 NEJČASTĚJŠÍ PROBLÉM

**90% pravděpodobnost:** Nespustili jste databázovou migraci!

### Rychlý test:
Zkuste nahrát PDF s rozbory. Pokud se v terminálu objeví:
```
❌ Chyba při vytváření soil_analysis: {
  code: '23514',
  message: 'violates check constraint "soil_analyses_ph_category_check"'
}
```

→ **Jednoznačně potřebujete spustit migraci!**

---

## 📝 Checklist

Projděte postupně:

- [ ] Spustil jsem SQL migraci v Supabase?
- [ ] Vidím v Supabase → soil_analyses nějaká data?
- [ ] Zkusil jsem hard refresh (Ctrl+Shift+R)?
- [ ] Restartoval jsem dev server?
- [ ] Nahrál jsem PDF rozbory PO spuštění migrace?

---

## 💡 Co mi pomoct?

**Pokud stále nefunguje, pošlete mi:**
1. Screenshot stránky "Historie rozborů"
2. Console log (F12 → Console)
3. Výsledek SQL query:
```sql
SELECT * FROM soil_analyses LIMIT 5;
```

---

**TL;DR:** Nejdřív spusťte migraci z `update_ph_category_constraint.sql`, pak nahrajte rozbory znovu!




