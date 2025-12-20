import { TableSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <TableSkeleton rows={10} />
      </div>
    </div>
  )
}
