# Portal Landing Page - Quick Test Guide ⚡

Quick 3-minute test guide for the portal landing page.

## Prerequisites

1. **Server is running**: `npm run dev`
2. **Database is set up**: Portal images table exists

## Quick Tests

### ✅ Test 1: Landing Page Loads (30 sec)

1. Open browser to `http://localhost:3000/portal`
2. Should see landing page

**Expected Results:**
- ✅ Hero section with gradient background
- ✅ Heading: "Portál pro správu půdních rozborů"
- ✅ Two buttons: "Přihlásit se" and "Kontaktovat nás"
- ✅ Benefits section with 4 checkmarks
- ✅ Features grid with 4 cards
- ✅ CTA section at bottom
- ✅ Footer info

### ✅ Test 2: Navigation (1 min)

1. Click "Přihlásit se" button
   - ✅ Should go to `/portal/prihlaseni`
2. Go back to `/portal`
3. Click "Kontaktovat nás" (in hero)
   - ✅ Should go to `/kontakt` (main website contact page)
4. Go back to `/portal`
5. Click "Kontaktovat nás" (in CTA section)
   - ✅ Should go to `/kontakt`
6. Click email link `base@demonagro.cz`
   - ✅ Should open email client

### ✅ Test 3: Gallery without Images (30 sec)

1. Verify no images in database:
```sql
SELECT COUNT(*) FROM public.portal_images WHERE is_active = true;
-- Should return 0
```

2. Reload `/portal`
   - ✅ Gallery section should be HIDDEN
   - ✅ Page should flow from Features → CTA
   - ✅ No errors in console

### ✅ Test 4: Gallery with Images (2 min)

1. Add test images:
```sql
-- Run lib/supabase/sql/add_portal_images_examples.sql
-- This adds 4 placeholder images
```

2. Reload `/portal`
   - ✅ Gallery section now visible
   - ✅ Title: "Ukázka portálu"
   - ✅ One main image displayed
   - ✅ Previous/Next buttons visible
   - ✅ Dots indicator at bottom (4 dots)

3. Click "Next" button
   - ✅ Image changes
   - ✅ Active dot updates
   - ✅ Smooth transition

4. Click "Previous" button
   - ✅ Goes back to previous image

5. Click on any dot
   - ✅ Jumps to that image

6. Scroll down (if 4+ images)
   - ✅ Thumbnail grid visible
   - ✅ Active thumbnail has green ring

7. Click on main image
   - ✅ Lightbox opens
   - ✅ Black overlay
   - ✅ Image in center
   - ✅ Close button (X) in top-right
   - ✅ Previous/Next buttons
   - ✅ Counter at bottom (e.g., "2 / 4")

8. Click outside image in lightbox
   - ✅ Lightbox closes

9. Open lightbox again
10. Click X button
    - ✅ Lightbox closes

### ✅ Test 5: Mobile Responsive (1 min)

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro
4. Reload `/portal`

**Expected Results:**
- ✅ Hero buttons stack vertically
- ✅ Benefits in single column
- ✅ Features in single column
- ✅ Gallery fits screen width
- ✅ Gallery navigation buttons smaller
- ✅ CTA buttons stack vertically
- ✅ Text is readable
- ✅ No horizontal scroll

5. Try landscape orientation
   - ✅ Layout adjusts
   - ✅ Still usable

### ✅ Test 6: Authenticated User (1 min)

1. Login to portal (any test user)
2. Navigate to `/portal`
3. ✅ Should see landing page
4. Click "Přihlásit se"
5. ✅ Should redirect to `/portal/dashboard` (not login page)

## Visual Checklist

### Hero Section
- [ ] Gradient background (green to brown)
- [ ] White text
- [ ] Large heading
- [ ] Two-sentence description
- [ ] Two CTA buttons (white and brown)

### Benefits Section
- [ ] Cream background
- [ ] Centered heading
- [ ] 4 benefits with green checkmarks
- [ ] 2-column grid (desktop)

### Features Section
- [ ] White background
- [ ] Heading: "Hlavní funkce portálu"
- [ ] 4 cards in grid
- [ ] Each card has:
  - [ ] Green circular icon
  - [ ] Bold title
  - [ ] Gray description
  - [ ] Hover shadow effect

### Gallery Section (if images exist)
- [ ] Cream background
- [ ] Heading: "Ukázka portálu"
- [ ] Main image (aspect-video)
- [ ] Previous/Next buttons
- [ ] Dots indicator
- [ ] Thumbnail grid (if 4+ images)
- [ ] Image title and description

### CTA Section
- [ ] Gradient background (green to brown)
- [ ] White text
- [ ] Heading: "Máte zájem o přístup do portálu?"
- [ ] Description text
- [ ] Two buttons (white and brown)

### Footer
- [ ] Light gray background
- [ ] Small text
- [ ] Centered

## Common Issues

### ❌ Gallery not showing
**Cause**: No active images in database  
**Fix**: Run `lib/supabase/sql/add_portal_images_examples.sql`

### ❌ Images not loading (broken image icons)
**Cause**: Invalid image URLs  
**Fix**: 
1. Upload real screenshots to Supabase Storage
2. Update image URLs in database
3. Or use placeholder URLs for testing

### ❌ Lightbox won't close
**Cause**: Click event not propagating  
**Fix**: Click directly on black overlay (not on image)

### ❌ Navigation buttons don't work in gallery
**Cause**: JavaScript not loaded  
**Fix**: Check browser console for errors

### ❌ Page looks broken on mobile
**Cause**: Zoom level or viewport issue  
**Fix**: 
1. Reset zoom to 100%
2. Check viewport meta tag in layout
3. Clear browser cache

## Database Verification

### Check portal images:
```sql
SELECT 
  key,
  title,
  is_active,
  display_order,
  category
FROM public.portal_images
WHERE category = 'portal_landing'
ORDER BY display_order;
```

**Expected**: 4 rows if you ran the example SQL script.

### Add/Remove images for testing:
```sql
-- Hide all images (test empty state)
UPDATE public.portal_images 
SET is_active = false
WHERE category = 'portal_landing';

-- Show all images (test with gallery)
UPDATE public.portal_images 
SET is_active = true
WHERE category = 'portal_landing';
```

## Performance Check

### Lighthouse Audit (Optional)
1. Open DevTools → Lighthouse
2. Run audit for Desktop
3. Check scores:
   - Performance: Should be > 90
   - Accessibility: Should be > 90
   - Best Practices: Should be > 90
   - SEO: Should be > 80

### Load Time
- Initial page load: < 2 seconds
- Gallery image change: < 100ms
- Lightbox open: Instant
- Smooth animations: No janky scrolling

## Success Criteria ✅

All tests pass if:
- [ ] Landing page loads without errors
- [ ] All sections render correctly
- [ ] Navigation buttons work
- [ ] Gallery shows when images exist
- [ ] Gallery hides when no images
- [ ] Carousel navigation works
- [ ] Lightbox opens and closes
- [ ] Mobile layout is usable
- [ ] No console errors
- [ ] Authenticated users can access

**Time to complete**: ~3-5 minutes  
**Status**: Ready for testing ✅

---

## Next Steps After Testing

1. ✅ Landing page works
2. Upload real screenshots:
   - Dashboard
   - Upload page
   - Health card
   - Fertilization plan
3. Update image URLs in database
4. Test with real images
5. Deploy to production
