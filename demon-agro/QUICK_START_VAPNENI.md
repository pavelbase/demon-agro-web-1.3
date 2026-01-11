# ⚡ QUICK START - Vlhkost a částice pro vápnění

## 🎯 Co potřebuješ udělat (2 minuty)

### 1️⃣ Spusť SQL v Supabase

**Přihlas se do Supabase → SQL Editor → Spusť:**

```sql
-- Zkopíruj a spusť celý obsah souboru:
lib/supabase/sql/create_liming_products_complete.sql
```

✅ Tím vytvoříš tabulku včetně všech nových polí pro vlhkost a částice!

---

### 2️⃣ Přidej své produkty

**Admin → Produkty vápnění → Přidat produkt**

#### Dolomit Štěpán (O1635)
```
Název: Dolomit Štěpán
Typ: Dolomitický
CaO: 50.0%
MgO: 40.0%
Reaktivita: Střední

--- Fyzikální vlastnosti ---
Vlhkost: 3.0%
Částice nad 1 mm: 18.0%
Částice pod 0.5 mm: 74.0%
```

#### Vápenec Vitošov (O635)
```
Název: Vápenec Vitošov jemně mletý
Typ: Kalcitický
CaO: 45.0%
MgO: 1.0%
Reaktivita: Vysoká

--- Fyzikální vlastnosti ---
Vlhkost: 17.5%
Částice 0.09-0.5 mm: 90.0%
```

---

## ❌ Pokud dostaneš chybu

### "relation liming_products does not exist"

✅ **To je OK!** Tabulka ještě neexistuje, což je normální.

**Řešení:** Spusť `create_liming_products_complete.sql` (viz Krok 1 výše)

📖 Detailní návod: `OPRAVA_LIMING_PRODUCTS_ERROR.md`

---

## 📚 Více informací

**Rychlý start:**
- ⚡ Tento soubor - základní postup
- 📋 `OPRAVA_LIMING_PRODUCTS_ERROR.md` - řešení chyb

**Kompletní dokumentace:**
- 📖 `HOTOVO_VAPNENI_VLHKOST_CASTICE.md` - úplný přehled
- 📚 `VAPNENI_PRODUKTY_REFERENCE.md` - všechny hodnoty z etiket
- 🔧 `MIGRACE_VAPNENI_VLHKOST_CASTICE.md` - technické detaily

---

## ✅ Hotovo!

Po spuštění SQL můžeš hned začít zadávat produkty s kompletními údaji včetně vlhkosti a obsahu částic z etiket.

**Přepočet CaO/MgO z etiket najdeš v:** `VAPNENI_PRODUKTY_REFERENCE.md`

---

*Quick Start vytvořen: 3.1.2026*



