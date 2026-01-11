# 🧪 Test: Optimalizace formuláře nové poptávky

## Jak testovat změny

### 1. Příprava testovacích dat

Přejít na stránku plánů vápnění a přidat alespoň jeden pozemek do košíku:
1. Navigace: **Plány vápnění** (`/portal/plany-vapneni`)
2. Kliknout na **Přidat do poptávky** u vybraného pozemku
3. Vybrat rok aplikace (např. 2026 podzim)
4. Potvrdit přidání

### 2. Test kompaktního layoutu

✅ **Otevřít formulář nové poptávky:**
- Navigace: **Moje poptávky** > **Nová poptávka**
- Nebo kliknout na floating košík a "Vytvořit poptávku"

✅ **Zkontrolovat výšku formuláře:**
- [ ] Celý formulář by se měl vejít na 1 obrazovku (1920×1080)
- [ ] Souhrn poptávky má kompaktní řádky (ne velké karty)
- [ ] Zobrazuje se kód pozemku (např. "10 2908/2")
- [ ] Rok a sezóna aplikace jsou viditelné (např. "2026 podzim")

### 3. Test termínů dodání

✅ **Zkontrolovat nabízené termíny:**

V lednu 2026 by mělo být:
- [ ] Co nejdříve
- [ ] Jaro 2026 (únor-duben)
- [ ] Podzim 2026 (září-říjen)
- [ ] Jaro 2027 (únor-duben)
- [ ] Podzim 2027 (září-říjen)
- [ ] Termín je flexibilní

❌ **NEMĚLO by být:**
- Jaro 2025
- Podzim 2025

✅ **Předvýběr termínu:**
- [ ] Pokud košík obsahuje "2026 podzim", měl by být předvybraný "Podzim 2026"
- [ ] Pokud košík obsahuje "2027 jaro", měl by být předvybraný "Jaro 2027"
- [ ] Pokud košík obsahuje jiný termín, mělo by být "Termín je flexibilní"

### 4. Test collapsible kontaktů

✅ **Když jsou kontakty předvyplněné:**
- [ ] Sekce "Kontaktní údaje" je defaultně collapsed
- [ ] Zobrazuje se: "Pavel Baše" + "731 734 907 • base@demonagro.cz"
- [ ] Tlačítko "Upravit" je viditelné

✅ **Po kliknutí na "Upravit" nebo na sekci:**
- [ ] Formulář se rozbalí
- [ ] Zobrazí se 2×2 grid inputů
- [ ] Všechny hodnoty jsou správně vyplněné

✅ **Když kontakty NEJSOU předvyplněné:**
- [ ] Formulář je defaultně rozbalený
- [ ] NENÍ tlačítko "Upravit"

### 5. Test auto-resize textarea

✅ **Poznámka k poptávce:**
- [ ] Defaultní výška je 2 řádky
- [ ] Když začnu psát delší text, textarea se automaticky zvětší
- [ ] Nezobrazuje se scroll bar uvnitř textarea

### 6. Test skrytého košíku

✅ **Na stránce `/portal/poptavky/nova`:**
- [ ] Floating košík (vpravo dole) NENÍ viditelný

✅ **Na jakékoli jiné stránce:**
- [ ] Floating košík JE viditelný (pokud obsahuje položky)

### 7. Test odeslání poptávky

✅ **Vyplnit a odeslat:**
1. Vybrat termín dodání
2. (Volitelně) Napsat poznámku
3. Zkontrolovat kontaktní údaje
4. Kliknout **Odeslat poptávku**

✅ **Po odeslání:**
- [ ] Zobrazí se toast: "Poptávka úspěšně odeslána"
- [ ] Přesměrování na `/portal/poptavky`
- [ ] Košík je vyprázdněný
- [ ] Nová poptávka je viditelná v seznamu

### 8. Test validace

✅ **Prázdné kontakty:**
- [ ] Vymazat jméno → kliknout Odeslat → chyba "Vyplňte prosím všechny kontaktní údaje."
- [ ] Sekce kontaktů se automaticky rozbalí

✅ **Prázdný košík:**
- [ ] Na prázdný košík zobrazit: "Košík je prázdný"
- [ ] Tlačítko "Přejít na plány vápnění"

### 9. Test responsivity

✅ **Mobilní zobrazení (< 768px):**
- [ ] Grid kontaktů se změní na 1 sloupec
- [ ] Souhrn poptávky je čitelný
- [ ] Tlačítko "Odeslat" zabírá celou šířku

### 10. Test edge cases

✅ **Více pozemků v košíku:**
- [ ] Každý pozemek má vlastní řádek
- [ ] Součty jsou správně vypočítané
- [ ] Všechny kódy pozemků jsou viditelné

✅ **Pozemek bez kódu:**
- [ ] Nezobrazuje se • před ha
- [ ] Formát: "orná neurčena • 10 ha | 2026 podzim"

✅ **Víceleté aplikace:**
- [ ] Zobrazí se všechny roky: "2026 podzim, 2027 jaro, 2028 podzim"
- [ ] Celkové množství je součet všech aplikací

---

## ⚠️ Známé limitace

1. **Termíny se generují při každém renderu** - může být nekonzistentní, pokud se stránka otevře těsně před půlnocí
2. **Předvýběr termínu bere pouze první aplikaci** - pokud má košík více položek s různými termíny, použije se první
3. **Auto-resize textarea** - v některých prohlížečích může mít mírně jinou výšku

---

## 🐛 Známé problémy k opravě

_Zatím žádné_

---

## ✅ Checklist před nasazením

- [ ] Všechny výše uvedené testy prošly
- [ ] Formulář se vejde na 1 obrazovku
- [ ] Termíny odpovídají aktuálnímu měsíci
- [ ] Košík je skrytý na stránce formuláře
- [ ] Validace funguje správně
- [ ] Mobilní responsivita OK
- [ ] Odeslání poptávky funguje

---

Testoval AI asistent Claude  
Datum: 3. ledna 2026



