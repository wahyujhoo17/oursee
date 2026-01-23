"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
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
    if (
      selectedProduct &&
      selectedProduct.images &&
      selectedProduct.images.length > 0 &&
      currentImageIndex < selectedProduct.images.length - 1
    ) {
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
    <div
      className={`font-jakarta bg-white text-gray-900 transition-opacity duration-700 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <Navbar />

      <section className="bg-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-black">
          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-snug space-y-1">
            <span className="block">
              TRANSFORMING
              <span className="font-citadel italic text-blue-600 font-normal">
                Floral Dreams
              </span>
            </span>
            <span className="block">INTO LUXURIOUS REALITY</span>
            <span className="block">
              FOR
              <span className="font-citadel italic text-blue-600 font-normal">
                Unforgettable
              </span>
            </span>
            <span className="block">WEDDINGS & EVENTS</span>
          </h1>

          <p className="mt-6 text-base text-gray-600">
            Elegantly curated floral experiences designed to captivate and
            inspire.
          </p>

          <div className="mt-8">
            <a
              href="#produk"
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 transition text-white font-semibold rounded-full"
            >
              Discover More
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl leading-snug">
              <span className="font-citadel text-gray-700">Elevating</span>
              <span className="font-serif text-blue-600 font-bold"> YOUR</span>
              <br />
              <span className="font-serif text-blue-600 font-bold">
                EVENTS WITH
              </span>
              <br />
              <span className="font-citadel text-gray-700">Bespoke</span>
              <span className="font-serif text-blue-600 font-bold">
                {" "}
                FLORAL
              </span>
              <br />
              <span className="font-serif text-blue-600 font-bold">DESIGN</span>
            </h1>

            <p className="mt-4 text-gray-600">
              Desain bunga artistik yang disesuaikan untuk setiap acara spesial
              Anda.
            </p>

            <div className="mt-6 flex gap-4">
              <a
                href="#produk"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:opacity-80 transition"
              >
                Lihat Koleksi
              </a>
              <a
                href="#order"
                className="px-6 py-3 border border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition"
              >
                Pesan
              </a>
            </div>
          </div>
          <Image
            src="/assets/oursee.png"
            alt="Bunga monokrom"
            width={500}
            height={500}
            className="w-[500px] mx-auto"
            priority
          />
        </div>
      </section>

      <section id="produk" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-black inline-block tracking-wide">
              New
              <span className="font-citadel italic font-normal text-blue-700">
                Product
              </span>
            </h2>

            <div className="mt-4">
              <a
                href="#all-products"
                className="px-5 py-1.5 border border-blue-700 text-blue-700 text-sm rounded-full hover:bg-blue-700 hover:text-white transition"
              >
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
                const mainImage =
                  item.images.find((img) => img.isMain) || item.images[0];
                const isLoading = loadingImages[item.id] !== false;

                return (
                  <div
                    key={item.id}
                    className="relative cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-4"
                    onClick={() => openModal(item)}
                  >
                    {/* Skeleton Loader */}
                    {isLoading && (
                      <div className="absolute inset-0 w-full h-72 bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                        <div className="text-gray-400">Loading...</div>
                      </div>
                    )}

                    {/* Image */}
                    <div
                      className={`transition-opacity duration-300 rounded-xl overflow-hidden ${
                        isLoading ? "opacity-0" : "opacity-100"
                      }`}
                    >
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

                    {/* Product Info with Skeleton */}
                    {isLoading ? (
                      <div className="mt-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
                        <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
                        <div className="h-10 bg-gray-200 rounded-full animate-pulse mx-auto w-32"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="mt-4 font-semibold text-lg text-gray-900">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="mt-2 text-xs text-gray-500 line-clamp-2 px-2">
                            {item.description.length > 80
                              ? item.description.substring(0, 80) + "..."
                              : item.description}
                          </p>
                        )}
                        {item.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center mt-2">
                            {item.categories.slice(0, 2).map((pc) => (
                              <span
                                key={pc.id}
                                className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full border border-blue-200"
                              >
                                {pc.category.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-gray-600 mt-2">
                          {item.price
                            ? `Rp ${item.price.toLocaleString()}`
                            : "Hubungi kami"}
                        </p>
                        <a
                          href="#order"
                          className="mt-3 inline-block px-5 py-2 border border-blue-700 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Add to bag
                        </a>
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
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                {getVisiblePages().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-gray-400"
                      >
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
                      className={`relative transition-all duration-300 text-sm ${
                        isActive
                          ? "text-blue-700 font-bold scale-110"
                          : "text-gray-500 hover:text-blue-700 hover:bg-gray-50 rounded-full px-3 py-1"
                      }`}
                    >
                      {isActive ? (
                        <span className="relative inline-flex items-center justify-center w-10 h-10">
                          {/* Flower SVG Background */}
                          <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Flower petals */}
                            <circle
                              cx="50"
                              cy="20"
                              r="18"
                              fill="#93c5fd"
                              opacity="0.8"
                            />
                            <circle
                              cx="80"
                              cy="50"
                              r="18"
                              fill="#93c5fd"
                              opacity="0.8"
                            />
                            <circle
                              cx="50"
                              cy="80"
                              r="18"
                              fill="#93c5fd"
                              opacity="0.8"
                            />
                            <circle
                              cx="20"
                              cy="50"
                              r="18"
                              fill="#93c5fd"
                              opacity="0.8"
                            />
                            <circle
                              cx="73"
                              cy="27"
                              r="15"
                              fill="#bfdbfe"
                              opacity="0.8"
                            />
                            <circle
                              cx="73"
                              cy="73"
                              r="15"
                              fill="#bfdbfe"
                              opacity="0.8"
                            />
                            <circle
                              cx="27"
                              cy="73"
                              r="15"
                              fill="#bfdbfe"
                              opacity="0.8"
                            />
                            <circle
                              cx="27"
                              cy="27"
                              r="15"
                              fill="#bfdbfe"
                              opacity="0.8"
                            />
                            {/* Center circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="26"
                              fill="#3b82f6"
                              opacity="0.9"
                            />
                          </svg>
                          <span className="relative z-10">{pageNum}</span>
                        </span>
                      ) : (
                        pageNum
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
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

      <section id="info" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-black text-center mb-16">
            Our
            <span className="font-citadel italic font-normal text-blue-700">
              Location
            </span>
          </h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="w-full h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.3123456789!2d112.7500!3d-7.2500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f9c123456789%3A0xabcdef123456789!2sKarang%20Empat%20IX%20No.34%2C%20Surabaya!5e0!3m2!1sid!2sid!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
              />
            </div>

            <div className="bg-white border-2 border-blue-600 rounded-xl p-10 text-center">
              <p className="text-blue-700 text-2xl font-bold leading-relaxed mb-4">
                BUKET BUNGA & SESERAHAN OURSEE.CO
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Karang Empat IX No.34 <br />
                Surabaya, Indonesia
              </p>
              <p className="text-lg">
                <a
                  href="https://wa.me/6285732286669?text=Halo%20Oursee.co,%20saya%20ingin%20memesan%20buket%20bunga."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-800 hover:underline font-medium"
                >
                  0857-3228-6669
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">&copy; 2026 Oursee. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-3xl font-serif font-bold text-gray-900">
                Detail Produk
              </h2>
              <button
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 text-xl"
              >
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
                            <Lottie
                              animationData={loadingAnimation}
                              loop={true}
                            />
                          </div>
                        </div>
                      )}
                      {selectedProduct.images &&
                        selectedProduct.images.length > 0 && (
                          <Image
                            src={
                              selectedProduct.images[currentImageIndex].imageUrl
                            }
                            alt={selectedProduct.name}
                            width={600}
                            height={600}
                            className="w-full h-full object-contain"
                            onLoad={() => setModalImageLoading(false)}
                          />
                        )}

                      {/* Navigation Buttons */}
                      {selectedProduct.images &&
                        selectedProduct.images.length > 1 && (
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
                              disabled={
                                currentImageIndex ===
                                selectedProduct.images.length - 1
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed z-20"
                            >
                              ›
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-20">
                              {currentImageIndex + 1} /{" "}
                              {selectedProduct.images.length}
                            </div>
                          </>
                        )}
                    </div>

                    {/* Thumbnail Navigation */}
                    {selectedProduct.images &&
                      selectedProduct.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                          {selectedProduct.images.map((image, index) => (
                            <div
                              key={index}
                              onClick={() => goToImage(index)}
                              className={`aspect-square overflow-hidden transition-all cursor-pointer ${
                                currentImageIndex === index
                                  ? "ring-4 ring-blue-500 opacity-100"
                                  : "opacity-60 hover:opacity-100"
                              }`}
                            >
                              <Image
                                src={image.imageUrl}
                                alt={`Product view ${index + 1}`}
                                width={120}
                                height={120}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                      {selectedProduct.name}
                    </h3>

                    {selectedProduct.categories &&
                      selectedProduct.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {selectedProduct.categories.map((pc) => (
                            <span
                              key={pc.id}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                            >
                              {pc.category.name}
                            </span>
                          ))}
                        </div>
                      )}

                    {/* Price */}
                    <div className="text-3xl font-bold text-blue-600 mb-6">
                      {selectedProduct.price
                        ? `Rp ${selectedProduct.price.toLocaleString()}`
                        : "Hubungi kami"}
                    </div>

                    {/* Description */}
                    {selectedProduct.description && (
                      <div className="space-y-4">
                        <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                          {showFullDescription
                            ? selectedProduct.description
                            : selectedProduct.description.length > 150
                              ? selectedProduct.description.substring(0, 150) +
                                "..."
                              : selectedProduct.description}
                        </div>

                        {selectedProduct.description.length > 150 &&
                          !showFullDescription && (
                            <button
                              onClick={() => setShowFullDescription(true)}
                              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                            >
                              Lihat semua deskripsi
                            </button>
                          )}

                        {showFullDescription && (
                          <button
                            onClick={() => setShowFullDescription(false)}
                            className="text-gray-500 hover:text-gray-600 font-medium hover:underline transition-colors"
                          >
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

                    <button
                      onClick={closeModal}
                      className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
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
