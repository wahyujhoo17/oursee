"use client";

import { useState, useEffect } from "react";
import { message } from "antd";

interface Product {
  id: string;
  productCode: string;
  name: string;
  price: number;
  images?: Array<{ imageUrl: string; isMain: boolean }>;
  categories?: Array<{ category: { id: string; name: string } }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FormData {
  nama: string;
  no_telepon: string;
  kategori: string;
  jenis_produk: string;
  metode: "AMBIL_SENDIRI" | "PICKUP_GOJEK";
  tanggal: string;
  jam: string;
  wish_card: string;
  pesan: string;
  addons: {
    greeting_card: boolean;
    stick_card: boolean;
  };
}

export default function OrderFormPage() {
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    no_telepon: "",
    kategori: "",
    jenis_produk: "",
    metode: "AMBIL_SENDIRI",
    tanggal: "",
    jam: "",
    wish_card: "",
    pesan: "",
    addons: {
      greeting_card: false,
      stick_card: false,
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Order receipt states
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [waConfirmed, setWaConfirmed] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Nomor rekening disalin");
    } catch (error) {
      console.error("Failed to copy text:", error);
      message.error("Gagal menyalin nomor rekening");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=1000");
      const data = await res.json();
      setAllProducts(data.data || []);
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData({
      ...formData,
      kategori: categoryId,
      jenis_produk: "", // Reset product selection
    });

    if (categoryId) {
      // Filter products by category - only show products in this category
      const filtered = allProducts.filter((product) => {
        return product.categories?.some((pc) => pc.category.id === categoryId);
      });
      setProducts(filtered); // Only show filtered products, not all
    } else {
      setProducts([]); // Show no products if no category selected
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      const addonName = name as keyof typeof formData.addons;
      setFormData({
        ...formData,
        addons: {
          ...formData.addons,
          [addonName]: checked,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.nama || !formData.no_telepon || !formData.jenis_produk || !formData.tanggal || !formData.jam) {
      message.error("Mohon isi semua field yang wajib");
      return;
    }
    const [hours, minutes] = formData.jam.split(":").map((value) => Number(value));
    const pickupMinutes = hours * 60 + minutes;
    const minMinutes = 8 * 60;
    const maxMinutes = 19 * 60;
    if (Number.isNaN(pickupMinutes) || pickupMinutes < minMinutes || pickupMinutes > maxMinutes) {
      message.error("Jam pengambilan hanya tersedia 08.00 - 19.00");
      return;
    }

    try {
      setLoading(true);

      // Cari atau buat customer
      let customerId = "";
      try {
        // Cari customer berdasarkan nama
        const customerRes = await fetch("/api/customers");
        const customerData = await customerRes.json();
        const existingCustomer = customerData.data?.find((c: any) => c.phone === formData.no_telepon);

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Buat customer baru
          const createRes = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.nama,
              phone: formData.no_telepon,
              address: "",
            }),
          });
          const newCustomer = await createRes.json();
          customerId = newCustomer.id;
        }
      } catch (error) {
        console.error("Error handling customer:", error);
        message.error("Gagal memproses data customer");
        return;
      }

      // Find selected product
      const selectedProduct = products.find((p) => p.id === formData.jenis_produk);
      if (!selectedProduct) {
        message.error("Produk tidak ditemukan");
        return;
      }

      // Create order
      const orderPayload = {
        customerId,
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: 1,
            price: selectedProduct.price,
          },
        ],
        addons: {
          greeting_card: formData.addons.greeting_card,
          stick_card: formData.addons.stick_card,
        },
        deliveryMethod: formData.metode === "AMBIL_SENDIRI" ? "PICKUP" : "DELIVERY",
        pickupDate: new Date(`${formData.tanggal}T${formData.jam}`),
        pickupTime: formData.jam,
        recipientName: formData.nama,
        recipientPhone: formData.no_telepon,
        deliveryAddress: "",
        notes: `Isi Wish Card:\n${formData.wish_card}\n\nKatatan Tambahan: ${formData.pesan}\n\nAdd-ons:\n- Greeting Card: ${formData.addons.greeting_card ? "Ya" : "Tidak"}\n- Stick Card: ${formData.addons.stick_card ? "Ya" : "Tidak"}`,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const newOrder = await res.json();

        // Extract pickup code from notes
        const pickupCodeMatch = newOrder.notes?.match(/Pickup Code: (OS-\d+)/);
        const pickupCode = pickupCodeMatch ? pickupCodeMatch[1] : "OS-00";

        // Store order data for receipt display
        setOrderData({
          orderNumber: newOrder.orderNumber,
          pickupCode,
          nama: formData.nama,
          no_telepon: formData.no_telepon,
          metode: formData.metode === "AMBIL_SENDIRI" ? "Ambil Sendiri (Self Pickup)" : "Pickup Gojek",
          tanggal: formData.tanggal,
          jam: formData.jam,
          jenis: selectedProduct?.name || "",
          pesan: formData.pesan,
          pesanKartu: formData.wish_card,
          hargaBuket: selectedProduct?.price || 0,
          addonCard: formData.addons.greeting_card,
          addonStick: formData.addons.stick_card,
          totalAmount: newOrder.totalAmount,
        });

        setShowReceipt(true);
        setWaConfirmed(false);
        message.success("Pesanan berhasil dibuat!");

        // Reset form
        setFormData({
          nama: "",
          no_telepon: "",
          kategori: "",
          jenis_produk: "",
          metode: "AMBIL_SENDIRI",
          tanggal: "",
          jam: "",
          wish_card: "",
          pesan: "",
          addons: {
            greeting_card: false,
            stick_card: false,
          },
        });
      } else {
        message.error("Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      message.error("Terjadi kesalahan saat membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <section className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 relative">
          <p className="text-center text-gray-800 font-medium text-sm leading-snug pr-6">Ingin Memesan Koleksi Ini?</p>
          <p className="text-center text-gray-500 font-serif italic text-sm mt-0.5">Ciptakan Momen Istimewa Anda.</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="overflow-hidden rounded-2xl border p-4" style={{ borderColor: "#d9e2ff", background: "linear-gradient(135deg, #f6f9ff 0%, #ffffff 60%)" }}>
            <div className="flex items-center gap-3">
              {products[0]?.images?.find((img) => img.isMain) ? (
                <img src={products[0].images.find((img) => img.isMain)?.imageUrl} alt={products[0].name} className="w-16 h-16 rounded-xl border border-[#d9e2ff] bg-white shrink-0 shadow-sm object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-xl border border-[#d9e2ff] bg-white shrink-0 shadow-sm flex items-center justify-center text-xl font-bold text-[#162E93]">B</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5169b9" }}>
                  Detail Pesanan
                </p>
                <p className="font-bold text-gray-900 leading-tight">{products[0]?.name || "Koleksi Bouquet"}</p>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1" style={{ color: "#162E93", backgroundColor: "#e9efff" }}>
                  Rp {(products[0]?.price || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-white border border-[#d9e2ff] px-2.5 py-0.5 text-xs font-medium text-gray-600 shrink-0 self-start">Qty 1</span>
            </div>
          </div>

          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "#d9e2ff", backgroundColor: "#fcfdff" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Alur Pemesanan</p>
                <p className="text-xs text-gray-500 mt-1">Isi data di bawah, lalu kirim pesanan untuk masuk ke sistem admin.</p>
              </div>
              <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold text-white shrink-0" style={{ backgroundColor: "#162E93" }}>
                Online
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
              <div className="rounded-lg border border-[#d9e2ff] bg-white px-2 py-1.5 text-center">Isi Form</div>
              <div className="rounded-lg border border-[#d9e2ff] bg-white px-2 py-1.5 text-center">Review</div>
              <div className="rounded-lg border border-[#d9e2ff] bg-white px-2 py-1.5 text-center">Kirim</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama <span className="text-red-500">*</span>
              </label>
              <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#162E93] transition-colors" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#162E93] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <input type="number" min={1} defaultValue={1} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#162E93] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Produk <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#162E93] transition-colors"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Produk <span className="text-red-500">*</span>
              </label>
              {!formData.kategori ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-gray-600 text-sm">Silakan pilih kategori terlebih dahulu</div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((p) => {
                    const mainImage = p.images?.find((img) => img.isMain);
                    return (
                      <label key={p.id} className={`cursor-pointer rounded-xl border p-2 transition-all ${formData.jenis_produk === p.id ? "border-[#162E93] bg-blue-50" : "border-gray-200 hover:border-[#162E93]"}`}>
                        <input type="radio" name="jenis_produk" value={p.id} checked={formData.jenis_produk === p.id} onChange={handleInputChange} className="sr-only" />
                        <div className="space-y-2">
                          {mainImage ? (
                            <img src={mainImage.imageUrl} alt={p.name} className="w-full h-24 object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">Tidak ada foto</div>
                          )}
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2">{p.name}</p>
                          <p className="text-xs text-[#162E93] font-bold">Rp {p.price.toLocaleString("id-ID")}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-gray-600 text-sm">Tidak ada produk dalam kategori ini</div>
              )}
            </div>

            <div className="pt-3 border-t border-dashed border-gray-300">
              <p className="text-sm font-bold text-center mb-3" style={{ color: "#162E93" }}>
                Pengiriman &amp; Waktu Pengambilan
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-[max-content_1fr] gap-3 items-start">
                <div className="grid grid-cols-2 gap-2 w-fit">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, metode: "AMBIL_SENDIRI" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${formData.metode === "AMBIL_SENDIRI" ? "border-[#162E93] bg-blue-50 text-[#162E93]" : "border-gray-200 text-gray-400 hover:border-[#162E93] hover:text-[#162E93]"}`}
                  >
                    <span className="text-sm font-semibold">P</span>
                    <span>Ambil Sendiri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, metode: "PICKUP_GOJEK" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${formData.metode === "PICKUP_GOJEK" ? "border-[#162E93] bg-blue-50 text-[#162E93]" : "border-gray-200 text-gray-400 hover:border-[#162E93] hover:text-[#162E93]"}`}
                  >
                    <span className="text-sm font-semibold">G</span>
                    <span>Pickup Gojek</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tanggal Pengambilan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-[#162E93] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Waktu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="jam"
                      value={formData.jam}
                      onChange={handleInputChange}
                      min="08:00"
                      max="19:00"
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-[#162E93] transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-gray-300">
              <p className="text-sm font-bold text-center mb-3" style={{ color: "#162E93" }}>
                Item Tambahan (Opsional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2" style={{ borderColor: "#162E93", backgroundColor: "#F0F4FF" }}>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Kartu Ucapan</p>
                    <p className="text-xs text-gray-600 font-medium">Rp 5.000</p>
                  </div>
                  <input type="checkbox" name="greeting_card" checked={formData.addons.greeting_card} onChange={handleInputChange} className="h-4 w-4 text-[#162E93] border-gray-300 rounded" />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2" style={{ borderColor: "#162E93", backgroundColor: "#F0F4FF" }}>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Stick Card</p>
                    <p className="text-xs text-gray-600 font-medium">Rp 5.000</p>
                  </div>
                  <input type="checkbox" name="stick_card" checked={formData.addons.stick_card} onChange={handleInputChange} className="h-4 w-4 text-[#162E93] border-gray-300 rounded" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pesan Ucapan</label>
              <textarea
                name="wish_card"
                value={formData.wish_card}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#162E93] transition-colors resize-none"
                placeholder="Tulis pesan ucapan Anda"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi / Kustomisasi</label>
              <textarea
                name="pesan"
                value={formData.pesan}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#162E93] transition-colors resize-none"
                placeholder="Contoh: warna soft pink, ukuran lebih besar, dll"
              />
            </div>

            <div className="rounded-xl border px-4 py-4 mt-3" style={{ borderColor: "#cfdcff", backgroundColor: "#f8fbff" }}>
              <p className="text-sm font-bold text-center mb-2" style={{ color: "#162E93" }}>
                Ringkasan Pesanan
              </p>
              <div className="flex items-center justify-between text-sm text-gray-700 pb-2 border-b border-dashed border-gray-300">
                <span>Subtotal Produk (x1)</span>
                <span className="font-semibold">Rp {(products[0]?.price || 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
                <span>Total Pesanan</span>
                <span className="font-bold text-base" style={{ color: "#162E93" }}>
                  Rp {((products[0]?.price || 0) + (formData.addons.greeting_card ? 5000 : 0) + (formData.addons.stick_card ? 5000 : 0)).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-xs italic text-red-500 text-center mt-2">*Harga belum termasuk ongkos kirim</p>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90" style={{ backgroundColor: "#162E93" }}>
              {loading ? "Processing..." : "Pesan Sekarang"}
            </button>
          </form>
        </div>
      </section>

      {/* Receipt Modal */}
      {showReceipt && orderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Nota Pesanan</h1>
                  <p className="text-gray-600 mt-2">Pesanan Anda berhasil diterima!</p>
                </div>
                <button
                  onClick={() => {
                    if (waConfirmed) setShowReceipt(false);
                  }}
                  className={`text-2xl ${waConfirmed ? "text-gray-400 hover:text-gray-600" : "text-gray-300 cursor-not-allowed"}`}
                >
                  ×
                </button>
              </div>

              {/* Order Number & Date */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-gray-600">No. Order</p>
                  <p className="font-bold text-lg text-blue-700">{orderData.orderNumber}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-gray-600">Kode Ambil</p>
                  <p className="font-bold text-lg text-blue-700">{orderData.pickupCode}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Details */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">Detail Pemesan</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama</span>
                      <span className="font-semibold">{orderData.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode</span>
                      <span className="font-semibold">{orderData.metode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal & Jam</span>
                      <span className="font-semibold">
                        {orderData.tanggal} • {orderData.jam}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">Pesanan</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produk</span>
                      <span className="font-semibold text-right max-w-xs">{orderData.jenis}</span>
                    </div>
                    {orderData.pesan && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deskripsi</span>
                        <span className="font-semibold text-right max-w-xs line-clamp-2">{orderData.pesan}</span>
                      </div>
                    )}
                    {orderData.pesanKartu && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pesan Kartu</span>
                        <span className="font-semibold text-right max-w-xs line-clamp-2">{orderData.pesanKartu}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Add-ons & Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Add-ons */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Add-on</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Greeting Card</span>
                      <span className="font-semibold">{orderData.addonCard ? "Ya (+Rp5.000)" : "Tidak"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stick Card</span>
                      <span className="font-semibold">{orderData.addonStick ? "Ya (+Rp5.000)" : "Tidak"}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Biaya</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga Produk</span>
                      <span className="font-semibold">Rp {orderData.hargaBuket.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Add-on</span>
                      <span className="font-semibold">Rp {((orderData.addonCard ? 5000 : 0) + (orderData.addonStick ? 5000 : 0)).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="font-bold text-lg text-blue-700">Rp {orderData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-sm text-blue-800">
                <p className="font-semibold mb-1">Info Pengambilan</p>
                <p>
                  Untuk <span className="font-semibold">Ambil Sendiri</span>, tunjukkan kode ambil saat datang. Untuk <span className="font-semibold">Pickup Gojek</span>, kirim pesan ini ke kurir.
                </p>
              </div>
              {/* Payment Instructions */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-6 text-sm text-emerald-800">
                <p className="font-semibold mb-1">Instruksi Pembayaran</p>
                <p className="mb-2 text-lg font-bold text-red-600">Total: Rp {orderData.totalAmount.toLocaleString()}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p>BCA 3251609134</p>
                    <button type="button" onClick={() => handleCopy("3251609134")} className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold">
                      Salin
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p>BSI 7310638007</p>
                    <button type="button" onClick={() => handleCopy("7310638007")} className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold">
                      Salin
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p>SeaBank 901643060605</p>
                    <button type="button" onClick={() => handleCopy("901643060605")} className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold">
                      Salin
                    </button>
                  </div>
                  <p>A/N Lathafanny Tsamara</p>
                </div>
                <p className="mt-3 text-red-600">Mohon kirimkan bukti transfer setelah melakukan pembayaran dan konfirmasi ke WhatsApp. Jika tidak konfirmasi, pesanan tidak diproses. Terima kasih.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const descriptionLine = `Deskripsi: ${orderData.pesan || "-"}`;
                    const messageBody = `Halo, saya mau konfirmasi pesanan.\n\nNo Order: ${orderData.orderNumber}\nKode Ambil: ${orderData.pickupCode}\nNama: ${orderData.nama}\nProduk: ${orderData.jenis}\nMetode: ${orderData.metode}\nJadwal: ${orderData.tanggal} ${orderData.jam}\n${descriptionLine}\nTotal: Rp ${orderData.totalAmount.toLocaleString()}\n\nPembayaran via Transfer:\n- BCA 3251609134\n- BSI 7310638007\n- SeaBank 901643060605\nA/N Lathafanny Tsamara\n\nMohon kirimkan bukti transfer setelah melakukan pembayaran. Terima kasih!`;
                    window.open(`https://wa.me/6285732286669?text=${encodeURIComponent(messageBody)}`, "_blank");
                    setWaConfirmed(true);
                  }}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                >
                  Konfirmasi WA
                </button>
              </div>

              <button
                onClick={() => {
                  if (waConfirmed) setShowReceipt(false);
                }}
                disabled={!waConfirmed}
                className={`w-full mt-3 px-4 py-3 font-semibold rounded-lg transition ${waConfirmed ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                Tutup
              </button>
              {!waConfirmed && <p className="mt-2 text-xs text-gray-500 text-center">Klik "Konfirmasi WA" untuk kirim bukti transfer sebelum menutup nota.</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
