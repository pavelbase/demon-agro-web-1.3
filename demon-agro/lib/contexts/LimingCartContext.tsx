'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { LimeType } from '@/lib/types/database'

export interface LimingCartItem {
  parcel_id: string
  parcel_name: string
  area_ha: number
  recommended_type: LimeType
  product_id?: string
  product_name?: string
  cao_content?: number
  quantity_cao_t: number
  quantity_product_t: number
  reason: string
}

interface LimingCartContextType {
  items: LimingCartItem[]
  addItem: (item: LimingCartItem) => void
  removeItem: (parcelId: string) => void
  updateItem: (parcelId: string, updates: Partial<LimingCartItem>) => void
  clearCart: () => void
  getTotalArea: () => number
  getTotalQuantity: () => number
  getTotalItems: () => number
}

const LimingCartContext = createContext<LimingCartContextType | undefined>(undefined)

const STORAGE_KEY = 'liming_cart_items'

export function LimingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LimingCartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setItems(parsed)
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [items, isHydrated])

  const addItem = (item: LimingCartItem) => {
    setItems((prev) => {
      // Check if item for this parcel already exists
      const existingIndex = prev.findIndex(i => i.parcel_id === item.parcel_id)
      
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev]
        updated[existingIndex] = item
        return updated
      } else {
        // Add new item
        return [...prev, item]
      }
    })
  }

  const removeItem = (parcelId: string) => {
    setItems((prev) => prev.filter((item) => item.parcel_id !== parcelId))
  }

  const updateItem = (parcelId: string, updates: Partial<LimingCartItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.parcel_id === parcelId ? { ...item, ...updates } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error)
    }
  }

  const getTotalArea = () => {
    return items.reduce((sum, item) => sum + item.area_ha, 0)
  }

  const getTotalQuantity = () => {
    return items.reduce((sum, item) => sum + item.quantity_product_t, 0)
  }

  const getTotalItems = () => {
    return items.length
  }

  return (
    <LimingCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        getTotalArea,
        getTotalQuantity,
        getTotalItems,
      }}
    >
      {children}
    </LimingCartContext.Provider>
  )
}

export function useLimingCart() {
  const context = useContext(LimingCartContext)
  if (!context) {
    throw new Error('useLimingCart must be used within a LimingCartProvider')
  }
  return context
}
