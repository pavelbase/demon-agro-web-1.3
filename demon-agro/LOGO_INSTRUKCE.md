# Instrukce pro nahrazení loga

## Aktuální stav
- Momentálně se používá dočasné SVG logo s textem "Démon agro - pH Management"
- Logo se nachází v `/public/logo.svg`

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

4. Aktualizujte cestu v komponentách:
   - `components/Navigation.tsx` - řádek 13
   - `components/Footer.tsx` - řádek 9
   - `app/admin/page.tsx` - řádek 30
   
   Změňte: `const logoUrl = "/logo.svg";`
   Na: `const logoUrl = "/logo.png";` (nebo `.jpg`, `.svg` podle vašeho formátu)

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

## Placeholder logo.jpg

Soubor `/public/logo.jpg` je momentálně jen 1x1 pixel placeholder. 
**Je třeba ho nahradit skutečným logem nebo jej smazat.**

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
