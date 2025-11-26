"use client";

import { useState, useEffect } from "react";
import { X, Check, Plus, Edit2, Trash2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Product, PageKey, ImageUrls } from "@/lib/types";
import { getProducts, saveProducts, resetProducts, defaultProducts } from "@/lib/products";
import { getPageContent, savePageContent, resetPageContent, defaultContent } from "@/lib/content";
import { getImages, saveImages, resetImages, defaultImages } from "@/lib/images";
import ImageUpload from "@/components/ImageUpload";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "content" | "images">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageKey>("home");
  const [pageContent, setPageContent] = useState(getPageContent("home"));
  const [images, setImages] = useState<ImageUrls>(defaultImages);
  const [selectedImageKey, setSelectedImageKey] = useState<keyof ImageUrls | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [imageFilter, setImageFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");

  useEffect(() => {
    if (isAuthenticated) {
      setProducts(getProducts());
      setImages(getImages());
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === "demonagro2024") {
      setIsAuthenticated(true);
    } else {
      alert("Nesprávné heslo");
    }
  };

  const handleSaveProduct = (product: Product) => {
    const updatedProducts = editingProduct
      ? products.map((p) => (p.id === product.id ? product : p))
      : [...products, { ...product, id: `product-${Date.now()}` }];
    
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    setEditingProduct(null);
    setIsAddingProduct(false);
    showSaveMessage("Produkt uložen");
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Opravdu chcete smazat tento produkt?")) {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      showSaveMessage("Produkt smazán");
    }
  };

  const handleToggleAvailability = (id: string) => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, dostupnost: !p.dostupnost } : p
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  const handleResetProducts = () => {
    if (confirm("Opravdu chcete obnovit výchozí produkty? Všechny změny budou ztraceny.")) {
      resetProducts();
      setProducts(defaultProducts);
      showSaveMessage("Produkty obnoveny");
    }
  };

  const handleSaveContent = () => {
    savePageContent(selectedPage, pageContent);
    showSaveMessage("Obsah uložen");
  };

  const handleResetContent = () => {
    if (confirm("Opravdu chcete obnovit výchozí text? Všechny změny budou ztraceny.")) {
      resetPageContent(selectedPage);
      setPageContent(defaultContent[selectedPage]);
      showSaveMessage("Obsah obnoven");
    }
  };

  const handlePageChange = (page: PageKey) => {
    setSelectedPage(page);
    setPageContent(getPageContent(page));
  };

  const handleUpdateImage = () => {
    if (selectedImageKey && tempImageUrl) {
      const updatedImages = { ...images, [selectedImageKey]: tempImageUrl };
      setImages(updatedImages);
      saveImages(updatedImages);
      setSelectedImageKey(null);
      setTempImageUrl("");
      showSaveMessage("Obrázek aktualizován");
    }
  };

  const handleResetImage = (key: keyof ImageUrls) => {
    if (confirm("Opravdu chcete obnovit výchozí obrázek?")) {
      const updatedImages = { ...images, [key]: defaultImages[key] };
      setImages(updatedImages);
      saveImages(updatedImages);
      showSaveMessage("Obrázek obnoven");
    }
  };

  const handleUpdateProductImage = (productId: string, newUrl: string) => {
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, fotka_url: newUrl } : p
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    setSelectedProduct(null);
    showSaveMessage("Obrázek produktu aktualizován");
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Panel - Přihlášení
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Heslo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                placeholder="Zadejte heslo"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md"
            >
              Přihlásit se
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Správa produktů, obsahu stránek a obrázků</p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 bg-green-50 p-4 rounded-lg shadow-sm flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-semibold">{saveMessage}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "products"
                ? "bg-[#4A7C59] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Produkty
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "content"
                ? "bg-[#4A7C59] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Obsah stránek
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "images"
                ? "bg-[#4A7C59] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Správa obrázků
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Produkty</h2>
              <div className="space-x-4">
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat produkt
                </button>
                <button
                  onClick={handleResetProducts}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md"
                >
                  Obnovit výchozí
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Název</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Kategorie</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Dostupnost</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{product.nazev}</td>
                      <td className="px-4 py-3 capitalize">{product.kategorie}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleAvailability(product.id)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.dostupnost
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.dostupnost ? "Dostupný" : "Nedostupný"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Product Form Modal */}
            {(editingProduct || isAddingProduct) && (
              <ProductFormModal
                product={editingProduct}
                onSave={handleSaveProduct}
                onClose={() => {
                  setEditingProduct(null);
                  setIsAddingProduct(false);
                }}
              />
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-2">
                Vyberte stránku
              </label>
              <select
                value={selectedPage}
                onChange={(e) => handlePageChange(e.target.value as PageKey)}
                className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              >
                <option value="home">Domů</option>
                <option value="ph">pH půdy</option>
                <option value="sira">Síra</option>
                <option value="k">Draslík</option>
                <option value="mg">Hořčík</option>
                <option value="analyza">Analýza</option>
                <option value="onas">O nás</option>
              </select>
            </div>

            <ContentForm
              pageKey={selectedPage}
              content={pageContent}
              onChange={setPageContent}
            />

            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleSaveContent}
                className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
              >
                Uložit změny
              </button>
              <button
                onClick={handleResetContent}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
              >
                Obnovit výchozí
              </button>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Správa obrázků</h2>
            
            {/* Logo Section */}
            <div className="mb-8 bg-gradient-to-r from-[#4A7C59] to-[#3d6449] rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">Logo společnosti</h3>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Speciální
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Preview */}
                <div className="bg-white rounded-lg p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.jpg";
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Aktuální logo (zobrazuje se v navigaci, na domovské stránce a ve footeru)
                  </p>
                </div>

                {/* Logo Upload */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Nahrát nové logo</h4>
                  <ImageUpload
                    currentUrl={logoUrl}
                    productName="logo"
                    onUploadSuccess={(url) => {
                      setLogoUrl(url);
                      // Uložit do localStorage
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('logo_url', url);
                      }
                      showSaveMessage("Logo aktualizováno - obnovte stránku pro zobrazení změn");
                    }}
                  />
                  <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>Tip:</strong> Po nahrání loga obnovte stránku (F5) pro zobrazení změn v navigaci.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600 font-semibold">
                  Obrázky stránek a produktů
                </span>
              </div>
            </div>
            
            {/* Category Filters */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-3">
                Filtrovat podle kategorie:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Vše" },
                  { value: "products", label: "Produkty" },
                  { value: "home", label: "Domů" },
                  { value: "ph", label: "pH půdy" },
                  { value: "sira", label: "Síra" },
                  { value: "k", label: "Draslík" },
                  { value: "mg", label: "Hořčík" },
                  { value: "analyza", label: "Analýza" },
                  { value: "onas", label: "O nás" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setImageFilter(filter.value)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      imageFilter === filter.value
                        ? "bg-[#4A7C59] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Page Images */}
              {(imageFilter === "all" || imageFilter !== "products") &&
                Object.entries(images)
                  .filter(([key]) => {
                    if (imageFilter === "all") return true;
                    if (imageFilter === "products") return false;
                    return key.startsWith(imageFilter + "_");
                  })
                  .map(([key, url]) => {
                    // Get category and type labels
                    const parts = key.split("_");
                    const category = parts[0];
                    const type = parts.slice(1).join(" ");
                    
                    const categoryLabels: Record<string, string> = {
                      home: "Domů",
                      ph: "pH půdy",
                      sira: "Síra",
                      k: "Draslík",
                      mg: "Hořčík",
                      analyza: "Analýza",
                      onas: "O nás",
                    };

                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                          <img
                            src={url}
                            alt={key}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80";
                            }}
                          />
                        </div>
                        <div className="mb-2">
                          <span className="inline-block bg-[#4A7C59] text-white text-xs font-semibold px-2 py-1 rounded">
                            {categoryLabels[category] || category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                          {type.replace(/_/g, " ")}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedImageKey(key as keyof ImageUrls);
                              setTempImageUrl(url);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          >
                            Změnit
                          </button>
                          <button
                            onClick={() => handleResetImage(key as keyof ImageUrls)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          >
                            Obnovit
                          </button>
                        </div>
                      </div>
                    );
                  })}

              {/* Product Images */}
              {(imageFilter === "all" || imageFilter === "products") &&
                products.map((product) => {
                  const categoryLabels: Record<string, string> = {
                    ph: "pH",
                    sira: "Síra",
                    k: "Draslík",
                    mg: "Hořčík",
                    analyza: "Analýza",
                  };

                  return (
                    <div key={product.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                        <img
                          src={product.fotka_url}
                          alt={product.nazev}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80";
                          }}
                        />
                      </div>
                      <div className="mb-2 flex items-center space-x-2">
                        <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Produkt
                        </span>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          {categoryLabels[product.kategorie] || product.kategorie}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {product.nazev}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setTempImageUrl(product.fotka_url);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Změnit
                        </button>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Upravit
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Empty State */}
            {imageFilter !== "all" && 
             imageFilter !== "products" && 
             Object.entries(images).filter(([key]) => key.startsWith(imageFilter + "_")).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Žádné obrázky v této kategorii
                </p>
              </div>
            )}

            {/* Image URL Modal */}
            {selectedImageKey && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Změnit obrázek
                    </h3>
                    <button
                      onClick={() => setSelectedImageKey(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Upload Component */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Nahrát nový obrázek
                      </h4>
                      <ImageUpload
                        currentUrl={tempImageUrl}
                        onUploadSuccess={(url) => {
                          setTempImageUrl(url);
                          const updatedImages = { ...images, [selectedImageKey]: url };
                          setImages(updatedImages);
                          saveImages(updatedImages);
                          setSelectedImageKey(null);
                          showSaveMessage("Obrázek nahrán");
                        }}
                      />
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">nebo zadejte URL</span>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block font-semibold text-gray-900 mb-2">
                        URL obrázku
                      </label>
                      <input
                        type="url"
                        value={tempImageUrl}
                        onChange={(e) => setTempImageUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {tempImageUrl && (
                      <div>
                        <label className="block font-semibold text-gray-900 mb-2">
                          Náhled
                        </label>
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={tempImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80";
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={handleUpdateImage}
                        className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
                      >
                        Uložit URL
                      </button>
                      <button
                        onClick={() => setSelectedImageKey(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Image Modal */}
            {selectedProduct && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Změnit obrázek produktu: {selectedProduct.nazev}
                    </h3>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Upload Component */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Nahrát nový obrázek
                      </h4>
                      <ImageUpload
                        currentUrl={tempImageUrl}
                        productName={selectedProduct.nazev}
                        onUploadSuccess={(url) => {
                          handleUpdateProductImage(selectedProduct.id, url);
                        }}
                      />
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">nebo zadejte URL</span>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block font-semibold text-gray-900 mb-2">
                        URL obrázku
                      </label>
                      <input
                        type="url"
                        value={tempImageUrl}
                        onChange={(e) => setTempImageUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {tempImageUrl && (
                      <div>
                        <label className="block font-semibold text-gray-900 mb-2">
                          Náhled
                        </label>
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={tempImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80";
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleUpdateProductImage(selectedProduct.id, tempImageUrl)}
                        className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
                      >
                        Uložit URL
                      </button>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Form Modal Component
function ProductFormModal({
  product,
  onSave,
  onClose,
}: {
  product: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: "",
      nazev: "",
      popis: "",
      kategorie: "ph",
      dostupnost: true,
      technicke_parametry: {},
      fotka_url: "",
    }
  );

  const [paramKey, setParamKey] = useState("");
  const [paramValue, setParamValue] = useState("");

  const handleAddParam = () => {
    if (paramKey && paramValue) {
      setFormData({
        ...formData,
        technicke_parametry: {
          ...formData.technicke_parametry,
          [paramKey]: paramValue,
        },
      });
      setParamKey("");
      setParamValue("");
    }
  };

  const handleRemoveParam = (key: string) => {
    const { [key]: _, ...rest } = formData.technicke_parametry;
    setFormData({ ...formData, technicke_parametry: rest });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {product ? "Upravit produkt" : "Přidat produkt"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-900 mb-2">Název</label>
            <input
              type="text"
              value={formData.nazev}
              onChange={(e) => setFormData({ ...formData, nazev: e.target.value })}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">Popis</label>
            <textarea
              value={formData.popis}
              onChange={(e) => setFormData({ ...formData, popis: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">Kategorie</label>
            <select
              value={formData.kategorie}
              onChange={(e) =>
                setFormData({ ...formData, kategorie: e.target.value as any })
              }
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            >
              <option value="ph">pH</option>
              <option value="sira">Síra</option>
              <option value="k">Draslík</option>
              <option value="mg">Hořčík</option>
              <option value="analyza">Analýza</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-4">Fotka produktu</label>
            
            {/* Upload Component */}
            <ImageUpload
              currentUrl={formData.fotka_url}
              productName={formData.nazev}
              onUploadSuccess={(url) => {
                setFormData({ ...formData, fotka_url: url });
              }}
            />
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">nebo zadejte URL</span>
              </div>
            </div>
            
            {/* URL Input */}
            <input
              type="url"
              value={formData.fotka_url}
              onChange={(e) => setFormData({ ...formData, fotka_url: e.target.value })}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.dostupnost}
                onChange={(e) =>
                  setFormData({ ...formData, dostupnost: e.target.checked })
                }
                className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59] rounded"
              />
              <span className="font-semibold text-gray-900">Dostupný</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Technické parametry
            </label>
            <div className="space-y-2 mb-3">
              {Object.entries(formData.technicke_parametry).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>
                    <strong>{key}:</strong> {value}
                  </span>
                  <button
                    onClick={() => handleRemoveParam(key)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={paramKey}
                onChange={(e) => setParamKey(e.target.value)}
                placeholder="Klíč"
                className="flex-1 px-3 py-2 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              />
              <input
                type="text"
                value={paramValue}
                onChange={(e) => setParamValue(e.target.value)}
                placeholder="Hodnota"
                className="flex-1 px-3 py-2 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              />
              <button
                onClick={handleAddParam}
                className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-4 py-2 rounded-lg font-semibold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => onSave(formData)}
              className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
            >
              Uložit
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
            >
              Zrušit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content Form Component
function ContentForm({
  pageKey,
  content,
  onChange,
}: {
  pageKey: PageKey;
  content: any;
  onChange: (content: any) => void;
}) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold text-gray-900 mb-2">
          Hero nadpis (max 200 znaků)
        </label>
        <input
          type="text"
          value={content.hero_nadpis || ""}
          onChange={(e) => handleChange("hero_nadpis", e.target.value.slice(0, 200))}
          maxLength={200}
          className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          {content.hero_nadpis?.length || 0}/200
        </p>
      </div>

      <div>
        <label className="block font-semibold text-gray-900 mb-2">
          Hero podnadpis (max 500 znaků)
        </label>
        <textarea
          value={content.hero_podnadpis || ""}
          onChange={(e) => handleChange("hero_podnadpis", e.target.value.slice(0, 500))}
          maxLength={500}
          rows={3}
          className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          {content.hero_podnadpis?.length || 0}/500
        </p>
      </div>

      {pageKey !== "home" && pageKey !== "onas" && (
        <>
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Problém nadpis (max 100 znaků)
            </label>
            <input
              type="text"
              value={content.problem_nadpis || ""}
              onChange={(e) => handleChange("problem_nadpis", e.target.value.slice(0, 100))}
              maxLength={100}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Problém obsah (max 2000 znaků)
            </label>
            <textarea
              value={content.problem_obsah || ""}
              onChange={(e) => handleChange("problem_obsah", e.target.value.slice(0, 2000))}
              maxLength={2000}
              rows={4}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {content.problem_obsah?.length || 0}/2000
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Ekonomický dopad nadpis (max 100 znaků)
            </label>
            <input
              type="text"
              value={content.dopad_nadpis || ""}
              onChange={(e) => handleChange("dopad_nadpis", e.target.value.slice(0, 100))}
              maxLength={100}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Ekonomický dopad obsah (max 2000 znaků)
            </label>
            <textarea
              value={content.dopad_obsah || ""}
              onChange={(e) => handleChange("dopad_obsah", e.target.value.slice(0, 2000))}
              maxLength={2000}
              rows={4}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {content.dopad_obsah?.length || 0}/2000
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Řešení nadpis (max 100 znaků)
            </label>
            <input
              type="text"
              value={content.reseni_nadpis || ""}
              onChange={(e) => handleChange("reseni_nadpis", e.target.value.slice(0, 100))}
              maxLength={100}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Řešení obsah (max 2000 znaků)
            </label>
            <textarea
              value={content.reseni_obsah || ""}
              onChange={(e) => handleChange("reseni_obsah", e.target.value.slice(0, 2000))}
              maxLength={2000}
              rows={4}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {content.reseni_obsah?.length || 0}/2000
            </p>
          </div>
        </>
      )}

      {pageKey === "onas" && (
        <>
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Kdo jsme nadpis (max 100 znaků)
            </label>
            <input
              type="text"
              value={content.kdo_jsme_nadpis || ""}
              onChange={(e) => handleChange("kdo_jsme_nadpis", e.target.value.slice(0, 100))}
              maxLength={100}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Kdo jsme text (max 2000 znaků)
            </label>
            <textarea
              value={content.kdo_jsme_text || ""}
              onChange={(e) => handleChange("kdo_jsme_text", e.target.value.slice(0, 2000))}
              maxLength={2000}
              rows={6}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {content.kdo_jsme_text?.length || 0}/2000
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Naše mise nadpis (max 100 znaků)
            </label>
            <input
              type="text"
              value={content.nase_mise_nadpis || ""}
              onChange={(e) => handleChange("nase_mise_nadpis", e.target.value.slice(0, 100))}
              maxLength={100}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Naše mise text (max 2000 znaků)
            </label>
            <textarea
              value={content.nase_mise_text || ""}
              onChange={(e) => handleChange("nase_mise_text", e.target.value.slice(0, 2000))}
              maxLength={2000}
              rows={6}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {content.nase_mise_text?.length || 0}/2000
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              CTA nadpis (max 100 znaků)
            </label>
            <input
              type="text"
              value={content.cta_nadpis || ""}
              onChange={(e) => handleChange("cta_nadpis", e.target.value.slice(0, 100))}
              maxLength={100}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              CTA text (max 200 znaků)
            </label>
            <input
              type="text"
              value={content.cta_text || ""}
              onChange={(e) => handleChange("cta_text", e.target.value.slice(0, 200))}
              maxLength={200}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
