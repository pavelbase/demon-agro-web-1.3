# AgroManažer - Implementace Dokončena ✅

## 📊 Přehled

**AgroManažer** je kalkulačka ziskovosti aplikace hnojiv pro zemědělské zakázky, integrovaná do administrátorské sekce portálu Démon Agro.

**URL:** `https://www.demonagro.cz/portal/admin/agromanager`

**Přístup:** Pouze pro administrátory (role: `admin`)

---

## ✅ Co bylo vytvořeno

### 1. **Databáze (Supabase)**

#### Soubor SQL migrace:
- `lib/supabase/sql/create_agro_customers_table.sql`

#### Struktura tabulky `agro_customers`:
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → profiles)
- jmeno (TEXT) - Název zákazníka/zakázky
- vymera_ha (NUMERIC) - Výměra v hektarech
- davka_kg_ha (NUMERIC) - Dávka v kg/ha
- cena_nakup_material_tuna (NUMERIC) - Cena nákupu materiálu
- cena_prodej_sluzba_ha (NUMERIC) - Cena prodeje služby
- cena_najem_traktor_mth (NUMERIC) - Cena nájmu traktoru
- vykonnost_ha_mth (NUMERIC) - Výkonnost ha/hodinu
- cena_nafta_tuna_materialu (NUMERIC) - Cena nafty
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### Bezpečnost:
- ✅ RLS (Row Level Security) aktivní
- ✅ Pouze admini mohou číst/vytvářet/editovat/mazat
- ✅ Automatický trigger pro `updated_at`
- ✅ 3 indexy pro optimalizaci

---

### 2. **TypeScript Typy**

#### Upravený soubor:
- `lib/types/database.ts`

#### Přidané typy:
```typescript
export type AgroCustomer = Tables<'agro_customers'>
export type AgroCustomerInsert = Database['public']['Tables']['agro_customers']['Insert']
export type AgroCustomerUpdate = Database['public']['Tables']['agro_customers']['Update']
```

---

### 3. **API Routes**

#### Vytvořené endpointy:

**A) GET /api/admin/agro-customers**
- Získat seznam všech zákazníků
- Řazení: nejnovější první
- Pouze pro adminy

**B) POST /api/admin/agro-customers/create**
- Vytvořit nového zákazníka
- Výchozí hodnoty aplikovány automaticky
- Audit log zápis

**C) PUT /api/admin/agro-customers/[id]**
- Aktualizovat zákazníka
- Partial update (jen poskytnutá pole)
- Audit log zápis

**D) DELETE /api/admin/agro-customers/[id]**
- Smazat zákazníka
- Potvrzení vyžadováno
- Audit log zápis

---

### 4. **React Komponenta**

#### Soubor:
- `components/admin/AgroManagerCalculator.tsx`

#### Funkce:
- ✅ **Dvoupanelový layout** (Seznam vlevo + Kalkulačka vpravo)
- ✅ **Excel-style design** (borders, gray labels, white inputs)
- ✅ **Real-time výpočty** (10 vzorců)
- ✅ **Automatické ukládání** (1 sekunda po změně)
- ✅ **Podmíněné formátování** (zelený/červený zisk)
- ✅ **Formátování čísel** (oddělovače tisíců)
- ✅ **CRUD operace** (Přidat, Editovat, Smazat)

#### Výpočty:
1. Spotřeba materiálu (t) = `(výměra × dávka) / 1000`
2. Celkem hodin (mth) = `výměra / výkonnost`
3. **TRŽBA CELKEM** = `výměra × cena prodeje`
4. Náklad Materiál = `spotřeba × cena nákupu`
5. Náklad Traktor = `hodiny × cena nájmu`
6. Náklad Nafta = `spotřeba × cena nafty`
7. **NÁKLADY CELKEM** = suma nákladů
8. **HRUBÝ ZISK** = tržba - náklady
9. Zisk na hodinu = `zisk / hodiny`
10. Zisk na hektar = `zisk / výměra`

---

### 5. **Admin Stránka**

#### Soubor:
- `app/portal/admin/agromanager/page.tsx`

#### Funkce:
- ✅ Server-side autentizace
- ✅ Role check (pouze admin)
- ✅ Metadata (title, description)
- ✅ Header s ikonou traktoru
- ✅ Integrace AgroManagerCalculator

---

### 6. **Admin Sidebar**

#### Upravený soubor:
- `components/admin/AdminSidebar.tsx`

#### Změny:
- ✅ Přidána ikona `Tractor` z lucide-react
- ✅ Nová položka "AgroManažer" v navigaci
- ✅ Umístění: mezi "Kalkulace" a "Audit log"
- ✅ Zvýraznění aktivní stránky

---

## 🚀 Nasazení (Deployment)

### Krok 1: Spustit SQL Migraci

1. Otevřít Supabase Dashboard
2. Jít do: **SQL Editor**
3. Vytvořit nový query
4. Zkopírovat obsah souboru:
   ```
   demon-agro/lib/supabase/sql/create_agro_customers_table.sql
   ```
5. Spustit SQL příkaz
6. Ověřit výsledek: `Tabulka agro_customers úspěšně vytvořena!`

### Krok 2: Verifikace Databáze

```sql
-- Zkontrolovat, že tabulka existuje
SELECT * FROM agro_customers LIMIT 1;

-- Zkontrolovat RLS policies
SELECT * FROM pg_policies WHERE tablename = 'agro_customers';

-- Zkontrolovat indexy
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'agro_customers';
```

### Krok 3: Build & Deploy

```bash
# 1. Commit změny
git add .
git commit -m "feat: AgroManažer - kalkulačka ziskovosti hnojení"

# 2. Push to GitHub
git push origin main

# 3. Vercel automaticky deployuje
# (nebo manuálně: vercel --prod)
```

### Krok 4: Testování

1. Přihlásit se jako admin: `https://www.demonagro.cz/portal/prihlaseni`
2. Jít do Admin panelu
3. Kliknout na **"AgroManažer"** v sidebar
4. Kliknout **"Přidat zakázku"**
5. Editovat hodnoty a sledovat výpočty
6. Ověřit automatické ukládání
7. Vyzkoušet smazání zákazníka

---

## 📱 Uživatelský Manuál

### Přidání Nové Zakázky

1. Kliknout **"Přidat zakázku"** (zelené tlačítko s +)
2. Nový zákazník se vytvoří s výchozími hodnotami
3. Editovat název v horním poli
4. Upravit vstupní parametry v tabulce
5. Změny se ukládají automaticky po 1 sekundě

### Editace Zakázky

1. Vybrat zákazníka ze seznamu vlevo
2. Měnit jakékoliv hodnoty v pravém panelu
3. Výpočty se aktualizují okamžitě
4. Ukládání probíhá automaticky
5. Status "Ukládání..." se zobrazí při uložení

### Mazání Zakázky

1. Najít zákazníka v seznamu
2. Kliknout na ikonu koše (🗑️) vedle názvu
3. Potvrdit smazání v dialogu
4. Zákazník je trvale odstraněn

### Interpretace Výsledků

**Zelený zisk (> 0):**
- ✅ Zakázka je zisková
- Doporučeno přijmout

**Červený zisk (< 0):**
- ⚠️ Zakázka je ztrátová
- Doporučeno odmítnout nebo přehodnotit ceny

---

## 🎨 Design Specifikace

### Barvy

```css
/* Tržba */
bg-blue-100, text-blue-900

/* Náklady */
bg-red-100, text-red-900

/* Zelený zisk */
bg-green-100, text-green-700

/* Červený zisk */
bg-red-100, text-red-700

/* Inputy */
bg-gray-100 (label), bg-white (input)

/* Výsledky */
bg-gray-50 (needitovatelné)
```

### Formátování

**Čísla:**
- Oddělovač tisíců: mezera
- Příklad: `33 600 Kč`
- Desetinná místa: 0-2 podle typu

**Tabulka:**
- Border: `border border-gray-300`
- Shadow: `shadow-md`
- Rounded: `rounded-lg`
- Excel-style: Ano (povoleny borders)

---

## 🔒 Bezpečnost

### Autentizace
- ✅ Server-side auth check (`requireAuth()`)
- ✅ Role verification (profile.role === 'admin')
- ✅ Redirect non-admins → `/portal/dashboard`

### Databáze
- ✅ RLS policies aktivní
- ✅ Pouze admini mají přístup
- ✅ Foreign key na profiles (cascade delete)

### API Routes
- ✅ Admin check v každém endpointu
- ✅ Error handling
- ✅ Audit log všech akcí

### Frontend
- ✅ Client-side validace
- ✅ Confirmation dialogs pro delete
- ✅ Toast notifikace pro feedback

---

## 📊 Statistiky Projektu

### Vytvořené Soubory: 7

1. `lib/supabase/sql/create_agro_customers_table.sql` (285 řádků)
2. `lib/types/database.ts` (update)
3. `app/api/admin/agro-customers/route.ts` (48 řádků)
4. `app/api/admin/agro-customers/create/route.ts` (79 řádků)
5. `app/api/admin/agro-customers/[id]/route.ts` (183 řádků)
6. `components/admin/AgroManagerCalculator.tsx` (641 řádků)
7. `app/portal/admin/agromanager/page.tsx` (45 řádků)

### Upravené Soubory: 2

1. `lib/types/database.ts` (+50 řádků)
2. `components/admin/AdminSidebar.tsx` (+6 řádků)

### Celkový Rozsah: ~1,337 řádků kódu

---

## ✅ Checklist Před Spuštěním

- [ ] SQL migrace spuštěna v Supabase
- [ ] Tabulka `agro_customers` existuje
- [ ] RLS policies aktivní
- [ ] Admin účet dostupný
- [ ] Kód commitnut a pushnut
- [ ] Deploy dokončen (Vercel)
- [ ] Testování provedeno
- [ ] AgroManažer viditelný v admin menu
- [ ] Kalkulace fungují správně
- [ ] Automatické ukládání funguje

---

## 🆘 Troubleshooting

### Problém: "Table does not exist"

**Řešení:**
1. Zkontrolovat že SQL migrace byla spuštěna
2. Verifikovat v Supabase: Table Editor → agro_customers

### Problém: "Unauthorized" při přístupu

**Řešení:**
1. Zkontrolovat že jste přihlášeni jako admin
2. Verifikovat role v profiles tabulce:
```sql
SELECT id, email, role FROM profiles WHERE role = 'admin';
```

### Problém: Výpočty se neaktualizují

**Řešení:**
1. Zkontrolovat konzoli prohlížeče (F12)
2. Ověřit že API endpointy odpovídají
3. Zkontrolovat network tab pro chyby

### Problém: "Saving..." se zobrazuje pořád

**Řešení:**
1. Zkontrolovat API response v network tab
2. Ověřit že PUT endpoint funguje
3. Zkontrolovat Supabase logs

---

## 📞 Support

**Technický kontakt:**
- Email: base@demonagro.cz
- Projekt: Démon Agro Portal
- Feature: AgroManažer v1.0

---

## 🎉 Status: IMPLEMENTACE DOKONČENA

✅ Databáze vytvořena
✅ API routes implementovány
✅ Frontend komponenta hotová
✅ Admin stránka vytvořena
✅ Sidebar aktualizován
✅ Žádné linter errors
✅ Připraveno k nasazení

**Čas k produkci:** ~5 minut (pouze SQL migrace)

---

**Vytvořeno:** 2026-01-22
**Verze:** 1.0.0
**Status:** ✅ Production Ready

---

© 2025-2026 Démon Agro. Všechna práva vyhrazena.

