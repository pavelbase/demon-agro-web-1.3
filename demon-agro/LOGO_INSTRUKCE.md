# Instrukce pro nahrazení loga

## Aktuální stav
- Logo ve formátu PNG je správně nastaveno a nachází se v `/public/logo.png`
- Logo má rozměry 860x374 px a je použito ve všech komponentách (Navigation, Footer, Admin)

## Jak nahrát skutečné logo

### Metoda 1: Ruční nahrání (Doporučeno)

1. Připravte si logo v jednom z těchto formátů:
   - **PNG** (preferováno pro transparentní pozadí)
   - **SVG** (ideální pro vektorovou grafiku)
   - **JPG** (pro fotografie)

2. Doporučené rozměry:
   - Šířka: 280-400px
   - Výška: 60-100px
   - Poměr stran: přibližně 3:1 nebo 4:1

3. Nahrajte soubor:
   ```bash
   # Zkopírujte váš soubor do projektu
   cp /cesta/k/vasemu/logo.png demon-agro/public/logo.png
   ```

4. Aktualizujte cestu v komponentách (již nastaveno):
   - `components/Navigation.tsx` - řádek 13: `const logoUrl = "/logo.png";`
   - `components/Footer.tsx` - řádek 9: `const logoUrl = "/logo.png";`
   - `app/admin/page.tsx` - řádek 30: `const [logoUrl, setLogoUrl] = useState("/logo.png");`

### Metoda 2: Přes Admin Panel (Budoucí feature)

V budoucnu bude možné nahrát logo přímo přes admin panel na adrese `/admin`.

## Specifikace pro profesionální logo

Pro nejlepší výsledky by logo mělo splňovat:

- **Formát**: PNG s transparentním pozadím nebo SVG
- **Rozlišení**: Minimálně 2x větší než zobrazovaná velikost (pro Retina displeje)
- **Barvy**: 
  - Primární: #4A7C59 (zelená z webu)
  - Sekundární: podle vašeho brand manuálu
- **Čitelnost**: Logo musí být čitelné i v menších velikostech (min. 150px šířka)
- **Pozadí**: Transparentní nebo bílé

## Aktuální logo soubory

- `/public/logo.png` - Hlavní logo aplikace (860x374 px, PNG formát)
- `/public/logo/demon-agro-logo.svg` - SVG varianta pro speciální použití
- `/public/logo/demon-agro-icon.svg` - Icon verze loga
- `/public/logo/demon-agro-favicon.svg` - Favicon

## Troubleshooting

**Logo se nezobrazuje po nahrání:**
1. Zkontrolujte, že jste restartovali dev server (`npm run dev`)
2. Vyčistěte browser cache (Ctrl+Shift+R)
3. Vyčistěte localStorage (F12 → Application → Local Storage → Clear)
4. Zkontrolujte, že cesta v kódu odpovídá názvu souboru

**Logo je rozmazané:**
- Použijte logo s vyšším rozlišením
- Pro nejlepší kvalitu použijte SVG formát

**Logo je příliš velké/malé:**
- Upravte `width` a `height` parametry v `<Image>` komponentě
- Viz `components/Navigation.tsx` řádek 53
