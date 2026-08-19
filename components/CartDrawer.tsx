"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

export interface CartItem {
  id: string;
  name: string;
  price: number | null;
  imageUrl: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

export default function CartDrawer({ isOpen, onClose, items, onRemove, onUpdateQty }: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Smooth Backdrop Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={onClose}
            />

            {/* Smooth Drawer Slide */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-100"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#162E93]/10 flex items-center justify-center text-[#162E93]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-serif font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Keranjang Belanja
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        {totalQty > 0 ? `${totalQty} item pilihan di keranjang` : "Keranjang masih kosong"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all duration-200"
                    aria-label="Tutup keranjang"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  {items.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center py-12 px-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-[#162E93]/5 flex items-center justify-center text-[#162E93] mb-4">
                        <ShoppingBag className="w-10 h-10 opacity-70" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Keranjangmu Masih Kosong</h3>
                      <p className="text-sm text-gray-500 max-w-xs mb-6">
                        Jelajahi koleksi buket & hadiah istimewa kami untuk momen tak terlupakan.
                      </p>
                      <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: "#162E93" }}
                      >
                        <Sparkles className="w-4 h-4" />
                        Mulai Belanja
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex gap-4 p-3.5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-xs group"
                        >
                          {/* Item Image */}
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                                  {item.name}
                                </h4>
                                <button
                                  onClick={() => onRemove(item.id)}
                                  className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0"
                                  title="Hapus produk"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                {item.price ? `Rp ${item.price.toLocaleString("id-ID")}` : "Harga per konfirmasi"}
                              </p>
                            </div>

                            {/* Quantity controls & Subtotal */}
                            <div className="flex items-center justify-between mt-2 pt-1">
                              <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50/80">
                                <button
                                  onClick={() =>
                                    item.quantity === 1 ? onRemove(item.id) : onUpdateQty(item.id, item.quantity - 1)
                                  }
                                  className="w-6 h-6 rounded-md bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 hover:text-red-600 transition-colors shadow-2xs"
                                  title={item.quantity === 1 ? "Hapus item" : "Kurangi kuantitas"}
                                >
                                  {item.quantity === 1 ? (
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  ) : (
                                    <Minus className="w-3 h-3" />
                                  )}
                                </button>

                                <span className="w-8 text-center text-xs font-bold text-gray-800">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-md bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 hover:text-[#162E93] transition-colors shadow-2xs"
                                  title="Tambah kuantitas"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-sm font-bold text-gray-900">
                                {item.price
                                  ? `Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Summary & Actions */}
                {items.length > 0 && (
                  <div className="p-6 border-t border-gray-100 bg-white space-y-4 shadow-lg sticky bottom-0">
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-gray-500 font-medium">Subtotal ({totalQty} item)</span>
                        <span className="text-lg font-bold text-gray-900">
                          Rp {total.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-[#162E93]">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-[#162E93]" />
                        <span>Harga final & pengiriman akan dikonfirmasi via WhatsApp</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl active:scale-[0.99] group"
                        style={{ backgroundColor: "#162E93" }}
                      >
                        <span>Lanjut Ke Checkout</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={onClose}
                        className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Lanjut Belanja
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={items} />
    </>
  );
}

