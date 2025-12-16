# Démon agro - pH Management a Výživa Půdy

Komplexní webová aplikace pro zemědělce v severních a západních Čechách zaměřená na pH management, výživu půdy a GPS mapování.

## Funkce

- **Home**: Hero sekce, 5 hlavních problémů, jak to funguje, proč my
- **Řešení**: pH půdy, Nedostatek síry, Nedostatek draslíku, Nedostatek hořčíku, Analýza půdy
- **Vzdělávání/Blog**: Články o pH, vápnění, živinách - Markdown editor, kategorie, SEO
- **Produktový systém**: Správa produktů s localStorage
- **Kalkulačka hnojení**: Výpočet potřeby vápnění a živin (VDLUFA)
- **Kontaktní formulář**: Integrace s EmailJS, GDPR compliance
- **Admin panel**: Správa produktů, textů, obrázků, článků a poptávek z kalkulačky
- **Responzivní design**: Optimalizováno pro mobil, tablet i desktop

## Technologie

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- EmailJS
- lucide-react (ikony)
- localStorage (databáze)
- react-markdown + remark-gfm (Markdown rendering)

## Instalace

```bash
npm install
```

## Konfigurace EmailJS

1. Zaregistrujte se na [EmailJS](https://www.emailjs.com/)
2. Vytvořte email service
3. Vytvořte email template s následujícími proměnnými:
   - `{{from_name}}` - jméno odesílatele
   - `{{from_email}}` - email odesílatele
   - `{{phone}}` - telefon
   - `{{farm_size}}` - velikost farmy
   - `{{message}}` - zpráva
4. Zkopírujte `.env.local.example` na `.env.local`
5. Vyplňte své EmailJS credentials do `.env.local`

## Spuštění

```bash
npm run dev
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000)

## Admin Panel

Přístup: `/admin`  
Heslo: `demonagro2024`

Pět záložek:
1. **Produkty**: Správa produktů (CRUD operace)
2. **Obsah stránek**: Editace textů (včetně Zásad ochrany os. údajů)
3. **Správa obrázků**: Změna URL obrázků + upload souborů
4. **Vzdělávací články**: Správa blogových článků (Markdown editor)
5. **Kalkulace**: Přehled vypočtených kalkulací, kontakty, marketingové souhlasy

## GDPR a Právní náležitosti

Web obsahuje implementaci pro soulad s GDPR:
- **Zásady ochrany osobních údajů**: Samostatná stránka editovatelná v adminu (`/zasady-ochrany-osobnich-udaju`)
- **Kontaktní formuláře**: Informační texty u tlačítek
- **Marketingový souhlas**: Volitelný checkbox v kalkulačce pro newsletter
- **Cookies**: Odkaz v patičce (příprava pro lištu)

## Struktura Projektu

```
demon-agro/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Domů)
│   ├── ph-pudy/
│   ├── sira/
│   ├── k/
│   ├── mg/
│   ├── analyza/
│   ├── vzdelavani/        
│   │   ├── page.tsx       (Seznam článků)
│   │   └── [slug]/
│   │       └── page.tsx   (Detail článku)
│   ├── kalkulacka/
│   │   ├── page.tsx       (Kalkulačka vápnění + živin)
│   │   └── prevodni/      (Převodní kalkulačka)
│   ├── zasady-ochrany-osobnich-udaju/ ⭐ NOVÉ
│   │   └── page.tsx
│   ├── o-nas/
│   ├── kontakt/
│   ├── admin/
│   └── api/
│       └── upload/        (Upload API pro obrázky)
├── components/
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ProductCard.tsx
│   ├── ImageUpload.tsx    ⭐ NOVÉ
│   └── ...
├── lib/
│   ├── products.ts
│   ├── content.ts
│   ├── images.ts
│   ├── articles.ts        
│   ├── kalkulace.ts       (Logika výpočtů a ukládání)
│   └── types.ts
└── public/
    ├── logo.jpg
    └── images/
        └── uploads/       (Nahrané obrázky)
```

## Dokumentace

- `OBRAZKY_NAVOD.md` - Návod na správu obrázků
- `POJMENOVANI_OBRAZKU.md` - Automatické pojmenování produktových obrázků
- `VZDELAVANI_NAVOD.md` - Kompletní návod pro vzdělávací sekci/blog ⭐ NOVÉ

## Kontakt

- Email: base@demonagro.cz
- Telefon: +420 731 734 907
- Oblast: Severní a západní Čechy

## License

© 2025 Démon agro. Všechna práva vyhrazena.
