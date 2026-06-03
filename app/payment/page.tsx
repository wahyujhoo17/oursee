"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const amount = Number(searchParams.get("amount") || 0);
  const uniqueCode = Number(searchParams.get("uniqueCode") || 0);
  const uniqueCodeLabel = String(uniqueCode).padStart(3, "0");
  const orderRef = searchParams.get("orderRef") || "AUTO";
  const orderStatus = searchParams.get("status") || "PENDING";
  const customerName = searchParams.get("name") || "Pelanggan";
  const customerPhone = searchParams.get("phone") || "-";

  const totalWithCode = useMemo(() => amount + uniqueCode, [amount, uniqueCode]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Nomor rekening berhasil disalin");
    } catch {
      alert("Gagal menyalin nomor rekening");
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7ff] px-4 py-8 md:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        <article className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#162E93]">Pembayaran</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Halaman pembayaran pesanan</h1>
          <p className="mt-2 text-sm text-slate-500">Gunakan halaman ini sebagai bukti pembayaran. Kode unik akan membantu tim kami mencocokkan transfer Anda.</p>

          <div className="mt-6 rounded-2xl border border-[#d9e2ff] bg-[#f8fbff] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Nomor Pesanan</p>
                <p className="mt-1 text-xl font-bold text-slate-900">#{orderRef}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Status: {orderStatus}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kode Unik</p>
                <p className="mt-1 text-xl font-bold text-[#162E93]">{uniqueCodeLabel}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#d9e2ff] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Tagihan</p>
              <p className="mt-1 text-3xl font-black text-[#162E93]">Rp {totalWithCode.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-sm text-slate-500">
                Rincian: Rp {amount.toLocaleString("id-ID")} + kode unik {uniqueCodeLabel} = Rp {totalWithCode.toLocaleString("id-ID")}.
              </p>
            </div>

            <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                Nama: <span className="font-semibold text-slate-900">{customerName}</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                Telepon: <span className="font-semibold text-slate-900">{customerPhone}</span>
              </div>
            </div>
          </div>
        </article>

        <aside className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#162E93]">QRIS</p>
              <h2 className="text-xl font-bold text-slate-900">Scan untuk bayar</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Aktif</span>
          </div>

          <div className="mt-4 rounded-2xl border border-[#d9e2ff] bg-[#f8fbff] p-4 text-center">
            <Image src="/qris.jpeg" alt="QRIS pembayaran Oursee" width={260} height={260} className="mx-auto h-auto w-full max-w-65 rounded-2xl border border-[#d9e2ff] bg-white p-2" />
            <p className="mt-3 text-sm text-slate-500">Pindai kode QRIS di atas untuk pembayaran cepat melalui e-wallet atau mobile banking.</p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Transfer Bank</p>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">BCA</p>
                    <p>3251609134</p>
                  </div>
                  <button type="button" onClick={() => copyText("3251609134")} className="rounded-lg border border-[#162E93] px-3 py-1.5 text-xs font-semibold text-[#162E93] hover:bg-[#162E93] hover:text-white">
                    Salin
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">SeaBank</p>
                    <p>901643060605</p>
                  </div>
                  <button type="button" onClick={() => copyText("901643060605")} className="rounded-lg border border-[#162E93] px-3 py-1.5 text-xs font-semibold text-[#162E93] hover:bg-[#162E93] hover:text-white">
                    Salin
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Catatan penting</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-emerald-800">
                <li>Pastikan nominal transfer sesuai total tagihan yang tertulis, termasuk kode unik.</li>
                <li>Mohon kirim bukti transfer ke WhatsApp agar pesanan kami bisa segera diproses.</li>
                <li>Jika nominal berbeda, kami akan mencocokkan berdasarkan kode unik yang muncul di halaman ini.</li>
              </ul>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
