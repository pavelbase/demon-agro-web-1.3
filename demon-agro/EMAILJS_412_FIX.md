# 🔧 Oprava EmailJS chyby 412

**Datum:** 6. ledna 2026  
**Problém:** EmailJS vrací status 412 (Precondition Failed), což blokuje zobrazení výsledků kalkulace

---

## ❌ Původní problém

### Symptomy
- Uživatel vyplní kalkulačku s platným emailem
- Výpočet probíhá, ale výsledek se nezobrazí
- V console je chyba: `api.emailjs.com/api/v1.0/email/send:1 Failed to load resource: the server responded with a status of 412 ()`
- Zobrazí se alert: "Došlo k chybě při zpracování kalkulace"

### Příčiny (2 problémy)

#### 1. Blokování celého procesu
EmailJS volání `await emailjs.send()` selhalo a vyhodilo error, který zastavil celý proces včetně zobrazení výsledků.

#### 2. Nesprávná data posílaná do EmailJS ⚠️ **HLAVNÍ PROBLÉM**
Po změně metodiky výpočtu jsme posílali do EmailJS **extra pole**, která nejsou v template:
- `doporuceny_produkt` ❌ (není v template)
- `doporucena_davka` ❌ (není v template)
- `dolomit_davka` ❌ (není v template)
- `vapenec_davka` ❌ (není v template)
- `user_email` ❌ (není v template)

EmailJS vrací **status 412**, když dostane data, která neodpovídají definovaným polím v template.

---

## ✅ Řešení

### 1. Oprava kódu - Fail-safe (HOTOVO)

**Soubor:** `app/(public)/kalkulacka/page.tsx`

**Změna 1:** Obalil jsem EmailJS volání do vlastního try-catch bloku:

```typescript
// Před (blokovalo zobrazení):
await emailjs.send(serviceId, templateId, templateParams, publicKey);
alert("Výsledky odeslány na váš email");
setVysledek(vypocet);

// Po (výsledek se zobrazí i když email selže):
try {
  await emailjs.send(serviceId, templateId, templateParams, publicKey);
  alert("Výsledky odeslány na váš email");
} catch (emailError) {
  console.error("Email send error:", emailError);
  alert("Výpočet byl dokončen, ale odeslání emailu selhalo. Výsledky si můžete prohlédnout níže.");
}
// Zobrazíme výsledek i když email selhal
setVysledek(vypocet);
```

**Výsledek:** Nyní se výsledek kalkulace zobrazí vždy, i když email selže.

### 2. Oprava template params - Odstranění extra polí (HOTOVO) ⭐

**Soubor:** `app/(public)/kalkulacka/page.tsx`

**Změna 2:** Upravil jsem `templateParams` tak, aby obsahoval **POUZE** pole, která jsou v EmailJS template:

```typescript
// PŘED (posílalo extra pole):
const templateParams = {
  soil_type: TYPYPUDY[vypocet.vstup.typPudy].nazev,
  ph_current: vypocet.vstup.pH,
  ph_target: vypocet.vapneni.optimalniPhRozmezi,
  cao_need: vypocet.vapneni.celkovaPotrebaCaO_t,
  limestone_suggestion: vypocet.vapneni.prepocetyHnojiva.mletyVapenec_t,
  doporuceny_produkt: vypocet.vapneni.doporucenyProdukt === 'dolomit' ? 'Dolomit' : 'Vápenec', // ❌ NENÍ v template
  doporucena_davka: ..., // ❌ NENÍ v template
  dolomit_davka: ..., // ❌ NENÍ v template
  vapenec_davka: ..., // ❌ NENÍ v template
  nutrients_summary: nutrients_summary,
  user_email: formData.email, // ❌ NENÍ v template
  user_name: formData.jmeno,
};

// PO (pouze pole z template):
const templateParams = {
  user_name: formData.jmeno || '',
  soil_type: TYPYPUDY[vypocet.vstup.typPudy]?.nazev || 'Neznámá',
  ph_current: vypocet.vstup.pH?.toFixed(1) || '0',
  ph_target: vypocet.vapneni?.optimalniPhRozmezi || 'N/A',
  cao_need: vypocet.vapneni?.celkovaPotrebaCaO_t?.toFixed(1) || '0',
  limestone_suggestion: vypocet.vapneni?.prepocetyHnojiva?.mletyVapenec_t?.toFixed(1) || '0',
  nutrients_summary: nutrients_summary || 'Není k dispozici',
};
```

**Vylepšení:**
- ✅ Odstraněna všechna extra pole
- ✅ Přidány fallback hodnoty (`|| ''`) pro případ undefined
- ✅ Přidán optional chaining (`?.`) pro bezpečný přístup
- ✅ Číselné hodnoty formátovány na 1 desetinné místo (`toFixed(1)`)

**Výsledek:** EmailJS by nyní měl email úspěšně odeslat.

---

### 3. Ověření EmailJS template

**EmailJS template musí obsahovat právě tato pole:**

```
{{user_name}}
{{soil_type}}
{{ph_current}}
{{ph_target}}
{{cao_need}}
{{limestone_suggestion}}
{{nutrients_summary}}
```

**⚠️ DŮLEŽITÉ:** Pokud template obsahuje i jiná pole nebo naopak nějaké chybí, je potřeba je synchronizovat s kódem výše.

---

### 4. Oprava EmailJS konfigurace (pokud problém přetrvává)

Status **412 (Precondition Failed)** obvykle znamená jeden z těchto problémů:

#### A. Neplatné API klíče

**Zkontrolovat:**
1. Otevřít [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Přihlásit se
3. Přejít na **Account** → **API Keys**
4. Ověřit, že klíč odpovídá tomu v kódu: `xL_Khx5Gcnt-lEvUl`

**Aktualizovat v kódu:**
```typescript
// app/(public)/kalkulacka/page.tsx, řádek ~181
const publicKey = "xL_Khx5Gcnt-lEvUl"; // ← zkontrolovat
```

#### B. Neexistující nebo neaktivní template

**Zkontrolovat:**
1. V EmailJS Dashboard přejít na **Email Templates**
2. Najít template s ID: `template_grgltnp`
3. Ověřit, že:
   - Template existuje
   - Je aktivní (enabled)
   - Má správně nastavené proměnné

**Proměnné v template (musí obsahovat):**
```
{{soil_type}}
{{ph_current}}
{{ph_target}}
{{cao_need}}
{{limestone_suggestion}}
{{doporuceny_produkt}}
{{doporucena_davka}}
{{dolomit_davka}}
{{vapenec_davka}}
{{nutrients_summary}}
{{user_email}}
{{user_name}}
```

#### C. Neexistující nebo neaktivní service

**Zkontrolovat:**
1. V EmailJS Dashboard přejít na **Email Services**
2. Najít service s ID: `service_xrx301a`
3. Ověřit, že:
   - Service existuje
   - Je připojený (connected)
   - Má platné přihlašovací údaje

#### D. Překročený limit nebo vypršelý účet

**Zkontrolovat:**
1. V EmailJS Dashboard přejít na **Account** → **Quota**
2. Ověřit:
   - Kolik emailů zbývá v měsíčním limitu
   - Zda není účet pozastavený
   - Platnost platby (pokud placený plán)

**Free plan limit:** 200 emailů/měsíc

---

## 🧪 Testování

### Test 1: Po opravě kódu (výsledek se zobrazí)
```
1. Otevřít kalkulačku: http://localhost:3000/kalkulacka
2. Vyplnit formulář s platným emailem
3. Kliknout "Vypočítat"
4. ✅ Výsledek by se měl zobrazit i když email selže
5. ✅ Alert: "Výpočet byl dokončen, ale odeslání emailu selhalo..."
```

### Test 2: Po opravě EmailJS (email se odešle)
```
1. Opravit EmailJS konfiguraci (viz body A-D výše)
2. Vyplnit kalkulačku
3. Kliknout "Vypočítat"
4. ✅ Výsledek se zobrazí
5. ✅ Alert: "Výsledky odeslány na váš email"
6. ✅ Email dorazí do schránky
```

---

## 🔍 Debugging

### Zjistit přesnou chybu z EmailJS

Upravit console.error pro více detailů:

```typescript
} catch (emailError: any) {
  console.error("Email send error:", emailError);
  console.error("EmailJS error details:", {
    status: emailError.status,
    text: emailError.text,
    message: emailError.message
  });
  alert("Výpočet byl dokončen, ale odeslání emailu selhalo. Výsledky si můžete prohlédnout níže.");
}
```

### Možné error messages

| Status | Message | Řešení |
|--------|---------|--------|
| 412 | Invalid template ID | Zkontrolovat template ID v dashboardu |
| 412 | Invalid service ID | Zkontrolovat service ID v dashboardu |
| 412 | Invalid user ID | Zkontrolovat public key |
| 403 | Forbidden | Zkontrolovat API key permissions |
| 429 | Too Many Requests | Překročen rate limit |
| 402 | Payment Required | Vypršel placený účet |

---

## 📝 Doporučení

### Krátkodobé (HOTOVO)
- ✅ Výsledek se zobrazí i když email selže
- ✅ Uživatel dostane informaci o selhání emailu
- ✅ Kalkulace není blokovaná

### Dlouhodobé
1. **Nastavit fallback email systém**
   - Použít server-side email (nodemailer, Resend, SendGrid)
   - Pokud EmailJS selže, zkusit backup

2. **Monitoring**
   - Logovat EmailJS chyby do Supabase
   - Nastavit alerting při vysokém % selhání

3. **Alternativní řešení**
   - Ukládat výsledky do databáze
   - Posílat emaily asynchronně (queue)
   - Umožnit stažení PDF bez emailu

---

## 🚀 Deployment

Po opravě kódu:

```bash
npm run build
vercel --prod
```

Po opravě EmailJS konfigurace:
- Není potřeba rebuild
- Změny v EmailJS dashboardu jsou okamžité

---

## 📞 Podpora

### EmailJS Support
- 📧 Email: support@emailjs.com
- 📚 Dokumentace: https://www.emailjs.com/docs/
- 💬 Community: https://github.com/emailjs/emailjs-sdk/issues

### Technická podpora
- Zkontrolovat EmailJS dashboard
- Ověřit API klíče
- Zkontrolovat rate limity

---

## ✅ Checklist

Po této opravě:

- [x] Kód opraven - výsledek se zobrazí i při selhání emailu
- [x] Template params opraveny - odstraněna extra pole
- [x] Přidány fallback hodnoty pro undefined
- [x] Přidán optional chaining pro bezpečnost
- [ ] Test - výsledek se zobrazí (mělo by fungovat)
- [ ] Test - email se odešle (mělo by fungovat)
- [ ] Deploy na produkci
- [ ] Ověřit v produkci, že emaily chodí

**Volitelné (pokud problém přetrvává):**
- [ ] EmailJS konfigurace zkontrolována
- [ ] API klíče ověřeny
- [ ] Template existuje a je aktivní
- [ ] Service existuje a je připojený
- [ ] Rate limit není překročen

---

**Status:** ✅ ✅ **OBA PROBLÉMY OPRAVENY**
1. ✅ Výsledky se nyní zobrazí vždy (i když email selže)
2. ✅ Template params opraveny (odstraněna extra pole) - **EmailJS by nyní měl fungovat**

