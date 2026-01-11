# ⚠️ EmailJS - Chybějící konfigurace

## Problém
Welcome email se neposílá, protože chybí základní EmailJS konfigurace.

## Chybějící environment variables

Do souboru `.env.local` je potřeba přidat:

```env
# EmailJS - Základní nastavení
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# EmailJS - Portálové templates (již nastavené)
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_welcome_id
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_reset_id
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=template_liming_id

# Admin nastavení
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
NEXT_PUBLIC_APP_URL=https://portal.demonagro.cz
```

## Kde najít hodnoty

### Service ID a Public Key
Tyto hodnoty jsou podle dokumentace:
- **Service ID:** `service_xrx301a`
- **Public Key:** `xL_Khx5Gcnt-lEvUl`

Ověřte je na [EmailJS Dashboard](https://dashboard.emailjs.com):
1. Přihlaste se
2. V levém menu klikněte na **Email Services**
3. Zkopírujte **Service ID**
4. V levém menu klikněte na **Account** → **General**
5. Zkopírujte **Public Key**

### Template IDs
Template IDs už máte nastavené v `.env.local`. Pokud ne, najdete je:
1. [EmailJS Dashboard](https://dashboard.emailjs.com)
2. **Email Templates**
3. Klikněte na každý template a zkopírujte jeho ID

## Po přidání proměnných

1. **Restartujte dev server:**
   ```bash
   # Zastavte server (Ctrl+C)
   npm run dev
   ```

2. **Zkuste vytvořit nového uživatele**

3. **Zkontrolujte logy v terminálu:**
   - Měli byste vidět: `Welcome email sent to: email@example.com`
   - Pokud ne, zkontrolujte chyby

## Testování

Po nastavení otestujte:

```bash
cd demon-agro
node -e "
require('dotenv').config({ path: '.env.local' });
console.log('SERVICE_ID:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? '✓' : '✗');
console.log('PUBLIC_KEY:', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? '✓' : '✗');
console.log('WELCOME_TPL:', process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID ? '✓' : '✗');
"
```

Všechny tři by měly mít ✓.

## Dokumentace

Pro kompletní setup viz:
- [`EMAILJS_PORTAL_SETUP_MASTER.md`](EMAILJS_PORTAL_SETUP_MASTER.md) - Kompletní návod
- [`EMAILJS_WELCOME_TEMPLATE.md`](EMAILJS_WELCOME_TEMPLATE.md) - Welcome email template
- [`EMAILJS_README.md`](EMAILJS_README.md) - Přehled všech emailů


