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

        // Store order data for receipt display
        setOrderData({
          orderNumber: newOrder.orderNumber,
          pickupCode: newOrder.id.substring(0, 8).toUpperCase(),
          nama: formData.nama,
          no_telepon: formData.no_telepon,
          metode: formData.metode === "AMBIL_SENDIRI" ? "Ambil Sendiri (Self Pickup)" : "Pickup Gojek",
          tanggal: formData.tanggal,
          jam: formData.jam,
          jenis: selectedProduct?.name || "",
          pesanKartu: formData.wish_card,
          hargaBuket: selectedProduct?.price || 0,
          addonCard: formData.addons.greeting_card,
          addonStick: formData.addons.stick_card,
          totalAmount: newOrder.totalAmount,
        });

        setShowReceipt(true);
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
    <main className="min-h-screen bg-gray-50">
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
          {/* Judul */}
          <h1 className="text-center text-3xl md:text-5xl font-bold text-blue-700 mb-4">Format Order 💐</h1>
          <p className="text-center text-gray-600 mb-10">Pesanan Anda akan masuk ke dalam queue order kami.</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Pemesan <span className="text-red-500">*</span>
              </label>
              <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600" required />
            </div>

            {/* No. Telepon */}
            <div>
              <label className="block text-sm font-medium mb-1">
                No. Telepon <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="no_telepon" value={formData.no_telepon} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600" required />
            </div>

            {/* Kategori Produk */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Kategori Produk <span className="text-red-500">*</span>
              </label>
              <select value={formData.kategori} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600" required>
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Produk */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Jenis Produk <span className="text-red-500">*</span>
              </label>
              {!formData.kategori ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-gray-600">Silakan pilih kategori terlebih dahulu</div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map((p) => {
                    const mainImage = p.images?.find((img) => img.isMain);
                    return (
                      <label key={p.id} className={`relative cursor-pointer p-2 border-2 rounded-lg transition-all ${formData.jenis_produk === p.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400"}`}>
                        <input type="radio" name="jenis_produk" value={p.id} checked={formData.jenis_produk === p.id} onChange={handleInputChange} className="sr-only" />
                        <div className="space-y-2">
                          {mainImage ? (
                            <img src={mainImage.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded" />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400">Tidak ada foto</div>
                          )}
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900 line-clamp-2">{p.name}</p>
                            <p className="text-blue-600 font-bold">Rp {p.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-gray-600">Tidak ada produk dalam kategori ini</div>
              )}
            </div>

            {/* Deskripsi Pesanan */}
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi / Kustomisasi</label>
              <textarea
                name="pesan"
                value={formData.pesan}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Tulis pesan atau kustomisasi yang diinginkan..."
              />
            </div>

            {/* Metode Pengambilan */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Metode Pengambilan <span className="text-red-500">*</span>
              </label>
              <select name="metode" value={formData.metode} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600" required>
                <option value="AMBIL_SENDIRI">Ambil Sendiri (Pickup)</option>
                <option value="PICKUP_GOJEK">Pickup Gojek</option>
              </select>
            </div>

            {/* Tanggal & Jam */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Pengambilan <span className="text-red-500">*</span>
                </label>
                <input type="date" name="tanggal" value={formData.tanggal} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jam Pengambilan <span className="text-red-500">*</span>
                </label>
                <input type="time" name="jam" value={formData.jam} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600" required />
              </div>
            </div>

            {/* Isi Wish Card */}
            <div>
              <label className="block text-sm font-medium mb-1">Isi Wish Card</label>
              <textarea
                name="wish_card"
                value={formData.wish_card}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Tulis pesan atau ucapan yang ingin ditulis di kartu wish..."
              />
            </div>

            {/* Add-ons */}
            <div>
              <span className="block text-sm font-medium mb-2">Add-On (Opsional)</span>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" name="greeting_card" checked={formData.addons.greeting_card} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <span>Greeting Card Tulis Tangan (+Rp 5.000)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="stick_card" checked={formData.addons.stick_card} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <span>Stick Card (+Rp 3.000)</span>
              </label>
            </div>

            {/* Submit */}
            <div className="text-center pt-4">
              <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold rounded-full transition">
                {loading ? "Processing..." : "Kirim Pesanan"}
              </button>
            </div>
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
                  <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Nota Pesanan 💐</h1>
                  <p className="text-gray-600 mt-2">Pesanan Anda berhasil diterima!</p>
                </div>
                <button onClick={() => setShowReceipt(false)} className="text-2xl text-gray-400 hover:text-gray-600">
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
                      <span className="font-semibold text-right max-w-[200px]">{orderData.jenis}</span>
                    </div>
                    {orderData.pesanKartu && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pesan Kartu</span>
                        <span className="font-semibold text-right max-w-[200px] line-clamp-2">{orderData.pesanKartu}</span>
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
                      <span className="font-semibold">{orderData.addonStick ? "Ya (+Rp3.000)" : "Tidak"}</span>
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
                      <span className="font-semibold">Rp {((orderData.addonCard ? 5000 : 0) + (orderData.addonStick ? 3000 : 0)).toLocaleString()}</span>
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
                <p className="font-semibold mb-1">📋 Info Pengambilan</p>
                <p>
                  Untuk <span className="font-semibold">Ambil Sendiri</span>, tunjukkan kode ambil saat datang. Untuk <span className="font-semibold">Pickup Gojek</span>, kirim pesan ini ke kurir.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="flex-1 px-4 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition">
                  🖨️ Download/Print
                </button>
                <button
                  onClick={() => {
                    const msg = `Halo, saya mau konfirmasi pesanan.\n\nNo Order: ${orderData.orderNumber}\nKode Ambil: ${orderData.pickupCode}\nNama: ${orderData.nama}\nProduk: ${orderData.jenis}\nMetode: ${orderData.metode}\nJadwal: ${orderData.tanggal} ${orderData.jam}\n\nTerima kasih.`;
                    window.open(`https://wa.me/6285732286669?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                >
                  💬 Konfirmasi WA
                </button>
              </div>

              <button onClick={() => setShowReceipt(false)} className="w-full mt-3 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
