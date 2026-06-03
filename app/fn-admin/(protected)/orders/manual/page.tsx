"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, DatePicker, TimePicker, Select, InputNumber, Checkbox, message, Divider } from "antd";
import { SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const GREETING_CARD_PRICE = 5000;
const STICK_CARD_PRICE = 5000;

const shippingOptions = [
  {
    key: "PICKUP",
    label: "Ambil Sendiri",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "GOSEND",
    label: "Gosend Pelanggan",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15V7a1 1 0 011-1h8a1 1 0 011 1v8m0 0h2m-2 0H9m10 0h2v-3l-2-4h-6" />
      </svg>
    ),
  },
];

export default function ManualOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [stickCard, setStickCard] = useState(false);
  const [bouquetPrice, setBouquetPrice] = useState<number>(0);

  const getTotal = () => {
    return (bouquetPrice || 0) + (greetingCard ? GREETING_CARD_PRICE : 0) + (stickCard ? STICK_CARD_PRICE : 0);
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // 1. Create / upsert customer
      const customerRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.customerName,
          phone: values.customerPhone,
        }),
      });

      if (!customerRes.ok) {
        message.error("Gagal menyimpan data pemesan");
        return;
      }

      const customerData = await customerRes.json();
      const customerId = customerData.id;

      // 2. Build notes: card message + add-ons
      const cardMessage = values.cardMessage?.trim() || "";
      const notesParts = [cardMessage ? `Pesan Kartu Ucapan: ${cardMessage}` : "", `Katatan Tambahan:\n\nAdd-ons:\nGreeting Card: ${greetingCard ? "ya" : "tidak"}\nStick Card: ${stickCard ? "ya" : "tidak"}`].filter(Boolean).join("\n\n");

      // 3. Delivery
      const deliveryMethod = values.deliveryMethod; // "PICKUP" | "GOSEND"
      const pickupDate = values.pickupDate ? values.pickupDate.toDate() : null;
      const pickupTime = values.pickupTime ? values.pickupTime.format("HH:mm") : null;

      // 4. Manual line item (no product catalog required)
      const bouquetItem = {
        productId: `MANUAL-${crypto.randomUUID()}`,

        productName: values.bouquetType,
        quantity: 1,
        price: bouquetPrice || 0,
        subtotal: bouquetPrice || 0,
      };

      const totalAmount = getTotal();

      const payload = {
        customerId,
        items: [bouquetItem],
        totalAmount,
        deliveryMethod: deliveryMethod === "GOSEND" ? "DELIVERY" : "PICKUP",
        pickupDate,
        pickupTime,
        notes: notesParts,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success("Pesanan manual berhasil disimpan!");
        setTimeout(() => router.push("/fn-admin/orders"), 1200);
      } else {
        message.error("Gagal menyimpan pesanan");
      }
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 relative">
            <p className="text-center text-gray-800 text-sm font-semibold">Pemesanan Manual</p>
            <p className="text-center text-gray-500 text-xs mt-1">Isi data pesanan langsung dari admin, dengan tampilan serupa checkout pelanggan.</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="overflow-hidden rounded-2xl border p-4" style={{ borderColor: "#d9e2ff", background: "linear-gradient(135deg, #f6f9ff 0%, #ffffff 60%)" }}>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-[#d9e2ff] bg-white shrink-0 shadow-sm flex items-center justify-center text-2xl text-[#162E93]">B</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5169b9" }}>
                    Detail Pesanan
                  </p>
                  <p className="font-bold text-gray-900 leading-tight">Pemesanan manual florist</p>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1" style={{ color: "#162E93", backgroundColor: "#e9efff" }}>
                    Rp {(bouquetPrice || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-white border border-[#d9e2ff] px-2.5 py-0.5 text-xs font-medium text-gray-600 shrink-0 self-start">1 item</span>
              </div>
            </div>

            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "#d9e2ff", backgroundColor: "#fcfdff" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Alur Pemesanan</p>
                  <p className="text-xs text-gray-500 mt-1">Isi data di bawah, lalu simpan pesanan untuk masuk ke dashboard admin.</p>
                </div>
                <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold text-white shrink-0" style={{ backgroundColor: "#162E93" }}>
                  Admin
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
                <div className="rounded-lg border border-[#d9e2ff] bg-white px-2 py-1.5 text-center">Isi Form</div>
                <div className="rounded-lg border border-[#d9e2ff] bg-white px-2 py-1.5 text-center">Cek Total</div>
                <div className="rounded-lg border border-[#d9e2ff] bg-white px-2 py-1.5 text-center">Simpan</div>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={(changed) => {
                if (changed.greetingCard !== undefined) setGreetingCard(changed.greetingCard);
                if (changed.stickCard !== undefined) setStickCard(changed.stickCard);
                if (changed.bouquetPrice !== undefined) setBouquetPrice(changed.bouquetPrice || 0);
              }}
              autoComplete="off"
            >
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Pemesan</label>
                    <Form.Item className="mb-0" name="customerName" rules={[{ required: true, message: "Masukkan nama pemesan" }]}>
                      <Input placeholder="Contoh: Anisa Rahma" size="large" className="rounded-xl" />
                    </Form.Item>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon / WhatsApp</label>
                    <Form.Item className="mb-0" name="customerPhone" rules={[{ required: true, message: "Masukkan nomor telepon" }]}>
                      <Input placeholder="Contoh: 08123456789" size="large" className="rounded-xl" />
                    </Form.Item>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Buket Bunga</label>
                    <Form.Item className="mb-0" name="bouquetType" rules={[{ required: true, message: "Masukkan jenis buket" }]}>
                      <Input.TextArea rows={3} placeholder="Contoh: buket mawar merah premium, dried flower, dll" className="rounded-xl" />
                    </Form.Item>
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Buket (Rp)</label>
                    <Form.Item className="mb-0" name="bouquetPrice" rules={[{ required: true, message: "Masukkan harga buket" }]}>
                      <InputNumber
                        placeholder="Contoh: 150000"
                        min={0}
                        step={1000}
                        size="large"
                        className="rounded-xl"
                        style={{ width: "100%", minWidth: "100%", height: 56, fontSize: 18 }}
                        formatter={(value?: string | number) => (value ? `Rp ${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : "")}
                        parser={(value?: string): number => Number(value?.replace(/Rp\s?|[.]/g, "") || 0)}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Pengambilan</label>
                    <Form.Item className="mb-0" name="deliveryMethod" initialValue="PICKUP" rules={[{ required: true, message: "Pilih metode pengambilan" }]}>
                      <Select size="large" className="rounded-xl" options={shippingOptions.map((item) => ({ label: item.label, value: item.key }))} />
                    </Form.Item>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal & Jam Pengambilan</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Form.Item className="mb-0" name="pickupDate" rules={[{ required: true, message: "Pilih tanggal pengambilan" }]}>
                        <DatePicker placeholder="Tanggal" size="large" className="w-full rounded-xl" disabledDate={(d) => d.isBefore(dayjs().startOf("day"))} />
                      </Form.Item>
                      <Form.Item className="mb-0" name="pickupTime" rules={[{ required: true, message: "Pilih jam pengambilan" }]}>
                        <TimePicker placeholder="Jam" format="HH:mm" size="large" className="w-full rounded-xl" minuteStep={15} />
                      </Form.Item>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pesan di Kartu Ucapan</label>
                    <Form.Item className="mb-0" name="cardMessage">
                      <Input.TextArea rows={3} placeholder="Contoh: Happy Birthday Kakak!" className="rounded-xl" />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d9e2ff] bg-[#f7faff] p-4">
                <p className="text-sm font-bold text-center mb-3" style={{ color: "#162E93" }}>
                  Item Tambahan (Opsional)
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#d9e2ff] bg-white px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Kartu Ucapan</p>
                      <p className="text-xs text-gray-500">+Rp 5.000</p>
                    </div>
                    <Form.Item name="greetingCard" valuePropName="checked" initialValue={false} className="mb-0">
                      <Checkbox onChange={(e) => setGreetingCard(e.target.checked)}>Tambah</Checkbox>
                    </Form.Item>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#d9e2ff] bg-white px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Stick Card</p>
                      <p className="text-xs text-gray-500">+Rp 5.000</p>
                    </div>
                    <Form.Item name="stickCard" valuePropName="checked" initialValue={false} className="mb-0">
                      <Checkbox onChange={(e) => setStickCard(e.target.checked)}>Tambah</Checkbox>
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
                <p className="text-sm font-bold text-center mb-3" style={{ color: "#162E93" }}>
                  Ringkasan Pesanan
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Harga Buket</span>
                    <span className="font-semibold">Rp {(bouquetPrice || 0).toLocaleString("id-ID")}</span>
                  </div>
                  {greetingCard && (
                    <div className="flex justify-between">
                      <span>Kartu Ucapan Cetak</span>
                      <span className="font-semibold">+Rp 5.000</span>
                    </div>
                  )}
                  {stickCard && (
                    <div className="flex justify-between">
                      <span>Stick Card</span>
                      <span className="font-semibold">+Rp 5.000</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-base font-bold" style={{ color: "#162E93" }}>
                    <span>Total</span>
                    <span>Rp {getTotal().toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button type="primary" htmlType="submit" loading={loading} icon={<SendOutlined />} size="large" block style={{ backgroundColor: "#162E93", borderColor: "#162E93", borderRadius: 14, height: 48, fontWeight: 700 }}>
                  Simpan Pesanan
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
