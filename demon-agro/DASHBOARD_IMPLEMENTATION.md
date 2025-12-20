# Dashboard - Implementation Documentation

## 📋 Overview

Main dashboard page at `/portal/dashboard` that provides users with an overview of their farm, parcels, and recent activity.

## 🎯 Features

### 1. **Welcome Section**
- Personalized greeting with company name or full name
- Current date in Czech format (e.g., "pátek 19. prosince 2025")
- Gradient background (green to brown)

### 2. **Quick Stats Cards** (4 cards)
- **Počet pozemků**: Total active parcels
- **Celková výměra**: Total area in hectares
- **Vyžadují pozornost**: Parcels with warnings
- **Nevyřízené poptávky**: Pending liming requests (new/in_progress)

Each card includes:
- Icon (Lucide React)
- Large number display
- Descriptive label
- Color-coded left border

### 3. **Parcels Requiring Attention**
Displays up to 5 parcels that meet any of these criteria:

**High Severity**:
- pH < 5.5 (acidic soil requiring liming)

**Medium Severity**:
- No soil analysis available
- Analysis older than 4 years

**Low Severity**:
- Low nutrient availability (P, K, or Mg in categories N or VH)

Features:
- Sorted by severity (high → medium → low)
- Clickable cards linking to parcel detail
- Shows: parcel name, area, cadastral number, and reason
- Color-coded badges (red/orange/yellow)
- "Zobrazit vše" link if more than 5 parcels

### 4. **Quick Actions** (3 buttons)
- **Nahrát rozbor**: → `/portal/upload`
- **Přidat pozemek**: → `/portal/pozemky?action=add`
- **Vytvořit poptávku**: → `/portal/poptavky/nova`

Each action card includes:
- Icon with colored background
- Title and description
- Hover effects
- Direct link

### 5. **Recent Activity Timeline**
Shows last 5 audit log entries:
- Action description
- Table name (translated to Czech)
- Time ago (e.g., "Před 2 h", "Před 3 dny")
- Green dot indicator

**Empty State**:
- If no activity: Message with CTA to upload first analysis
- Button: "Nahrát první rozbor"

## 🏗️ Architecture

### Server Component
```typescript
export default async function DashboardPage() {
  // 1. Require authentication
  const user = await requireAuth()
  
  // 2. Fetch data from Supabase
  const profile = await supabase.from('profiles')...
  const parcels = await supabase.from('parcels')...
  const limingRequests = await supabase.from('liming_requests')...
  const auditLogs = await supabase.from('audit_logs')...
  
  // 3. Calculate statistics
  // 4. Identify parcels needing attention
  // 5. Render dashboard
}
```

### Data Flow
```
User Authentication (requireAuth)
  ↓
Fetch Profile (for company name)
  ↓
Fetch Parcels (with latest soil analyses)
  ↓
Fetch Liming Requests
  ↓
Fetch Audit Logs (last 5)
  ↓
Calculate Stats & Analyze Data
  ↓
Render Dashboard
```

## 🗄️ Database Queries

### 1. User Profile
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('company_name, full_name')
  .eq('id', user.id)
  .single()
```

### 2. Parcels with Latest Analysis
```typescript
const { data: parcels } = await supabase
  .from('parcels')
  .select(`
    *,
    soil_analyses (
      id,
      parcel_id,
      analysis_date,
      ph,
      p, p_category,
      k, k_category,
      mg, mg_category,
      created_at
    )
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

**Processing**:
- Sort analyses by `analysis_date` descending
- Take the first (latest) analysis for each parcel

### 3. Liming Requests
```typescript
const { data: limingRequests } = await supabase
  .from('liming_requests')
  .select('id, status, created_at')
  .eq('user_id', user.id)
```

**Processing**:
- Filter for `status === 'new' || status === 'in_progress'`
- Count pending requests

### 4. Audit Logs
```typescript
const { data: auditLogs } = await supabase
  .from('audit_logs')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(5)
```

## 📊 Statistics Calculations

### Total Parcels
```typescript
const totalParcels = parcelsWithLatestAnalysis.length
```

### Total Area
```typescript
const totalArea = parcelsWithLatestAnalysis.reduce(
  (sum, p) => sum + p.area, 
  0
)
```

### Pending Requests
```typescript
const pendingRequests = (limingRequests || []).filter(
  r => r.status === 'new' || r.status === 'in_progress'
).length
```

### Parcels Needing Attention
Algorithm:
1. Loop through all parcels
2. For each parcel, check:
   - No analysis? → Medium severity
   - pH < 5.5? → High severity
   - Analysis > 4 years old? → Medium severity
   - Low nutrients (N/VH)? → Low severity
3. Sort by severity
4. Take first 5

## 🎨 Design System

### Colors
- **Primary Green**: `#4A7C59` - main actions, stat card borders
- **Primary Brown**: `#5C4033` - gradients, hover states
- **Primary Cream**: `#F5F1E8` - (available if needed)
- **Blue**: `#3B82F6` - total area card
- **Orange**: `#F97316` - attention warnings
- **Purple**: `#A855F7` - liming requests
- **Red**: `#EF4444` - high severity badges
- **Yellow**: `#EAB308` - low severity badges

### Typography
- **Headings**: Bold, dark gray (`text-gray-900`)
- **Body**: Regular, medium gray (`text-gray-600`)
- **Stats**: Extra large, bold (`text-3xl font-bold`)
- **Labels**: Small, medium weight (`text-sm font-medium`)

### Spacing
- Section gaps: `space-y-8`
- Card gaps: `gap-6`
- Card padding: `p-6`
- Border radius: `rounded-lg`

## 🧮 Helper Functions

### getCzechDate()
Formats current date in Czech locale:
```typescript
function getCzechDate() {
  return new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}
// Output: "pátek 19. prosince 2025"
```

### formatArea(area: number)
Formats area with 2 decimal places:
```typescript
function formatArea(area: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(area)
}
// Output: "123,45"
```

### getTimeAgo(date: string)
Returns human-readable time difference:
```typescript
function getTimeAgo(date: string): string {
  // < 1 min: "Právě teď"
  // < 60 min: "Před X min"
  // < 24 h: "Před X h"
  // < 7 days: "Před X dny"
  // else: "19. 12. 2025"
}
```

## 🔐 Access Control

### Authentication Required
- Uses `requireAuth()` from auth-helpers
- Redirects unauthenticated users to login
- Passes authenticated user to page logic

### Data Isolation
- All queries filtered by `user_id`
- Users only see their own:
  - Parcels
  - Analyses
  - Requests
  - Audit logs

## 📱 Responsive Design

### Breakpoints

**Mobile (< 768px)**:
- Stats grid: 1 column
- Quick actions: 1 column
- Attention cards: Full width

**Tablet (768px - 1024px)**:
- Stats grid: 2 columns
- Quick actions: 3 columns (may wrap)

**Desktop (> 1024px)**:
- Stats grid: 4 columns
- Quick actions: 3 columns
- All cards side-by-side

### Touch Targets
- All buttons/links: Minimum 44x44px
- Card hover areas: Full card clickable
- Icon buttons: 48x48px touch area

## 🧪 Testing Scenarios

### Test 1: New User (No Data)
1. Login as new user
2. ✅ Dashboard loads
3. ✅ All stats show 0
4. ✅ No attention section
5. ✅ Quick actions visible
6. ✅ Empty activity state shows
7. ✅ "Nahrát první rozbor" CTA visible

### Test 2: User with Parcels
1. Login as user with 3 parcels
2. ✅ "Počet pozemků" shows 3
3. ✅ "Celková výměra" shows sum
4. ✅ Date in Czech format
5. ✅ Company name in greeting

### Test 3: Parcels Needing Attention
1. Create parcel with pH 5.2
2. ✅ Shows in attention section
3. ✅ Badge is red (high severity)
4. ✅ Reason: "Nízké pH (5.2)"
5. Click card
6. ✅ Navigates to parcel detail

### Test 4: Old Analysis
1. Create parcel with 5-year-old analysis
2. ✅ Shows in attention section
3. ✅ Badge is orange (medium severity)
4. ✅ Reason: "Rozbor starý 5 let"

### Test 5: Low Nutrients
1. Create parcel with P category = "N"
2. ✅ Shows in attention section
3. ✅ Badge is yellow (low severity)
4. ✅ Reason: "Nízká zásobenost (P)"

### Test 6: Pending Requests
1. Create liming request with status "new"
2. ✅ "Nevyřízené poptávky" shows 1
3. Create another with status "completed"
4. ✅ Count still shows 1 (only pending)

### Test 7: Recent Activity
1. Perform some actions (upload, add parcel)
2. ✅ Activity timeline shows last 5
3. ✅ Time ago is correct
4. ✅ Table names translated to Czech

### Test 8: Quick Actions
1. Click "Nahrát rozbor"
2. ✅ Goes to `/portal/upload`
3. Click "Přidat pozemek"
4. ✅ Goes to `/portal/pozemky?action=add`
5. Click "Vytvořit poptávku"
6. ✅ Goes to `/portal/poptavky/nova`

### Test 9: Mobile Responsive
1. Open on mobile device
2. ✅ Stats stack vertically
3. ✅ Cards are full width
4. ✅ Text is readable
5. ✅ Buttons are tappable

## 🐛 Troubleshooting

### Issue: Stats show 0 but data exists
**Solution**: Check queries are filtering by correct user_id
```typescript
console.log('User ID:', user.id)
console.log('Parcels:', parcels?.length)
```

### Issue: Attention section not showing
**Cause**: No parcels meet criteria or `sortedAttention` is empty
**Solution**: Verify analysis dates and values in database

### Issue: Czech date not formatting
**Cause**: Locale not available
**Solution**: Verify Intl API support (works in all modern browsers)

### Issue: Time ago shows wrong values
**Cause**: Timezone mismatch
**Solution**: Ensure dates are stored in UTC in Supabase

### Issue: Activity timeline empty
**Cause**: No audit_logs entries
**Solution**: Check audit logging is enabled and working

## 🎯 Future Enhancements

### Phase 3 (Optional)
- [ ] Charts for nutrient trends over time
- [ ] Weather integration
- [ ] Calendar view of upcoming tasks
- [ ] Notifications for urgent items
- [ ] Export dashboard to PDF
- [ ] Customizable dashboard widgets
- [ ] Comparison with previous season
- [ ] Recommendations based on AI

### Phase 4 (Optional)
- [ ] Multi-year statistics
- [ ] Benchmarking against similar farms
- [ ] Predictive analytics
- [ ] Mobile app push notifications

## 📊 Performance Considerations

### Database Queries
- All queries use indexes on `user_id`
- Latest analysis: Client-side sort (efficient for <100 parcels)
- Audit logs: Limited to 5 entries
- Consider pagination for farms with 100+ parcels

### Optimization Tips
1. Add database index on `parcels.user_id`
2. Add composite index on `soil_analyses(parcel_id, analysis_date)`
3. Consider caching for stats (if data doesn't change often)
4. Use Supabase RLS for automatic user_id filtering

## ✅ Completion Criteria

All implemented:
- [x] Welcome section with Czech date
- [x] 4 quick stats cards
- [x] Attention section with severity
- [x] 3 quick action buttons
- [x] Recent activity timeline
- [x] Empty states
- [x] Mobile responsive
- [x] Data from Supabase
- [x] User-specific filtering
- [x] Czech localization

## 🏁 Status

**Phase 2.2 - Dashboard**: ✅ **COMPLETE**

All requirements met:
- Uvítání s datem ✅
- Rychlý přehled (4 karty) ✅
- Pozemky vyžadující pozornost ✅
- Rychlé akce ✅
- Poslední aktivita ✅
- Server Component ✅
- Supabase data ✅
- Design system ✅

---

**Implementation Date**: December 19, 2025  
**Phase**: 2.2 - Dashboard  
**Status**: Ready for Testing ✅
