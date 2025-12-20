// Empty State Components
// Reusable empty states for lists and collections

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          {action.label}
        </button>
      )}
      
      {children}
    </div>
  )
}

// Pre-configured empty states for common scenarios
import { Map, FileText, ShoppingCart, History, Calendar } from 'lucide-react'

export const EmptyParcels = ({ onAdd }: { onAdd: () => void }) => (
  <EmptyState
    icon={Map}
    title="Zatím nemáte žádné pozemky"
    description="Začněte přidáním svého prvního pozemku. Poté budete moci nahrát rozbory půdy a generovat plány hnojení."
    action={{ label: 'Přidat první pozemek', onClick: onAdd }}
  />
)

export const EmptyAnalyses = () => (
  <EmptyState
    icon={FileText}
    title="Žádné rozbory půdy"
    description="Pro tento pozemek zatím nemáte nahrané žádné rozbory. Nahrajte PDF rozbor nebo vytvořte manuálně."
  />
)

export const EmptyRequests = ({ onAdd }: { onAdd: () => void }) => (
  <EmptyState
    icon={ShoppingCart}
    title="Žádné poptávky"
    description="Zatím jste neodeslali žádnou poptávku na vápnění. Začněte výběrem produktů v plánech vápnění."
    action={{ label: 'Přejít na pozemky', onClick: onAdd }}
  />
)

export const EmptyFertilizationHistory = ({ onAdd }: { onAdd: () => void }) => (
  <EmptyState
    icon={History}
    title="Žádná historie hnojení"
    description="Pro tento pozemek zatím nemáte zaznamenanou žádnou historii hnojení. Začněte přidáním první aplikace."
    action={{ label: 'Přidat první záznam', onClick: onAdd }}
  />
)

export const EmptyCropRotation = ({ onAdd }: { onAdd: () => void }) => (
  <EmptyState
    icon={Calendar}
    title="Žádný osevní postup"
    description="Pro tento pozemek zatím nemáte naplánovaný osevní postup. Vytvořte plán pro příští roky."
    action={{ label: 'Vytvořit plán', onClick: onAdd }}
  />
)
