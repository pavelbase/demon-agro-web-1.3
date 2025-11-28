# Démon agro - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd demon-agro
npm install
```

### 2. Configure EmailJS

1. Sign up at [EmailJS.com](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with these variables:
   - `{{from_name}}` - Jméno odesílatele
   - `{{from_email}}` - Email odesílatele
   - `{{phone}}` - Telefon
   - `{{farm_size}}` - Velikost farmy
   - `{{message}}` - Zpráva
   - `{{to_email}}` - Email příjemce (base@demonagro.cz)

4. Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

5. Edit `.env.local` and fill in your EmailJS credentials:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_CONTACT_EMAIL=base@demonagro.cz
```

### 3. Replace Logo

Replace `/public/logo.jpg` with your actual logo:
- Format: JPG or PNG
- Recommended size: 200x200px (or larger)
- Should contain:
  - Démonská hlava s rohy
  - Text "Démon" (tmavě hnědý #5C4033)
  - Text "agro" (béžový #C9A77C)
  - Krémové pozadí (#F5F1E8)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📋 Features Overview

### Public Pages

1. **Domů (Home)** - `/`
   - Hero section with large background image
   - 5 main problems in card grid with color-coded icons
   - "How it works" section with 6 numbered steps
   - "Why us" section with 5 features
   - CTA section

2. **Problem Pages** - `/ph-pudy`, `/sira`, `/k`, `/mg`, `/analyza`
   - Hero with large icon
   - Problem description
   - Economic impact
   - Our solution
   - Products grid (filtered by category)
   - CTA section

3. **O nás (About Us)** - `/o-nas`
   - Hero
   - Who we are
   - Our mission
   - CTA

4. **Kontakt (Contact)** - `/kontakt`
   - Contact information
   - Contact form with EmailJS integration
   - Form validation
   - Success/error messages

5. **Kalkulačka (Calculator)** - `/kalkulacka`
   - Placeholder page (to be implemented)

### Admin Panel

**URL:** `/admin`  
**Password:** `demonagro2024`

#### Tab 1: Produkty (Products)
- View all products in table
- Add new product
- Edit existing product
- Delete product
- Toggle availability
- Reset to default products
- Stored in localStorage

Product fields:
- Název (Name)
- Popis (Description)
- Kategorie (Category): pH, Síra, Draslík, Hořčík, Analýza
- Dostupnost (Availability)
- Technické parametry (Technical parameters) - key-value pairs
- Fotka URL (Photo URL)

#### Tab 2: Obsah stránek (Page Content)
- Edit text content for all pages
- Character limits for each field
- Save changes
- Reset to default text
- Stored in localStorage per page

Editable pages:
- Domů (Home)
- pH půdy
- Síra
- Draslík
- Hořčík
- Analýza
- O nás

#### Tab 3: Správa obrázků (Image Management)
- View all images with thumbnails
- Change image URL for any image
- Preview before saving
- Reset to default image
- Stored in localStorage

Image categories:
- Home (hero, background)
- pH (hero, problem image, impact background)
- Síra (hero, problem image, impact background)
- Draslík (hero, problem image, impact background)
- Hořčík (hero, problem image, impact background)
- Analýza (hero, problem image, impact background)
- O nás (hero, who we are image)

---

## 🎨 Design System

### Colors

```javascript
Primary Brown: #5C4033  // Text "Démon"
Secondary Beige: #C9A77C // Text "agro", accents
Light Background: #F5F1E8 // Cream background
Accent Green: #4A7C59   // CTA buttons, active states

Icon Colors:
pH: #4A7C59   // Green
S: #F59E0B    // Yellow/Gold
K: #3B82F6    // Blue
Mg: #8B5CF6   // Purple
Lab: #5C4033  // Brown
```

### Typography

- Font: Inter
- Hero headings: text-4xl to text-6xl, font-bold
- Section headings: text-3xl to text-4xl, font-bold
- Body text: text-base to text-lg

### Components

**Cards:**
- White background
- Shadow-lg (NO BORDERS!)
- Rounded-xl
- Padding: p-6
- Hover: shadow-2xl, scale-105

**Buttons:**
- Primary (Green): bg-[#4A7C59], hover:bg-[#3d6449]
- Text: white, font-semibold
- Rounded-full
- Shadow-md, hover:shadow-lg
- Padding: px-8 py-3

**Icons:**
- Circular background with color
- White icon/text inside
- Shadow-lg
- Sizes: 64x64px (mobile), 80x80px (desktop)
- Hover: scale-110

---

## 📁 Project Structure

```
demon-agro/
├── app/
│   ├── layout.tsx          # Root layout with Navigation & Footer
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── admin/              # Admin panel
│   │   └── page.tsx
│   ├── analyza/            # Soil analysis page
│   │   └── page.tsx
│   ├── k/                  # Potassium page
│   │   └── page.tsx
│   ├── kalkulacka/         # Calculator page
│   │   └── page.tsx
│   ├── kontakt/            # Contact page
│   │   └── page.tsx
│   ├── mg/                 # Magnesium page
│   │   └── page.tsx
│   ├── o-nas/              # About us page
│   │   └── page.tsx
│   ├── ph-pudy/            # pH & liming page
│   │   └── page.tsx
│   └── sira/               # Sulfur page
│       └── page.tsx
├── components/
│   ├── Navigation.tsx      # Header navigation
│   ├── Footer.tsx          # Footer
│   ├── ProductCard.tsx     # Product display card
│   ├── ProblemCard.tsx     # Problem display card
│   ├── FeatureCard.tsx     # Feature display card
│   ├── ProblemIcon.tsx     # Colored circular icons
│   ├── StepNumber.tsx      # Numbered step circles
│   └── ProblemPageTemplate.tsx # Reusable template
├── lib/
│   ├── types.ts            # TypeScript types
│   ├── products.ts         # Product data & functions
│   ├── content.ts          # Page content & functions
│   └── images.ts           # Image URLs & functions
├── public/
│   ├── logo.jpg            # Company logo
│   ├── favicon.ico         # Favicon
│   └── images/             # Image directory
│       ├── products/       # Product images
│       └── README.md       # Image guidelines
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local.example
├── .gitignore
├── README.md
└── SETUP.md               # This file
```

---

## 🔑 Key Features

### 1. **No Borders Design**
- The entire website uses shadows instead of borders
- Clean, minimalist aesthetic
- Cards use `shadow-lg`, `shadow-xl`, `shadow-2xl`
- NEVER use `border`, `border-1`, or `outline` classes

### 2. **Color-Coded Icons**
- pH: Green circle (#4A7C59)
- Síra: Yellow/Gold circle (#F59E0B)
- Draslík: Blue circle (#3B82F6)
- Hořčík: Purple circle (#8B5CF6)
- Analýza: Brown circle (#5C4033) with lab flask icon

### 3. **localStorage Database**
- All data stored in browser localStorage
- No backend required
- Products, page content, and image URLs
- Easy to reset to defaults

### 4. **Responsive Design**
- Mobile-first approach
- Hamburger menu on mobile
- Responsive grids (1, 2, or 3 columns)
- Touch-friendly buttons

### 5. **EmailJS Integration**
- Contact form sends to base@demonagro.cz
- Form validation
- Success/error messages
- No backend needed

---

## 📧 EmailJS Template Example

**Subject:** Nová poptávka z webu Démon agro - {{from_name}}

**Body:**
```
Nová poptávka z webu demonagro.cz

KONTAKTNÍ ÚDAJE:
Jméno: {{from_name}}
Email: {{from_email}}
Telefon: {{phone}}
Velikost farmy: {{farm_size}} ha

ZPRÁVA:
{{message}}

Odesláno: {{sent_date}}
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
   - `NEXT_PUBLIC_CONTACT_EMAIL`
4. Deploy

### Other Platforms

The project can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with PM2

---

## 📝 Content Management

### Adding Products

1. Go to `/admin`
2. Enter password: `demonagro2024`
3. Click "Produkty" tab
4. Click "Přidat produkt"
5. Fill in all fields
6. Add technical parameters
7. Click "Uložit"

### Editing Page Content

1. Go to `/admin`
2. Click "Obsah stránek" tab
3. Select page from dropdown
4. Edit text fields
5. Click "Uložit změny"

### Changing Images

1. Go to `/admin`
2. Click "Správa obrázků" tab
3. Find the image you want to change
4. Click "Změnit URL"
5. Enter new image URL
6. Preview the image
7. Click "Uložit"

**Image URL Sources:**
- Upload to your own server
- Use image hosting service (Imgur, Cloudinary)
- Use stock photos (Unsplash, Pexels)
- Current default: Unsplash images

---

## 🛠️ Troubleshooting

### EmailJS Not Working

**Problem:** Form submits but no email received

**Solution:**
1. Check `.env.local` has correct credentials
2. Verify EmailJS service is active
3. Check email template has correct variable names
4. Check browser console for errors
5. For testing, the form will simulate success if EmailJS is not configured

### Images Not Loading

**Problem:** Broken image placeholders

**Solution:**
1. Check image URL is accessible
2. Use HTTPS URLs only
3. Verify CORS allows the image
4. Use Admin panel to reset to default images
5. Check browser console for errors

### Admin Panel Won't Login

**Problem:** Password not working

**Solution:**
1. Default password: `demonagro2024`
2. Check for typos (case-sensitive)
3. Clear browser cache and localStorage
4. Try incognito/private window

### Products Not Showing

**Problem:** Products page is empty

**Solution:**
1. Go to Admin panel
2. Click "Produkty" tab
3. Click "Obnovit výchozí" to reset products
4. Check product category matches page
5. Ensure products are marked as "Dostupný"

### Content Changes Not Saving

**Problem:** Edits in admin don't appear on site

**Solution:**
1. Check browser localStorage is enabled
2. Try hard refresh (Ctrl+Shift+R)
3. Clear browser cache
4. Check browser console for errors
5. Use "Obnovit výchozí" to reset content

---

## 📞 Support

For issues or questions:
- **Email:** base@demonagro.cz
- **Phone:** +420 731 734 907

---

## 📄 License

© 2025 Démon agro. Všechna práva vyhrazena.
