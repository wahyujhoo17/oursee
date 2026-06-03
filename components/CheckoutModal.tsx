"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CartItem } from "./CartDrawer";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

type Shipping = "self" | "gosend_customer";

const shippingOptions: { key: Shipping; label: string; icon: React.ReactElement }[] = [
  {
    key: "self",
    label: "Ambil Sendiri",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "gosend_customer",
    label: "Gosend Pelanggan",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15V7a1 1 0 011-1h8a1 1 0 011 1v8m0 0h2m-2 0H9m10 0h2v-3l-2-4h-6" />
      </svg>
    ),
  },
];

export default function CheckoutModal({ isOpen, onClose, items }: CheckoutModalProps) {
  const router = useRouter();
  const [shipping, setShipping] = useState<Shipping>("self");
  const [additionalItems, setAdditionalItems] = useState({
    wishCard: false,
    stickCard: false,
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [additionalRequest, setAdditionalRequest] = useState("");
  const [qty, setQty] = useState(1);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [studio, setStudio] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const firstItem = items[0];
  const total = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const additionalTotal = (additionalItems.wishCard ? 5000 : 0) + (additionalItems.stickCard ? 5000 : 0);
  const productSubtotal = total;
  const orderTotal = productSubtotal + additionalTotal;

  useEffect(() => {
    if (isOpen) {
      setQty(totalQty);
    }
  }, [isOpen, items]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (price: number | null) => {
    if (!price) return "Hubungi kami";
    return `Rp ${price.toLocaleString()}`;
  };

  const handleOrder = async () => {
    // Cek field yang belum diisi
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Nama harus diisi";
    if (!phone.trim()) newErrors.phone = "Telepon harus diisi";
    if (!greetingMessage.trim()) newErrors.greetingMessage = "Pesan ucapan harus diisi";
    if (!pickupDate) newErrors.pickupDate = "Tanggal pengambilan harus dipilih";
    if (!pickupTime) newErrors.pickupTime = "Waktu harus dipilih";
    if (!studio) newErrors.studio = "Studio harus dipilih";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const customerRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: "",
          phone,
          address: studio,
        }),
      });

      if (!customerRes.ok) {
        throw new Error("Gagal membuat data pelanggan");
      }

      const customer = await customerRes.json();

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          items: items.map((item) => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price ?? 0,
          })),
          deliveryMethod: shipping === "gosend_customer" ? "DELIVERY" : "PICKUP",
          pickupDate,
          pickupTime,
          recipientName: name,
          recipientPhone: phone,
          deliveryAddress: studio,
          notes: [greetingMessage, additionalRequest].filter(Boolean).join("\n"),
          addons: {
            greeting_card: additionalItems.wishCard,
            stick_card: additionalItems.stickCard,
          },
          paymentMethod: "TRANSFER",
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Gagal membuat pesanan");
      }

      const order = await orderRes.json();
      const seed = `${new Date().toISOString().slice(0, 10)}-${order.orderNumber}`;
      const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const uniqueCode = (hash % 58) + 1;
      const uniqueCodeLabel = String(uniqueCode).padStart(3, "0");

      router.push(`/payment?amount=${orderTotal}&uniqueCode=${uniqueCodeLabel}&orderRef=${encodeURIComponent(order.orderNumber)}&orderId=${order.id}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&status=PENDING`);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Maaf, pesanan belum bisa dibuat. Silakan coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 relative">
          <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-xl transition-colors">
            x
          </button>
          <p className="text-center text-gray-800 font-medium text-sm leading-snug pr-6">Ingin Memesan Koleksi Ini?</p>
          <p className="text-center text-gray-500 font-serif italic text-sm mt-0.5">Ciptakan Momen Istimewa Anda.</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="overflow-hidden rounded-2xl border p-4" style={{ borderColor: "#d9e2ff", background: "linear-gradient(135deg, #f6f9ff 0%, #ffffff 60%)" }}>
            <div className="flex items-center gap-3">
              {firstItem?.imageUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#d9e2ff] bg-white shrink-0 shadow-sm">
                  <Image src={firstItem.imageUrl} alt={firstItem.name} width={64} height={64} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5169b9" }}>
                  Detail Pesanan
                </p>
                <p className="font-bold text-gray-900 leading-tight truncate">{items.length === 1 ? firstItem?.name : `${items.length} produk`}</p>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1" style={{ color: "#162E93", backgroundColor: "#e9efff" }}>
                  {formatPrice(items.length === 1 ? (firstItem?.price ?? null) : total)}
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-white border border-[#d9e2ff] px-2.5 py-0.5 text-xs font-medium text-gray-600 shrink-0 self-start">Qty {qty}</span>
            </div>
          </div>

          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "#d9e2ff", backgroundColor: "#fcfdff" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Alur Pemesanan</p>
                <p className="text-xs text-gray-500 mt-1">Isi data di bawah, lalu klik tombol Pesan Sekarang untuk lanjut ke WhatsApp Customer Relations kami.</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#162E93]"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="08***"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${errors.phone ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#162E93]"}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Pesanan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#162E93] transition-colors"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-gray-300">
            <p className="text-sm font-bold text-center mb-3" style={{ color: "#162E93" }}>
              Pengiriman &amp; Waktu Pengambilan
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-[max-content_1fr] gap-3 items-start">
              <div className="inline-flex items-start gap-1 w-fit">
                {shippingOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setShipping(opt.key)}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-xs font-medium transition-colors w-24 h-31 ${
                      shipping === opt.key ? "border-[#162E93] bg-blue-50 text-[#162E93]" : "border-gray-200 text-gray-400 hover:border-[#162E93] hover:text-[#162E93]"
                    }`}
                  >
                    <span style={{ color: shipping === opt.key ? "#162E93" : "#93a3c8" }}>{opt.icon}</span>
                    <span className="text-center leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tanggal Pengambilan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        if (errors.pickupDate) setErrors({ ...errors, pickupDate: "" });
                      }}
                      className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none transition-colors ${errors.pickupDate ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#162E93]"}`}
                    />
                    {errors.pickupDate && <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Waktu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      min="09:00"
                      max="19:30"
                      value={pickupTime}
                      onChange={(e) => {
                        setPickupTime(e.target.value);
                        if (errors.pickupTime) setErrors({ ...errors, pickupTime: "" });
                      }}
                      className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none transition-colors ${errors.pickupTime ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#162E93]"}`}
                    />
                    {errors.pickupTime && <p className="text-red-500 text-xs mt-1">{errors.pickupTime}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Pilih Studio Kami <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studio}
                    onChange={(e) => {
                      setStudio(e.target.value);
                      if (errors.studio) setErrors({ ...errors, studio: "" });
                    }}
                    className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none transition-colors text-gray-700 ${errors.studio ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#162E93]"}`}
                  >
                    <option value="">-- Pilih Studio --</option>
                    <option value="Karang Empat IX No.34, Surabaya">Karang Empat IX No.34, Surabaya</option>
                  </select>
                  {errors.studio && <p className="text-red-500 text-xs mt-1">{errors.studio}</p>}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-gray-400">
                <span className="font-semibold">#Catatan:</span> Waktu yang ditampilkan mewakili saat pesanan Anda selesai dan siap dikirim. Waktu tiba akan bervariasi tergantung kondisi lalu lintas.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-gray-300">
            <p className="text-sm font-bold text-center mb-3" style={{ color: "#162E93" }}>
              Item Tambahan (Opsional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2" style={{ borderColor: "#162E93", backgroundColor: "#F0F4FF" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <Image src="/assets/wishcard.png" alt="Kartu Ucapan" width={44} height={44} className="w-11 h-11 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Kartu Ucapan</p>
                    <p className="text-xs text-gray-600 font-medium">Rp 5.000</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdditionalItems((prev) => ({
                      ...prev,
                      wishCard: !prev.wishCard,
                    }))
                  }
                  className={`text-xs font-semibold rounded px-2.5 py-1 border transition-colors whitespace-nowrap ${additionalItems.wishCard ? "bg-[#162E93] border-[#162E93] text-white" : "border-[#162E93] text-[#162E93] hover:bg-blue-50"}`}
                >
                  +Add
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2" style={{ borderColor: "#162E93", backgroundColor: "#F0F4FF" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <Image src="/assets/stickcard.png" alt="Stick Card" width={44} height={44} className="w-11 h-11 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Stick Card</p>
                    <p className="text-xs text-gray-600 font-medium">Rp 5.000</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdditionalItems((prev) => ({
                      ...prev,
                      stickCard: !prev.stickCard,
                    }))
                  }
                  className={`text-xs font-semibold rounded px-2.5 py-1 border transition-colors whitespace-nowrap ${additionalItems.stickCard ? "bg-[#162E93] border-[#162E93] text-white" : "border-[#162E93] text-[#162E93] hover:bg-blue-50"}`}
                >
                  +Add
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-gray-300">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pesan Ucapan <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Tulis pesan ucapan (maksimal 20 kata)</p>
              <input
                type="text"
                value={greetingMessage}
                onChange={(e) => {
                  const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                  if (words.length <= 20) {
                    setGreetingMessage(e.target.value);
                  } else {
                    setGreetingMessage(words.slice(0, 20).join(" "));
                  }
                  if (errors.greetingMessage) setErrors({ ...errors, greetingMessage: "" });
                }}
                placeholder="Pesan ucapan Anda"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.greetingMessage ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#162E93]"}`}
              />
              {errors.greetingMessage && <p className="text-red-500 text-xs mt-1">{errors.greetingMessage}</p>}
            </div>

            <div className="mt-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Permintaan Tambahan</label>
              <p className="text-xs text-gray-500 mb-2">Contoh: Ubah mawar merah menjadi tulip merah muda, dan buat susunannya lebih besar</p>
              <textarea
                value={additionalRequest}
                onChange={(e) => setAdditionalRequest(e.target.value)}
                placeholder="Tulis permintaan Anda"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#162E93] transition-colors resize-none"
              />
              <div className="mt-2 border-b border-dashed border-gray-300" />
            </div>

            <div className="rounded-xl border px-4 py-4 mt-3" style={{ borderColor: "#cfdcff", backgroundColor: "#f8fbff" }}>
              <p className="text-sm font-bold text-center mb-2" style={{ color: "#162E93" }}>
                Ringkasan Pesanan
              </p>
              <div className="flex items-center justify-between text-sm text-gray-700 pb-2 border-b border-dashed border-gray-300">
                <span>Subtotal Produk (x{totalQty})</span>
                <span className="font-semibold">Rp {productSubtotal.toLocaleString()}</span>
              </div>
              {(additionalItems.wishCard || additionalItems.stickCard) && (
                <div className="mt-2 pb-2 border-b border-dashed border-gray-300">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Item Tambahan</p>
                  {additionalItems.wishCard && (
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Kartu Ucapan</span>
                      <span>Rp 5.000</span>
                    </div>
                  )}
                  {additionalItems.stickCard && (
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                      <span>Stick Card</span>
                      <span>Rp 5.000</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
                <span>Total Pesanan</span>
                <span className="font-bold text-base" style={{ color: "#162E93" }}>
                  Rp {orderTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs italic text-red-500 text-center mt-2">*Harga belum termasuk ongkos kirim</p>
            </div>
          </div>

          <button onClick={handleOrder} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90" style={{ backgroundColor: "#162E93" }}>
            Pesan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
