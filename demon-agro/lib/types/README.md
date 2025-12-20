# Database Types - Usage Guide

Kompletní TypeScript typy pro Supabase databázi.

## 📦 Exportované typy

### Enum typy
```typescript
import type {
  UserRole,        // 'admin' | 'user'
  SoilType,        // 'L' | 'S' | 'T'
  Culture,         // 'orna' | 'ttp'
  NutrientCategory,// 'N' | 'VH' | 'D' | 'V' | 'VV'
  PhCategory,      // 'EK' | 'SK' | 'N' | 'SZ' | 'EZ'
  RequestStatus,   // 'new' | 'in_progress' | 'quoted' | 'completed' | 'cancelled'
  LimeType,        // 'calcitic' | 'dolomite' | 'either'
} from '@/lib/types/database'
```

### Table typy (Row)
```typescript
import type {
  Profile,              // User profiles
  Parcel,               // Pozemky
  SoilAnalysis,         // Rozbory půdy
  FertilizationHistory, // Historie hnojení
  CropRotation,         // Osevní postup
  FertilizationPlan,    // Plány hnojení
  Product,              // Produkty
  LimingRequest,        // Poptávky vápnění
  LimingRequestItem,    // Položky poptávek
  PortalImage,          // Obrázky portálu
  AuditLog,             // Audit záznamy
} from '@/lib/types/database'
```

### Insert typy (pro vytváření záznamů)
```typescript
import type {
  ProfileInsert,
  ParcelInsert,
  SoilAnalysisInsert,
  ProductInsert,
  // ... atd
} from '@/lib/types/database'
```

### Update typy (pro aktualizaci záznamů)
```typescript
import type {
  ProfileUpdate,
  ParcelUpdate,
  SoilAnalysisUpdate,
  ProductUpdate,
  // ... atd
} from '@/lib/types/database'
```

## 🎯 Použití

### 1. Typování Supabase klienta

```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

const supabase = createClient<Database>()

// Nyní máte plnou type-safety
const { data } = await supabase
  .from('parcels')
  .select('*')
// data je typu Parcel[]
```

### 2. Server Components

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Parcel, SoilAnalysis } from '@/lib/types/database'

export default async function PozemkyPage() {
  const supabase = await createClient()
  
  const { data: parcels } = await supabase
    .from('parcels')
    .select('*')
  
  // parcels je typu Parcel[] | null
  
  return (
    <div>
      {parcels?.map((parcel: Parcel) => (
        <div key={parcel.id}>{parcel.name}</div>
      ))}
    </div>
  )
}
```

### 3. Server Actions

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import type { ParcelInsert } from '@/lib/types/database'

export async function createParcel(data: ParcelInsert) {
  const supabase = await createClient()
  
  const { data: parcel, error } = await supabase
    .from('parcels')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return parcel
}
```

### 4. Form validace

```typescript
import { z } from 'zod'
import type { SoilType, Culture } from '@/lib/types/database'

// Vytvoř Zod schema s enum typy
const parcelSchema = z.object({
  name: z.string().min(1),
  area: z.number().positive(),
  soil_type: z.enum(['L', 'S', 'T'] as const),
  culture: z.enum(['orna', 'ttp'] as const),
})

// Type inference
type ParcelFormData = z.infer<typeof parcelSchema>
```

### 5. Pomocné utility typy

```typescript
import type {
  ParcelWithAnalysis,
  LimingRequestWithItems,
  FertilizationPlanWithDetails,
} from '@/lib/types/database'

// Načtení pozemku s nejnovějším rozborem
const { data: parcel } = await supabase
  .from('parcels')
  .select(`
    *,
    latest_analysis:soil_analyses(*)
  `)
  .eq('id', parcelId)
  .single()

// parcel je typu ParcelWithAnalysis
```

## 📋 Příklady pro běžné operace

### Vytvoření pozemku

```typescript
import type { ParcelInsert } from '@/lib/types/database'

const newParcel: ParcelInsert = {
  user_id: user.id,
  name: 'Pozemek 1',
  area: 10.5,
  soil_type: 'S',
  culture: 'orna',
  cadastral_number: '123/45',
}

const { data, error } = await supabase
  .from('parcels')
  .insert(newParcel)
  .select()
  .single()
```

### Aktualizace rozboru půdy

```typescript
import type { SoilAnalysisUpdate } from '@/lib/types/database'

const updates: SoilAnalysisUpdate = {
  ph: 6.5,
  ph_category: 'N',
  phosphorus: 150,
  phosphorus_category: 'D',
}

await supabase
  .from('soil_analyses')
  .update(updates)
  .eq('id', analysisId)
```

### Vytvoření poptávky s položkami

```typescript
import type { LimingRequestInsert, LimingRequestItemInsert } from '@/lib/types/database'

// 1. Vytvořit poptávku
const request: LimingRequestInsert = {
  user_id: user.id,
  total_area: 25.5,
  delivery_address: 'Ulice 123, Praha',
  contact_phone: '+420 123 456 789',
}

const { data: newRequest } = await supabase
  .from('liming_requests')
  .insert(request)
  .select()
  .single()

// 2. Přidat položky
const items: LimingRequestItemInsert[] = [
  {
    request_id: newRequest.id,
    parcel_id: 'parcel-uuid',
    product_name: 'Vápenec dolomitický',
    quantity: 2.5,
    unit: 't',
  }
]

await supabase
  .from('liming_request_items')
  .insert(items)
```

### Načtení poptávky s relacemi

```typescript
const { data: request } = await supabase
  .from('liming_requests')
  .select(`
    *,
    items:liming_request_items(
      *,
      parcel:parcels(*),
      product:products(*)
    ),
    user:profiles(*)
  `)
  .eq('id', requestId)
  .single()

// request je typu LimingRequestWithItems
```

## 🔍 Type Guards

Vytvořte type guards pro runtime kontroly:

```typescript
import type { SoilType, Culture } from '@/lib/types/database'

export function isSoilType(value: string): value is SoilType {
  return ['L', 'S', 'T'].includes(value)
}

export function isCulture(value: string): value is Culture {
  return ['orna', 'ttp'].includes(value)
}

// Použití
const soilType = formData.get('soil_type') as string
if (isSoilType(soilType)) {
  // soilType je nyní typu SoilType
}
```

## 📊 Enum hodnoty a jejich význam

### SoilType (Typ půdy)
- `L` - Lehká půda (písčitá)
- `S` - Střední půda (hlinitá)
- `T` - Těžká půda (jílovitá)

### Culture (Kultura)
- `orna` - Orná půda
- `ttp` - Travní trvalý porost

### NutrientCategory (Kategorie živiny)
- `N` - Nízký obsah
- `VH` - Velmi Hluboký pod optimem
- `D` - Dobrý obsah
- `V` - Vysoký obsah
- `VV` - Velmi Vysoký obsah

### PhCategory (Kategorie pH)
- `EK` - Extrémně Kyselý (< 5.0)
- `SK` - Silně Kyselý (5.0 - 5.5)
- `N` - Neutrální (6.0 - 7.0)
- `SZ` - Slabě Zásaditý (7.0 - 7.5)
- `EZ` - Extrémně Zásaditý (> 8.0)

### RequestStatus (Stav poptávky)
- `new` - Nová poptávka
- `in_progress` - Zpracovává se
- `quoted` - Nabídka odeslána
- `completed` - Dokončeno
- `cancelled` - Zrušeno

### LimeType (Typ vápna)
- `calcitic` - Vápenatý vápenec (CaCO₃)
- `dolomite` - Dolomitický vápenec (CaMg(CO₃)₂)
- `either` - Libovolný

## 🎨 Konstanty pro UI

```typescript
// lib/constants/database.ts
import type { SoilType, Culture, NutrientCategory } from '@/lib/types/database'

export const SOIL_TYPE_LABELS: Record<SoilType, string> = {
  L: 'Lehká',
  S: 'Střední',
  T: 'Těžká',
}

export const CULTURE_LABELS: Record<Culture, string> = {
  orna: 'Orná půda',
  ttp: 'Travní trvalý porost',
}

export const NUTRIENT_CATEGORY_LABELS: Record<NutrientCategory, string> = {
  N: 'Nízký',
  VH: 'Velmi Hluboký',
  D: 'Dobrý',
  V: 'Vysoký',
  VV: 'Velmi Vysoký',
}

// Použití v komponentě
<select>
  {Object.entries(SOIL_TYPE_LABELS).map(([value, label]) => (
    <option key={value} value={value}>{label}</option>
  ))}
</select>
```

## 🔄 Migrace

Po změnách v databázi vygenerujte nové typy:

```bash
# Použij Supabase CLI
npx supabase gen types typescript --project-id ppsldvsodvcbxecxjssf > lib/types/database.ts

# Nebo použij již připravené typy z tohoto souboru
```

## 🛠️ Tips & Tricks

### Partial Updates
```typescript
// Pro částečné aktualizace použij Update typ
const updates: Partial<SoilAnalysisUpdate> = {
  ph: 6.5,
  // ostatní pole jsou optional
}
```

### Non-null Assertions
```typescript
// Pokud víš že data nejsou null
const parcel = data! // data is Parcel (not Parcel | null)

// Lepší: Type guard
if (data) {
  // data je Parcel
}
```

### Generic Helper
```typescript
type NonNullable<T> = T extends null | undefined ? never : T
type RequiredParcel = Required<NonNullable<Parcel>>
```

---

**Tip**: Pro maximální type-safety vždy typuj Supabase klient s `Database` typem a používej `select()` s explicitním výběrem sloupců.
