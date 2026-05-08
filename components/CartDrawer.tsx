"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Lock body scroll when open
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

  // Build WhatsApp message
  const buildWAMessage = () => {
    const lines = items.map((item) => `- ${item.name} x${item.quantity}${item.price ? ` (Rp ${(item.price * item.quantity).toLocaleString()})` : ""}`);
    const msg = `Halo Oursee, saya ingin memesan:\n${lines.join("\n")}` + (total > 0 ? `\n\nTotal: Rp ${total.toLocaleString()}` : "");
    return encodeURIComponent(msg);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: "#162E93" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-lg font-serif font-bold text-gray-900">Keranjang {items.length > 0 && <span className="text-sm font-normal text-gray-400">({items.length} item)</span>}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-400 text-sm">Keranjang masih kosong</p>
              <button onClick={onClose} className="px-5 py-2 rounded-full text-sm font-semibold text-white transition hover:opacity-80" style={{ backgroundColor: "#162E93" }}>
                Lihat Produk
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0">
                  {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-gray-100" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm mt-0.5" style={{ color: "#162E93" }}>
                    {item.price ? `Rp ${item.price.toLocaleString()}` : "Hubungi kami"}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => (item.quantity === 1 ? onRemove(item.id) : onUpdateQty(item.id, item.quantity - 1))}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-red-400 hover:text-red-500 transition-colors text-sm"
                    >
                      {item.quantity === 1 ? "×" : "−"}
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#162E93] hover:text-[#162E93] transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                {item.price && <p className="text-sm font-semibold text-gray-700 shrink-0 self-start pt-0.5">Rp {(item.price * item.quantity).toLocaleString()}</p>}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-gray-100 space-y-3 bg-white">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">Rp {total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400">Harga final dikonfirmasi saat pemesanan</p>
            <button onClick={() => setIsCheckoutOpen(true)} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 shadow" style={{ backgroundColor: "#162E93" }}>
              Checkout
            </button>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Lanjut Belanja
            </button>
          </div>
        )}
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={items} />
    </>
  );
}
