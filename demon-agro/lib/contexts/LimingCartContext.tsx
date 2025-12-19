'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface LimingCartItem {
  id: string
  fieldId: string
  productId: string
  quantity: number
}

interface LimingCartContextType {
  items: LimingCartItem[]
  addItem: (item: LimingCartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

const LimingCartContext = createContext<LimingCartContextType | undefined>(undefined)

export function LimingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LimingCartItem[]>([])

  const addItem = (item: LimingCartItem) => {
    setItems((prev) => [...prev, item])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.length
  }

  return (
    <LimingCartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotalItems }}
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
