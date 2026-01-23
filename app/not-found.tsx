"use client";

import React from "react";
import { Flower2, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative flowers */}
      <div className="absolute top-10 left-10 text-blue-200 opacity-40 animate-pulse">
        <Flower2 size={80} />
      </div>
      <div
        className="absolute bottom-20 right-16 text-blue-300 opacity-40 animate-pulse"
        style={{ animationDelay: "1s" }}
      >
        <Flower2 size={60} />
      </div>
      <div
        className="absolute top-40 right-32 text-slate-300 opacity-30 animate-pulse"
        style={{ animationDelay: "2s" }}
      >
        <Flower2 size={50} />
      </div>
      <div
        className="absolute bottom-40 left-20 text-blue-400 opacity-40 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      >
        <Flower2 size={70} />
      </div>

      {/* Main content */}
      <div className="max-w-2xl w-full text-center relative z-10">
        {/* 404 with flower */}
        <div className="relative inline-block mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            404
          </h1>
          <div className="absolute -top-8 -right-8 text-blue-400 animate-bounce">
            <Flower2 size={60} fill="currentColor" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Oops! Halaman yang Anda Cari Tidak Ditemukan
          </h2>
          <p className="text-lg text-slate-700 mb-2">
            Sepertinya halaman ini sudah layu dan tidak ada lagi.
          </p>
          <p className="text-slate-600">
            Mungkin bunga yang Anda cari sudah berpindah ke taman lain.
          </p>
        </div>

        {/* Decorative flower row */}
        <div className="flex justify-center gap-4 mb-8">
          <Flower2 className="text-blue-400" size={32} fill="currentColor" />
          <Flower2 className="text-blue-500" size={32} fill="currentColor" />
          <Flower2 className="text-white" size={32} fill="currentColor" />
          <Flower2 className="text-blue-400" size={32} fill="currentColor" />
          <Flower2 className="text-blue-500" size={32} fill="currentColor" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="group px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 flex items-center gap-2 shadow-md hover:scale-105"
          >
            <Home size={20} />
            Ke Halaman Utama
            <Flower2
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
          </button>
        </div>

        {/* Bottom text */}
        <p className="mt-12 text-sm text-slate-600 italic">
          "Setiap bunga adalah jiwa yang mekar di alam" - Temukan bunga impian
          Anda di halaman utama
        </p>
      </div>
    </div>
  );
}
