// Toast notification utility
// Simple toast system for user feedback

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

let toastCounter = 0
const toastListeners: Array<(toast: Toast) => void> = []

export function toast(message: string, type: ToastType = 'info', duration = 5000) {
  const newToast: Toast = {
    id: `toast-${++toastCounter}`,
    type,
    message,
    duration,
  }
  
  toastListeners.forEach(listener => listener(newToast))
}

toast.success = (message: string, duration?: number) => toast(message, 'success', duration)
toast.error = (message: string, duration?: number) => toast(message, 'error', duration)
toast.warning = (message: string, duration?: number) => toast(message, 'warning', duration)
toast.info = (message: string, duration?: number) => toast(message, 'info', duration)

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast])
      
      if (toast.duration) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id))
        }, toast.duration)
      }
    }
    
    toastListeners.push(listener)
    
    return () => {
      const index = toastListeners.indexOf(listener)
      if (index > -1) toastListeners.splice(index, 1)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 border-green-200 text-green-800',
      iconClassName: 'text-green-600',
    },
    error: {
      icon: XCircle,
      className: 'bg-red-50 border-red-200 text-red-800',
      iconClassName: 'text-red-600',
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClassName: 'text-yellow-600',
    },
    info: {
      icon: AlertCircle,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClassName: 'text-blue-600',
    },
  }

  const { icon: Icon, className, iconClassName } = config[toast.type]

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg pointer-events-auto min-w-[300px] max-w-md ${className}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconClassName}`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Zavřít"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
