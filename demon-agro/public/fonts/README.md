# Fonts for PDF Export

## Roboto Font for Czech Characters

Pro **nejrychlejší** generování PDF můžete umístit `Roboto-Regular.ttf` do této složky.

### Jak získat font:

1. **Stáhnout z Google Fonts:**
   - Otevřít: https://fonts.google.com/specimen/Roboto
   - Kliknout na "Download family"
   - Rozbalit ZIP
   - Zkopírovat `static/Roboto-Regular.ttf` sem

2. **Přímo z GitHub:**
   ```bash
   curl -L -o Roboto-Regular.ttf "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Regular.ttf"
   ```

### Poznámka

Pokud font zde není, systém ho automaticky stáhne z CDN (jsDelivr nebo rawgit).
První generování PDF může trvat o 1-2 sekundy déle, protože musí font stáhnout.

---

**Důležité:** Font je potřeba pro správné zobrazení českých znaků (ěščřžýáíéúůďťň) v PDF.



