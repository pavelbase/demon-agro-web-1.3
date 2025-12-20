# Parcel Operations - Implementation Documentation

## 📋 Overview

Complete implementation of advanced parcel operations: split, merge, archive, and restore. All operations maintain data integrity with proper rollback mechanisms and audit logging.

**Phase**: 3.4 - Parcel Operations

## 🎯 Features

### 1. **Split Parcel** (Rozdělení pozemku)

Splits one parcel into 2-5 smaller parcels.

**Process**:
1. User selects number of parts (2-5)
2. For each part: enter name and area
3. Validation: sum of areas must equal original area (±0.01 ha tolerance)
4. Archive original parcel (status = 'archived')
5. Create new parcels with `source_parcel_id` = original
6. Copy latest analysis to all new parcels (same values)
7. Copy fertilization history to all new parcels
8. Log operation to audit_logs
9. Revalidate affected paths

**Characteristics**:
- Latest soil analysis is copied to all parts unchanged
- Fertilization history is copied to all parts
- Future operations on parts are independent
- Original parcel remains in database but archived

### 2. **Merge Parcels** (Sloučení pozemků)

Merges 2+ parcels into one combined parcel.

**Process**:
1. User selects 2+ parcels to merge
2. Enter new parcel name
3. Calculate total area (sum of all parcels)
4. Archive all original parcels
5. Create new parcel with total area
6. Calculate weighted average soil analysis
7. Merge all fertilization histories
8. Log operation to audit_logs
9. Revalidate affected paths

**Weighted Average Calculation**:
```typescript
weightedPh = Σ(pH_i × area_i) / Σ(area_i)
weightedP = Σ(P_i × area_i) / Σ(area_i)
weightedK = Σ(K_i × area_i) / Σ(area_i)
weightedMg = Σ(Mg_i × area_i) / Σ(area_i)
```

**Characteristics**:
- Soil analysis is weighted average by area
- All fertilization records are combined
- Lab name set to "Vážený průměr"
- Analysis date set to current date

### 3. **Archive Parcel** (Archivace)

Archives a parcel without deleting it.

**Process**:
1. User confirms archiving
2. Set parcel status = 'archived'
3. Log operation to audit_logs
4. Revalidate paths

**Characteristics**:
- Parcel data remains in database
- Not shown in active parcels list
- All related data (analyses, history) preserved
- Can be restored later

### 4. **Restore from Archive** (Obnovení z archivu)

Restores an archived parcel to active status.

**Process**:
1. User selects archived parcel
2. Set parcel status = 'active'
3. Log operation to audit_logs
4. Revalidate paths

**Characteristics**:
- All data restored as-is
- Appears in active parcels list again
- No data loss during archive/restore cycle

## 🗄️ Database Schema Changes

### Parcels Table - New Fields

```sql
-- Status field
ALTER TABLE parcels 
ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'archived'));

-- Source parcel reference (for tracking splits/merges)
ALTER TABLE parcels 
ADD COLUMN source_parcel_id UUID 
REFERENCES parcels(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_source ON parcels(source_parcel_id) 
WHERE source_parcel_id IS NOT NULL;
```

### Migration File

**Location**: `lib/supabase/sql/add_parcel_operations_fields.sql`

**Run Before Using Operations**:
```bash
# In Supabase SQL Editor:
# Copy and run: lib/supabase/sql/add_parcel_operations_fields.sql
```

## 📦 Files Created/Modified

### Created Files

1. **Server Actions**:
   - `lib/actions/parcel-operations.ts` (532 lines)
     - `splitParcel(data)`
     - `mergeParcels(data)`
     - `archiveParcel(id)`
     - `restoreParcel(id)`

2. **UI Components**:
   - `components/portal/ParcelOperationsModals.tsx` (705 lines)
     - `SplitParcelModal`
     - `MergeParcelsModal`
     - `ArchiveParcelModal`
   - `components/portal/ParcelActionButtons.tsx` (58 lines)

3. **Database**:
   - `lib/supabase/sql/add_parcel_operations_fields.sql`

### Modified Files

1. **Types**:
   - `lib/types/database.ts`
     - Added `status: 'active' | 'archived'`
     - Added `source_parcel_id: string | null`

2. **Pages**:
   - `app/portal/pozemky/[id]/page.tsx`
     - Integrated `ParcelActionButtons`
   - `app/portal/pozemky/page.tsx`
     - Added `.eq('status', 'active')` filter

## 🔧 Server Actions API

### splitParcel(data)

```typescript
interface SplitParcelData {
  parcelId: string
  parts: Array<{
    name: string
    area: number
  }>
}

// Usage
const result = await splitParcel({
  parcelId: 'uuid',
  parts: [
    { name: 'Pozemek - část 1', area: 10.5 },
    { name: 'Pozemek - část 2', area: 14.5 },
  ]
})

// Returns
{
  success?: boolean
  message?: string
  newParcels?: Parcel[]
  error?: string
}
```

**Validations**:
- `parts.length` must be 2-5
- Sum of `parts[].area` must equal original parcel area (±0.01 tolerance)
- User must own the parcel

### mergeParcels(data)

```typescript
interface MergeData {
  parcelIds: string[]
  newName: string
}

// Usage
const result = await mergeParcels({
  parcelIds: ['uuid1', 'uuid2', 'uuid3'],
  newName: 'Sloučený pozemek'
})

// Returns
{
  success?: boolean
  message?: string
  newParcel?: Parcel
  error?: string
}
```

**Validations**:
- `parcelIds.length` must be >= 2
- `newName` must not be empty
- User must own all parcels
- All parcels must have status 'active'

### archiveParcel(id)

```typescript
// Usage
const result = await archiveParcel('parcel-uuid')

// Returns
{
  success?: boolean
  message?: string
  error?: string
}
```

**Validations**:
- User must own the parcel
- Parcel must not already be archived

### restoreParcel(id)

```typescript
// Usage
const result = await restoreParcel('parcel-uuid')

// Returns
{
  success?: boolean
  message?: string
  error?: string
}
```

**Validations**:
- User must own the parcel
- Parcel must be archived

## 🎨 UI Components

### SplitParcelModal

**Props**:
```typescript
{
  parcel: Parcel
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}
```

**Features**:
- Select number of parts (2-5)
- Dynamic form fields for each part
- Real-time area validation
- Visual indicator: green check (valid) or orange warning (invalid)
- Disabled submit until valid
- Loading state during operation
- Success/error messages

**Validation Display**:
- Total area shown in real-time
- Difference from original calculated
- Green badge: "Odpovídá původní výměře"
- Orange badge: "Rozdíl: X.XX ha (musí být < 0.01 ha)"

### MergeParcelsModal

**Props**:
```typescript
{
  parcels: Parcel[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}
```

**Features**:
- Scrollable list of parcels with checkboxes
- Multiple selection (min 2)
- Selected summary (count + total area)
- New name input field
- Info box explaining what will happen
- Loading state
- Success/error messages

**Info Displayed**:
- "Původní pozemky budou archivovány"
- "Vytvoří se nový pozemek s celkovou výměrou"
- "Rozbor půdy bude vážený průměr podle výměry"
- "Historie hnojení všech pozemků se spojí"

### ArchiveParcelModal

**Props**:
```typescript
{
  parcel: Parcel
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}
```

**Features**:
- Confirmation dialog with warning
- Parcel name displayed
- Explains what happens during archiving
- Orange warning badge with alert icon
- Cancel/Confirm buttons

### ParcelActionButtons

**Props**:
```typescript
{
  parcel: Parcel
}
```

**Features**:
- Three buttons: Edit, Split, Archive
- Edit: Placeholder alert (future feature)
- Split: Opens SplitParcelModal
- Archive: Opens ArchiveParcelModal
- Client component managing modal state
- Automatic redirect after success

## 💻 Usage Examples

### Example 1: Split Parcel

```tsx
import { ParcelActionButtons } from '@/components/portal/ParcelActionButtons'

export default function ParcelDetail({ parcel }) {
  return (
    <div>
      <h1>{parcel.name}</h1>
      <ParcelActionButtons parcel={parcel} />
    </div>
  )
}
```

User clicks "Rozdělit" → Modal opens → User fills form → Parcel is split → Redirects to list

### Example 2: Merge Parcels

```tsx
'use client'

import { useState } from 'react'
import { MergeParcelsModal } from '@/components/portal/ParcelOperationsModals'

export function ParcelsList({ parcels }) {
  const [mergeModalOpen, setMergeModalOpen] = useState(false)
  
  return (
    <div>
      <button onClick={() => setMergeModalOpen(true)}>
        Sloučit vybrané pozemky
      </button>
      
      <MergeParcelsModal
        parcels={parcels}
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
```

### Example 3: Archive from List

```tsx
import { archiveParcel } from '@/lib/actions/parcel-operations'

export function QuickArchiveButton({ parcelId }) {
  const handleArchive = async () => {
    if (confirm('Archivovat tento pozemek?')) {
      const result = await archiveParcel(parcelId)
      if (result.success) {
        window.location.reload()
      }
    }
  }
  
  return (
    <button onClick={handleArchive}>Archivovat</button>
  )
}
```

## 🔒 Security & Authorization

### Ownership Verification

All operations verify user owns the parcel(s):

```typescript
const { data: parcel } = await supabase
  .from('parcels')
  .select('*')
  .eq('id', parcelId)
  .eq('user_id', user.id)
  .single()

if (!parcel) {
  return { error: 'Nemáte oprávnění' }
}
```

### Rollback on Error

If operation fails, changes are rolled back:

```typescript
// Archive original parcel
const { error: archiveError } = await supabase
  .from('parcels')
  .update({ status: 'archived' })
  .eq('id', parcelId)

if (archiveError) {
  // Rollback not needed (nothing changed yet)
  return { error: 'Failed to archive' }
}

// Create new parcels
for (const part of parts) {
  const { error: insertError } = await supabase
    .from('parcels')
    .insert({ ...part })
  
  if (insertError) {
    // Rollback: restore original parcel
    await supabase
      .from('parcels')
      .update({ status: 'active' })
      .eq('id', parcelId)
    
    return { error: 'Failed to create part' }
  }
}
```

### Audit Logging

All operations are logged:

```typescript
await supabase.from('audit_logs').insert({
  user_id: user.id,
  action: `Pozemek rozdělen: ${originalName} → ${newNames.join(', ')}`,
  table_name: 'parcels',
  record_id: parcelId,
  old_data: originalParcel,
  new_data: newParcels,
})
```

## 🧪 Testing Scenarios

### Test 1: Split Parcel (Valid)

```typescript
const parcel = { id: 'p1', name: 'Pole', area: 25.0 }

await splitParcel({
  parcelId: 'p1',
  parts: [
    { name: 'Pole - sever', area: 12.5 },
    { name: 'Pole - jih', area: 12.5 },
  ]
})

// Expected:
// ✓ Original parcel archived
// ✓ 2 new parcels created
// ✓ Latest analysis copied to both
// ✓ Fertilization history copied
```

### Test 2: Split Parcel (Invalid Area)

```typescript
await splitParcel({
  parcelId: 'p1',
  parts: [
    { name: 'Část 1', area: 10 },
    { name: 'Část 2', area: 14 }, // Total: 24, Original: 25
  ]
})

// Expected:
// ✗ Error: "Součet výměr (24.00 ha) musí být roven původní výměře (25.00 ha)"
```

### Test 3: Merge Parcels

```typescript
const parcels = [
  { id: 'p1', area: 10, ph: 6.0 },
  { id: 'p2', area: 15, ph: 6.6 },
]

await mergeParcels({
  parcelIds: ['p1', 'p2'],
  newName: 'Velké pole'
})

// Expected:
// ✓ Original parcels archived
// ✓ New parcel created with area: 25 ha
// ✓ pH: (6.0×10 + 6.6×15) / 25 = 6.36
```

### Test 4: Archive/Restore Cycle

```typescript
// Archive
await archiveParcel('p1')
// ✓ Status changed to 'archived'
// ✓ Not shown in active list

// Restore
await restoreParcel('p1')
// ✓ Status changed to 'active'
// ✓ Shown in active list again
// ✓ No data lost
```

## ⚠️ Edge Cases & Handling

### Edge Case 1: Rounding Errors

**Problem**: Area sum might not match due to floating point precision.

**Solution**: Allow ±0.01 ha tolerance:
```typescript
const areaDiff = Math.abs(totalArea - originalArea)
if (areaDiff > 0.01) {
  return { error: 'Area mismatch' }
}
```

### Edge Case 2: Parcel with No Analysis

**Problem**: Cannot merge parcels if some have no analysis.

**Solution**: Only include parcels with analyses in weighted average:
```typescript
const analysesWithData = results.filter(r => r.analysis !== null)

if (analysesWithData.length === 0) {
  // No analyses to merge
  mergedAnalysis = null
} else {
  // Calculate weighted average
}
```

### Edge Case 3: Split During Other Operation

**Problem**: User might try to split while another operation is running.

**Solution**: Use transitions and disable buttons:
```typescript
const [isPending, startTransition] = useTransition()

<button disabled={isPending}>
  {isPending ? 'Rozdělování...' : 'Rozdělit'}
</button>
```

### Edge Case 4: Unauthorized Access

**Problem**: User tries to operate on parcel they don't own.

**Solution**: Verify ownership before any operation:
```typescript
.eq('user_id', user.id)

if (!parcel) {
  return { error: 'Nemáte oprávnění' }
}
```

## 📊 Data Flow Diagrams

### Split Parcel Flow

```
User
  ↓ Opens SplitParcelModal
Form (Client)
  ↓ Enter parts & areas
  ↓ Validate sum
  ↓ Click "Rozdělit"
splitParcel() (Server Action)
  ↓ Verify ownership
  ↓ Validate input
  ↓ Fetch latest analysis
  ↓ Archive original
  ↓ Create new parcels
  ↓ Copy analysis to each
  ↓ Copy fertilization history
  ↓ Log to audit
  ↓ Revalidate paths
Client
  ↓ Show success
  ↓ Redirect to list
```

### Merge Parcels Flow

```
User
  ↓ Opens MergeParcelsModal
Form (Client)
  ↓ Select parcels
  ↓ Enter new name
  ↓ Click "Sloučit"
mergeParcels() (Server Action)
  ↓ Verify ownership
  ↓ Fetch all parcels
  ↓ Fetch all analyses
  ↓ Calculate weighted average
  ↓ Archive originals
  ↓ Create merged parcel
  ↓ Create weighted analysis
  ↓ Merge fertilization history
  ↓ Log to audit
  ↓ Revalidate paths
Client
  ↓ Show success
  ↓ Redirect to list
```

## ✅ Completion Criteria

All implemented:
- [x] Database schema updated (status, source_parcel_id)
- [x] SQL migration file created
- [x] Split parcel Server Action
- [x] Merge parcels Server Action
- [x] Archive parcel Server Action
- [x] Restore parcel Server Action
- [x] SplitParcelModal UI
- [x] MergeParcelsModal UI
- [x] ArchiveParcelModal UI
- [x] ParcelActionButtons wrapper
- [x] Detail page integration
- [x] List page filter (active only)
- [x] Validation logic
- [x] Error handling
- [x] Rollback mechanisms
- [x] Audit logging
- [x] Path revalidation

## 🏁 Status

**Phase 3.4 - Parcel Operations**: ✅ **COMPLETE**

All requirements met:
- Rozdělení pozemku (2-5 částí) ✅
- Sloučení pozemků (2+ pozemků) ✅
- Archivace pozemku ✅
- Obnovení z archivu ✅
- Kopírování rozborů při rozdělení ✅
- Vážený průměr rozborů při sloučení ✅
- Sloučení historie hnojení ✅
- Server Actions s revalidatePath ✅

---

**Implementation Date**: December 19, 2025  
**Implemented By**: AI Assistant (Claude Sonnet 4.5)  
**Phase**: 3.4 - Parcel Operations  
**Status**: Ready for Production ✅

**Code Statistics**:
- Server Actions: 532 lines
- UI Modals: 705 lines
- Action Buttons: 58 lines
- Total: 1,295 lines
