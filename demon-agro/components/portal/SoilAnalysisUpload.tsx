'use client'

import { useState } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'
import { SoilAnalysisForm } from './SoilAnalysisForm'

interface SoilAnalysisUploadProps {
  parcels: Parcel[]
}

interface UploadedFile {
  file: File
  preview: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  error?: string
  extractedData?: ExtractedSoilData
}

interface ExtractedSoilData {
  date: string
  ph: number
  phosphorus: number
  potassium: number
  magnesium: number
  calcium?: number
  nitrogen?: number
  lab_name?: string
  confidence: 'high' | 'medium' | 'low'
}

export function SoilAnalysisUpload({ parcels }: SoilAnalysisUploadProps) {
  const [selectedParcel, setSelectedParcel] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Prosím nahrajte PDF soubor')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Soubor je příliš velký. Maximum je 10 MB.')
      return
    }

    // Validate parcel selection
    if (!selectedParcel) {
      alert('Prosím vyberte pozemek')
      return
    }

    // Create file preview object
    const fileObj: UploadedFile = {
      file,
      preview: file.name,
      status: 'uploading',
    }

    setUploadedFile(fileObj)

    try {
      // Upload PDF to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('parcelId', selectedParcel)

      const uploadResponse = await fetch('/api/upload-soil-analysis', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Chyba při nahrávání souboru')
      }

      const { pdfUrl } = await uploadResponse.json()

      // Update status to processing
      setUploadedFile(prev => prev ? { ...prev, status: 'processing' } : null)

      // Extract data from PDF using AI
      const extractResponse = await fetch('/api/extract-soil-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl, parcelId: selectedParcel }),
      })

      if (!extractResponse.ok) {
        throw new Error('Chyba při zpracování PDF')
      }

      const extractedData: ExtractedSoilData = await extractResponse.json()

      // Update file with extracted data
      setUploadedFile(prev => prev ? {
        ...prev,
        status: 'ready',
        extractedData,
      } : null)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadedFile(prev => prev ? {
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      } : null)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const handleManualEntry = () => {
    if (!selectedParcel) {
      alert('Prosím vyberte pozemek')
      return
    }
    setShowManualForm(true)
  }

  // Show form if data extracted or manual entry
  if (uploadedFile?.status === 'ready' || showManualForm) {
    return (
      <SoilAnalysisForm
        parcelId={selectedParcel}
        initialData={uploadedFile?.extractedData}
        onCancel={() => {
          setUploadedFile(null)
          setShowManualForm(false)
        }}
        onSuccess={() => {
          setUploadedFile(null)
          setShowManualForm(false)
          setSelectedParcel('')
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Parcel Selection */}
      <div>
        <label htmlFor="parcel" className="block text-sm font-medium text-gray-700 mb-2">
          1. Vyberte pozemek <span className="text-red-500">*</span>
        </label>
        {parcels.length === 0 ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-900 font-medium">Nemáte žádné pozemky</p>
              <p className="text-orange-700 text-sm mt-1">
                Před nahráním rozboru musíte nejprve vytvořit pozemek.{' '}
                <a href="/portal/pozemky" className="underline hover:text-orange-900">
                  Přidat pozemek
                </a>
              </p>
            </div>
          </div>
        ) : (
          <select
            id="parcel"
            value={selectedParcel}
            onChange={(e) => setSelectedParcel(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="">-- Vyberte pozemek --</option>
            {parcels.map((parcel) => (
              <option key={parcel.id} value={parcel.id}>
                {parcel.name} ({parcel.area} ha)
                {parcel.cadastral_number && ` - ${parcel.cadastral_number}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          2. Nahrajte PDF rozbor půdy
        </label>

        {!uploadedFile ? (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging
                ? 'border-primary-green bg-green-50'
                : 'border-gray-300 hover:border-primary-green hover:bg-gray-50'
              }
              ${!selectedParcel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (selectedParcel) {
                document.getElementById('file-input')?.click()
              }
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
              disabled={!selectedParcel}
            />

            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            
            <p className="text-lg font-medium text-gray-900 mb-2">
              Přetáhněte PDF sem nebo klikněte pro výběr
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              Maximální velikost: 10 MB
            </p>

            <div className="text-xs text-gray-500">
              Podporované formáty: PDF
            </div>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <FileText className="h-10 w-10 text-primary-green flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {uploadedFile.preview}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Status */}
                <div className="mt-3">
                  {uploadedFile.status === 'uploading' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Nahrávám...</span>
                    </div>
                  )}

                  {uploadedFile.status === 'processing' && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Zpracovávám PDF pomocí AI...</span>
                    </div>
                  )}

                  {uploadedFile.status === 'ready' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Data extrahována</span>
                    </div>
                  )}

                  {uploadedFile.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{uploadedFile.error}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={uploadedFile.status === 'uploading' || uploadedFile.status === 'processing'}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Option */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">
          Pokud nemáte PDF nebo chcete zadat data ručně:
        </p>
        <button
          onClick={handleManualEntry}
          disabled={!selectedParcel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Zadat rozbor ručně
        </button>
      </div>
    </div>
  )
}
