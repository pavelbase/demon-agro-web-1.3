# Migrace databáze - Vlhkost a obsah částic u produktů vápnění

## 📋 Co bylo přidáno

Do tabulky `liming_products` byly přidány 4 nové sloupce pro fyzikální vlastnosti:

1. **moisture_content** - Vlhkost v %
2. **particles_over_1mm** - Částice nad 1 mm v %
3. **particles_under_05mm** - Částice pod 0,5 mm v %
4. **particles_009_05mm** - Částice 0,09-0,5 mm v %

## 🚀 Jak spustit migraci

### 1. Připojení k databázi
Připoj se k Supabase databázi přes SQL Editor nebo pgAdmin.

### 2. Spuštění migrace
Spusť SQL soubor:
```sql
-- Spustit tento soubor:
demon-agro/lib/supabase/sql/add_moisture_particles_to_liming_products.sql
```

### 3. Verifikace
Po spuštění zkontroluj, že sloupce byly přidány:
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'liming_products' 
AND column_name IN (
  'moisture_content',
  'particles_over_1mm', 
  'particles_under_05mm',
  'particles_009_05mm'
)
ORDER BY column_name;
```

**Očekávaný výstup:**
```
column_name              | data_type | is_nullable
------------------------+------------+-------------
moisture_content        | numeric    | YES
particles_009_05mm      | numeric    | YES
particles_over_1mm      | numeric    | YES
particles_under_05mm    | numeric    | YES
```

## 📝 Co bylo upraveno v kódu

### 1. Frontend komponenty

**LimingProductModal.tsx**
- ✓ Přidána pole pro vlhkost a obsah částic
- ✓ Organizovaná sekce "Fyzikální vlastnosti"
- ✓ Validace a formátování hodnot
- ✓ Nápovědy pro uživatele

**LimingProductsTable.tsx**
- ✓ Nový sloupec "Vlhkost %"
- ✓ Nový sloupec "Částice" s detaily
- ✓ Zobrazení všech tří typů frakce částic
- ✓ Responzivní zobrazení

### 2. Backend API

**create/route.ts**
- ✓ Přidáno přijímání nových parametrů
- ✓ Insert do databáze s novými sloupci

**update/route.ts**
- ✓ Přidáno přijímání nových parametrů
- ✓ Update databáze s novými sloupci

## 🧪 Testování

### 1. Vytvoření nového produktu
1. Přihlas se jako admin
2. Jdi na `/portal/admin/produkty-vapneni`
3. Klikni "Přidat produkt"
4. Vyplň základní údaje + fyzikální vlastnosti
5. Ulož

### 2. Úprava existujícího produktu
1. U existujícího produktu klikni na ✏️ (Edit)
2. Přidej hodnoty vlhkosti a částic
3. Ulož změny
4. Zkontroluj zobrazení v tabulce

### 3. Příklad testovacích dat

**Dolomit:**
```
Název: Dolomit Štěpán (Test)
Typ: Dolomitický
CaO: 50.0%
MgO: 40.0%
Reaktivita: Střední
Vlhkost: 3.0%
Částice nad 1mm: 18.0%
Částice pod 0.5mm: 74.0%
```

**Vápenec:**
```
Název: Vápenec Vitošov (Test)
Typ: Kalcitický
CaO: 45.0%
MgO: 1.0%
Reaktivita: Vysoká
Vlhkost: 17.5%
Částice 0.09-0.5mm: 90.0%
```

## 🔍 Kontrola funkčnosti

### Checklist
- [ ] SQL migrace proběhla úspěšně
- [ ] Nové sloupce existují v databázi
- [ ] Formulář zobrazuje nová pole
- [ ] Lze vytvořit nový produkt s novými hodnotami
- [ ] Lze upravit existující produkt
- [ ] Hodnoty se správně zobrazují v tabulce
- [ ] Prázdné hodnoty se zobrazují jako "—"
- [ ] API přijímá a ukládá nové parametry

## 🐛 Možné problémy

### Problem: Sloupce již existují
**Řešení:** SQL migrace používá `IF NOT EXISTS`, takže je bezpečné spustit vícekrát.

### Problem: Hodnoty se neuloží
**Řešení:** 
1. Zkontroluj konzoli prohlížeče (F12) na chyby
2. Zkontroluj API response
3. Ověř, že máš admin práva

### Problem: Hodnoty se nezobrazují
**Řešení:**
1. Refreshni stránku (Ctrl+F5)
2. Zkontroluj, že data jsou v databázi
3. Zkontroluj SQL query v Supabase logs

## 📚 Související soubory

**SQL migrace:**
- `demon-agro/lib/supabase/sql/add_moisture_particles_to_liming_products.sql`

**Frontend komponenty:**
- `demon-agro/components/admin/LimingProductModal.tsx`
- `demon-agro/components/admin/LimingProductsTable.tsx`

**Backend API:**
- `demon-agro/app/api/admin/liming-products/create/route.ts`
- `demon-agro/app/api/admin/liming-products/update/route.ts`

**Dokumentace:**
- `demon-agro/VAPNENI_PRODUKTY_REFERENCE.md` - Referenční hodnoty z etiket

## ✅ Hotovo!

Po úspěšné migraci můžeš začít zadávat kompletní údaje o produktech vápnění včetně vlhkosti a obsahu částic.

---

*Migrace vytvořena: 3.1.2026*  
*Autor: Démon Agro Development Team*




