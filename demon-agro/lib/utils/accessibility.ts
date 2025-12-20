// Accessibility utilities
// Helpers for keyboard navigation, focus management, and ARIA

/**
 * Trap focus within a modal/dialog
 * Usage: Call in useEffect when modal opens
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey)
  
  // Focus first element
  firstElement?.focus()
  
  // Cleanup
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Handle Escape key to close modals
 */
export function useEscapeKey(onEscape: () => void) {
  if (typeof window === 'undefined') return
  
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscape()
    }
  }
  
  window.addEventListener('keydown', handleEscape)
  
  return () => {
    window.removeEventListener('keydown', handleEscape)
  }
}

/**
 * Generate unique IDs for form fields (for aria-describedby)
 */
let idCounter = 0
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div')
  announcer.setAttribute('role', 'status')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.className = 'sr-only'
  
  document.body.appendChild(announcer)
  
  // Small delay to ensure screen reader picks it up
  setTimeout(() => {
    announcer.textContent = message
  }, 100)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

/**
 * Get accessible error message ID for a field
 */
export function getErrorId(fieldName: string): string {
  return `${fieldName}-error`
}

/**
 * Get accessible description ID for a field
 */
export function getDescriptionId(fieldName: string): string {
  return `${fieldName}-description`
}
