# Supabase Client Usage Guide

Tento projekt používá Supabase pro autentizaci a databázi. Zde jsou příklady použití různých klientů.

## 1. Browser Client (Client Components)

Pro použití v Client Components (komponenty s `'use client'`):

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function MyClientComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Fetch data
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
    
    if (error) console.error(error)
    return data
  }

  return <div>{user?.email}</div>
}
```

## 2. Server Client (Server Components)

Pro použití v Server Components a Server Actions:

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch data
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
  
  return <div>{user?.email}</div>
}
```

## 3. Auth Helpers

Pro běžné auth operace použijte helper funkce:

```tsx
import { requireAuth, getCurrentUser, isAdmin } from '@/lib/supabase/auth-helpers'

// V protected page
export default async function ProtectedPage() {
  const user = await requireAuth() // Redirectne na login pokud není přihlášen
  
  return <div>Chráněná stránka pro {user.email}</div>
}

// Kontrola admin role
export default async function AdminPage() {
  const user = await requireAuth()
  const isUserAdmin = await isAdmin()
  
  if (!isUserAdmin) {
    redirect('/portal/dashboard')
  }
  
  return <div>Admin stránka</div>
}
```

## 4. Admin Client (Service Role)

⚠️ **POZOR**: Používejte POUZE v Server Components, Server Actions nebo API routes. NIKDY v Client Components!

```tsx
import { createAdminClient } from '@/lib/supabase/admin'

// Server Action
export async function createUserAsAdmin(email: string, password: string) {
  'use server'
  
  const supabase = createAdminClient()
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  
  return { data, error }
}
```

## 5. Server Actions

Pro mutace dat použijte Server Actions:

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createField(formData: FormData) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('fields')
    .insert({
      name: formData.get('name'),
      area: formData.get('area'),
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/portal/pozemky')
  return { data }
}
```

## 6. Middleware

Middleware automaticky obnovuje session pro každý request. Je už nakonfigurován v `middleware.ts`.

## Environment Variables

Nezapomeňte nastavit v `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Real-time Subscriptions

Pro real-time updates v Client Components:

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function RealtimeComponent() {
  const [items, setItems] = useState([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchItems = async () => {
      const { data } = await supabase.from('items').select('*')
      setItems(data || [])
    }
    fetchItems()

    // Subscribe to changes
    const channel = supabase
      .channel('items-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('Change received!', payload)
          fetchItems() // Re-fetch data
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>Items: {items.length}</div>
}
```
