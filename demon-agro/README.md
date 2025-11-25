# Démon agro - pH Management a Výživa Půdy

Komplexní webová aplikace pro zemědělce v severních a západních Čechách zaměřená na pH management, výživu půdy a GPS mapování.

## Funkce

- **Home**: Hero sekce, 5 hlavních problémů, jak to funguje, proč my
- **Řešení**: pH půdy, Nedostatek síry, Nedostatek draslíku, Nedostatek hořčíku, Analýza půdy
- **Produktový systém**: Správa produktů s localStorage
- **Kontaktní formulář**: Integrace s EmailJS
- **Admin panel**: Správa produktů, textů stránek a obrázků
- **Responzivní design**: Optimalizováno pro mobil, tablet i desktop

## Technologie

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- EmailJS
- lucide-react (ikony)
- localStorage (databáze)

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

Tři záložky:
1. **Produkty**: Správa produktů (CRUD operace)
2. **Obsah stránek**: Editace textů všech stránek
3. **Správa obrázků**: Změna URL obrázků

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
│   ├── kalkulacka/
│   ├── o-nas/
│   ├── kontakt/
│   └── admin/
├── components/
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ProductCard.tsx
│   └── ...
├── lib/
│   ├── products.ts
│   ├── content.ts
│   └── images.ts
└── public/
    ├── logo.jpg
    └── images/
```

## Kontakt

- Email: base@demonagro.cz
- Telefon: +420 731 734 907
- Oblast: Severní a západní Čechy

## License

© 2025 Démon agro. Všechna práva vyhrazena.
