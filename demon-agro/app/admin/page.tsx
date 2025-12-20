"use client";

import { useState, useEffect } from "react";
import { X, Check, Plus, Edit2, Trash2, AlertCircle, Image as ImageIcon, Mail } from "lucide-react";
import { Product, PageKey, ImageUrls, Article } from "@/lib/types";
import { getProducts, saveProducts, resetProducts, defaultProducts } from "@/lib/products";
import { getPageContent, savePageContent, resetPageContent, defaultContent } from "@/lib/content";
import { getImages, saveImages, resetImages, defaultImages } from "@/lib/images";
import { getArticles, saveArticles, resetArticles, generateSlug } from "@/lib/articles";
import { getKalkulace, updateKalkulace, deleteKalkulace, UlozenaKalkulace } from "@/lib/kalkulace";
import ImageUpload from "@/components/ImageUpload";
import ImagesManagerTab from "@/components/ImagesManagerTab";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "content" | "images" | "articles" | "kalkulace">("products");
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [kalkulace, setKalkulace] = useState<UlozenaKalkulace[]>([]);
  const [selectedKalkulace, setSelectedKalkulace] = useState<UlozenaKalkulace | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setProducts(getProducts());
      setImages(getImages());
      setArticles(getArticles());
      setKalkulace(getKalkulace());
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

  const handleSaveArticle = (article: Article) => {
    const updatedArticles = editingArticle
      ? articles.map((a) => (a.id === article.id ? article : a))
      : [...articles, { ...article, id: `article-${Date.now()}` }];
    
    setArticles(updatedArticles);
    saveArticles(updatedArticles);
    setEditingArticle(null);
    setIsAddingArticle(false);
    showSaveMessage("Článek uložen");
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm("Opravdu chcete smazat tento článek?")) {
      const updatedArticles = articles.filter((a) => a.id !== id);
      setArticles(updatedArticles);
      saveArticles(updatedArticles);
      showSaveMessage("Článek smazán");
    }
  };

  const handleTogglePublished = (id: string) => {
    const updatedArticles = articles.map((a) =>
      a.id === id ? { ...a, publikovano: !a.publikovano } : a
    );
    setArticles(updatedArticles);
    saveArticles(updatedArticles);
  };

  const handleResetArticles = () => {
    if (confirm("Opravdu chcete obnovit výchozí články? Všechny změny budou ztraceny.")) {
      resetArticles();
      setArticles(getArticles());
      showSaveMessage("Články obnoveny");
    }
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
        <div className="mb-8 flex flex-wrap gap-4">
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
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "articles"
                ? "bg-[#4A7C59] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Vzdělávací články
          </button>
          <button
            onClick={() => setActiveTab("kalkulace")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "kalkulace"
                ? "bg-[#4A7C59] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Kalkulace
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
                <option value="kontakt">Kontakt</option>
                <option value="privacy-policy">Zásady ochrany osobních údajů</option>
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


        {/* Images Tab - NEW CENTRALIZED SYSTEM */}
        {activeTab === "images" && <ImagesManagerTab />}

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Vzdělávací články</h2>
              <div className="space-x-4">
                <button
                  onClick={() => setIsAddingArticle(true)}
                  className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat článek
                </button>
                <button
                  onClick={handleResetArticles}
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
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Nadpis</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Kategorie</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Datum</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Publikováno</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{article.nadpis}</td>
                      <td className="px-4 py-3 capitalize">{article.kategorie}</td>
                      <td className="px-4 py-3">
                        {new Date(article.datum_publikace).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleTogglePublished(article.id)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            article.publikovano
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {article.publikovano ? "Publikováno" : "Koncept"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingArticle(article)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
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

            {/* Article Form Modal */}
            {(editingArticle || isAddingArticle) && (
              <ArticleFormModal
                article={editingArticle}
                onSave={handleSaveArticle}
                onClose={() => {
                  setEditingArticle(null);
                  setIsAddingArticle(false);
                }}
              />
            )}
          </div>
        )}

        {/* Kalkulace Tab */}
        {activeTab === "kalkulace" && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Kalkulace hnojení</h2>
              <div className="text-sm text-gray-600">
                Celkem: {kalkulace.length}
              </div>
            </div>

            {kalkulace.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">
                  Zatím nejsou žádné kalkulace.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Datum</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Jméno / Firma</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Kontakt</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900" title="Newsletter souhlas">
                        <Mail className="w-4 h-4 inline-block" />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Typ půdy</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">pH</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Kontaktován</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kalkulace.map((kal) => (
                      <tr key={kal.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {new Date(kal.datum).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{kal.jmeno}</div>
                          {kal.firma && <div className="text-sm text-gray-600">{kal.firma}</div>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{kal.email}</div>
                          <div className="text-gray-600">{kal.telefon}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {kal.marketing_consent ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                              <Check className="w-4 h-4 text-green-600" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                              <X className="w-3 h-3 text-gray-400" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 capitalize">{kal.typPudy.replace('_', '-')}</td>
                        <td className="px-4 py-3">{kal.vysledek.vstup.pH}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              updateKalkulace(kal.id, { kontaktovan: !kal.kontaktovan });
                              setKalkulace(getKalkulace());
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              kal.kontaktovan
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {kal.kontaktovan ? "Kontaktován" : "Nekontaktován"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => setSelectedKalkulace(kal)}
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Opravdu chcete smazat tuto kalkulaci?")) {
                                deleteKalkulace(kal.id);
                                setKalkulace(getKalkulace());
                                showSaveMessage("Kalkulace smazána");
                              }
                            }}
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
            )}

            {/* Detail Modal */}
            {selectedKalkulace && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Detail kalkulace
                    </h3>
                    <button
                      onClick={() => setSelectedKalkulace(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Kontaktní údaje */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Kontaktní údaje</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Jméno:</span>
                          <span className="ml-2 font-semibold">{selectedKalkulace.jmeno}</span>
                        </div>
                        {selectedKalkulace.firma && (
                          <div>
                            <span className="text-gray-600">Firma:</span>
                            <span className="ml-2 font-semibold">{selectedKalkulace.firma}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2">{selectedKalkulace.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Telefon:</span>
                          <span className="ml-2">{selectedKalkulace.telefon}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Datum:</span>
                          <span className="ml-2">{new Date(selectedKalkulace.datum).toLocaleString('cs-CZ')}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t mt-2">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">Marketingový souhlas (Newsletter):</span>
                            {selectedKalkulace.marketing_consent ? (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                <Check className="w-3 h-3 mr-1" />
                                ANO
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                <X className="w-3 h-3 mr-1" />
                                NE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Základní údaje */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Základní údaje</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Typ půdy:</span>
                          <span className="ml-2 capitalize font-semibold">{selectedKalkulace.vysledek.vstup.typPudy.replace('_', '-')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Humus:</span>
                          <span className="ml-2">{selectedKalkulace.vysledek.humus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vápnění */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Potřeba vápnění (na 1 ha)</h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Aktuální pH:</span>
                            <span className="ml-2 font-semibold">{selectedKalkulace.vysledek.vstup.pH}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">pH třída:</span>
                            <span className="ml-2 font-semibold">{selectedKalkulace.vysledek.vapneni.phTrida} ({selectedKalkulace.vysledek.vapneni.phTridaNazev})</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Optimální pH:</span>
                            <span className="ml-2 font-semibold text-green-700">{selectedKalkulace.vysledek.vapneni.optimalniPhRozmezi}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Celková potřeba:</span>
                            <span className="ml-2 font-semibold text-green-700">{selectedKalkulace.vysledek.vapneni.celkovaPotrebaCaO_t} t CaO/ha</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Mletý vápenec:</span>
                            <span className="ml-2 font-semibold text-green-700">{selectedKalkulace.vysledek.vapneni.prepocetyHnojiva.mletyVapenec_t} t/ha</span>
                          </div>
                        </div>
                        {selectedKalkulace.vysledek.vapneni.pocetAplikaci > 1 && (
                          <div className="pt-3 border-t border-green-200 text-sm">
                            <div className="text-orange-700">
                              ⚠️ Rozdělit do {selectedKalkulace.vysledek.vapneni.pocetAplikaci} aplikací
                              ({selectedKalkulace.vysledek.vapneni.davkaNaAplikaci_t} t CaO/ha každá)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Živiny */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Stav živin (na 1 ha)</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left">Živina</th>
                            <th className="px-3 py-2 text-left">Třída</th>
                            <th className="px-3 py-2 text-left">Hodnocení</th>
                            <th className="px-3 py-2 text-right">Aktuální</th>
                            <th className="px-3 py-2 text-right">Deficit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(selectedKalkulace.vysledek.ziviny).map(([key, data]) => (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-semibold">{key}</td>
                              <td className="px-3 py-2">{data.trida}</td>
                              <td className="px-3 py-2" style={{ color: data.tridaBarva }}>
                                {data.tridaNazev}
                              </td>
                              <td className="px-3 py-2 text-right">{data.aktualni} mg/kg</td>
                              <td className="px-3 py-2 text-right font-semibold">
                                {data.deficit_kg_ha ? `${data.deficit_kg_ha} kg/ha` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Poznámka */}
                    <div>
                      <label className="block font-semibold text-gray-900 mb-2">
                        Poznámka
                      </label>
                      <textarea
                        value={selectedKalkulace.poznamka || ''}
                        onChange={(e) => {
                          const updated = { ...selectedKalkulace, poznamka: e.target.value };
                          setSelectedKalkulace(updated);
                        }}
                        rows={3}
                        className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
                        placeholder="Interní poznámka (jen pro administrátory)..."
                      />
                    </div>

                    {/* Akce */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          updateKalkulace(selectedKalkulace.id, { 
                            poznamka: selectedKalkulace.poznamka 
                          });
                          setKalkulace(getKalkulace());
                          showSaveMessage("Poznámka uložena");
                          setSelectedKalkulace(null);
                        }}
                        className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
                      >
                        Uložit
                      </button>
                      <button
                        onClick={() => setSelectedKalkulace(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
                      >
                        Zavřít
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

// Article Form Modal Component
function ArticleFormModal({
  article,
  onSave,
  onClose,
}: {
  article: Article | null;
  onSave: (article: Article) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Article>(
    article || {
      id: "",
      slug: "",
      nadpis: "",
      kategorie: "ziviny",
      perex: "",
      obsah: "",
      obrazek_url: "",
      datum_publikace: new Date().toISOString(),
      cas_cteni: 5,
      publikovano: false,
      autor: "Démon agro",
      meta_description: "",
    }
  );

  // Auto-generate slug from title
  useEffect(() => {
    if (!article && formData.nadpis) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(formData.nadpis)
      }));
    }
  }, [formData.nadpis, article]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {article ? "Upravit článek" : "Přidat článek"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Nadpis článku *
            </label>
            <input
              type="text"
              value={formData.nadpis}
              onChange={(e) => setFormData({ ...formData, nadpis: e.target.value })}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              placeholder="Optimální pH půdy pro dostupnost živin"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              placeholder="optimalni-ph-pudy-pro-dostupnost-zivin"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL článku: /vzdelavani/{formData.slug || "nazev-clanku"}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">Kategorie *</label>
            <select
              value={formData.kategorie}
              onChange={(e) => setFormData({ ...formData, kategorie: e.target.value as any })}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
            >
              <option value="ph">pH půdy</option>
              <option value="vapneni">Vápnění</option>
              <option value="ziviny">Živiny</option>
              <option value="vyzkumy">Výzkumy</option>
              <option value="tipy">Tipy pro zemědělce</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Perex / Úryvek (max 200 znaků) *
            </label>
            <textarea
              value={formData.perex}
              onChange={(e) => setFormData({ ...formData, perex: e.target.value.slice(0, 200) })}
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
              placeholder="Krátký úryvek, který se zobrazí na seznamu článků..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.perex.length}/200
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-4">Obrázek článku</label>
            <ImageUpload
              currentUrl={formData.obrazek_url}
              productName={formData.nadpis || "clanek"}
              onUploadSuccess={(url) => {
                setFormData({ ...formData, obrazek_url: url });
              }}
            />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">nebo zadejte URL</span>
              </div>
            </div>
            <input
              type="url"
              value={formData.obrazek_url}
              onChange={(e) => setFormData({ ...formData, obrazek_url: e.target.value })}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Obsah článku (Markdown) *
            </label>
            <textarea
              value={formData.obsah}
              onChange={(e) => setFormData({ ...formData, obsah: e.target.value })}
              rows={20}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none font-mono text-sm"
              placeholder="## Nadpis&#10;&#10;Text článku...&#10;&#10;### Podnadpis&#10;&#10;- Seznam&#10;- položek"
            />
            <p className="text-sm text-gray-500 mt-1">
              Podporuje Markdown: ## Nadpis, **tučné**, *kurzíva*, tabulky, seznamy
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Datum publikace
              </label>
              <input
                type="date"
                value={formData.datum_publikace.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, datum_publikace: new Date(e.target.value).toISOString() })}
                className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Čas čtení (minuty)
              </label>
              <input
                type="number"
                value={formData.cas_cteni}
                onChange={(e) => setFormData({ ...formData, cas_cteni: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Meta description (SEO, max 160 znaků)
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value.slice(0, 160) })}
              maxLength={160}
              rows={2}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none"
              placeholder="Krátký popis pro vyhledávače..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.meta_description.length}/160
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.publikovano}
                onChange={(e) => setFormData({ ...formData, publikovano: e.target.checked })}
                className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59] rounded"
              />
              <span className="font-semibold text-gray-900">Publikovat článek</span>
            </label>
            <p className="text-sm text-gray-500 ml-6 mt-1">
              Nepublikované články se ukládají jako koncepty
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => onSave(formData)}
              className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
            >
              {formData.publikovano ? "Uložit a publikovat" : "Uložit koncept"}
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

      {pageKey !== "privacy-policy" && pageKey !== "kontakt" && (
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
      )}

      {pageKey === "kontakt" && (
        <>
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Facebook URL
            </label>
            <input
              type="text"
              value={content.facebook_url || ""}
              onChange={(e) => handleChange("facebook_url", e.target.value)}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Instagram URL
            </label>
            <input
              type="text"
              value={content.instagram_url || ""}
              onChange={(e) => handleChange("instagram_url", e.target.value)}
              className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              placeholder="https://instagram.com/..."
            />
          </div>
        </>
      )}

      {pageKey !== "home" && pageKey !== "onas" && pageKey !== "privacy-policy" && pageKey !== "kontakt" && (
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

      {pageKey === "privacy-policy" && (
        <div>
          <label className="block font-semibold text-gray-900 mb-2">
            Text zásad (Markdown)
          </label>
          <textarea
            value={content.privacy_text || ""}
            onChange={(e) => handleChange("privacy_text", e.target.value)}
            rows={20}
            className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none resize-none font-mono text-sm"
            placeholder="# Zásady ochrany osobních údajů..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Podporuje Markdown formátování
          </p>
        </div>
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
