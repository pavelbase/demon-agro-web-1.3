# Database Types - Implementation Summary ✅

Kompletní TypeScript typy pro Supabase databázi byly úspěšně vytvořeny.

## 📦 Vytvořené soubory

### 1. Core Types
- ✅ **`lib/types/database.ts`** - Hlavní databázové typy
  - 11 tabulek (profiles, parcels, soil_analyses, atd.)
  - 7 enum typů
  - Row, Insert, Update typy pro každou tabulku
  - Helper utility typy

### 2. Constants
- ✅ **`lib/constants/database.ts`** - Konstanty a labels
  - Labels pro všechny enum hodnoty
  - Barvy pro UI komponenty
  - Helper funkce pro formátování
  - Select options generátory

### 3. Validation Schemas
- ✅ **`lib/utils/validations.ts`** - Zod validační schémata
  - Auth schemas (login, register, reset)
  - Parcel schemas
  - Soil analysis schemas
  - Fertilization schemas
  - Product schemas
  - Liming request schemas

### 4. Documentation
- ✅ **`lib/types/README.md`** - Kompletní usage guide

## 📊 Database Schema

### Enum Types

```typescript
// User role
type UserRole = 'admin' | 'user'

// Soil classification
type SoilType = 'L' | 'S' | 'T'  // Lehká, Střední, Těžká
type Culture = 'orna' | 'ttp'    // Orná půda, Travní porost

// Nutrient classification
type NutrientCategory = 'N' | 'VH' | 'D' | 'V' | 'VV'
type PhCategory = 'EK' | 'SK' | 'N' | 'SZ' | 'EZ'

// Request management
type RequestStatus = 'new' | 'in_progress' | 'quoted' | 'completed' | 'cancelled'
type LimeType = 'calcitic' | 'dolomite' | 'either'
```

### Tables (11 celkem)

1. **profiles** - Uživatelské profily
2. **parcels** - Pozemky
3. **soil_analyses** - Rozbory půdy
4. **fertilization_history** - Historie hnojení
5. **crop_rotation** - Osevní postup
6. **fertilization_plans** - Plány hnojení
7. **products** - Produkty (hnojiva + vápno)
8. **liming_requests** - Poptávky vápnění
9. **liming_request_items** - Položky poptávek
10. **portal_images** - Obrázky portálu
11. **audit_logs** - Audit záznamy

## 🎯 Použití

### Typování Supabase klienta

```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

const supabase = createClient<Database>()
```

### Import typů

```typescript
// Table types
import type {
  Profile,
  Parcel,
  SoilAnalysis,
  Product,
  LimingRequest,
} from '@/lib/types/database'

// Enum types
import type {
  SoilType,
  Culture,
  NutrientCategory,
  RequestStatus,
} from '@/lib/types/database'

// Insert/Update types
import type {
  ParcelInsert,
  ParcelUpdate,
  SoilAnalysisInsert,
} from '@/lib/types/database'
```

### Použití v komponentách

```typescript
// Server Component
import type { Parcel } from '@/lib/types/database'

export default async function PozemkyPage() {
  const { data: parcels } = await supabase
    .from('parcels')
    .select('*')
  
  return (
    <div>
      {parcels?.map((parcel: Parcel) => (
        <div key={parcel.id}>{parcel.name}</div>
      ))}
    </div>
  )
}
```

### Validace formulářů

```typescript
import { parcelSchema } from '@/lib/utils/validations'
import type { ParcelFormData } from '@/lib/utils/validations'

// React Hook Form
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<ParcelFormData>({
  resolver: zodResolver(parcelSchema),
})
```

### Konstanty pro UI

```typescript
import {
  SOIL_TYPE_LABELS,
  CULTURE_LABELS,
  NUTRIENT_CATEGORY_COLORS,
  getSelectOptions,
} from '@/lib/constants/database'

// Select dropdown
<select>
  {Object.entries(SOIL_TYPE_LABELS).map(([value, label]) => (
    <option key={value} value={value}>{label}</option>
  ))}
</select>

// Colored badge
<span className={NUTRIENT_CATEGORY_COLORS[category]}>
  {NUTRIENT_CATEGORY_LABELS[category]}
</span>
```

## 📋 Příklady CRUD operací

### Create (Insert)

```typescript
import type { ParcelInsert } from '@/lib/types/database'

const newParcel: ParcelInsert = {
  user_id: user.id,
  name: 'Pozemek 1',
  area: 10.5,
  soil_type: 'S',
  culture: 'orna',
}

const { data, error } = await supabase
  .from('parcels')
  .insert(newParcel)
  .select()
  .single()
```

### Read (Select)

```typescript
import type { Parcel } from '@/lib/types/database'

const { data: parcels } = await supabase
  .from('parcels')
  .select('*')
  .eq('user_id', userId)

// parcels je typu Parcel[] | null
```

### Update

```typescript
import type { ParcelUpdate } from '@/lib/types/database'

const updates: ParcelUpdate = {
  name: 'Nový název',
  area: 15.0,
}

await supabase
  .from('parcels')
  .update(updates)
  .eq('id', parcelId)
```

### Delete

```typescript
await supabase
  .from('parcels')
  .delete()
  .eq('id', parcelId)
```

## 🔍 Pokročilé queries

### Join s relacemi

```typescript
const { data } = await supabase
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
```

### Filtrování

```typescript
const { data } = await supabase
  .from('soil_analyses')
  .select('*')
  .eq('parcel_id', parcelId)
  .gte('ph', 6.0)
  .lte('ph', 7.0)
  .order('date', { ascending: false })
  .limit(10)
```

## 🎨 UI Konstanty

### Soil Type (Typ půdy)

| Hodnota | Label | Popis |
|---------|-------|-------|
| `L` | Lehká | Lehká půda (písčitá) |
| `S` | Střední | Střední půda (hlinitá) |
| `T` | Těžká | Těžká půda (jílovitá) |

### Culture (Kultura)

| Hodnota | Label | Popis |
|---------|-------|-------|
| `orna` | Orná půda | Půda určená pro pěstování plodin |
| `ttp` | Travní trvalý porost | Trvalé travní porosty |

### Nutrient Category (Kategorie živiny)

| Hodnota | Label | Barva | Doporučení |
|---------|-------|-------|------------|
| `N` | Nízký | Červená | Nutné hnojení |
| `VH` | Velmi hluboký | Oranžová | Výrazné hnojení |
| `D` | Dobrý | Zelená | Udržovací hnojení |
| `V` | Vysoký | Modrá | Minimální hnojení |
| `VV` | Velmi vysoký | Fialová | Hnojení není nutné |

### pH Category (Kategorie pH)

| Hodnota | Label | Rozsah | Doporučení |
|---------|-------|--------|------------|
| `EK` | Extrémně kyselý | < 5.0 | Nutné vápnění |
| `SK` | Silně kyselý | 5.0 - 5.5 | Doporučeno vápnění |
| `N` | Neutrální | 6.0 - 7.0 | Optimální |
| `SZ` | Slabě zásaditý | 7.0 - 7.5 | Mírně alkalická |
| `EZ` | Extrémně zásaditý | > 8.0 | Vysoká alkalita |

### Request Status (Stav poptávky)

| Hodnota | Label | Badge Color |
|---------|-------|-------------|
| `new` | Nová | Modrá |
| `in_progress` | Zpracovává se | Žlutá |
| `quoted` | Nabídka odeslána | Fialová |
| `completed` | Dokončeno | Zelená |
| `cancelled` | Zrušeno | Šedá |

## 🔧 Helper Types

### Utility Types

```typescript
// Extract table type
type Parcel = Tables<'parcels'>

// Extract enum type
type SoilType = Enums<'soil_type'>

// Parcel with latest analysis
type ParcelWithAnalysis = Parcel & {
  latest_analysis?: SoilAnalysis | null
}

// Liming request with all items
type LimingRequestWithItems = LimingRequest & {
  items: LimingRequestItem[]
  user?: Profile
}
```

### Form Types

```typescript
// Form data types from Zod schemas
type ParcelFormData = z.infer<typeof parcelSchema>
type SoilAnalysisFormData = z.infer<typeof soilAnalysisSchema>
type LimingRequestFormData = z.infer<typeof limingRequestSchema>
```

## 🚀 Integrace s React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { parcelSchema, type ParcelFormData } from '@/lib/utils/validations'

function ParcelForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
  })

  const onSubmit = async (data: ParcelFormData) => {
    // data je plně typované
    const { error } = await supabase
      .from('parcels')
      .insert({
        ...data,
        user_id: userId,
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  )
}
```

## 📝 Type Safety Tips

### 1. Vždy typuj Supabase klient

```typescript
// ✅ Dobře
const supabase = createClient<Database>()

// ❌ Špatně
const supabase = createClient()
```

### 2. Používej Select s explicitními sloupci

```typescript
// ✅ Dobře - víš přesně co dostaneš
const { data } = await supabase
  .from('parcels')
  .select('id, name, area')

// ⚠️ OK ale méně bezpečné
const { data } = await supabase
  .from('parcels')
  .select('*')
```

### 3. Type guards pro runtime validaci

```typescript
function isSoilType(value: string): value is SoilType {
  return ['L', 'S', 'T'].includes(value)
}

const soilType = formData.get('soil_type') as string
if (isSoilType(soilType)) {
  // soilType je nyní typu SoilType
}
```

## 🔄 Generování typů z Supabase

Pro aktualizaci typů po změnách v databázi:

```bash
# Použij Supabase CLI
npx supabase gen types typescript \
  --project-id ppsldvsodvcbxecxjssf \
  > lib/types/database.ts

# Pak aktualizuj helper typy na konci souboru
```

## 📚 Dokumentace

- 📖 **lib/types/README.md** - Detailní usage guide
- 📖 **lib/constants/database.ts** - Všechny konstanty a labels
- 📖 **lib/utils/validations.ts** - Zod schemas

## ✅ Status

| Komponenta | Status |
|------------|--------|
| Database Types | ✅ Kompletní (11 tabulek) |
| Enum Types | ✅ Kompletní (7 enums) |
| Insert/Update Types | ✅ Auto-generované |
| Helper Types | ✅ Připraveno |
| Constants & Labels | ✅ Kompletní |
| Validation Schemas | ✅ Kompletní |
| Documentation | ✅ Připraveno |

## 🎯 Další kroky

1. ⏳ Vytvořit SQL schéma v Supabase
2. ⏳ Spustit migrace
3. ⏳ Vygenerovat typy z Supabase CLI (optional)
4. ⏳ Implementovat CRUD operace
5. ⏳ Vytvořit UI komponenty s typy

---

**Implementováno**: 19.12.2025  
**TypeScript Version**: 5.0+  
**Zod Version**: 3.x  
**Status**: ✅ Plně připraveno k použití
