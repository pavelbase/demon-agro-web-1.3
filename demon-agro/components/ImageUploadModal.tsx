"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Upload, X, Image as ImageIcon, Check } from "lucide-react";
import { 
  ImageCategory, 
  ImageData, 
  IMAGE_SPECS, 
  IMAGE_KEYS,
  validateImage,
  formatFileSize 
} from "@/lib/images-manager";

interface ImageUploadModalProps {
  imageKey: string;
  currentImage: ImageData | null;
  onClose: () => void;
  onSave: (key: string, imageData: ImageData) => void;
}

export default function ImageUploadModal({ imageKey, currentImage, onClose, onSave }: ImageUploadModalProps) {
  // Kontrola zda je to produktový obrázek
  const isProductImage = imageKey.startsWith('product_');
  const keyData = !isProductImage ? IMAGE_KEYS[imageKey as keyof typeof IMAGE_KEYS] : null;
  const specs = keyData ? IMAGE_SPECS[keyData.category] : IMAGE_SPECS.product;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Pro produktové obrázky použij product kategorii
    const category: ImageCategory = isProductImage ? 'product' : (keyData?.category || 'product');
    
    // Validace
    const validation = validateImage(file, category);
    if (!validation.valid) {
      setError(validation.error || "Neplatný soubor");
      return;
    }
    
    setSelectedFile(file);
    
    // Vytvoření preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    setError(null);
    
    if (url) {
      setPreviewUrl(url);
      setSelectedFile(null);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    
    // Pro produktové obrázky použij product kategorii
    const category: ImageCategory = isProductImage ? 'product' : (keyData?.category || 'product');
    const title = isProductImage 
      ? `Produkt: ${imageKey.replace('product_', '')}`
      : (keyData?.title || imageKey);
    
    try {
      let finalUrl = "";
      let imageSize = 0;
      let imageFormat = "";
      let imageDimensions = specs?.dimensions || "";
      
      if (selectedFile) {
        // ========================================================================
        // UPLOAD DO SUPABASE STORAGE přes API endpoint
        // ========================================================================
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Přidat název pro pojmenování souboru
        const productName = isProductImage 
          ? imageKey.replace('product_', '') 
          : title;
        formData.append('productName', productName);
        
        // Upload na server
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Chyba při nahrávání');
        }
        
        // Získat URL ze Supabase Storage
        finalUrl = uploadData.url;
        imageSize = selectedFile.size;
        imageFormat = selectedFile.type.split('/')[1];
        
        // Získání rozměrů obrázku
        const img = new Image();
        img.onload = () => {
          imageDimensions = `${img.width}x${img.height}`;
          
          const imageData: ImageData = {
            url: finalUrl,
            category: category,
            ...(isProductImage ? { productId: imageKey.replace('product_', '') } : { page: keyData?.page }),
            title: title,
            dimensions: imageDimensions,
            size: imageSize,
            format: imageFormat,
            uploadedAt: new Date().toISOString()
          };
          
          onSave(imageKey, imageData);
          onClose();
        };
        img.onerror = () => {
          setError("Nepodařilo se načíst nahraný obrázek");
          setIsUploading(false);
        };
        img.src = finalUrl;
      } else if (urlInput) {
        // URL zadaná ručně (pro externí obrázky nebo Unsplash)
        finalUrl = urlInput;
        
        // Získání rozměrů z URL
        const img = new Image();
        img.onload = () => {
          imageDimensions = `${img.width}x${img.height}`;
          imageFormat = urlInput.split('.').pop() || 'jpg';
          
          const imageData: ImageData = {
            url: finalUrl,
            category: category,
            ...(isProductImage ? { productId: imageKey.replace('product_', '') } : { page: keyData?.page }),
            title: title,
            dimensions: imageDimensions,
            size: 0,
            format: imageFormat,
            uploadedAt: new Date().toISOString()
          };
          
          onSave(imageKey, imageData);
          onClose();
        };
        img.onerror = () => {
          setError("Nepodařilo se načíst obrázek z URL");
          setIsUploading(false);
        };
        img.src = finalUrl;
      } else {
        setError("Vyberte soubor nebo zadejte URL");
        setIsUploading(false);
      }
    } catch (err) {
      setError("Chyba při nahrávání obrázku");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Nahrát obrázek - {isProductImage ? imageKey.replace('product_', 'Produkt ') : (keyData?.title || imageKey)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Doporučené parametry */}
          {specs && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                📋 DOPORUČENÉ PARAMETRY:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Rozměry: {specs.dimensions}px</li>
                <li>• Formát: {specs.formats.join(', ').toUpperCase()}</li>
                <li>• Max velikost: {formatFileSize(specs.maxSize)}</li>
                <li>• Použití: {specs.description}</li>
              </ul>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#4A7C59] transition-colors"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id={`file-upload-${imageKey}`}
            />
            <label htmlFor={`file-upload-${imageKey}`} className="cursor-pointer block">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Přetáhněte obrázek sem nebo klikněte
              </p>
              <span className="inline-block bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-2 rounded-full font-semibold transition-colors">
                Vybrat soubor
              </span>
            </label>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NEBO zadejte URL:
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">NÁHLED:</h3>
              <div className="relative w-full h-96">
                <NextImage
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="rounded-lg object-contain bg-gray-100"
                />
              </div>
              {selectedFile && (
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>Velikost: {formatFileSize(selectedFile.size)}</p>
                  <p>Typ: {selectedFile.type}</p>
                </div>
              )}
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <p className="font-semibold mb-1">⚠️ Automatická optimalizace:</p>
                <ul className="space-y-1">
                  <li>• Změna velikosti na {specs?.dimensions}px</li>
                  <li>• Komprese na max {specs && formatFileSize(specs.maxSize)}</li>
                  <li>• Konverze na WebP (optional)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            disabled={isUploading}
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            disabled={(!selectedFile && !urlInput) || isUploading}
            className="px-6 py-2 bg-[#4A7C59] hover:bg-[#3d6449] text-white rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Nahrávám...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Uložit obrázek
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
