"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/assets/loading.json";

interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
  order: number;
}

interface Category {
  id: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string | null;
  price: number | null;
  images: ProductImage[];
  categories: Category[];
}

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=1000");
      const data = await res.json();
      setProducts(data.data || data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Collect unique categories
  const allCategories = Array.from(new Map(products.flatMap((p) => p.categories.map((pc) => pc.category)).map((c) => [c.id, c])).values());

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "all" || p.categories.some((pc) => pc.category.id === selectedCategory);
    return matchSearch && matchCategory;
  });

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setModalImageLoading(true);
    setCurrentImageIndex(0);
    setShowFullDescription(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setShowFullDescription(false);
    setModalImageLoading(true);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && currentImageIndex < selectedProduct.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setModalImageLoading(true);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setModalImageLoading(true);
    }
  };

  const handleImageLoad = (id: string) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageLoadStart = (id: string) => {
    setLoadingImages((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="font-jakarta bg-white text-gray-900 min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-black tracking-wide">
            All{" "}
            <span className="font-citadel italic font-normal" style={{ color: "#162E93" }}>
              Products
            </span>
          </h1>
          <p className="mt-4 text-gray-500">Temukan koleksi lengkap buket bunga &amp; seserahan kami</p>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-row gap-8 items-start">
          {/* LEFT SIDEBAR */}
          <aside className="w-44 shrink-0 sticky top-28 space-y-6">
            {/* Search */}
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-0 bottom-0 my-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#162E93" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                style={{ backgroundColor: "#e7eafd", color: "#162E93", border: "none" }}
              />
            </div>

            {/* Filters label */}
            <p className="text-lg font-bold text-gray-900">Filters</p>

            {/* Categories */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#162E93" }}>
                Kategori ({allCategories.length})
              </p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`text-sm flex items-center gap-2 w-full text-left transition-colors ${selectedCategory === "all" ? "font-semibold" : "text-gray-500 hover:text-gray-800"}`}
                    style={selectedCategory === "all" ? { color: "#162E93" } : {}}
                  >
                    <span className={`w-3 h-3 rounded-sm border shrink-0 ${selectedCategory === "all" ? "border-transparent" : "border-gray-300"}`} style={selectedCategory === "all" ? { backgroundColor: "#162E93" } : {}} />
                    Semua
                  </button>
                </li>
                {allCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-sm flex items-center gap-2 w-full text-left transition-colors ${selectedCategory === cat.id ? "font-semibold" : "text-gray-500 hover:text-gray-800"}`}
                      style={selectedCategory === cat.id ? { color: "#162E93" } : {}}
                    >
                      <span className={`w-3 h-3 rounded-sm border shrink-0`} style={selectedCategory === cat.id ? { backgroundColor: "#162E93", borderColor: "#162E93" } : { borderColor: "#d1d5db" }} />
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Count */}
            {!loading && (
              <p className="text-xs text-gray-400">
                <span className="font-semibold" style={{ color: "#162E93" }}>
                  {filtered.length}
                </span>{" "}
                produk
              </p>
            )}

            {/* Reset */}
            {(selectedCategory !== "all" || search !== "") && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearch("");
                }}
                className="text-xs underline text-gray-400 hover:text-gray-600 transition-colors"
              >
                Reset filter
              </button>
            )}
          </aside>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0">
            {/* Grid */}
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="w-32 h-32">
                  <Lottie animationData={loadingAnimation} loop={true} />
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <p className="text-lg">Tidak ada produk ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((item) => {
                  const mainImage = item.images.find((img) => img.isMain) || item.images[0];
                  const isImgLoading = loadingImages[item.id] !== false;

                  return (
                    <div
                      key={item.id}
                      className="relative cursor-pointer rounded-2xl overflow-hidden bg-white border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-4"
                      style={{ borderColor: "#e7eafd" }}
                      onClick={() => openModal(item)}
                    >
                      {isImgLoading && (
                        <div className="absolute inset-0 h-60 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Loading...</span>
                        </div>
                      )}
                      <div className={`transition-opacity duration-300 rounded-xl overflow-hidden ${isImgLoading ? "opacity-0" : "opacity-100"}`}>
                        {mainImage && (
                          <Image
                            src={mainImage.imageUrl}
                            alt={item.name}
                            width={300}
                            height={240}
                            className="w-full h-56 object-contain bg-gray-50 rounded-xl"
                            onLoad={() => handleImageLoad(item.id)}
                            onLoadStart={() => handleImageLoadStart(item.id)}
                            loading="lazy"
                          />
                        )}
                      </div>

                      <h3 className="mt-3 font-semibold text-sm text-gray-900 line-clamp-2">{item.name}</h3>

                      {item.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.categories.slice(0, 2).map((pc) => (
                            <span key={pc.id} className="px-2 py-0.5 text-[10px] rounded-full border" style={{ backgroundColor: "#e7eafd", color: "#162E93", borderColor: "#b6bfe7" }}>
                              {pc.category.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-sm mt-2 font-medium" style={{ color: "#162E93" }}>
                        {item.price ? `Rp ${item.price.toLocaleString()}` : "Hubungi kami"}
                      </p>

                      <a
                        href={`https://wa.me/6285732286669?text=Halo%20Oursee,%20saya%20ingin%20memesan%20${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block w-full text-center px-4 py-2 border rounded-full text-xs font-medium hover:text-white transition"
                        style={{ borderColor: "#162E93", color: "#162E93" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pesan Sekarang
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-3xl font-serif font-bold text-gray-900">Detail Produk</h2>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Images */}
                <div className="bg-gray-50 p-8">
                  <div className="sticky top-0">
                    <div className="aspect-square overflow-hidden mb-4 relative group">
                      {modalImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                          <div className="w-32 h-32">
                            <Lottie animationData={loadingAnimation} loop={true} />
                          </div>
                        </div>
                      )}
                      {selectedProduct.images && selectedProduct.images.length > 0 && (
                        <Image src={selectedProduct.images[currentImageIndex].imageUrl} alt={selectedProduct.name} width={600} height={600} className="w-full h-full object-contain" onLoad={() => setModalImageLoading(false)} />
                      )}
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            disabled={currentImageIndex === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed z-20"
                          >
                            ‹
                          </button>
                          <button
                            onClick={nextImage}
                            disabled={currentImageIndex === selectedProduct.images.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed z-20"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-20">
                            {currentImageIndex + 1} / {selectedProduct.images.length}
                          </div>
                        </>
                      )}
                    </div>
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-3">
                        {selectedProduct.images.map((image, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setModalImageLoading(true);
                            }}
                            className={`aspect-square overflow-hidden transition-all cursor-pointer ${currentImageIndex === index ? "ring-4 ring-blue-500 opacity-100" : "opacity-60 hover:opacity-100"}`}
                          >
                            <Image src={image.imageUrl} alt={`View ${index + 1}`} width={120} height={120} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">{selectedProduct.name}</h3>

                    {selectedProduct.categories && selectedProduct.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedProduct.categories.map((pc) => (
                          <span key={pc.id} className="px-3 py-1 text-sm rounded-full" style={{ backgroundColor: "#e7eafd", color: "#162E93" }}>
                            {pc.category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-3xl font-bold mb-6" style={{ color: "#162E93" }}>
                      {selectedProduct.price ? `Rp ${selectedProduct.price.toLocaleString()}` : "Hubungi kami"}
                    </div>

                    {selectedProduct.description && (
                      <div className="space-y-4">
                        <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                          {showFullDescription ? selectedProduct.description : selectedProduct.description.length > 150 ? selectedProduct.description.substring(0, 150) + "..." : selectedProduct.description}
                        </div>
                        {selectedProduct.description.length > 150 && !showFullDescription && (
                          <button onClick={() => setShowFullDescription(true)} className="font-medium hover:underline" style={{ color: "#162E93" }}>
                            Lihat semua deskripsi
                          </button>
                        )}
                        {showFullDescription && (
                          <button onClick={() => setShowFullDescription(false)} className="text-gray-500 hover:text-gray-600 font-medium hover:underline">
                            Sembunyikan deskripsi
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <a
                      href={`https://wa.me/6285732286669?text=Halo%20Oursee,%20saya%20ingin%20memesan%20${encodeURIComponent(selectedProduct.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      Pesan via WhatsApp
                    </a>
                    <button onClick={closeModal} className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
