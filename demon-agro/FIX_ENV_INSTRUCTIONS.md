# 🔧 OPRAVA - EmailJS pro veřejné formuláře

**Datum:** 9. ledna 2026  
**Problém:** Service ID not found - veřejná kalkulačka a kontaktní formulář nefungují  
**Řešení:** ✅ Kód opraven - nyní stačí doplnit ENV variables

---

## ⚡ RYCHLÁ OPRAVA (2 minuty)

### Krok 1: Otevřete `.env.local`

V kořenové složce `demon-agro/` otevřete soubor `.env.local`

### Krok 2: Přidejte tyto 2 řádky

**Najděte sekci s EmailJS** (řádek kde je `NEXT_PUBLIC_EMAILJS_SERVICE_ID`) a **přidejte pod něj**:

```bash
# Template pro kalkulačku vápnění
NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID=template_grgltnp

# Template pro kontaktní formulář
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=template_kogwumm
```

### Krok 3: Restartujte dev server

V terminálu:
1. Stiskněte `Ctrl+C` (zastaví server)
2. Spusťte znovu: `npm run dev`

### Krok 4: Otestujte

- Otevřete: http://localhost:3000/kalkulacka
- Vyplňte a odešlete kalkulačku
- ✅ Mělo by fungovat!

---

## 📋 KOMPLETNÍ ENV VARIABLES PRO EMAILJS

Váš `.env.local` by měl obsahovat (v sekci EmailJS):

```bash
# ===== EMAILJS =====
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5k776hf
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# Templates - Veřejná část
NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID=template_grgltnp
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=template_kogwumm

# Templates - Portál (pokud už máte)
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=your_welcome_template_id
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=your_password_reset_template_id
NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID=your_liming_template_id
```

---

## 🎯 CO BYLO OPRAVENO

### ✅ Soubory změněny:

1. **`app/(public)/kalkulacka/page.tsx`**
   - ❌ Dříve: `const serviceId = "service_xrx301a"` (špatné ID)
   - ✅ Nyní: `const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID` (správné)

2. **`app/(public)/kontakt/page.tsx`**
   - ❌ Dříve: `const serviceId = "service_xrx301a"` (špatné ID)
   - ✅ Nyní: `const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID` (správné)

### ✅ Výhody nového řešení:

- 🔧 **Snadná údržba** - změna credentials na jednom místě
- 🎯 **Konzistence** - stejný přístup jako v portálu
- 🔒 **Flexibilita** - různé hodnoty pro dev/production

---

## ❓ FAQ

### Proč to nefungovalo?

**Hardcoded service ID** `service_xrx301a` v kódu **neodpovídalo skutečnému** service ID `service_5k776hf` v EmailJS dashboardu.

### Je bezpečné mít Service ID v kódu?

**ANO** - Service ID a Public Key jsou **veřejné** credentials:
- 📱 Jsou určeny pro použití v prohlížeči
- 👁️ Jsou viditelné v buildu tak či tak
- 🛡️ EmailJS má ochranu (rate limiting, domain restrictions)
- 🔐 **Nejsou to secret keys** (ty by viditelné být neměly)

### Co když chci změnit credentials?

Změňte hodnoty v `.env.local` a restartujte server. Nemusíte editovat kód!

---

## 🚀 DEPLOYMENT (Vercel/Netlify)

Když budete nasazovat na production, **nastavte tyto ENV variables** v dashboardu:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5k776hf
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl
NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID=template_grgltnp
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=template_kogwumm
```

⚠️ **Nezapomeňte restartovat build!**

---

## ✅ CHECKLIST

- [ ] Přidal(a) jsem `NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID` do `.env.local`
- [ ] Přidal(a) jsem `NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID` do `.env.local`
- [ ] Restartoval(a) jsem dev server (`Ctrl+C` → `npm run dev`)
- [ ] Otestoval(a) jsem kalkulačku - ✅ funguje
- [ ] Otestoval(a) jsem kontaktní formulář - ✅ funguje
- [ ] Email dorazil na správnou adresu

---

## 📚 DALŠÍ DOKUMENTACE

- 📄 `ENV_PUBLIC_FORMS.md` - Detailní dokumentace změn
- 📄 `EMAILJS_README.md` - Přehled EmailJS v projektu
- 📄 `ENV_VARIABLES_COMPLETE.md` - Kompletní ENV setup

---

## ✨ HOTOVO!

Po doplnění ENV variables by mělo vše fungovat. Pokud ne, zkontrolujte:

1. ✅ Service ID je `service_5k776hf` (ne `service_xrx301a`)
2. ✅ Templates `template_grgltnp` a `template_kogwumm` existují v EmailJS
3. ✅ Dev server byl restartován po změně `.env.local`
4. ✅ V console nejsou chyby

🎉 **Úspěch!** Veřejné formuláře by nyní měly fungovat.



