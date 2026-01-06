'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { LimeType } from '@/lib/types/database'

export interface LimingCartItem {
  parcel_id: string
  parcel_name: string
  parcel_code?: string
  area_ha: number
  recommended_type: LimeType
  product_id?: string
  product_name?: string
  cao_content?: number
  quantity_cao_t: number
  quantity_product_t: number
  reason: string
  // Nové položky pro víceleté plány
  applications?: LimingCartApplication[]
}

export interface LimingCartApplication {
  year: number
  season: 'jaro' | 'podzim'
  product_name: string
  dose_per_ha: number
  total_tons: number
  cao_per_ha: number
  plan_id?: string
  application_id?: string
}

interface LimingCartContextType {
  items: LimingCartItem[]
  addItem: (item: LimingCartItem) => void
  removeItem: (parcelId: string) => void
  updateItem: (parcelId: string, updates: Partial<LimingCartItem>) => void
  removeApplication: (parcelId: string, applicationId: string) => void
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

  const removeApplication = (parcelId: string, applicationId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.parcel_id !== parcelId || !item.applications) {
          return item
        }

        // Filter out the application
        const updatedApplications = item.applications.filter(
          (app) => app.application_id !== applicationId
        )

        // If no applications left, remove the entire item
        if (updatedApplications.length === 0) {
          return null
        }

        // Recalculate totals
        const newQuantityProduct = updatedApplications.reduce(
          (sum, app) => sum + app.total_tons,
          0
        )
        const newQuantityCao = updatedApplications.reduce(
          (sum, app) => sum + (app.total_tons * (app.cao_per_ha / app.dose_per_ha)),
          0
        )

        return {
          ...item,
          applications: updatedApplications,
          quantity_product_t: newQuantityProduct,
          quantity_cao_t: newQuantityCao,
        }
      }).filter((item): item is LimingCartItem => item !== null)
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
        removeApplication,
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
