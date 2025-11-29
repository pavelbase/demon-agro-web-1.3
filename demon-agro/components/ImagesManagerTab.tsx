"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Edit2, Trash2, Filter } from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";
import {
  getImages,
  saveImage,
  deleteImage,
  getProductImages,
  ImageData,
  ImageCategory,
  PageKey,
  IMAGE_KEYS,
  IMAGE_SPECS,
  formatFileSize,
  ImagesDatabase
} from "@/lib/images-manager";
import { getProducts } from "@/lib/products";
import { Product } from "@/lib/types";

export default function ImagesManagerTab() {
  const [images, setImages] = useState<ImagesDatabase>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ImageCategory | 'all'>('all');
  const [pageFilter, setPageFilter] = useState<PageKey | 'all'>('all');
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadImages();
    loadProducts();
  }, []);

  const loadImages = () => {
    setImages(getImages());
  };

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const handleSaveImage = (key: string, imageData: ImageData) => {
    saveImage(key, imageData);
    loadImages();
    setShowUploadModal(false);
    setSelectedImageKey(null);
  };

  const handleDeleteImage = (key: string) => {
    if (confirm('Opravdu chcete smazat tento obrázek? Nahradí se placeholderem.')) {
      deleteImage(key);
      loadImages();
    }
  };

  const handleEditImage = (key: string) => {
    setSelectedImageKey(key);
    setShowUploadModal(true);
  };

  // Filtrování obrázků
  const filteredImageKeys = Object.keys(IMAGE_KEYS).filter((key) => {
    const keyData = IMAGE_KEYS[key as keyof typeof IMAGE_KEYS];
    
    if (categoryFilter !== 'all' && keyData.category !== categoryFilter) {
      return false;
    }
    
    if (pageFilter !== 'all' && keyData.page !== pageFilter) {
      return false;
    }
    
    return true;
  });

  // Produktové obrázky
  const productImages = categoryFilter === 'all' || categoryFilter === 'product' 
    ? products.map(p => ({
        key: `product_${p.id}`,
        product: p,
        imageData: images[`product_${p.id}`]
      }))
    : [];

  // Seskupení podle kategorie
  const groupedImages: Record<string, string[]> = {};
  filteredImageKeys.forEach((key) => {
    const keyData = IMAGE_KEYS[key as keyof typeof IMAGE_KEYS];
    const category = keyData.category;
    
    if (!groupedImages[category]) {
      groupedImages[category] = [];
    }
    groupedImages[category].push(key);
  });

  // Přidat produkty jako samostatnou kategorii pokud jsou zobrazeny
  if (productImages.length > 0) {
    groupedImages['product'] = productImages.map(p => p.key);
  }

  const categoryLabels: Record<ImageCategory, string> = {
    hero: 'HERO OBRÁZKY',
    background: 'BACKGROUND OBRÁZKY',
    section: 'SECTION IMAGES',
    product: 'PRODUKTY',
    article: 'ČLÁNKY'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Správa obrázků</h2>
        <p className="text-gray-600">
          Centralizovaná správa všech obrázků na webu
        </p>
      </div>

      {/* Filtry */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filtry</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtr kategorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategorie obrázku
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ImageCategory | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] outline-none"
            >
              <option value="all">Všechny kategorie</option>
              <option value="hero">Hero obrázky</option>
              <option value="background">Background obrázky</option>
              <option value="section">Section images</option>
              <option value="product">Produkty</option>
              <option value="article">Články</option>
            </select>
          </div>

          {/* Filtr stránky */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stránka
            </label>
            <select
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value as PageKey | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-[#4A7C59] outline-none"
            >
              <option value="all">Všechny stránky</option>
              <option value="home">Domů</option>
              <option value="ph">pH půdy</option>
              <option value="sira">Síra</option>
              <option value="k">Draslík</option>
              <option value="mg">Hořčík</option>
              <option value="analyza">Analýza</option>
              <option value="onas">O nás</option>
              <option value="radce">Rádce</option>
              <option value="kontakt">Kontakt</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Zobrazeno: <span className="font-semibold">{filteredImageKeys.length + productImages.length}</span> obrázků
        </div>
      </div>

      {/* Skupiny obrázků podle kategorie */}
      {Object.entries(groupedImages).map(([category, keys]) => (
        <div key={category} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {categoryLabels[category as ImageCategory]}
            </h3>
            <span className="bg-[#4A7C59] text-white px-3 py-1 rounded-full text-sm font-semibold">
              {keys.length} {keys.length === 1 ? 'obrázek' : 'obrázků'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keys.map((key) => {
              // Produktový obrázek
              if (key.startsWith('product_')) {
                const productImg = productImages.find(p => p.key === key);
                if (!productImg) return null;
                
                const product = productImg.product;
                const imageData = productImg.imageData;
                const imageUrl = imageData?.url || product.fotka_url || `/images/placeholders/product-placeholder.svg`;

                return (
                  <div key={key} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Náhled obrázku */}
                    <div className="aspect-video bg-gray-200 relative group">
                      <img
                        src={imageUrl}
                        alt={product.nazev}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditImage(key)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Změnit obrázek"
                        >
                          <Edit2 className="w-5 h-5 text-gray-700" />
                        </button>
                        {imageData && (
                          <button
                            onClick={() => handleDeleteImage(key)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Smazat obrázek"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {product.nazev}
                      </h4>
                      
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">
                          produkt
                        </span>
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">
                          {product.kategorie}
                        </span>
                      </div>

                      {imageData ? (
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <div>{imageData.dimensions || '600x600'}</div>
                          <div>{imageData.size > 0 ? formatFileSize(imageData.size) : '—'}</div>
                          <div className="text-gray-400">{imageData.format.toUpperCase()}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          Doporučené: 600x600
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => handleEditImage(key)}
                          className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          {imageData ? 'Změnit' : 'Nahrát'}
                        </button>
                        {imageData && (
                          <button
                            onClick={() => handleDeleteImage(key)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Smazat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Standardní obrázek
              const keyData = IMAGE_KEYS[key as keyof typeof IMAGE_KEYS];
              const imageData = images[key];
              const specs = IMAGE_SPECS[keyData.category];
              
              // Použij placeholder pokud obrázek není nahraný
              const imageUrl = imageData?.url || `/images/placeholders/${keyData.category}-placeholder.svg`;

              return (
                <div key={key} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Náhled obrázku */}
                  <div className="aspect-video bg-gray-200 relative group">
                    <img
                      src={imageUrl}
                      alt={keyData.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditImage(key)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Změnit obrázek"
                      >
                        <Edit2 className="w-5 h-5 text-gray-700" />
                      </button>
                      {imageData && (
                        <button
                          onClick={() => handleDeleteImage(key)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Smazat obrázek"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {keyData.title}
                    </h4>
                    
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                        {keyData.category}
                      </span>
                      {keyData.page && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                          {keyData.page}
                        </span>
                      )}
                    </div>

                    {imageData ? (
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>{imageData.dimensions || specs.dimensions}</div>
                        <div>{imageData.size > 0 ? formatFileSize(imageData.size) : '—'}</div>
                        <div className="text-gray-400">{imageData.format.toUpperCase()}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Doporučené: {specs.dimensions}
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleEditImage(key)}
                        className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        {imageData ? 'Změnit' : 'Nahrát'}
                      </button>
                      {imageData && (
                        <button
                          onClick={() => handleDeleteImage(key)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Smazat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {filteredImageKeys.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Žádné obrázky
          </h3>
          <p className="text-gray-500">
            Pro vybrané filtry nebyly nalezeny žádné obrázky.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedImageKey && (
        <ImageUploadModal
          imageKey={selectedImageKey}
          currentImage={images[selectedImageKey] || null}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedImageKey(null);
          }}
          onSave={handleSaveImage}
        />
      )}
    </div>
  );
}
