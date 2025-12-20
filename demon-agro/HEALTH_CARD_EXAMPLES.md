# ParcelHealthCard - Usage Examples

## 📚 Table of Contents

1. [Basic Usage](#basic-usage)
2. [Full Mode Examples](#full-mode-examples)
3. [Compact Mode Examples](#compact-mode-examples)
4. [Edge Cases](#edge-cases)
5. [Common Patterns](#common-patterns)

## Basic Usage

### Import

```tsx
import { ParcelHealthCard } from '@/components/portal/ParcelHealthCard'
```

### Minimal Example

```tsx
<ParcelHealthCard 
  parcel={parcel}
  analysis={analysis}
/>
```

## Full Mode Examples

### Example 1: Parcel Detail Page

```tsx
// app/portal/pozemky/[id]/page.tsx
import { ParcelHealthCard } from '@/components/portal/ParcelHealthCard'
import { createClient } from '@/lib/supabase/server'

export default async function ParcelDetailPage({ params }) {
  const supabase = await createClient()
  
  // Fetch parcel
  const { data: parcel } = await supabase
    .from('parcels')
    .select('*')
    .eq('id', params.id)
    .single()
  
  // Fetch latest analysis
  const { data: analyses } = await supabase
    .from('soil_analyses')
    .select('*')
    .eq('parcel_id', params.id)
    .order('date', { ascending: false })
    .limit(1)
  
  const latestAnalysis = analyses?.[0] || null
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1>{parcel.name}</h1>
      
      {/* Full Health Card */}
      <ParcelHealthCard 
        parcel={parcel}
        analysis={latestAnalysis}
      />
    </div>
  )
}
```

### Example 2: With Multiple Analyses (Show Latest)

```tsx
export default async function ParcelOverview({ parcelId }) {
  const analyses = await fetchAllAnalyses(parcelId)
  const parcel = await fetchParcel(parcelId)
  
  // Show latest
  const latest = analyses[0]
  
  return (
    <div>
      <ParcelHealthCard parcel={parcel} analysis={latest} />
      
      {/* Historical analyses below */}
      <div className="mt-6">
        <h3>Starší rozbory</h3>
        {analyses.slice(1).map(a => (
          <div key={a.id} className="mb-4">
            <small>{new Date(a.date).toLocaleDateString('cs-CZ')}</small>
            {/* Could show compact version here */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 3: Side-by-Side Comparison

```tsx
export default function CompareAnalyses({ parcel, analysis1, analysis2 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="mb-4">Aktuální rozbor</h3>
        <ParcelHealthCard parcel={parcel} analysis={analysis1} />
      </div>
      <div>
        <h3 className="mb-4">Předchozí rozbor</h3>
        <ParcelHealthCard parcel={parcel} analysis={analysis2} />
      </div>
    </div>
  )
}
```

## Compact Mode Examples

### Example 4: Dashboard Grid

```tsx
// app/portal/dashboard/page.tsx
export default async function DashboardPage() {
  const parcels = await fetchParcelsWithAnalysis()
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Přehled pozemků</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parcels.map(p => (
          <a key={p.id} href={`/portal/pozemky/${p.id}`}>
            <ParcelHealthCard 
              parcel={p}
              analysis={p.latest_analysis}
              compact={true}
            />
          </a>
        ))}
      </div>
    </div>
  )
}
```

### Example 5: Parcels List with Health Cards

```tsx
// Alternative to table view
export default function ParcelsListView({ parcels }) {
  return (
    <div className="space-y-3">
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

### Example 6: Problem Parcels Widget

```tsx
export default function ProblemParcelsWidget({ parcels }) {
  // Filter parcels with warnings
  const problemParcels = parcels.filter(p => {
    if (!p.latest_analysis) return true
    const analysis = p.latest_analysis
    return (
      analysis.ph < 5.5 ||
      analysis.phosphorus > 300 ||
      isOldAnalysis(analysis.date)
    )
  })
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Pozemky vyžadující pozornost
      </h3>
      
      <div className="space-y-3">
        {problemParcels.map(p => (
          <ParcelHealthCard
            key={p.id}
            parcel={p}
            analysis={p.latest_analysis}
            compact={true}
          />
        ))}
      </div>
      
      {problemParcels.length === 0 && (
        <p className="text-gray-600 text-sm">Všechny pozemky jsou v pořádku</p>
      )}
    </div>
  )
}
```

## Edge Cases

### Example 7: No Analysis (Empty State)

```tsx
// Parcel without any analysis
<ParcelHealthCard
  parcel={{
    id: '123',
    name: 'Nový pozemek',
    area: 10.5,
    soil_type: 'S',
    culture: 'orna',
  }}
  analysis={null}
/>
```

**Full Mode Output**:
- Large warning box
- "Chybí rozbor půdy" message
- CTA button to upload

**Compact Mode Output**:
- Small orange box
- "Chybí rozbor" badge

### Example 8: Very Old Analysis

```tsx
<ParcelHealthCard
  parcel={parcel}
  analysis={{
    date: '2018-05-15', // >4 years old
    ph: 6.5,
    // ... other fields
  }}
/>
```

**Shows**:
- Blue "Rozbor starší než 4 roky" badge
- Recommendation for new analysis

### Example 9: Extreme pH Values

```tsx
<ParcelHealthCard
  parcel={parcel}
  analysis={{
    ph: 4.2,  // Extremely acidic
    ph_category: 'EK',
    // ...
  }}
/>
```

**Shows**:
- Red "Nízké pH (4.2) - doporučeno vápnění" badge
- Red progress bar
- Critical warning

### Example 10: High Phosphorus (Legislative)

```tsx
<ParcelHealthCard
  parcel={parcel}
  analysis={{
    phosphorus: 350,  // Above limit
    phosphorus_category: 'VV',
    // ...
  }}
/>
```

**Shows**:
- Orange "Vysoká zásobenost P - legislativní omezení" badge
- Purple progress bar (VV category)

## Common Patterns

### Pattern 1: Conditional Rendering Based on Analysis

```tsx
export default function ParcelOverview({ parcel, analysis }) {
  if (!analysis) {
    return (
      <div>
        <ParcelHealthCard parcel={parcel} analysis={null} />
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Pro správné doporučení je nutný rozbor půdy
          </p>
          <a 
            href={`/portal/upload?parcel=${parcel.id}`}
            className="btn-primary"
          >
            Nahrát první rozbor
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <ParcelHealthCard parcel={parcel} analysis={analysis} />
      
      {/* Show recommendations based on analysis */}
      <RecommendationsSection analysis={analysis} />
    </div>
  )
}
```

### Pattern 2: Filtering Parcels by Health Status

```tsx
export default function ParcelsFilteredByStatus({ parcels }) {
  const [filter, setFilter] = useState('all')
  
  const filtered = parcels.filter(p => {
    if (filter === 'all') return true
    if (filter === 'no-analysis') return !p.latest_analysis
    if (filter === 'warnings') {
      // Has any warnings
      return hasWarnings(p.latest_analysis)
    }
    return true
  })
  
  return (
    <div>
      <div className="mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Všechny pozemky</option>
          <option value="no-analysis">Bez rozboru</option>
          <option value="warnings">S varováními</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <ParcelHealthCard
            key={p.id}
            parcel={p}
            analysis={p.latest_analysis}
            compact={true}
          />
        ))}
      </div>
    </div>
  )
}
```

### Pattern 3: Loading State

```tsx
'use client'

export default function ParcelHealthCardWithLoading({ parcelId }) {
  const [parcel, setParcel] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function load() {
      const p = await fetchParcel(parcelId)
      const a = await fetchLatestAnalysis(parcelId)
      setParcel(p)
      setAnalysis(a)
      setLoading(false)
    }
    load()
  }, [parcelId])
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4" />
        <div className="h-20 bg-gray-200 rounded mb-4" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    )
  }
  
  return <ParcelHealthCard parcel={parcel} analysis={analysis} />
}
```

### Pattern 4: Exporting Card as Image

```tsx
'use client'

import html2canvas from 'html2canvas'
import { useRef } from 'react'

export default function ExportableHealthCard({ parcel, analysis }) {
  const cardRef = useRef(null)
  
  async function exportAsImage() {
    if (!cardRef.current) return
    
    const canvas = await html2canvas(cardRef.current)
    const link = document.createElement('a')
    link.download = `zdravotni-karta-${parcel.name}.png`
    link.href = canvas.toDataURL()
    link.click()
  }
  
  return (
    <div>
      <div ref={cardRef}>
        <ParcelHealthCard parcel={parcel} analysis={analysis} />
      </div>
      
      <button 
        onClick={exportAsImage}
        className="mt-4 btn-secondary"
      >
        Exportovat jako obrázek
      </button>
    </div>
  )
}
```

### Pattern 5: Print View

```tsx
export default function PrintableHealthCard({ parcel, analysis }) {
  return (
    <div className="print:shadow-none">
      <ParcelHealthCard parcel={parcel} analysis={analysis} />
      
      <style jsx global>{`
        @media print {
          .no-print { display: none; }
          .print\\:shadow-none { box-shadow: none; }
        }
      `}</style>
    </div>
  )
}
```

## Testing Examples

### Test Data 1: Optimal Parcel

```typescript
const optimalParcel = {
  id: 'test-1',
  name: 'Horní pole',
  area: 25.5,
  soil_type: 'S',
  culture: 'orna',
}

const optimalAnalysis = {
  id: 'analysis-1',
  parcel_id: 'test-1',
  date: '2024-06-15',
  ph: 6.5,
  ph_category: 'N',
  phosphorus: 150,
  phosphorus_category: 'D',
  potassium: 180,
  potassium_category: 'D',
  magnesium: 90,
  magnesium_category: 'D',
  lab_name: 'Agrolab CZ',
}

// K:Mg = 180/90 = 2.0 (optimal)
// No warnings
```

### Test Data 2: Problem Parcel

```typescript
const problemAnalysis = {
  date: '2019-05-15',  // Old
  ph: 5.2,             // Low
  ph_category: 'SK',
  phosphorus: 320,     // High
  phosphorus_category: 'VV',
  potassium: 120,
  potassium_category: 'N',
  magnesium: 100,
  magnesium_category: 'D',
}

// K:Mg = 120/100 = 1.2 (warning)
// 4 warnings expected
```

## Common Mistakes to Avoid

### ❌ Wrong: Missing parcel prop

```tsx
// DON'T DO THIS
<ParcelHealthCard analysis={analysis} />
```

### ✅ Correct: Always pass parcel

```tsx
<ParcelHealthCard parcel={parcel} analysis={analysis} />
```

### ❌ Wrong: Using compact in detail view

```tsx
// DON'T DO THIS (too small for detail page)
<ParcelHealthCard parcel={parcel} analysis={analysis} compact={true} />
```

### ✅ Correct: Full mode for detail, compact for lists

```tsx
// Detail page
<ParcelHealthCard parcel={parcel} analysis={analysis} />

// List view
<ParcelHealthCard parcel={parcel} analysis={analysis} compact={true} />
```

### ❌ Wrong: Not handling null analysis

```tsx
// DON'T DO THIS (will crash if analysis is null)
<div>pH: {analysis.ph}</div>
```

### ✅ Correct: Component handles null internally

```tsx
// Component will show empty state
<ParcelHealthCard parcel={parcel} analysis={null} />
```

---

**Last Updated**: December 19, 2025  
**Examples Count**: 10 basic + 5 patterns  
**Status**: Production Ready ✅
