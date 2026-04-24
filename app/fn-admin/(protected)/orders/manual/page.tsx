"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, DatePicker, TimePicker, Select, InputNumber, Checkbox, message, Divider } from "antd";
import { SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const GREETING_CARD_PRICE = 5000;
const STICK_CARD_PRICE = 5000;

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
        message.success("Pesanan manual berhasil disimpan! 🌸");
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
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-rose-50 to-fuchsia-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-rose-800">💐 Form Pemesanan Manual</h1>
          <p className="mt-1 text-sm text-rose-500">Isi data pesanan yang masuk melalui WhatsApp atau langsung di toko</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white shadow-xl border border-rose-100 overflow-hidden">
          {/* Pink top banner */}
          <div className="bg-linear-to-r from-rose-400 to-fuchsia-400 px-8 py-5 flex items-center gap-3">
            <span className="text-2xl">💐</span>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Silakan isi form pemesanan berikut ya, kak</p>
              <p className="text-rose-100 text-xs mt-0.5">Semua field wajib diisi kecuali yang opsional</p>
            </div>
          </div>

          <div className="px-8 py-8">
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
              {/* ── 1. Nama Pemesan ── */}
              <div className="flex items-start gap-3 mb-1">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">1</span>
                <Form.Item className="flex-1 mb-4" label={<span className="font-semibold text-slate-700">Nama Pemesan</span>} name="customerName" rules={[{ required: true, message: "Masukkan nama pemesan" }]}>
                  <Input placeholder="Contoh: Anisa Rahma" size="large" className="rounded-xl" />
                </Form.Item>
              </div>

              {/* ── No. Telepon (needed to create customer) ── */}
              <div className="flex items-start gap-3 mb-1 pl-9">
                <Form.Item className="flex-1 mb-4" label={<span className="font-semibold text-slate-700">No. Telepon / WhatsApp</span>} name="customerPhone" rules={[{ required: true, message: "Masukkan nomor telepon" }]}>
                  <Input placeholder="Contoh: 08123456789" size="large" className="rounded-xl" />
                </Form.Item>
              </div>

              <Divider className="my-4 border-rose-100" />

              {/* ── 2. Jenis Buket + Harga ── */}
              <div className="flex items-start gap-3 mb-1">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">2</span>
                <div className="flex-1">
                  <Form.Item className="mb-4" label={<span className="font-semibold text-slate-700">Jenis Buket Bunga</span>} name="bouquetType" rules={[{ required: true, message: "Masukkan jenis buket" }]}>
                    <Input.TextArea placeholder="Deskripsikan jenis buket yang dipesan (contoh: buket mawar merah premium, bouquet dried flower, dll)" rows={3} className="rounded-xl" />
                  </Form.Item>

                  <Form.Item className="mb-4" label={<span className="font-semibold text-slate-700">Harga Buket (Rp)</span>} name="bouquetPrice" rules={[{ required: true, message: "Masukkan harga buket" }]}>
                    <InputNumber
                      placeholder="Contoh: 150000"
                      size="large"
                      min={0}
                      step={1000}
                      style={{ width: "100%" }}
                      className="rounded-xl"
                      formatter={(v) => (v ? `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "")}
                      parser={(v) => v!.replace(/Rp\s?|[.]/g, "") as any}
                    />
                  </Form.Item>
                  <p className="text-xs text-slate-400 -mt-3 mb-2">💡 Lampirkan foto referensi buket ke customer setelah mengisi form ini</p>
                </div>
              </div>

              <Divider className="my-4 border-rose-100" />

              {/* ── 3. Metode Pengambilan ── */}
              <div className="flex items-start gap-3 mb-1">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">3</span>
                <Form.Item
                  className="flex-1 mb-4"
                  label={<span className="font-semibold text-slate-700">Metode Pengambilan</span>}
                  name="deliveryMethod"
                  initialValue="PICKUP"
                  rules={[{ required: true, message: "Pilih metode pengambilan" }]}
                >
                  <Select
                    size="large"
                    className="rounded-xl"
                    options={[
                      {
                        label: "🏪 Self Pickup — Ambil Sendiri",
                        value: "PICKUP",
                      },
                      {
                        label: "🛵 Gosend — Customer yang Pesan",
                        value: "GOSEND",
                      },
                    ]}
                  />
                </Form.Item>
              </div>

              <Divider className="my-4 border-rose-100" />

              {/* ── 4. Tanggal & Jam Pengambilan ── */}
              <div className="flex items-start gap-3 mb-1">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">4</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 mb-3">Tanggal &amp; Jam Pengambilan</p>
                  <div className="flex gap-3">
                    <Form.Item
                      className="flex-1 mb-4"
                      name="pickupDate"
                      rules={[
                        {
                          required: true,
                          message: "Pilih tanggal pengambilan",
                        },
                      ]}
                    >
                      <DatePicker placeholder="Pilih tanggal" size="large" style={{ width: "100%" }} className="rounded-xl" disabledDate={(d) => d.isBefore(dayjs().startOf("day"))} />
                    </Form.Item>
                    <Form.Item className="flex-1 mb-4" name="pickupTime" rules={[{ required: true, message: "Pilih jam pengambilan" }]}>
                      <TimePicker placeholder="Pilih jam" format="HH:mm" size="large" style={{ width: "100%" }} className="rounded-xl" minuteStep={15} />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <Divider className="my-4 border-rose-100" />

              {/* ── 5. Pesan Kartu Ucapan ── */}
              <div className="flex items-start gap-3 mb-1">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">5</span>
                <Form.Item
                  className="flex-1 mb-4"
                  label={
                    <span className="font-semibold text-slate-700">
                      Pesan di Kartu Ucapan <span className="text-slate-400 font-normal text-xs">(Tulis Tangan)</span>
                    </span>
                  }
                  name="cardMessage"
                >
                  <Input.TextArea placeholder="Contoh: Happy Birthday Kakak! Semoga selalu sehat dan bahagia 🎂" rows={3} className="rounded-xl" />
                </Form.Item>
              </div>

              <Divider className="my-4 border-rose-100" />

              {/* ── Add-ons ── */}
              <div className="mb-6">
                <p className="font-semibold text-slate-700 mb-3">
                  ✨ Add-On <span className="text-slate-400 font-normal text-xs">(Opsional, centang jika ingin ditambahkan)</span>
                </p>

                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 space-y-4">
                  <Form.Item name="greetingCard" valuePropName="checked" initialValue={false} className="mb-0">
                    <Checkbox onChange={(e) => setGreetingCard(e.target.checked)}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎴</span>
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">Kartu Ucapan Cetak</p>
                          <p className="text-xs text-slate-500">+Rp 5.000 — kartu ucapan dicetak dengan desain khusus</p>
                        </div>
                      </div>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item name="stickCard" valuePropName="checked" initialValue={false} className="mb-0">
                    <Checkbox onChange={(e) => setStickCard(e.target.checked)}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏷️</span>
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">Stick Card</p>
                          <p className="text-xs text-slate-500">+Rp 5.000 — kartu kecil untuk ditempelkan pada bunga</p>
                        </div>
                      </div>
                    </Checkbox>
                  </Form.Item>
                </div>
              </div>

              {/* ── Total ── */}
              <div className="rounded-2xl bg-linear-to-r from-rose-100 to-fuchsia-100 border border-rose-200 p-5 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Harga Buket</span>
                    <span className="font-medium">Rp {(bouquetPrice || 0).toLocaleString("id-ID")}</span>
                  </div>
                  {greetingCard && (
                    <div className="flex justify-between text-slate-600">
                      <span>Kartu Ucapan Cetak</span>
                      <span className="font-medium">+Rp 5.000</span>
                    </div>
                  )}
                  {stickCard && (
                    <div className="flex justify-between text-slate-600">
                      <span>Stick Card</span>
                      <span className="font-medium">+Rp 5.000</span>
                    </div>
                  )}
                  <div className="border-t border-rose-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-rose-700 text-base">Total</span>
                    <span className="font-bold text-rose-700 text-xl">Rp {getTotal().toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* ── Submit ── */}
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
                  size="large"
                  block
                  style={{
                    background: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
                    border: "none",
                    height: 52,
                    borderRadius: 16,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                  }}
                >
                  Simpan Pesanan
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
