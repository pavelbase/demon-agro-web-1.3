# 🧪 Testování zabezpečení kalkulačky v prohlížeči

Manuální test scénáře pro ověření funkčnosti zabezpečení.

---

## 🎯 Test 1: Neplatný email formát

### Postup:
1. Otevřít https://demonagro.cz/kalkulacka
2. Vyplnit KROK 1 (Typ půdy) - vybrat libovolný
3. Kliknout "Pokračovat"
4. Vyplnit KROK 2 (Rozbor půdy) - zadat libovolné hodnoty
5. Kliknout "Pokračovat"
6. Vyplnit KROK 3:
   - Jméno: `Test`
   - Email: `a@a` ⚠️
   - Telefon: `123456789`
7. Kliknout "Vypočítat"

### ✅ Očekávaný výsledek:
- Pod polem Email se zobrazí **červená chyba**
- Text: "Zadejte platnou emailovou adresu (např. jmeno@domena.cz)"
- Výpočet **neproběhne**

### ❌ Pokud test selže:
- Zkontrolovat, že aplikace je aktuální verze
- Vymazat cache prohlížeče (Ctrl+Shift+Delete)
- Zkusit znovu

---

## 🎯 Test 2: Další neplatné emaily

Opakovat Test 1 s těmito emaily (všechny by měly být zamítnuty):

| Email | Důvod zamítnutí |
|-------|-----------------|
| `test@` | Chybí doména |
| `@test.com` | Chybí lokální část |
| `test@test` | Chybí TLD (.com, .cz, ...) |
| `test..test@test.com` | Dvojitá tečka |
| `.test@test.com` | Začíná tečkou |
| `test.@test.com` | Končí tečkou před @ |

### ✅ Očekávaný výsledek:
- Všechny by měly zobrazit chybu validace
- Žádný by neměl projít

---

## 🎯 Test 3: Platné emaily

Tyto emaily by měly projít validací (pokud ještě nebyly použity):

| Email | Poznámka |
|-------|----------|
| `test@example.com` | Základní formát |
| `jan.novak@firma.cz` | S tečkou |
| `test123@test-domain.co.uk` | Pomlčka a dlouhá TLD |
| `user+tag@gmail.com` | Plus znak (Gmail aliasy) |

### ✅ Očekávaný výsledek:
- Validace projde
- Pokračuje se k dalšímu kroku (nebo kontrola duplicity)

---

## 🎯 Test 4: Duplicitní email (hlavní test)

### Postup:
1. Otevřít https://demonagro.cz/kalkulacka
2. Vyplnit celý formulář s emailem: `test-duplicate@example.com`
3. Kliknout "Vypočítat"
4. ✅ Výpočet by měl proběhnout
5. Počkat na zobrazení výsledků
6. Kliknout "Zpět na kalkulačku"
7. Vyplnit znovu **se stejným emailem**: `test-duplicate@example.com`
8. Kliknout "Vypočítat"

### ✅ Očekávaný výsledek:
- Pod polem Email se zobrazí **červená chyba**
- Text: "Na tento email již byl odeslán výsledek kalkulace. Pro další výpočty nás prosím kontaktujte přímo na base@demonagro.cz nebo +420 731 734 907."
- Výpočet **neproběhne**

### 🔍 Co testujeme:
- Server-side kontrola funguje
- Nelze obejít vymazáním localStorage

---

## 🎯 Test 5: Obcházení localStorage

### Postup:
1. Provést Test 4 (použít email `test-storage@example.com`)
2. Po prvním úspěšném výpočtu otevřít **Developer Tools** (F12)
3. Přejít na záložku **Application** (Chrome) nebo **Storage** (Firefox)
4. V levém menu najít **Local Storage** → https://demonagro.cz
5. Najít klíč `kalkulace` a **smazat ho** (kliknout pravým a Delete)
6. Zavřít Developer Tools
7. Obnovit stránku (F5)
8. Vyplnit kalkulačku znovu **se stejným emailem**: `test-storage@example.com`
9. Kliknout "Vypočítat"

### ✅ Očekávaný výsledek:
- I přes vymazání localStorage se zobrazí **chyba**
- Text: "Na tento email již byl odeslán výsledek kalkulace..."
- Výpočet **neproběhne**

### 🔍 Co testujeme:
- Server-side kontrola je nezávislá na localStorage
- Zabezpečení nelze obejít vymazáním dat prohlížeče

---

## 🎯 Test 6: Inkognito režim

### Postup:
1. V normálním okně provést výpočet s emailem: `test-incognito@example.com`
2. Otevřít **inkognito/soukromé okno** (Ctrl+Shift+N v Chrome, Ctrl+Shift+P ve Firefoxu)
3. Otevřít https://demonagro.cz/kalkulacka
4. Vyplnit kalkulačku **se stejným emailem**: `test-incognito@example.com`
5. Kliknout "Vypočítat"

### ✅ Očekávaný výsledek:
- I v inkognito režimu se zobrazí **chyba**
- Text: "Na tento email již byl odeslán výsledek kalkulace..."
- Výpočet **neproběhne**

### 🔍 Co testujeme:
- Server-side kontrola funguje i v inkognito
- Zabezpečení není závislé na cookies/localStorage

---

## 🎯 Test 7: Různé prohlížeče

### Postup:
1. V Chrome provést výpočet s emailem: `test-browser@example.com`
2. Otevřít **jiný prohlížeč** (Firefox, Edge, Safari...)
3. Otevřít https://demonagro.cz/kalkulacka
4. Vyplnit kalkulačku **se stejným emailem**: `test-browser@example.com`
5. Kliknout "Vypočítat"

### ✅ Očekávaný výsledek:
- I v jiném prohlížeči se zobrazí **chyba**
- Text: "Na tento email již byl odeslán výsledek kalkulace..."
- Výpočet **neproběhne**

### 🔍 Co testujeme:
- Server-side kontrola funguje napříč prohlížeči
- Zabezpečení není závislé na konkrétním prohlížeči

---

## 🎯 Test 8: Rate limiting (3 výpočty/24h)

### ⚠️ POZOR: Tento test zablokuje vaši IP na 24 hodin!

### Postup:
1. Provést 3 výpočty s **různými emaily**:
   - `test-rate1@example.com`
   - `test-rate2@example.com`
   - `test-rate3@example.com`
2. Zkusit 4. výpočet s emailem: `test-rate4@example.com`

### ✅ Očekávaný výsledek:
- První 3 výpočty proběhnou **úspěšně**
- 4. výpočet zobrazí **chybu**
- Text: "Byl překročen denní limit použití kalkulačky. Zkuste to prosím zítra nebo nás kontaktujte přímo."
- Výpočet **neproběhne**

### 🔍 Co testujeme:
- Rate limiting podle IP adresy funguje
- Nelze obejít použitím různých emailů

### 🔓 Jak odblokovat IP:
Pokud potřebujete odblokovat IP před uplynutím 24 hodin, kontaktujte administrátora nebo spusťte v Supabase:

```sql
DELETE FROM calculator_usage 
WHERE ip_address = 'your-ip-address';
```

---

## 🎯 Test 9: Case-insensitive email

### Postup:
1. Provést výpočet s emailem: `Test@Example.COM`
2. Zkusit znovu s emailem: `test@example.com` (malými písmeny)

### ✅ Očekávaný výsledek:
- Druhý pokus zobrazí **chybu**
- Systém rozpozná, že je to stejný email (case-insensitive)

### 🔍 Co testujeme:
- Email kontrola je case-insensitive
- `Test@Example.COM` = `test@example.com`

---

## 🎯 Test 10: Rychlost validace

### Postup:
1. Otevřít Developer Tools (F12)
2. Přejít na záložku **Network**
3. Vyplnit kalkulačku s platným emailem
4. Kliknout "Vypočítat"
5. Sledovat Network tab

### ✅ Očekávaný výsledek:
- Měl by se objevit request na `/api/calculator/check-usage`
- Response time by měl být **< 500ms**
- Status: 200 OK (pokud email není použitý)

### 🔍 Co testujeme:
- API je rychlé a neblokuje UX
- Validace proběhne v reálném čase

---

## 📊 Shrnutí testů

| Test | Co testuje | Očekávaný výsledek |
|------|------------|-------------------|
| 1 | Validace emailu | ❌ Zamítnuto |
| 2 | Další neplatné formáty | ❌ Zamítnuto |
| 3 | Platné emaily | ✅ Přijato |
| 4 | Duplicitní email | ❌ Zamítnuto |
| 5 | Obcházení localStorage | ❌ Zamítnuto |
| 6 | Inkognito režim | ❌ Zamítnuto |
| 7 | Různé prohlížeče | ❌ Zamítnuto |
| 8 | Rate limiting | ❌ Zamítnuto (4. pokus) |
| 9 | Case-insensitive | ❌ Zamítnuto |
| 10 | Rychlost | < 500ms |

---

## ✅ Checklist testování

Po dokončení všech testů zkontrolovat:

- [ ] Test 1: Neplatný email ✅
- [ ] Test 2: Další neplatné emaily ✅
- [ ] Test 3: Platné emaily ✅
- [ ] Test 4: Duplicitní email ✅
- [ ] Test 5: Obcházení localStorage ✅
- [ ] Test 6: Inkognito režim ✅
- [ ] Test 7: Různé prohlížeče ✅
- [ ] Test 8: Rate limiting ✅ (volitelné)
- [ ] Test 9: Case-insensitive ✅
- [ ] Test 10: Rychlost validace ✅

---

## 🐛 Hlášení problémů

Pokud některý test selže:

1. **Zkontrolovat:**
   - Je aplikace aktuální verze?
   - Byla spuštěna SQL migrace?
   - Jsou nastaveny environment variables?

2. **Zaznamenat:**
   - Který test selhal
   - Co se zobrazilo místo očekávaného výsledku
   - Screenshot chybové hlášky
   - Console log (F12 → Console)
   - Network log (F12 → Network)

3. **Kontaktovat:**
   - Vývojový tým s detaily problému

---

## 📞 Podpora

- 📧 Email: info@demonagro.cz
- 📱 Telefon: +420 123 456 789
- 📚 Dokumentace: `CALCULATOR_SECURITY_IMPLEMENTATION.md`

---

**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Odhadovaný čas testování:** 20-30 minut (všechny testy)

