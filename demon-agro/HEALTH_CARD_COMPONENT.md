# ParcelHealthCard Component - Documentation

## 📋 Overview

Reusable health card component for displaying soil analysis data with visual indicators, progress bars, warnings, and tooltips. Supports both full and compact display modes.

**Location**: `components/portal/ParcelHealthCard.tsx`

## 🎯 Features

### 1. **Two Display Modes**

**Full Mode** (default):
- Large card with detailed information
- Progress bars for all nutrients
- Full warnings display
- Detailed tooltips
- Use in: Parcel detail page

**Compact Mode** (`compact={true}`):
- Smaller card optimized for list views
- Badge-style nutrient display
- Abbreviated warnings
- Use in: Dashboard, parcels list

### 2. **Sub-Components**

**A. NutrientBar**:
- Label (pH, P, K, Mg, Ca)
- Value with unit
- Category badge (color-coded)
- Progress bar (visual indicator)
- Tooltip with explanation
- Responsive full/compact modes

**B. RatioIndicator**:
- K:Mg ratio calculation
- Status indicator (good/warning/critical)
- Color-coded dot and text
- Optimal range display (1.5:1 to 2.5:1)
- Tooltip with explanation

**C. WarningBadge**:
- Low pH warning (< 5.5)
- High P warning (legislative limit)
- Unbalanced K:Mg warning
- Old analysis warning (> 4 years)
- Color-coded by severity

**D. Tooltip**:
- Hover-triggered tooltips
- Category explanations
- Optimal range information

### 3. **Color Coding (Per Specification)**

**pH Categories**:
- EK (Extrémně kyselý): `#ef4444` (Red)
- SK (Silně kyselý): `#f97316` (Orange)
- N (Neutrální): `#eab308` (Yellow)
- SZ (Slabě zásaditý): `#84cc16` (Lime Green)
- EZ (Extrémně zásaditý): `#06b6d4` (Cyan)

**Nutrient Categories**:
- VH (Velmi hluboký): `#ef4444` (Red)
- N (Nízký): `#f97316` (Orange)
- D (Dobrý): `#22c55e` (Green)
- V (Vysoký): `#3b82f6` (Blue)
- VV (Velmi vysoký): `#8b5cf6` (Purple)

**K:Mg Ratio Status**:
- Good (1.5-2.5): Green
- Warning (<1.5 or >2.5-3.5): Yellow
- Critical (<1.2 or >3.5): Red

## 📦 Props Interface

```typescript
interface ParcelHealthCardProps {
  parcel: Parcel              // Parcel data (required)
  analysis: SoilAnalysis | null  // Soil analysis data (optional)
  compact?: boolean           // Display mode (default: false)
}
```

### Parcel Object

```typescript
interface Parcel {
  id: string
  name: string
  area: number
  soil_type: 'L' | 'S' | 'T'
  culture: 'orna' | 'ttp'
  cadastral_number?: string
  notes?: string
  // ... other fields
}
```

### SoilAnalysis Object

```typescript
interface SoilAnalysis {
  id: string
  date: string
  
  // pH
  ph: number
  ph_category: 'EK' | 'SK' | 'N' | 'SZ' | 'EZ' | null
  
  // Nutrients
  phosphorus: number
  phosphorus_category: 'VH' | 'N' | 'D' | 'V' | 'VV' | null
  
  potassium: number
  potassium_category: 'VH' | 'N' | 'D' | 'V' | 'VV' | null
  
  magnesium: number
  magnesium_category: 'VH' | 'N' | 'D' | 'V' | 'VV' | null
  
  calcium?: number | null
  calcium_category?: 'VH' | 'N' | 'D' | 'V' | 'VV' | null
  
  // Optional
  lab_name?: string | null
  notes?: string | null
  // ... other fields
}
```

## 💻 Usage Examples

### Example 1: Full Mode (Detail Page)

```tsx
import { ParcelHealthCard } from '@/components/portal/ParcelHealthCard'

export default async function ParcelDetailPage({ params }) {
  const parcel = await fetchParcel(params.id)
  const analysis = await fetchLatestAnalysis(params.id)
  
  return (
    <div>
      <ParcelHealthCard parcel={parcel} analysis={analysis} />
    </div>
  )
}
```

**Displays**:
- Full-width card with shadow
- Detailed progress bars for all nutrients
- Large K:Mg ratio indicator
- All warning badges
- Analysis date and lab info

### Example 2: Compact Mode (List/Dashboard)

```tsx
import { ParcelHealthCard } from '@/components/portal/ParcelHealthCard'

export default async function DashboardPage() {
  const parcels = await fetchParcelsWithAnalysis()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parcels.map(p => (
        <ParcelHealthCard 
          key={p.id}
          parcel={p}
          analysis={p.latest_analysis}
          compact={true}
        />
      ))}
    </div>
  )
}
```

**Displays**:
- Compact card with border (no shadow)
- Parcel name and basic info
- Badge-style nutrients (4 in grid)
- Small K:Mg indicator
- Abbreviated warnings (max 2 shown)

### Example 3: No Analysis (Empty State)

```tsx
<ParcelHealthCard 
  parcel={parcel}
  analysis={null}
/>
```

**Full Mode**:
- Large warning box
- Alert icon
- Message: "Chybí rozbor půdy"
- CTA button: "Nahrát rozbor" → `/portal/upload?parcel={id}`

**Compact Mode**:
- Small orange box
- Alert icon + "Chybí rozbor" text

## 🔧 Sub-Components API

### NutrientBar

```typescript
interface NutrientBarProps {
  label: string                    // e.g., "pH", "Fosfor (P)"
  value: number                    // Numeric value
  unit: string                     // e.g., "mg/kg", ""
  category: PhCategory | NutrientCategory | null
  categoryLabel: string            // e.g., "Dobrý", "Neutrální"
  categoryDescription: string      // Tooltip text
  isPh?: boolean                   // Special handling for pH
  compact?: boolean                // Display mode
}
```

**Usage**:
```tsx
<NutrientBar
  label="Fosfor (P)"
  value={150}
  unit="mg/kg"
  category="D"
  categoryLabel="Dobrý"
  categoryDescription="Dobrý obsah živiny - udržovací hnojení"
  compact={false}
/>
```

### RatioIndicator

```typescript
interface RatioIndicatorProps {
  potassium: number      // K value in mg/kg
  magnesium: number      // Mg value in mg/kg
  compact?: boolean      // Display mode
}
```

**Usage**:
```tsx
<RatioIndicator
  potassium={200}
  magnesium={85}
  compact={false}
/>
```

**Calculation**:
- Ratio = K / Mg
- Good: 1.5 ≤ ratio ≤ 2.5
- Warning: 1.2 ≤ ratio < 1.5 or 2.5 < ratio ≤ 3.5
- Critical: ratio < 1.2 or ratio > 3.5

### WarningBadge

```typescript
interface WarningBadgeProps {
  type: 'low-ph' | 'high-p' | 'unbalanced-kmg' | 'old-analysis'
  message: string
}
```

**Usage**:
```tsx
<WarningBadge
  type="low-ph"
  message="Nízké pH (5.2) - doporučeno vápnění"
/>
```

### Tooltip

```typescript
interface TooltipProps {
  content: string
  children: React.ReactNode
}
```

**Usage**:
```tsx
<Tooltip content="Optimální pH pro ornou půdu je 6.0-7.0">
  <span className="cursor-help">pH 6.5</span>
</Tooltip>
```

## 🎨 Styling & Theming

### Colors (Tailwind Classes)

**pH Colors**:
```css
EK: bg-[#ef4444], text-[#ef4444]
SK: bg-[#f97316], text-[#f97316]
N:  bg-[#eab308], text-[#eab308]
SZ: bg-[#84cc16], text-[#84cc16]
EZ: bg-[#06b6d4], text-[#06b6d4]
```

**Nutrient Colors**:
```css
VH: bg-[#ef4444], text-[#ef4444]
N:  bg-[#f97316], text-[#f97316]
D:  bg-[#22c55e], text-[#22c55e]
V:  bg-[#3b82f6], text-[#3b82f6]
VV: bg-[#8b5cf6], text-[#8b5cf6]
```

### Layout Classes

**Full Mode**:
- Card: `bg-white rounded-lg shadow-lg p-6`
- Progress bar: `h-3 rounded-full`
- Grid: `grid grid-cols-1 md:grid-cols-2 gap-4`

**Compact Mode**:
- Card: `bg-white rounded-lg border border-gray-200 p-4`
- Grid: `grid grid-cols-2 gap-2`
- Badges: `text-xs px-2 py-0.5 rounded`

## 📱 Responsive Behavior

### Full Mode

**Desktop (>1024px)**:
- 2-column nutrient grid
- Full-width progress bars
- Side-by-side info

**Mobile (<768px)**:
- Single column layout
- Stacked nutrients
- Full-width elements

### Compact Mode

**All Sizes**:
- 2-column nutrient grid maintained
- Wrapping warnings
- Consistent padding

## 🧮 Calculations & Logic

### Progress Bar Width

**pH**:
```typescript
progress = Math.min((value / 9) * 100, 100)
// Scale: 0-9 → 0-100%
```

**Nutrients**:
```typescript
VH: 10%
N:  30%
D:  60%
V:  85%
VV: 100%
```

### K:Mg Ratio Status

```typescript
function getKMgRatio(k: number, mg: number) {
  const ratio = k / mg
  
  if (ratio >= 1.5 && ratio <= 2.5) {
    return 'good'      // Green
  } else if (ratio >= 1.2 && ratio < 1.5) {
    return 'warning'   // Yellow (low K)
  } else if (ratio > 2.5 && ratio <= 3.5) {
    return 'warning'   // Yellow (high K)
  } else {
    return 'critical'  // Red
  }
}
```

### Old Analysis Check

```typescript
function isAnalysisOld(date: string): boolean {
  const yearsDiff = (now - analysisDate) / (365.25 * 24 * 60 * 60 * 1000)
  return yearsDiff > 4
}
```

### High P Check

```typescript
function isPhosphorusTooHigh(value: number, category: string): boolean {
  return category === 'VV' || value > 300
}
```

## ⚠️ Warning Triggers

1. **Low pH**: `ph < 5.5`
2. **High P**: `category === 'VV' || phosphorus > 300`
3. **Unbalanced K:Mg**: `ratio < 1.5 || ratio > 2.5`
4. **Old Analysis**: `age > 4 years`

## 🔄 State Management

Component is fully stateless except for:
- Tooltip visibility (local state in Tooltip component)

All data is passed via props from parent server component.

## 🧪 Testing Scenarios

### Test 1: Full Display with All Warnings

```typescript
const parcel = { 
  name: "Dolní pole", 
  area: 25.5, 
  soil_type: "S", 
  culture: "orna" 
}

const analysis = {
  date: "2019-05-15",  // Old (>4 years)
  ph: 5.2,             // Low pH
  ph_category: "SK",
  phosphorus: 320,     // High P
  phosphorus_category: "VV",
  potassium: 150,
  potassium_category: "N",
  magnesium: 120,
  magnesium_category: "D",
}

// K:Mg = 150/120 = 1.25 (low, warning)
```

**Expected**: 4 warning badges displayed

### Test 2: Optimal Values (No Warnings)

```typescript
const analysis = {
  date: "2024-06-15",
  ph: 6.5,
  ph_category: "N",
  phosphorus: 150,
  phosphorus_category: "D",
  potassium: 180,
  potassium_category: "D",
  magnesium: 90,
  magnesium_category: "D",
}

// K:Mg = 180/90 = 2.0 (optimal)
```

**Expected**: No warning badges, all green indicators

### Test 3: Compact Mode in Grid

```typescript
<div className="grid grid-cols-3 gap-4">
  {parcels.map(p => (
    <ParcelHealthCard 
      parcel={p}
      analysis={p.analysis}
      compact={true}
    />
  ))}
</div>
```

**Expected**: 3 compact cards per row on desktop

## 🎯 Integration Points

### With Database
- Fetches `Parcel` from `parcels` table
- Fetches `SoilAnalysis` from `soil_analyses` table
- Uses constants from `lib/constants/database.ts`

### With Pages
- `/portal/pozemky/[id]` - Full mode
- `/portal/dashboard` - Compact mode (future)
- `/portal/pozemky` - Compact mode in list (future)

### With Types
- `lib/types/database.ts` - Type definitions
- `lib/constants/database.ts` - Labels and descriptions

## 📚 Helper Functions

### getPhCategoryColor(category)
Returns Tailwind bg-color class for pH category.

### getPhTextColor(category)
Returns Tailwind text-color class for pH category.

### getNutrientCategoryColor(category)
Returns Tailwind bg-color class for nutrient category.

### getNutrientTextColor(category)
Returns Tailwind text-color class for nutrient category.

### getNutrientProgress(category)
Returns progress percentage (0-100) for nutrient category.

### getKMgRatio(k, mg)
Calculates K:Mg ratio and returns status object with message.

### isAnalysisOld(date)
Checks if analysis is older than 4 years.

### isPhosphorusTooHigh(value, category)
Checks if phosphorus exceeds legislative limit.

## ✅ Best Practices

1. **Always pass full parcel object** (not just name)
2. **Handle null analysis gracefully** (empty state)
3. **Use compact mode in lists** for better space usage
4. **Provide meaningful tooltips** for user education
5. **Update colors per spec** (use exact hex values)
6. **Test with edge cases** (no analysis, extreme values)
7. **Ensure responsive layout** works on all screen sizes

## 🚀 Future Enhancements

- [ ] Historical trend comparison
- [ ] Nutrient recommendations
- [ ] Click to see detailed analysis
- [ ] Export card as PDF/image
- [ ] Customizable warning thresholds
- [ ] Animation on hover
- [ ] Print-friendly version

---

**Component Size**: 635 lines  
**Last Updated**: December 19, 2025  
**Version**: 2.0 (Enhanced)  
**Status**: Production Ready ✅
