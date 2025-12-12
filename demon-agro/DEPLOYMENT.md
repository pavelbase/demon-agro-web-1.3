# Deployment Guide - Démon agro

## Quick Deployment Checklist

- [ ] Replace `public/logo.jpg` with actual logo
- [ ] Configure EmailJS credentials in `.env.local`
- [ ] Test contact form locally
- [ ] Update image URLs in Admin panel (optional)
- [ ] Test all pages locally
- [ ] Build production version (`npm run build`)
- [ ] Deploy to hosting platform
- [ ] Set environment variables on hosting platform
- [ ] Test deployed website
- [ ] Test contact form on production

---

## 1. Pre-Deployment Setup

### Replace Logo

```bash
# Replace the placeholder logo with your actual logo
cp /path/to/your/logo.jpg demon-agro/public/logo.jpg
```

**Logo specifications:**
- Format: JPG or PNG with transparency
- Size: 200x200px minimum (SVG preferred for scalability)
- Content: Démon character + "Démon agro" text
- Colors: Brown (#5C4033) and Beige (#C9A77C) on cream (#F5F1E8)

### Configure EmailJS

1. Create account at [EmailJS.com](https://www.emailjs.com/)
2. Add email service (Gmail, Outlook, etc.)
3. Create email template:

**Template ID:** (save this for later)

**Template content:**
```
Subject: Nová poptávka z webu Démon agro - {{from_name}}

Body:
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

4. Get your credentials:
   - Service ID
   - Template ID
   - Public Key

5. Create `.env.local`:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_CONTACT_EMAIL=base@demonagro.cz
```

### Test Locally

```bash
npm run dev
```

Test all features:
- [ ] Navigate through all pages
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Test contact form submission
- [ ] Check email arrives at base@demonagro.cz
- [ ] Test admin panel (password: demonagro2024)
- [ ] Add/edit/delete products
- [ ] Edit page content
- [ ] Change image URLs

### Build for Production

```bash
npm run build
```

Should complete without errors. Warnings about `<img>` vs `<Image />` are okay.

---

## 2. Deployment to Vercel (Recommended)

### Why Vercel?
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- CDN worldwide
- Free for personal/commercial use

### Steps

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit - Démon agro website"
git remote add origin https://github.com/yourusername/demon-agro.git
git push -u origin main
```

2. **Import to Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js

3. **Configure Environment Variables**

In Vercel project settings, add:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_CONTACT_EMAIL=base@demonagro.cz
```

4. **Deploy**

Click "Deploy" - Vercel will:
- Install dependencies
- Build the project
- Deploy to production
- Give you a URL: `https://demon-agro.vercel.app`

5. **Custom Domain (Optional)**

- Buy domain (e.g., `demonagro.cz`)
- In Vercel settings → Domains
- Add your domain
- Update DNS records as instructed
- Vercel provides automatic HTTPS

---

## 3. Alternative Deployment Options

### Netlify

1. Push to GitHub
2. Go to [netlify.com](https://www.netlify.com)
3. "New site from Git"
4. Connect GitHub repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy

### AWS Amplify

1. Push to GitHub
2. Go to AWS Amplify Console
3. "New app" → "Host web app"
4. Connect GitHub
5. Build settings auto-detected
6. Add environment variables
7. Deploy

### DigitalOcean App Platform

1. Push to GitHub
2. Create new app in DigitalOcean
3. Connect GitHub repo
4. Select Next.js template
5. Add environment variables
6. Choose plan (starts at $5/month)
7. Deploy

### Self-Hosted (VPS/Dedicated Server)

**Requirements:**
- Node.js 18+ installed
- PM2 process manager
- Nginx reverse proxy
- SSL certificate (Let's Encrypt)

**Setup:**

```bash
# On your server
git clone https://github.com/yourusername/demon-agro.git
cd demon-agro

# Install dependencies
npm install

# Create .env.local with your EmailJS credentials
nano .env.local

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "demon-agro" -- start
pm2 save
pm2 startup
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name demonagro.cz www.demonagro.cz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL with Certbot:**

```bash
sudo certbot --nginx -d demonagro.cz -d www.demonagro.cz
```

---

## 4. Post-Deployment

### Verify Deployment

Test checklist:
- [ ] Website loads at production URL
- [ ] All pages accessible
- [ ] Images load correctly
- [ ] Contact form works
- [ ] Email arrives at base@demonagro.cz
- [ ] Admin panel accessible at `/admin`
- [ ] Mobile responsive
- [ ] HTTPS works (green padlock)

### Performance Testing

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

**Expected scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### SEO Setup

1. **Google Search Console**
   - Add property: `demonagro.cz`
   - Submit sitemap: `https://demonagro.cz/sitemap.xml`
   - Request indexing

2. **Google Business Profile**
   - Create profile for Démon agro
   - Add contact info
   - Add service area (severní a západní Čechy)
   - Add website link

3. **Meta Tags** (already included in pages)
   - Title
   - Description
   - Keywords
   - Open Graph tags (for social media)

### Analytics (Optional)

Add Google Analytics:

1. Create GA4 property
2. Get tracking ID
3. Add to `app/layout.tsx`:

```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

## 5. Maintenance

### Regular Updates

```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Backup

**What to backup:**
- Source code (GitHub repository)
- Environment variables (store securely)
- Logo and custom images
- Content changes made in admin panel (export localStorage if needed)

**localStorage Export:**

Add this to admin panel to export data:

```javascript
const exportData = () => {
  const data = {
    products: localStorage.getItem('products'),
    images: localStorage.getItem('images'),
    content: {}
  };
  
  ['home', 'ph', 'sira', 'k', 'mg', 'analyza', 'onas'].forEach(page => {
    data.content[page] = localStorage.getItem(`content_${page}`);
  });
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'demonagro-backup.json';
  a.click();
};
```

### Monitoring

Set up uptime monitoring:
- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

---

## 6. Troubleshooting

### Build Fails on Deployment

**Error:** "Module not found" or "Cannot find module"

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Problem:** EmailJS not sending emails on production

**Solution:**
1. Verify env vars are set in hosting platform
2. Must start with `NEXT_PUBLIC_` to be accessible in browser
3. Restart/redeploy after adding env vars
4. Check browser console for errors

### Images Not Loading on Production

**Problem:** Images work locally but not on production

**Solution:**
1. Check CORS policy of image host
2. Use HTTPS URLs only (not HTTP)
3. Consider hosting images on same domain
4. Check Next.js Image optimization settings

### High Bandwidth Usage

**Problem:** Image loading is slow/expensive

**Solution:**
1. Compress images before uploading
2. Use WebP format
3. Use Next.js Image component (replace `<img>` tags)
4. Enable CDN on hosting platform

---

## 7. Scaling

### When to Scale

Signs you need to scale:
- Slow page load times (>3 seconds)
- High traffic (>10,000 visitors/day)
- Form submissions delayed
- Server errors under load

### Scaling Options

1. **CDN** (Already included with Vercel/Netlify)
   - Static assets cached globally
   - Faster load times worldwide

2. **Database Migration**
   - Move from localStorage to real database
   - Options: PostgreSQL, MongoDB, Supabase
   - Needed when admin access is required from multiple devices

3. **Email Service Upgrade**
   - EmailJS has limits on free plan
   - Consider: SendGrid, Mailgun, AWS SES
   - Needed when >200 emails/month

4. **Image Optimization**
   - Use image CDN (Cloudinary, Imgix)
   - Automatic optimization and resizing
   - Needed when many images or large files

---

## 8. Security

### Best Practices

- [ ] Use HTTPS only (automatic with Vercel/Netlify)
- [ ] Keep dependencies updated
- [ ] Don't commit `.env.local` to Git
- [ ] Use strong admin password (change from default)
- [ ] Implement rate limiting on contact form (future)
- [ ] Add CAPTCHA to contact form (future)
- [ ] Regular backups

### Admin Password Change

To change admin password, edit `app/admin/page.tsx`:

```typescript
const handleLogin = () => {
  if (password === "YOUR_NEW_PASSWORD_HERE") {
    setIsAuthenticated(true);
  }
```

---

## 9. Support & Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [EmailJS Docs](https://www.emailjs.com/docs/)
- [Vercel Docs](https://vercel.com/docs)

### Need Help?

- **Technical Issues:** Check SETUP.md troubleshooting section
- **Content Management:** See content management section in SETUP.md
- **Email:** base@demonagro.cz
- **Phone:** +420 731 734 907

---

## 10. Success Checklist

Before going live:

- [ ] Logo replaced with actual logo
- [ ] EmailJS configured and tested
- [ ] All pages reviewed and content correct
- [ ] Contact form sends emails successfully
- [ ] Admin panel password changed (optional)
- [ ] Images optimized and loading fast
- [ ] Mobile responsive checked on real devices
- [ ] All links work
- [ ] SSL certificate active (HTTPS)
- [ ] Google Search Console set up
- [ ] Domain pointed correctly
- [ ] Backup of all content
- [ ] Monitoring set up

---

**Congratulations! Your Démon agro website is ready to launch! 🚀**

For ongoing support and updates, refer to SETUP.md and this deployment guide.
