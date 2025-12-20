'use client'

import { useState, useCallback } from 'react'
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface UploadImageModalProps {
  onClose: () => void
}

export function UploadImageModal({ onClose }: UploadImageModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    // Validate file size (2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('Soubor je příliš velký. Maximum je 2MB.')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError('Nepodporovaný formát. Povolené: JPG, PNG, WebP')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Vyberte obrázek')
      return
    }

    if (!formData.title) {
      setError('Název je povinný')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create form data
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)

      const response = await fetch('/api/admin/portal-images/upload', {
        method: 'POST',
        body: uploadData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nepodařilo se nahrát obrázek')
      }

      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo k chybě')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Nahrát nový obrázek
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-green bg-primary-green/5'
                    : 'border-gray-300 hover:border-primary-green'
                }`}
              >
                <input {...getInputProps()} />
                
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600">
                      Klikněte nebo přetáhněte pro změnu obrázku
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ImageIcon className="h-16 w-16 mx-auto text-gray-400" />
                    <div>
                      <p className="text-gray-700 font-medium">
                        {isDragActive
                          ? 'Pusťte soubor zde'
                          : 'Klikněte nebo přetáhněte obrázek'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG nebo WebP, max 2MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="např. Sklizeň 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Popis
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="Volitelný popis obrázku..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !file}
                  className="flex-1 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Nahrávám...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Nahrát
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
