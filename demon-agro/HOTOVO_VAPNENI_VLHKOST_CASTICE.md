# ✅ HOTOVO - Vlhkost a obsah částic pro produkty vápnění

## 🎯 Co bylo provedeno

Do admin rozhraní pro správu produktů vápnění byly přidány nové parametry:
- **Vlhkost (%)**
- **Obsah částic** (3 typy frakce)

## 📦 Provedené změny

### 1. ✅ SQL migrace databáze
**Soubor:** `lib/supabase/sql/add_moisture_particles_to_liming_products.sql`

Přidány sloupce:
- `moisture_content` - Vlhkost v %
- `particles_over_1mm` - Částice nad 1 mm v %
- `particles_under_05mm` - Částice pod 0,5 mm v %
- `particles_009_05mm` - Částice 0,09-0,5 mm v %

### 2. ✅ Admin formulář (LimingProductModal.tsx)
- Přidána sekce "Fyzikální vlastnosti"
- 4 nová vstupní pole s nápovědami
- Validace a formátování hodnot
- Uživatelsky přívětivý design

### 3. ✅ Admin tabulka (LimingProductsTable.tsx)
- Nový sloupec "Vlhkost %"
- Nový sloupec "Částice" s detailním zobrazením všech frakcí
- Responsive design

### 4. ✅ API endpointy
- `api/admin/liming-products/create` - přijímá nové parametry
- `api/admin/liming-products/update` - přijímá nové parametry

## 🚀 Jak začít používat

### Krok 1: Spusť SQL migraci

⚠️ **DŮLEŽITÉ:** Pokud tabulka `liming_products` ještě neexistuje, použij:

```bash
# V Supabase SQL Editor spusť:
demon-agro/lib/supabase/sql/create_liming_products_complete.sql
```

✅ Tento soubor vytvoří tabulku včetně všech nových sloupců najednou!

**NEBO** pokud tabulka již existuje:
```bash
# Pouze přidá nové sloupce:
demon-agro/lib/supabase/sql/add_moisture_particles_to_liming_products.sql
```

📖 **Návod při chybě:** Pokud dostaneš chybu "relation does not exist", viz `OPRAVA_LIMING_PRODUCTS_ERROR.md`

### Krok 2: Restart aplikace (pokud potřeba)
```bash
# Pokud běží vývojový server, restartuj ho
npm run dev
```

### Krok 3: Přidej produkty
1. Přihlas se jako admin
2. Jdi na **Admin → Produkty vápnění**
3. Klikni **"Přidat produkt"**
4. Vyplň všechna pole včetně fyzikálních vlastností

## 📖 Referenční hodnoty z etiket

### Dolomit (Agroslužby Štěpán)
```
Vlhkost: 3.0%
Částice nad 1 mm: 18.0% (max)
Částice pod 0.5 mm: 74.0% (min)
```

### Vápenec Vitošov (jemně mletý)
```
Vlhkost: 15.0-20.0% (můžeš zadat 17.5%)
Částice 0.09-0.5 mm: 90.0% (min)
```

**💡 Více detailů najdeš v:** `VAPNENI_PRODUKTY_REFERENCE.md`

## 📸 Screenshot UI změn

**Admin formulář - nová sekce:**
```
┌─────────────────────────────────────┐
│ Fyzikální vlastnosti                │
├─────────────────────────────────────┤
│ Vlhkost (%)                         │
│ [________] např. 3.0 nebo 15.0      │
│                                     │
│ Částice nad 1 mm (%)                │
│ [________] např. 18.0 (max)         │
│                                     │
│ Částice pod 0,5 mm (%)              │
│ [________] např. 74.0 (min)         │
│                                     │
│ Částice 0,09-0,5 mm (%)             │
│ [________] např. 90.0 (min)         │
│ Pro jemně mletý vápenec             │
└─────────────────────────────────────┘
```

**Admin tabulka - nové sloupce:**
```
| Název | Typ | %CaO | %MgO | Vlhkost % | Částice | Reaktivita |
|-------|-----|------|------|-----------|---------|------------|
| Dolomit | Dolomit | 50% | 40% | 3.0% | >1mm: 18% | Střední |
|         |         |     |     |       | <0.5mm: 74% |        |
```

## 📝 Důležité poznámky

### Která pole vyplnit?
- **Dolomit (hrubší frakce):** Vlhkost + Částice nad 1mm + Částice pod 0.5mm
- **Vápenec mletý (jemná frakce):** Vlhkost + Částice 0.09-0.5mm

### Všechna pole jsou volitelná
- Můžeš vyplnit jen ta, která máš k dispozici
- Nevyplněné hodnoty se zobrazují jako "—"

### Přepočet CaO a MgO
- Hodnoty CaO a MgO budeš muset přepočítat z etiket sám
- Příklady přepočtů najdeš v `VAPNENI_PRODUKTY_REFERENCE.md`
- Dolomit: CaO ~50%, MgO ~40%
- Vápenec Vitošov: CaO ~45%, MgO ~1%

## 🎓 Dokumentace

📄 **VAPNENI_PRODUKTY_REFERENCE.md**
- Detailní hodnoty z obou etiket
- Příklady zadání do systému
- Doporučené dávkování
- Bezpečnostní informace
- Skladování

📄 **MIGRACE_VAPNENI_VLHKOST_CASTICE.md**
- Technický návod na migraci
- Testování funkčnosti
- Troubleshooting

## ✨ Výhody nových parametrů

1. **Přesnější výpočty** - Zohlednění vlhkosti pro reálné množství účinné látky
2. **Kvalitní data** - Odpovídá oficiálním etiketám produktů
3. **Lepší plánování** - Info o skladování a manipulaci
4. **Profesionální vzhled** - Kompletní údaje o produktech

## 🎯 Další kroky (doporučené)

1. ✅ Spusť SQL migraci
2. ✅ Přidej do systému své produkty s novými údaji
3. ✅ Otestuj vytvoření i úpravu produktu
4. 📊 Můžeš v budoucnu využít data pro reporty
5. 📈 Rozšířit o další fyzikální parametry dle potřeby

## 🤝 Potřebuješ pomoc?

- Dokumentace etiket: `VAPNENI_PRODUKTY_REFERENCE.md`
- Technická dokumentace: `MIGRACE_VAPNENI_VLHKOST_CASTICE.md`
- SQL migrace: `lib/supabase/sql/add_moisture_particles_to_liming_products.sql`

---

**Status:** ✅ Kompletně hotovo a připraveno k použití  
**Datum:** 3.1.2026  
**Verze:** 1.0

