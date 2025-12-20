'use client'

import { useState } from 'react'
import { Plus, Upload, Image as ImageIcon, Edit, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { UploadImageModal } from './UploadImageModal'
import { EditImageModal } from './EditImageModal'
import Image from 'next/image'

interface PortalImage {
  id: string
  title: string
  description: string | null
  image_url: string
  display_order: number
  is_active: boolean
  created_at: string
}

interface PortalImagesManagerProps {
  images: PortalImage[]
}

export function PortalImagesManager({ images: initialImages }: PortalImagesManagerProps) {
  const [images, setImages] = useState(initialImages)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingImage, setEditingImage] = useState<PortalImage | null>(null)

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    
    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[index - 1]
    newImages[index - 1] = temp
    
    setImages(newImages)
    
    // Update display_order in DB
    await updateOrder(newImages)
  }

  const handleMoveDown = async (index: number) => {
    if (index === images.length - 1) return
    
    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[index + 1]
    newImages[index + 1] = temp
    
    setImages(newImages)
    
    // Update display_order in DB
    await updateOrder(newImages)
  }

  const updateOrder = async (orderedImages: PortalImage[]) => {
    try {
      await fetch('/api/admin/portal-images/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: orderedImages.map((img, idx) => ({ id: img.id, display_order: idx }))
        }),
      })
    } catch (error) {
      console.error('Reorder error:', error)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('Opravdu chcete smazat tento obrázek? Akce je nevratná.')) return

    try {
      const response = await fetch('/api/admin/portal-images/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Nepodařilo se smazat obrázek')
      }
    } catch (error) {
      alert('Došlo k chybě')
    }
  }

  const handleToggleActive = async (image: PortalImage) => {
    try {
      const response = await fetch('/api/admin/portal-images/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: image.id,
          title: image.title,
          description: image.description,
          is_active: !image.is_active,
        }),
      })

      if (response.ok) {
        setImages(images.map(img => 
          img.id === image.id ? { ...img, is_active: !img.is_active } : img
        ))
      }
    } catch (error) {
      console.error('Toggle active error:', error)
    }
  }

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-center text-gray-500">
          <ImageIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Zatím žádné obrázky</h3>
          <p className="mb-6">Přidejte první obrázek do galerie portálu</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Nahrát obrázek
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Celkem obrázků: {images.length} ({images.filter(img => img.is_active).length} aktivních)
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nahrát obrázek
        </button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
              image.is_active ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              <Image
                src={image.image_url}
                alt={image.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {!image.is_active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">Neaktivní</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">{image.title}</h3>
                <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
              </div>
              
              {image.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {image.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Posunout nahoru"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Posunout dolů"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => handleToggleActive(image)}
                  className={`p-1 ${image.is_active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                  title={image.is_active ? 'Deaktivovat' : 'Aktivovat'}
                >
                  {image.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setEditingImage(image)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Upravit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title="Smazat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Doporučené rozměry:</strong> 1200x800px, max 2MB, formáty: JPG, PNG, WebP
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadImageModal onClose={() => setShowUploadModal(false)} />
      )}
      
      {editingImage && (
        <EditImageModal
          image={editingImage}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  )
}
