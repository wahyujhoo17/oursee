"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/assets/loading.json";

interface HomeProps {
  fadeIn: boolean;
}

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

export default function Home({ fadeIn }: HomeProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemsPerPage = 4;

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

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNum: number) => {
    if (pageNum !== currentPage && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setModalImageLoading(true);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setShowFullDescription(false);
    setModalImageLoading(true);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && currentImageIndex < selectedProduct.images.length - 1) {
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

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setModalImageLoading(true);
  };

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const mainImage = product.images.find((img) => img.isMain) || product.images[0];
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, imageUrl: mainImage?.imageUrl ?? "", quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateCartQty = (id: string, qty: number) => {
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const handleShare = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const shareData = {
      title: product.name,
      text: `${product.name}${product.price ? ` - Rp ${product.price.toLocaleString()}` : ""}\n\nLihat produk kami di Oursee.co`,
      url: `${window.location.origin}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled or error, do nothing
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert("Link produk disalin ke clipboard!");
    }
  };

  // Helper function to process description
  const processDescription = (caption: string, isFull: boolean = false) => {
    // Remove product name from first line
    const lines = caption.split("\n").slice(1);

    // Filter out lines that start with # (hashtags)
    const filteredLines = lines.filter((line) => !line.trim().startsWith("#"));

    // Join back and clean up
    let description = filteredLines.join("\n").trim();

    // If not showing full description, limit to first 150 characters
    if (!isFull && description.length > 150) {
      description = description.substring(0, 150) + "...";
    }

    return description;
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const getVisiblePages = () => {
    const delta = 2; // jumlah halaman yang ditampilkan di kiri dan kanan halaman aktif
    const range = [];

    // Jika total halaman <= 7, tampilkan semua
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    // Selalu tampilkan halaman pertama
    range.push(1);

    // Hitung range di sekitar halaman aktif
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Tambahkan ellipsis jika ada gap setelah halaman pertama
    if (start > 2) {
      range.push("...");
    }

    // Tambahkan halaman di sekitar aktif
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Tambahkan ellipsis jika ada gap sebelum halaman terakhir
    if (end < totalPages - 1) {
      range.push("...");
    }

    // Selalu tampilkan halaman terakhir jika lebih dari 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const handleImageLoad = (id: string) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageLoadStart = (id: string) => {
    setLoadingImages((prev) => ({ ...prev, [id]: true }));
  };
  return (
    <div className={`font-jakarta bg-white text-gray-900 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      <Navbar cartCount={cartItems.length} onCartOpen={() => setIsCartOpen(true)} />

      <section className="bg-white pt-24 pb-16 relative overflow-hidden">
        {/* LEFT SVG */}
        <Image src="/assets/kiri.svg" alt="left decoration" width={360} height={360} className="hidden md:block absolute left-10 top-1/2 -translate-y-1/2 w-70 h-auto opacity-100 z-0 pointer-events-none" priority />

        {/* RIGHT SVG */}
        <Image src="/assets/kanan.svg" alt="right decoration" width={360} height={360} className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 w-70 h-auto opacity-100 z-0 pointer-events-none" priority />

        <div className="max-w-4xl mx-auto px-6 text-center text-black relative z-10">
          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-snug space-y-1">
            <span className="block">
              TRANSFORMING
              <span className="font-citadel italic font-normal" style={{ color: "#162E93" }}>
                {" "}
                Floral Dreams
              </span>
            </span>

            <span className="block">INTO LUXURIOUS REALITY</span>

            <span className="block">
              FOR
              <span className="font-citadel italic font-normal" style={{ color: "#162E93" }}>
                {" "}
                Unforgettable
              </span>
            </span>

            <span className="block">WEDDINGS & EVENTS</span>
          </h1>

          <p className="mt-6 text-base text-gray-600">Elegantly curated floral experiences designed to captivate and inspire.</p>

          <div className="mt-8">
            <a href="#produk" className="px-6 py-3 transition text-white font-semibold rounded-full hover:opacity-80" style={{ backgroundColor: "#162E93" }}>
              Discover More
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-[2.3rem] md:text-[2.9rem] leading-snug">
              <span className="font-citadel text-gray-700">Elevating</span>
              <span className="font-serif font-bold" style={{ color: "#162E93" }}>
                {" "}
                YOUR
              </span>
              <span className="block -mt-2" />
              <span className="font-serif font-bold" style={{ color: "#162E93" }}>
                EVENTS WITH
              </span>
              <span className="block -mt-2" />
              <span className="font-citadel text-gray-700">Bespoke</span>
              <span className="font-serif font-bold" style={{ color: "#162E93" }}>
                {" "}
                FLORAL
              </span>
              <span className="block -mt-2" />
              <span className="font-serif font-bold" style={{ color: "#162E93" }}>
                DESIGN
              </span>
            </h1>

            <p className="mt-4 text-gray-600 text-[1rem]">Desain bunga artistik yang disesuaikan untuk setiap acara spesial Anda.</p>

            <div className="mt-6 flex gap-4">
              <a href="#produk" className="px-7 py-3 text-white rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95" style={{ backgroundColor: "#162E93" }}>
                Lihat Koleksi
              </a>

              <a href="#order" className="px-7 py-3 border border-black text-black rounded-full font-semibold text-sm hover:bg-black hover:text-white transition-all duration-300 hover:scale-105 active:scale-95">
                Pesan
              </a>
            </div>
          </div>

          <div className="flex justify-end">
            <Image src="/assets/hydra.svg" alt="Floral illustration" width={450} height={450} className="w-112.5 md:-mr-10" priority />
          </div>
        </div>
      </section>

      <section id="produk" className="bg-white py-16 -mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-black inline-block tracking-wide">
              New
              <span className="font-citadel italic font-normal" style={{ color: "#162E93" }}>
                Product
              </span>
            </h2>

            <div className="mt-4">
              <a href="/all-products" className="px-5 py-1.5 border text-sm rounded-full hover:text-white transition" style={{ borderColor: "#162E93", color: "#162E93" }}>
                see all
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {loading ? (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-600">No products available</p>
              </div>
            ) : (
              currentProducts.map((item: Product) => {
                const mainImage = item.images.find((img) => img.isMain) || item.images[0];
                const isLoading = loadingImages[item.id] !== false;

                return (
                  <div
                    key={item.id}
                    className="relative cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-4"
                    style={{ borderColor: "#162E93" }}
                    onClick={() => openModal(item)}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 w-full h-72 bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                        <div className="text-gray-400">Loading...</div>
                      </div>
                    )}

                    <div className={`transition-opacity duration-300 rounded-xl overflow-hidden ${isLoading ? "opacity-0" : "opacity-100"}`}>
                      {mainImage && (
                        <Image
                          src={mainImage.imageUrl}
                          alt={item.name}
                          width={300}
                          height={288}
                          className="w-full h-72 object-contain bg-gray-50 rounded-xl"
                          onLoad={() => handleImageLoad(item.id)}
                          onLoadStart={() => handleImageLoadStart(item.id)}
                          loading="lazy"
                        />
                      )}
                    </div>

                    {isLoading ? (
                      <div className="mt-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
                        <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
                        <div className="h-10 bg-gray-200 rounded-full animate-pulse mx-auto w-32"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="mt-4 font-semibold text-lg text-gray-900">{item.name}</h3>

                        {item.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center mt-2">
                            {item.categories.slice(0, 2).map((pc) => (
                              <span key={pc.id} className="px-2 py-0.5 text-[10px] rounded-full border" style={{ backgroundColor: "#e7eafd", color: "#162E93", borderColor: "#b6bfe7" }}>
                                {pc.category.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-gray-600 mt-2">{item.price ? `Rp ${item.price.toLocaleString()}` : "Hubungi kami"}</p>

                        <div className="flex justify-center gap-3 mt-3">
                          <button
                            onClick={(e) => addToCart(e, item)}
                            className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 hover:bg-[#162E93] hover:text-white hover:border-[#162E93] group text-[#162E93] border-[#162E93]"
                            title="Tambah ke keranjang"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleShare(e, item)}
                            className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 hover:bg-[#162E93] hover:text-white hover:border-[#162E93] text-[#162E93] border-[#162E93]"
                            title="Bagikan produk"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <>
              <div className="flex justify-center items-center gap-3 mt-12">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: currentPage === 1 ? undefined : "#162E93" }}>
                  &lt;
                </button>

                {getVisiblePages().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  const pageNum = page as number;
                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      className={`relative transition-all duration-300 text-sm ${isActive ? "font-bold scale-110" : "text-gray-500 hover:bg-gray-50 rounded-full px-3 py-1"}`}
                      style={isActive ? { color: "#162E93" } : {}}
                    >
                      {isActive ? (
                        <span className="relative inline-flex items-center justify-center w-10 h-10">
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="20" r="18" fill="#162E93" opacity="0.8" />
                            <circle cx="80" cy="50" r="18" fill="#162E93" opacity="0.8" />
                            <circle cx="50" cy="80" r="18" fill="#162E93" opacity="0.8" />
                            <circle cx="20" cy="50" r="18" fill="#162E93" opacity="0.8" />
                            <circle cx="73" cy="27" r="15" fill="#162E93" opacity="0.7" />
                            <circle cx="73" cy="73" r="15" fill="#162E93" opacity="0.7" />
                            <circle cx="27" cy="73" r="15" fill="#162E93" opacity="0.7" />
                            <circle cx="27" cy="27" r="15" fill="#162E93" opacity="0.7" />
                            <circle cx="50" cy="50" r="26" fill="#162E93" opacity="0.9" />
                          </svg>
                          <span className="relative z-10">{pageNum}</span>
                        </span>
                      ) : (
                        pageNum
                      )}
                    </button>
                  );
                })}

                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: currentPage === totalPages ? undefined : "#162E93" }}>
                  &gt;
                </button>
              </div>

              <div className="text-center mt-4 text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </div>
            </>
          )}
        </div>
      </section>

      <section id="info" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-black inline-block tracking-wide">
              Our{" "}
              <span className="font-citadel italic font-normal" style={{ color: "#162E93" }}>
                Location
              </span>
            </h2>
            <p className="mt-4 text-gray-500 text-base">Kunjungi kami atau hubungi langsung untuk konsultasi</p>
          </div>

          {/* Card + Map */}
          <div className="grid lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
            {/* Info Card */}
            <div className="lg:col-span-2 p-10 flex flex-col justify-between bg-white">
              <div>
                <div className="mb-8">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#162E93" }}>
                    Toko Kami
                  </span>
                  <h3 className="text-2xl font-serif font-bold mt-2 leading-snug text-gray-900">
                    Buket Bunga &amp;
                    <br />
                    Seserahan Oursee.co
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#e7eafd" }}>
                      <svg className="w-5 h-5" style={{ color: "#162E93" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-400 mb-1">Alamat</p>
                      <p className="text-gray-700 leading-relaxed">
                        Karang Empat IX No.34
                        <br />
                        Surabaya, Indonesia
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#e7eafd" }}>
                      <svg className="w-5 h-5" style={{ color: "#162E93" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-400 mb-1">Telepon / WhatsApp</p>
                      <a href="https://wa.me/6285732286669" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline transition-colors" style={{ color: "#162E93" }}>
                        0857-3228-6669
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#e7eafd" }}>
                      <svg className="w-5 h-5" style={{ color: "#162E93" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-400 mb-1">Jam Operasional</p>
                      <p className="text-gray-700">
                        Senin – Sabtu
                        <br />
                        08.00 – 20.00 WIB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <a
                href="https://wa.me/6285732286669?text=Halo%20Oursee.co,%20saya%20ingin%20memesan%20buket%20bunga."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 flex items-center justify-center gap-3 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:opacity-80 hover:scale-105 active:scale-95 shadow-md"
                style={{ backgroundColor: "#162E93" }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi via WhatsApp
              </a>
            </div>

            {/* Map */}
            <div className="lg:col-span-3 h-80 lg:h-auto" style={{ minHeight: "420px" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.3123456789!2d112.7500!3d-7.2500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f9c123456789%3A0xabcdef123456789!2sKarang%20Empat%20IX%20No.34%2C%20Surabaya!5e0!3m2!1sid!2sid!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: "#e7eafd" }}>
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Image src="/assets/logo.png" alt="Oursee.co" width={200} height={70} className="mb-3" />
            <p className="text-sm leading-relaxed" style={{ color: "#162E93" }}>
              Transforming floral dreams into luxurious reality for unforgettable weddings &amp; events.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.instagram.com/oursee.co"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: "#162E93" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/6285732286669"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: "#162E93" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "#162E93" }}>
              Navigasi
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Beranda", href: "#" },
                { label: "Koleksi Produk", href: "#produk" },
                { label: "Pesan Sekarang", href: "#order" },
                { label: "Lokasi Kami", href: "#info" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors duration-200 hover:opacity-70 inline-block" style={{ color: "#162E93" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "#162E93" }}>
              Kontak
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3" style={{ color: "#162E93" }}>
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#162E93" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Karang Empat IX No.34, Surabaya
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 shrink-0" style={{ color: "#162E93" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a href="https://wa.me/6285732286669" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-colors font-medium" style={{ color: "#162E93" }}>
                  0857-3228-6669
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div>
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: "#162E93", borderTop: "1px solid #b6bfe7" }}>
            <p>&copy; 2026 Oursee.co. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={removeFromCart} onUpdateQty={updateCartQty} />

      {/* Product Detail Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-3xl font-serif font-bold text-gray-900">Detail Produk</h2>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Product Images */}
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

                      {/* Navigation Buttons */}
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            disabled={currentImageIndex === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed z-20"
                          >
                            ‹
                          </button>
                          <button
                            onClick={nextImage}
                            disabled={currentImageIndex === selectedProduct.images.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed z-20"
                          >
                            ›
                          </button>

                          {/* Image Counter */}
                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-20">
                            {currentImageIndex + 1} / {selectedProduct.images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Navigation */}
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-3">
                        {selectedProduct.images.map((image, index) => (
                          <div
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`aspect-square overflow-hidden transition-all cursor-pointer ${currentImageIndex === index ? "ring-4 ring-blue-500 opacity-100" : "opacity-60 hover:opacity-100"}`}
                          >
                            <Image src={image.imageUrl} alt={`Product view ${index + 1}`} width={120} height={120} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
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

                    {/* Price */}
                    <div className="text-3xl font-bold mb-6" style={{ color: "#162E93" }}>
                      {selectedProduct.price ? `Rp ${selectedProduct.price.toLocaleString()}` : "Hubungi kami"}
                    </div>

                    {/* Description */}
                    {selectedProduct.description && (
                      <div className="space-y-4">
                        <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                          {showFullDescription ? selectedProduct.description : selectedProduct.description.length > 150 ? selectedProduct.description.substring(0, 150) + "..." : selectedProduct.description}
                        </div>

                        {selectedProduct.description.length > 150 && !showFullDescription && (
                          <button onClick={() => setShowFullDescription(true)} className="font-medium hover:underline transition-colors" style={{ color: "#162E93" }}>
                            Lihat semua deskripsi
                          </button>
                        )}

                        {showFullDescription && (
                          <button onClick={() => setShowFullDescription(false)} className="text-gray-500 hover:text-gray-600 font-medium hover:underline transition-colors">
                            Sembunyikan deskripsi
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <a
                      href={`https://wa.me/6285732286669?text=Halo%20Oursee,%20saya%20ingin%20memesan%20${encodeURIComponent(selectedProduct.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <span>Pesan via WhatsApp</span>
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
