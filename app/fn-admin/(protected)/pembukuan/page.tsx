"use client";

import { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, InputNumber, message, Statistic, Table } from "antd";
import dayjs from "dayjs";

interface FinanceSummary {
  monthLabel: string;
  openingBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  closingBalance: number;
  grossProfit: number;
  totalOrders: number;
}

interface LedgerEntry {
  date: string;
  type: string;
  description: string;
  income: number;
  expense: number;
  balance: number;
}

export default function AdminBookkeepingPage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const [summaryRes, ledgerRes] = await Promise.all([fetch("/api/finance/summary"), fetch("/api/finance/ledger")]);
      const summaryData = await summaryRes.json();
      const ledgerData = await ledgerRes.json();

      setSummary(summaryData);
      setLedger(ledgerData.ledger || []);
    } catch (error) {
      message.error("Gagal memuat data pembukuan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const onFinish = async (values: { amount: number; date: string; description?: string }) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/opening-balances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: values.amount,
          date: values.date,
          description: values.description || "Saldo awal",
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan saldo awal");

      message.success("Saldo awal berhasil disimpan");
      form.resetFields();
      fetchSummary();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Gagal menyimpan saldo awal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Pembukuan</h1>
        <p className="text-gray-500">Pantau saldo awal, pendapatan, pengeluaran, saldo akhir, dan laba kotor.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card title={`Ringkasan Keuangan ${summary?.monthLabel || "Bulan Ini"}`} loading={loading}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Statistic title="Saldo Awal" value={summary?.openingBalance ?? 0} prefix="Rp " formatter={(value) => Number(value).toLocaleString("id-ID")} />
            <Statistic title="Total Pendapatan" value={summary?.totalRevenue ?? 0} prefix="Rp " formatter={(value) => Number(value).toLocaleString("id-ID")} />
            <Statistic title="Total Pengeluaran" value={summary?.totalExpenses ?? 0} prefix="Rp " formatter={(value) => Number(value).toLocaleString("id-ID")} />
            <Statistic title="Saldo Akhir" value={summary?.closingBalance ?? 0} prefix="Rp " formatter={(value) => Number(value).toLocaleString("id-ID")} />
            <Statistic title="Laba Kotor" value={summary?.grossProfit ?? 0} prefix="Rp " formatter={(value) => Number(value).toLocaleString("id-ID")} />
            <Statistic title="Order Selesai" value={summary?.totalOrders ?? 0} />
          </div>
          <p className="mt-4 text-sm text-gray-500">Perhitungan di bawah ini hanya menghitung data bulan berjalan, sesuai saldo awal bulan yang Anda masukkan.</p>
        </Card>

        <Card title="Set Saldo Awal">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Jumlah Saldo Awal" name="amount" rules={[{ required: true, message: "Masukkan jumlah saldo awal" }]}>
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="Tanggal" name="date" rules={[{ required: true, message: "Pilih tanggal" }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="Keterangan" name="description">
              <input className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Contoh: Saldo awal bulan Juni" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} className="w-full">
                Simpan Saldo Awal
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Card title="Daftar Balance Bulan Ini" loading={loading}>
        <Table
          rowKey={(record) => `${record.date}-${record.description}`}
          dataSource={ledger}
          pagination={false}
          columns={[
            {
              title: "Tanggal",
              dataIndex: "date",
              key: "date",
              render: (value) => dayjs(value).format("DD MMM YYYY"),
            },
            {
              title: "Keterangan",
              dataIndex: "description",
              key: "description",
            },
            {
              title: "Masuk",
              dataIndex: "income",
              key: "income",
              render: (value) => (value ? `Rp ${Number(value).toLocaleString("id-ID")}` : "-"),
            },
            {
              title: "Keluar",
              dataIndex: "expense",
              key: "expense",
              render: (value) => (value ? `Rp ${Number(value).toLocaleString("id-ID")}` : "-"),
            },
            {
              title: "Balance",
              dataIndex: "balance",
              key: "balance",
              render: (value) => `Rp ${Number(value).toLocaleString("id-ID")}`,
            },
          ]}
        />
      </Card>
    </div>
  );
}
