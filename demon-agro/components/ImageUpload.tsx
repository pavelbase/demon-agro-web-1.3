"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, X, Check, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  currentUrl?: string;
  productName?: string; // Název produktu pro pojmenování souboru
}

export default function ImageUpload({ onUploadSuccess, currentUrl, productName }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(currentUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError("");

    // Validace typu
    if (!file.type.startsWith('image/')) {
      setError("Lze nahrát pouze obrázky");
      return;
    }

    // Validace velikosti (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Soubor je příliš velký. Maximum je 5MB.");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    // Přidat název produktu, pokud existuje
    if (productName) {
      formData.append('productName', productName);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při nahrávání');
      }

      onUploadSuccess(data.url);
      setError("");
    } catch (err: any) {
      setError(err.message || 'Chyba při nahrávání souboru');
      setPreview(currentUrl || "");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-[#4A7C59] bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
          </div>
        )}

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        <p className="text-gray-600 mb-2">
          Přetáhněte obrázek sem nebo klikněte pro výběr
        </p>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50"
        >
          {isUploading ? "Nahrávám..." : "Vybrat soubor"}
        </button>

        <p className="text-sm text-gray-500 mt-3">
          JPG, PNG, WebP, GIF (max 5MB)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
