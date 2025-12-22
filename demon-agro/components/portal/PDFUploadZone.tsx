'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'

interface PDFUploadZoneProps {
  parcels: Parcel[]
  userId: string
  remainingExtractions: number
}

type DocumentType = 'azzp' | 'lab' | 'auto'
type UploadStatus = 'idle' | 'uploading' | 'extracting' | 'validating' | 'success' | 'error'

interface UploadedFile {
  file: File
  name: string
  size: number
  pdfUrl?: string
  filename?: string
  extractedData?: any
  error?: string
}

export function PDFUploadZone({ parcels, userId, remainingExtractions }: PDFUploadZoneProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('auto')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    // Create file object
    const fileObj: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
    }

    setUploadedFile(fileObj)
    setStatus('uploading')
    setUploadProgress(0)

    try {
      // Simulate progress for upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Upload to Supabase Storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const uploadResponse = await fetch('/api/portal/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Chyba při nahrávání souboru')
      }

      const { pdfUrl, filename } = await uploadResponse.json()

      setUploadedFile(prev => prev ? { ...prev, pdfUrl, filename } : null)
      setStatus('extracting')
      setUploadProgress(0)

      // Extract data from PDF using AI
      const extractResponse = await fetch('/api/portal/extract-soil-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfUrl,
          filename,
          documentType,
          userId,
        }),
      })

      if (!extractResponse.ok) {
        const error = await extractResponse.json()
        throw new Error(error.error || 'Chyba při extrakci dat')
      }

      const extractedData = await extractResponse.json()

      setUploadedFile(prev => prev ? { ...prev, extractedData } : null)
      setStatus('validating')

      // Redirect to validation page
      window.location.href = `/portal/upload/validate?data=${encodeURIComponent(JSON.stringify({
        ...extractedData,
        pdfUrl,
      }))}`

    } catch (error) {
      console.error('Upload error:', error)
      setStatus('error')
      setUploadedFile(prev => prev ? {
        ...prev,
        error: error instanceof Error ? error.message : 'Neznámá chyba'
      } : null)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setStatus('idle')
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1. Typ dokumentu
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setDocumentType('auto')}
            disabled={status !== 'idle'}
            className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
              documentType === 'auto'
                ? 'border-primary-green bg-green-50 text-primary-green'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Automaticky
          </button>
          <button
            type="button"
            onClick={() => setDocumentType('azzp')}
            disabled={status !== 'idle'}
            className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
              documentType === 'azzp'
                ? 'border-primary-green bg-green-50 text-primary-green'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            AZZP zpráva
          </button>
          <button
            type="button"
            onClick={() => setDocumentType('lab')}
            disabled={status !== 'idle'}
            className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
              documentType === 'lab'
                ? 'border-primary-green bg-green-50 text-primary-green'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Lab. protokol
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          2. Nahrajte PDF dokument
        </label>

        {!uploadedFile ? (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
              ${isDragging
                ? 'border-primary-green bg-green-50 scale-105'
                : 'border-gray-300 hover:border-primary-green hover:bg-gray-50'
              }
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            <Upload className={`h-16 w-16 mx-auto mb-4 transition-transform ${
              isDragging ? 'text-primary-green scale-110' : 'text-gray-400'
            }`} />
            
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragging ? 'Pusťte soubor zde' : 'Přetáhněte PDF sem nebo klikněte pro výběr'}
            </p>
            
            <p className="text-sm text-gray-600 mb-1">
              Maximální velikost: 10 MB
            </p>
            
            <p className="text-xs text-gray-500">
              Podporované formáty: PDF
            </p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <div className="flex items-start gap-4">
              <FileText className="h-10 w-10 text-primary-green flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Status Messages */}
                <div className="mt-4">
                  {status === 'uploading' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Nahrávám do cloudu...</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">{uploadProgress}%</p>
                    </div>
                  )}

                  {status === 'extracting' && (
                    <div className="flex items-center gap-2 text-purple-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">AI extrahuje data z PDF...</span>
                    </div>
                  )}

                  {status === 'validating' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Připravuji validaci dat...</span>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Chyba: {uploadedFile.error}</span>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-sm text-primary-green hover:underline"
                      >
                        Zkusit znovu
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {status === 'idle' || status === 'error' ? (
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
