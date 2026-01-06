# 📧 EmailJS Template pro kalkulačku

**Template ID:** `template_grgltnp`  
**Service ID:** `service_xrx301a`

---

## 🎯 Návod na vytvoření template v EmailJS

### Krok 1: Přihlášení
1. Otevřít [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Přihlásit se

### Krok 2: Vytvoření/Úprava Template
1. V levém menu kliknout na **Email Templates**
2. Najít template s ID: `template_grgltnp`
3. Nebo vytvořit nový: kliknout **Create New Template**

### Krok 3: Nastavení základních údajů

**Template Name:** `Kalkulačka Vápnění - Výsledky`

**From Name:** `Démon agro`

**From Email:** `base@demonagro.cz` (nebo vaše firemní)

**Subject:** `Výsledky kalkulace vápnění - Démon agro`

**Reply To:** `base@demonagro.cz`

---

## 📝 Template Content (HTML)

Zkopírujte tento kód do pole **Content** (HTML format):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4A7C59;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
    }
    .section {
      background-color: white;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      border-left: 4px solid #4A7C59;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      color: #4A7C59;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .data-row {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      font-weight: bold;
      color: #555;
    }
    .data-value {
      color: #333;
    }
    .highlight {
      background-color: #FFF9C4;
      padding: 3px 6px;
      border-radius: 3px;
      font-weight: bold;
    }
    .footer {
      background-color: #4A7C59;
      color: white;
      padding: 15px;
      text-align: center;
      border-radius: 0 0 8px 8px;
      margin-top: 20px;
    }
    .footer a {
      color: white;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🌱 Démon agro</h1>
    <p style="margin: 10px 0 0 0;">Výsledky kalkulace vápnění</p>
  </div>
  
  <div class="content">
    <p>Dobrý den, <strong>{{user_name}}</strong>,</p>
    <p>zde jsou výsledky vaší kalkulace z webu Démon agro.</p>
    
    <div class="section">
      <div class="section-title">📋 Zadané údaje</div>
      <div class="data-row">
        <span class="data-label">Typ půdy:</span> 
        <span class="data-value">{{soil_type}}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Aktuální pH:</span> 
        <span class="data-value">{{ph_current}}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Cílové (optimální) pH:</span> 
        <span class="data-value">{{ph_target}}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">🪨 Doporučení vápnění</div>
      <div class="data-row">
        <span class="data-label">Potřeba čistých živin (CaO):</span> 
        <span class="data-value highlight">{{cao_need}} t/ha</span>
      </div>
      <div class="data-row">
        <span class="data-label">Doporučená dávka vápence:</span> 
        <span class="data-value highlight">{{limestone_suggestion}} t/ha</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">🌱 Stav živin (Váš deficit)</div>
      <p style="margin: 0;">{{nutrients_summary}}</p>
    </div>
    
    <div style="background-color: #E8F5E9; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <p style="margin: 0 0 10px 0;"><strong>💬 Máte zájem o dodání materiálu nebo aplikaci?</strong></p>
      <p style="margin: 0;">Odpovězte na tento e-mail nebo volejte <strong><a href="tel:+420731734907" style="color: #4A7C59;">+420 731 734 907</a></strong>.</p>
    </div>
  </div>
  
  <div class="footer">
    <p style="margin: 0 0 10px 0;">S pozdravem,</p>
    <p style="margin: 0; font-weight: bold;">Tým Démon agro</p>
    <p style="margin: 10px 0 0 0; font-size: 12px;">
      <a href="https://demonagro.cz">www.demonagro.cz</a> | 
      <a href="mailto:base@demonagro.cz">base@demonagro.cz</a>
    </p>
  </div>
</body>
</html>
```

---

## 📝 Template Content (Plain Text - záložní verze)

Zkopírujte tento kód do pole **Plain Text** (fallback pro emaily bez HTML):

```
Dobrý den, {{user_name}},

zde jsou výsledky vaší kalkulace z webu Démon agro.

--------------------------------------------------

ZADANÉ ÚDAJE:

Typ půdy: {{soil_type}}
Aktuální pH: {{ph_current}}
Cílové (optimální) pH: {{ph_target}}

--------------------------------------------------

DOPORUČENÍ VÁPNĚNÍ:

Potřeba čistých živin (CaO): {{cao_need}} t/ha
Doporučená dávka vápence: {{limestone_suggestion}} t/ha

--------------------------------------------------

STAV ŽIVIN (Váš deficit):

{{nutrients_summary}}

--------------------------------------------------

Máte zájem o dodání materiálu nebo aplikaci?
Odpovězte na tento e-mail nebo volejte +420 731 734 907.

S pozdravem,
Tým Démon agro

www.demonagro.cz | base@demonagro.cz
```

---

## 🏷️ Proměnné v template

Template používá **přesně těchto 7 proměnných** (které posílá kód):

| Proměnná | Popis | Příklad |
|----------|-------|---------|
| `{{user_name}}` | Jméno uživatele | "Jan Novák" |
| `{{soil_type}}` | Typ půdy | "Střední (hlinitá)" |
| `{{ph_current}}` | Aktuální pH | "5.5" |
| `{{ph_target}}` | Optimální pH rozmezí | "6.2 - 6.8" |
| `{{cao_need}}` | Potřeba CaO v t/ha | "2.5" |
| `{{limestone_suggestion}}` | Dávka vápence v t/ha | "5.2" |
| `{{nutrients_summary}}` | Souhrn živin | "P: 45 mg/kg (dobrý), K: 180 mg/kg (vyhovující), ..." |

---

## ✅ Checklist pro nastavení

Po vytvoření template:

- [ ] Template vytvořen/upraven v EmailJS
- [ ] Template ID je: `template_grgltnp` (nebo změnit v kódu)
- [ ] Service ID je: `service_xrx301a` (nebo změnit v kódu)
- [ ] HTML verze zkopírována do **Content**
- [ ] Plain text verze zkopírována do **Plain Text**
- [ ] Všech 7 proměnných je v template
- [ ] From Email nastaven: `base@demonagro.cz`
- [ ] Reply To nastaven: `base@demonagro.cz`
- [ ] Subject nastaven: "Výsledky kalkulace vápnění - Démon agro"
- [ ] Template uložen (Save)
- [ ] Test email odeslán (Test It button)
- [ ] Test email dorazil a vypadá správně

---

## 🧪 Test Template

### V EmailJS Dashboardu:

1. Po uložení template kliknout na **Test It**
2. Vyplnit testovací hodnoty:
```json
{
  "user_name": "Jan Testovací",
  "soil_type": "Střední (hlinitá)",
  "ph_current": "5.5",
  "ph_target": "6.2 - 6.8",
  "cao_need": "2.5",
  "limestone_suggestion": "5.2",
  "nutrients_summary": "P: 45 mg/kg (dobrý), K: 180 mg/kg (vyhovující), Mg: 150 mg/kg (dobrý), Ca: 2500 mg/kg (vyhovující), S: 18 mg/kg (dobrý)"
}
```
3. Zadat svůj testovací email
4. Kliknout **Send Test Email**
5. ✅ Zkontrolovat schránku

---

## 🎨 Úpravy designu (volitelné)

### Změna barvy:

V CSS sekci změnit `#4A7C59` (zelená) na jinou barvu:
```css
background-color: #4A7C59; /* ← změnit zde */
```

### Přidání loga:

Do HTML za `<div class="header">` přidat:
```html
<img src="https://demonagro.cz/logo.png" alt="Démon agro" style="max-width: 150px; margin-bottom: 10px;">
```

---

## 📞 Podpora

Pokud máte problémy s vytvořením template:
- 📧 EmailJS Support: support@emailjs.com
- 📚 Dokumentace: https://www.emailjs.com/docs/

---

**Status:** ✅ Template připraven ke zkopírování do EmailJS  
**Verze:** 1.0  
**Datum:** 6. ledna 2026

