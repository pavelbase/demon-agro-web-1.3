# Démon agro - Logo Implementace

## Přehled změn

Nové logo s démonským maskotem bylo úspěšně implementováno na webu Démon agro. Logo je plně responzivní a optimalizované pro všechny zařízení.

## Vytvořené soubory

### SVG loga
- `/public/logo/demon-agro-logo.svg` - Hlavní logo pro desktop a tablet (400x100px)
- `/public/logo/demon-agro-icon.svg` - Pouze ikona pro mobilní zařízení (100x115px)
- `/public/logo/demon-agro-favicon.svg` - Zjednodušený favicon (64x64px)
- `/public/logo/demon-agro-logo-light.svg` - Světlá verze loga pro tmavé pozadí

## Upravené komponenty

### 1. Navigation.tsx
**Změny:**
- Odstraněn localStorage mechanismus pro dynamickou změnu loga
- Přidána responzivní implementace s Next.js Image komponentou
- Tři breakpointy:
  - **Desktop (md+)**: Plné logo 200x50px
  - **Tablet (sm-md)**: Střední logo 160x40px  
  - **Mobil (<sm)**: Pouze ikona 40x46px
- Použit `priority` prop pro optimalizaci načítání

### 2. Footer.tsx
**Změny:**
- Odstraněn localStorage mechanismus
- Implementováno Next.js Image s lazy loading
- Logo 150x37px optimalizované pro footer

### 3. layout.tsx
**Změny:**
- Přidán SVG favicon do metadata
- Správná integrace s Next.js metadata API

## Barvy a design

### Barevná paleta
- **Hnědá (demon-dark)**: `#3d3021` - hlavní barva maskota a textu "Démon"
- **Zelená (demon-green)**: `#4a7c59` - text "agro", odpovídá barvě navigace
- **Bílá (demon-white)**: `#ffffff` - detaily (oči, úsměv, zuby)
- **Světlá zelená**: `#48bb78` - pro světlou verzi loga

### Design prvky
- **Hexagon**: Geometrický rámec s outline
- **Démonský maskot**: Rohy, oči, úsměv, zuby, bradka
- **Typografie**: Arial/Helvetica bold pro "Démon", medium pro "agro"

## Responzivní breakpointy (Tailwind)

```tsx
className="hidden md:block"          // Desktop: ≥768px
className="hidden sm:block md:hidden" // Tablet: 640-767px
className="block sm:hidden"           // Mobil: <640px
```

## Optimalizace

### Načítání
- **Header logo**: `priority` prop pro okamžité načtení (Critical CSS)
- **Footer logo**: `loading="lazy"` pro odložené načtení
- SVG formát zajišťuje ostrost na všech DPI

### Performance
- Žádné external dependencies
- Inline CSS v SVG pomocí `<defs><style>`
- Minimální velikost souborů (< 2KB každý)

## Testování

### Kontrolní seznam
- ✅ Logo se zobrazuje v headeru na desktopu
- ✅ Logo se správně zmenšuje na tabletu
- ✅ Na mobilu se zobrazuje jen ikona
- ✅ Favicon je připraven (viditelný po restartu serveru)
- ✅ Logo je vektorové - ostré na všech zařízeních
- ✅ Barvy odpovídají brandingu
- ✅ Kliknutí na logo vede na homepage
- ✅ Logo má správný alt text pro SEO
- ✅ Žádné linter errors

### Zařízení k otestování
1. **Desktop** (Chrome, Firefox, Safari)
2. **Tablet** - zkontrolovat střední breakpoint
3. **Mobil** (iPhone, Android) - jen ikona
4. **Dev tools responsive mode** - všechny velikosti

## Možná budoucí vylepšení

1. **PNG fallback** pro starší browsery:
   ```bash
   rsvg-convert -w 192 -h 192 public/logo/demon-agro-favicon.svg > public/favicon-192x192.png
   ```

2. **Apple Touch Icon** (180x180px PNG)

3. **Animace** - hover efekt na maskota (např. blikání očí)

4. **Dark mode variant** - automatické přepínání na light verzi
   ```tsx
   const isDark = useTheme().theme === 'dark';
   const logoSrc = isDark ? '/logo/demon-agro-logo-light.svg' : '/logo/demon-agro-logo.svg';
   ```

## Technické detaily

### Next.js Image optimalizace
- Automatické WebP/AVIF conversion
- Responsive loading
- Lazy loading pro non-critical images
- Blur placeholder možnost

### SVG výhody
- Škálovatelnost bez ztráty kvality
- Malá velikost souboru
- CSS animace možnost
- Přístupnost (alt text, aria labels)

## Závěr

Logo bylo úspěšně implementováno s důrazem na:
- ✅ Moderní Next.js best practices
- ✅ Plnou responzivitu
- ✅ Performance optimalizaci
- ✅ SEO a přístupnost
- ✅ Konzistentní branding

Web je připraven k nasazení s novým logem!
