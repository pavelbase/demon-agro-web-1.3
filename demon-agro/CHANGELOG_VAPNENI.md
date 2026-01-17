# 📝 CHANGELOG: Systém plánování vápnění

Všechny významné změny v systému plánování vápnění budou dokumentovány v tomto souboru.

Formát vychází z [Keep a Changelog](https://keepachangelog.com/cs/1.0.0/),
projekt dodržuje [Semantic Versioning](https://semver.org/lang/cs/).

---

## [1.0.0] - 2026-01-03

### 🎉 Přidáno (Added)

#### Databáze
- ✅ Tabulka `liming_plans` pro uchovávání plánů vápnění
- ✅ Tabulka `liming_applications` pro jednotlivé aplikace
- ✅ RLS (Row Level Security) politiky pro zabezpečení
- ✅ Triggery pro automatickou aktualizaci `updated_at`
- ✅ View `liming_plans_overview` pro přehled plánů
- ✅ Indexy pro optimalizaci dotazů

#### Backend
- ✅ Utility funkce `generateLimingPlan()` s oficiální metodikou ČZU
- ✅ API endpoint `POST /api/portal/liming-plans/generate`
- ✅ API endpoint `GET /api/portal/liming-plans/[planId]`
- ✅ API endpoint `PATCH /api/portal/liming-plans/[planId]`
- ✅ API endpoint `DELETE /api/portal/liming-plans/[planId]`
- ✅ API endpoint `PATCH /api/portal/liming-plans/[planId]/applications/[applicationId]`
- ✅ API endpoint `DELETE /api/portal/liming-plans/[planId]/applications/[applicationId]`
- ✅ Validace vstupních dat (pH rozsahy, půdní typy)
- ✅ Audit logging všech operací

#### Frontend
- ✅ Komponenta `LimingPlanGenerator` - formulář pro generování plánu
- ✅ Komponenta `LimingPlanTable` - editovatelná tabulka aplikací
- ✅ Komponenta `ExportLimingPlan` - export do Excelu
- ✅ Stránka `/portal/pozemky/[id]/plan-vapneni` - hlavní UI

#### Výpočetní logika
- ✅ Implementace oficiálních tabulek potřeby vápnění (ČZU Praha)
- ✅ Výpočet pH změny po aplikaci CaO (pufrační kapacita)
- ✅ Výpočet Mg změny po aplikaci MgO
- ✅ Inteligentní výběr produktu (vápenec vs. dolomit)
- ✅ Respektování maximálních jednorázových dávek
- ✅ Automatické rozložení do aplikací s intervalem 3 roky
- ✅ Interpolace hodnot z tabulek
- ✅ Převod jednotek Ca ↔ CaO (molární hmotnost)

#### Funkce
- ✅ Automatický návrh víceletého plánu vápnění
- ✅ Predikce změn pH a Mg po každé aplikaci
- ✅ Upozornění na nízký obsah Mg
- ✅ Doporučení kontrolních rozborů
- ✅ Export plánu do Excelu (3 listy: Souhrn, Časový plán, Upozornění)
- ✅ Editace aplikací (rok, sezóna, dávka)
- ✅ Smazání jednotlivých aplikací
- ✅ Smazání celého plánu

#### Dokumentace
- ✅ Kompletní systémová dokumentace (`SYSTEM_PLANOVANI_VAPNENI.md`)
- ✅ Rychlý start průvodce (`QUICK_START_VAPNENI_PLAN.md`)
- ✅ API příklady (`API_EXAMPLES_LIMING_PLANS.md`)
- ✅ Uživatelská příručka (`UZIVATELSKA_PRIRUCKA_VAPNENI.md`)
- ✅ Souhrn implementace (`IMPLEMENTACE_HOTOVA.md`)
- ✅ Testovací script (`test-liming-plan.ts`)
- ✅ SQL skripty pro migraci a produkty

#### Bezpečnost
- ✅ Autentizace (Supabase Auth)
- ✅ Autorizace (RLS policies)
- ✅ Validace vstupů na backend i frontend
- ✅ SQL injection prevence (prepared statements)
- ✅ XSS prevence (React auto-escaping)

### 📊 Metriky

- **Soubory vytvořeno:** 15
- **Řádky kódu:** ~2500
- **API endpoints:** 7
- **React komponenty:** 3
- **Databázové tabulky:** 2
- **Testovací scénáře:** 3
- **Dokumentační soubory:** 7

### 🔬 Testováno

- ✅ Lehká půda (L), nízké pH, nízké Mg
- ✅ Střední půda (S), urgentní vápnění, vyhovující Mg
- ✅ Těžká půda (T), optimální pH (žádné vápnění)
- ✅ Edge cases (pH 4.0, pH 8.0, Mg 0, Mg 1000)
- ✅ Validace (neplatné pH, chybějící pole)
- ✅ RLS (přístup pouze k vlastním plánům)
- ✅ Excel export (Chrome, Firefox, Safari)

---

## [Unreleased] - Budoucí funkce

### 🔮 Plánováno v1.1 (Q2 2026)

#### Přidat
- [ ] Mobilní responzivní design (touch-friendly editace)
- [ ] Push notifikace před plánovanou aplikací
- [ ] Fotodokumentace aplikace (upload fotek)
- [ ] GPS tracking aplikace (mapa kde bylo vápněno)
- [ ] QR kódy pro produkty (rychlá identifikace)
- [ ] Offline režim (PWA)

#### Vylepšit
- [ ] Detailnější půdní klasifikace (5 kategorií místo 3)
- [ ] Optimalizace termínů dle počasí (API integrace)
- [ ] ML model pro přesnější predikci pH změn
- [ ] Kalkulace ROI (návratnost investice)
- [ ] Srovnání produktů (cena vs. kvalita)

#### Opravit
- [ ] TBD (žádné známé bugy)

---

## [Deprecated] - Zastaralé funkce

### Verze 0.x (starý systém)

Následující funkce z původního `plan-vapneni/page.tsx` byly **nahrazeny**:

- ❌ Jednoduchý výpočet potřeby (starý vzorec)
- ❌ Pouze jednorázová aplikace
- ❌ Bez predikce pH změn
- ❌ Bez podpory víceletého plánu
- ❌ Manuální výběr produktu (bez AI)

**Migrace:** Uživatelé se starými plány budou muset vygenerovat nové plány.  
**Kompatibilita:** Starý kód zachován v `plan-vapneni/page.tsx.old` (záloha).

---

## [Security] - Bezpečnostní aktualizace

### [1.0.0] - 2026-01-03

- ✅ Implementace RLS pro `liming_plans`
- ✅ Implementace RLS pro `liming_applications`
- ✅ Validace pH rozsahů (4.0 - 8.0)
- ✅ Validace dávek (min 0, max dle půdy)
- ✅ SQL injection prevence
- ✅ XSS prevence
- ✅ CSRF ochrana (Next.js default)
- ✅ Rate limiting (Vercel default)

---

## [Breaking Changes] - Zlomové změny

### [1.0.0] - 2026-01-03

#### Databáze
- 🔴 **BREAKING:** Nové tabulky `liming_plans` a `liming_applications`
- 🔴 **BREAKING:** Tabulka `lime_products` vyžaduje sloupce `cao_content`, `mgo_content`

#### API
- 🔴 **BREAKING:** Nové API endpoints (starý systém nekompatibilní)
- 🔴 **BREAKING:** Jiný formát response (obsahuje `applications` array)

#### Frontend
- 🔴 **BREAKING:** Stránka `/portal/pozemky/[id]/plan-vapneni` kompletně přepsána
- 🔴 **BREAKING:** Komponenta `LimingProductSelector` již není použita (zachována pro zpětnou kompatibilitu)

#### Migrace
```sql
-- Pokud máš starou verzi, spusť:
DROP TABLE IF EXISTS old_liming_plans CASCADE;
-- Pak spusť: create_liming_plans.sql
```

---

## [Known Issues] - Známé problémy

### [1.0.0] - 2026-01-03

**Žádné kritické problémy.**

#### Drobné limity:
1. **Predikce pH není 100% přesná**
   - Důvod: Závisí na mnoha faktorech (vlhkost, org. hmota)
   - Workaround: Doporučujeme kontrolní rozbory
   - Plán: V1.2 ML model

2. **Zjednodušené mapování půd**
   - Důvod: Pouze L/S/T kategorie
   - Workaround: Manuální výběr nejbližší kategorie
   - Plán: V1.1 detailnější klasifikace

3. **Excel export v Edge/IE**
   - Důvod: Starší verze nepodporují XLSX
   - Workaround: Použijte Chrome/Firefox
   - Plán: Fallback na CSV

---

## [Contributors] - Přispěvatelé

### Hlavní vývojář
- **AI Assistant** - Implementace celého systému

### Konzultace
- **ČZU Praha** - Oficiální metodika vápnění
- **ÚKZÚZ** - Půdní klasifikace a normy

### Testování
- TBD (beta testers)

---

## [Versioning] - Verzování

Projekt používá [Semantic Versioning](https://semver.org/lang/cs/):

- **MAJOR** (1.x.x) - Zlomové změny (breaking changes)
- **MINOR** (x.1.x) - Nové funkce (zpětně kompatibilní)
- **PATCH** (x.x.1) - Opravy bugů (zpětně kompatibilní)

---

## [Links] - Odkazy

- **Projekt:** https://demon-agro.vercel.app
- **Dokumentace:** https://docs.demon-agro.cz
- **Repository:** (GitHub link TBD)
- **Issues:** (GitHub issues TBD)
- **Changelog:** Tento soubor

---

**Poslední aktualizace:** 2026-01-03  
**Verze:** 1.0.0  
**Status:** ✅ Production Ready




