# Portal Landing Page - Implementation Documentation

## 📋 Overview

Public landing page for the portal at `/portal` that showcases features and encourages users to sign up or log in.

## 🎯 Features

### 1. **Hero Section**
- Gradient background (green to brown)
- Main heading: "Portál pro správu půdních rozborů"
- Descriptive subheading (2-3 sentences)
- Two CTA buttons:
  - "Přihlásit se" → `/portal/prihlaseni` (white on primary-green)
  - "Kontaktovat nás" → `/kontakt` (primary-brown with border)

### 2. **Benefits Section**
- Cream background
- 4 key benefits with checkmark icons:
  - Úspora času při zpracování rozborů
  - Přehled všech pozemků na jednom místě
  - Profesionální reporty pro jednání s úřady
  - Historie hnojení a osevních postupů

### 3. **Features Grid**
- 4 feature cards in a responsive grid (1 col mobile, 2 cols tablet, 4 cols desktop)
- Each card includes:
  - Lucide React icon (Upload, FileText, TrendingUp, Download)
  - Title
  - Description
- Features:
  1. **Upload rozborů** - AI automaticky rozpozná data z PDF
  2. **Zdravotní karty** - Přehledná vizualizace stavu půdy
  3. **Plány hnojení** - Doporučení na míru vašim pozemkům
  4. **Export dat** - Stáhněte si reporty v PDF nebo Excel

### 4. **Gallery Section** (Conditional)
- Only displayed if `portal_images` table has active images
- Interactive carousel with:
  - Main image display (aspect-video)
  - Navigation arrows (previous/next)
  - Dots indicator
  - Thumbnail grid (for 4+ images)
  - Lightbox on click
  - Image title and description
- If no images exist, section is automatically hidden

### 5. **CTA Section**
- Gradient background (green to brown)
- Heading: "Máte zájem o přístup do portálu?"
- Descriptive text about how to get access
- Two buttons:
  - "Kontaktovat nás" → `/kontakt`
  - "base@demonagro.cz" → mailto link

### 6. **Footer Info**
- Light gray background
- Small text explaining access requirements

## 🏗️ Architecture

### Files Created

```
app/portal/
└── page.tsx                           # Landing page (Server Component)

components/portal/
└── PortalGallery.tsx                 # Gallery carousel & lightbox (Client Component)
```

### Component Structure

```
PortalLandingPage (Server Component)
├── Fetches portal_images from Supabase
├── Passes images to PortalGallery
└── Renders sections

PortalGallery (Client Component)
├── Manages carousel state
├── Handles navigation
├── Opens/closes lightbox
└── Displays thumbnails
```

## 🎨 Design System Integration

### Colors Used
- **Primary Green**: `#4A7C59` - buttons, icons, accents
- **Primary Brown**: `#5C4033` - secondary buttons, gradients
- **Primary Cream**: `#F5F1E8` - section backgrounds
- **Primary Beige**: `#C9A77C` - (available if needed)

### Components Style
- Same card style as main website (FeatureCard)
- Consistent button styles
- Same shadows and transitions
- Matching typography

### Icons
All from Lucide React:
- `Upload` - Upload rozborů
- `FileText` - Zdravotní karty
- `TrendingUp` - Plány hnojení
- `Download` - Export dat
- `ArrowRight` - CTA arrows
- `Mail` - Contact button
- `CheckCircle2` - Benefits checkmarks
- `ChevronLeft`, `ChevronRight` - Gallery navigation
- `X` - Lightbox close

## 🗄️ Database Integration

### Portal Images Table

**Table**: `portal_images`

**Columns Used**:
- `id` - UUID
- `url` - Image URL (Supabase Storage)
- `alt` - Alt text
- `title` - Image title (optional)
- `description` - Image description (optional)
- `category` - Category (e.g., 'portal_landing')
- `display_order` - Sort order
- `is_active` - Show/hide flag

**Query**:
```typescript
const { data: images } = await supabase
  .from('portal_images')
  .select('*')
  .eq('is_active', true)
  .order('display_order', { ascending: true })
```

**Conditional Rendering**:
```typescript
{images && images.length > 0 && (
  <section>
    <PortalGallery images={images} />
  </section>
)}
```

## 🎭 Gallery Features

### Carousel
- Displays one image at a time
- Previous/Next navigation buttons
- Dots indicator for quick navigation
- Auto-sizing with aspect-video ratio
- Smooth transitions

### Thumbnails
- Shown if 4+ images exist
- Grid layout (2 cols mobile, 4 cols desktop)
- Active thumbnail highlighted with ring
- Click to navigate

### Lightbox
- Opens on main image click
- Full-screen overlay
- Black background (90% opacity)
- Previous/Next navigation
- Close button (X)
- Image counter (e.g., "2 / 5")
- Click outside to close
- Keyboard navigation (optional enhancement)

## 📱 Responsive Design

### Mobile (< 768px)
- Hero: single column, larger padding
- Benefits: 1 column
- Features: 1 column
- Gallery: full width, smaller buttons
- CTA: stacked buttons
- Thumbnails: 2 columns

### Tablet (768px - 1024px)
- Benefits: 2 columns
- Features: 2 columns
- Gallery: aspect-video maintained
- CTA: row buttons with gap

### Desktop (> 1024px)
- Benefits: 2 columns
- Features: 4 columns
- Gallery: full width with larger controls
- Thumbnails: 4 columns

## 🔐 Access Control

### Public Access
- Route `/portal` is publicly accessible (no auth required)
- Listed in middleware public routes

### Authenticated Users
- If user is logged in and navigates to `/portal`, they see the landing page
- Can click "Přihlásit se" to go to dashboard (redirect handled by middleware)

### Middleware Configuration
```typescript
// In middleware.ts
const publicRoutes = ['/portal', '/portal/prihlaseni', '/portal/reset-hesla', '/portal/onboarding']
const isPublicRoute = publicRoutes.includes(path)

if (isPublicRoute) {
  if (user && path === '/portal/prihlaseni') {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url))
  }
  return response
}
```

## 🧪 Testing Guide

### Test Scenario 1: Unauthenticated User
1. Open `/portal` in incognito mode
2. ✅ Should see full landing page
3. Click "Přihlásit se"
4. ✅ Should redirect to `/portal/prihlaseni`
5. Click "Kontaktovat nás"
6. ✅ Should go to `/kontakt`

### Test Scenario 2: Authenticated User
1. Login to portal
2. Navigate to `/portal`
3. ✅ Should see landing page
4. Click "Přihlásit se"
5. ✅ Should redirect to `/portal/dashboard`

### Test Scenario 3: Gallery with Images
1. Add images to `portal_images` table
2. Reload `/portal`
3. ✅ Gallery section visible
4. Click navigation arrows
5. ✅ Images change
6. Click main image
7. ✅ Lightbox opens
8. Click outside lightbox
9. ✅ Lightbox closes

### Test Scenario 4: Gallery without Images
1. Set all images to `is_active = false` or delete them
2. Reload `/portal`
3. ✅ Gallery section hidden
4. ✅ No errors in console

### Test Scenario 5: Mobile Responsive
1. Open DevTools
2. Toggle device toolbar
3. Test on iPhone 12 Pro
4. ✅ All sections stack vertically
5. ✅ Buttons are full-width on mobile
6. ✅ Gallery navigation works
7. ✅ Text is readable

## 📝 Managing Portal Images

### Adding Images (SQL)

```sql
-- Insert a new portal image
INSERT INTO public.portal_images (
  key,
  url,
  alt,
  title,
  description,
  category,
  display_order,
  is_active
) VALUES (
  'portal_dashboard_screenshot',
  'https://your-supabase-url/storage/v1/object/public/portal-images/dashboard.png',
  'Screenshot of portal dashboard',
  'Dashboard Overview',
  'Main dashboard showing parcels and recent analyses',
  'portal_landing',
  1,
  true
);
```

### Reordering Images

```sql
-- Update display order
UPDATE public.portal_images
SET display_order = 1
WHERE key = 'portal_dashboard_screenshot';

UPDATE public.portal_images
SET display_order = 2
WHERE key = 'portal_upload_screenshot';
```

### Hiding Images

```sql
-- Hide an image
UPDATE public.portal_images
SET is_active = false
WHERE key = 'portal_old_screenshot';
```

## 🎨 Customization

### Changing Hero Text
Edit `app/portal/page.tsx`:
```typescript
<h1>Your New Heading</h1>
<p>Your new subheading...</p>
```

### Changing Features
Edit `features` array in `app/portal/page.tsx`:
```typescript
const features = [
  {
    icon: YourIcon,
    title: 'New Feature',
    description: 'Feature description...',
  },
  // ...
]
```

### Changing Benefits
Edit `benefits` array in `app/portal/page.tsx`:
```typescript
const benefits = [
  'New benefit 1',
  'New benefit 2',
  // ...
]
```

### Changing Contact Email
Edit CTA section:
```typescript
<a href="mailto:your-email@example.com">
  your-email@example.com
</a>
```

## 🐛 Troubleshooting

### Issue: Gallery not showing
**Solution**: Check images in database
```sql
SELECT * FROM public.portal_images WHERE is_active = true;
```
If empty, add images.

### Issue: Images not loading
**Solution**: Check Supabase Storage permissions
- Go to Supabase Dashboard → Storage
- Verify bucket exists and is public
- Check image URLs are correct

### Issue: Lightbox not closing
**Solution**: Check z-index conflicts
- Lightbox uses `z-50`
- Ensure no other elements have higher z-index

### Issue: Carousel buttons not working
**Solution**: Check state management
- Open React DevTools
- Verify `currentIndex` updates
- Check `images` array has data

## 🚀 Deployment Checklist

- [ ] Landing page displays correctly
- [ ] Hero section with gradient
- [ ] Benefits section with checkmarks
- [ ] Features grid (4 cards)
- [ ] Gallery section (if images exist)
- [ ] CTA section with buttons
- [ ] Footer info
- [ ] "Přihlásit se" button works
- [ ] "Kontaktovat nás" button works
- [ ] Email link works
- [ ] Mobile responsive
- [ ] Gallery carousel works
- [ ] Lightbox opens/closes
- [ ] No console errors
- [ ] Images load properly

## 📊 Future Enhancements

### Phase 2 (Optional)
- [ ] Video testimonials
- [ ] Feature comparison table
- [ ] Pricing section (if applicable)
- [ ] FAQ section
- [ ] Statistics/metrics
- [ ] Customer logos
- [ ] Blog posts integration

### Phase 3 (Optional)
- [ ] Keyboard navigation for gallery
- [ ] Swipe gestures on mobile
- [ ] Image zoom in lightbox
- [ ] Video support in gallery
- [ ] Categories filter for gallery

---

## ✅ Status

**Phase 2.1 - Portal Landing Page**: ✅ **COMPLETE**

All requirements met:
- Hero section ✅
- Benefits section ✅
- Features grid ✅
- Gallery (conditional) ✅
- CTA section ✅
- Footer ✅
- Design system integration ✅
- Mobile responsive ✅
- Database integration ✅

---

**Implementation Date**: December 19, 2025  
**Phase**: 2.1 - Portal Landing Page  
**Status**: Ready for Testing ✅
