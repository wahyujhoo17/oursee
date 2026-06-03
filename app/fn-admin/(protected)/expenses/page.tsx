"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, DatePicker, Form, Input, InputNumber, message, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface Expense {
  id: string;
  expenseDate: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error("Gagal memuat data pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0), [expenses]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseDate: values.expenseDate?.toISOString?.() || values.expenseDate,
          category: values.category,
          description: values.description,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengeluaran");
      }

      message.success("Pengeluaran berhasil disimpan");
      form.resetFields();
      fetchExpenses();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Gagal menyimpan pengeluaran");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus pengeluaran");
      message.success("Pengeluaran berhasil dihapus");
      fetchExpenses();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Gagal menghapus pengeluaran");
    }
  };

  const [form] = Form.useForm();

  const currencyFormatter = (value?: string | number) => {
    const safeValue = value ?? 0;
    return `Rp ${String(safeValue).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const currencyParser = (value?: string) => Number(value?.replace(/Rp\s?|,/g, "") || 0);

  const columns: ColumnsType<Expense> = [
    {
      title: "Tanggal",
      dataIndex: "expenseDate",
      key: "expenseDate",
      render: (value) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Keterangan",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Jumlah",
      dataIndex: "amount",
      key: "amount",
      render: (value) => `Rp ${Number(value).toLocaleString("id-ID")}`,
    },
    {
      title: "Metode Bayar",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          Hapus
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Pengeluaran</h1>
        <p className="text-gray-500">Catat semua pengeluaran harian agar laporan lebih rapi.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Form Pengeluaran Baru">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Tanggal" name="expenseDate" rules={[{ required: true, message: "Pilih tanggal" }]}>
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item label="Kategori" name="category" rules={[{ required: true, message: "Masukkan kategori" }]}>
              <Input placeholder="Contoh: Bahan Bunga" />
            </Form.Item>

            <Form.Item label="Keterangan" name="description" rules={[{ required: true, message: "Masukkan keterangan" }]}>
              <Input.TextArea rows={3} placeholder="Contoh: Beli vas dan ribbon" />
            </Form.Item>

            <Form.Item label="Jumlah" name="amount" rules={[{ required: true, message: "Masukkan jumlah" }]}>
              <InputNumber min={0} className="w-full" formatter={currencyFormatter} parser={currencyParser} />
            </Form.Item>

            <Form.Item label="Metode Pembayaran" name="paymentMethod" rules={[{ required: true, message: "Pilih metode pembayaran" }]}>
              <Select
                options={[
                  { value: "CASH", label: "Tunai" },
                  { value: "TRANSFER", label: "Transfer" },
                  { value: "EWALLET", label: "E-Wallet" },
                ]}
                placeholder="Pilih metode pembayaran"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} className="w-full">
                Simpan Pengeluaran
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Ringkasan Pengeluaran">
          <div className="space-y-4">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm text-green-700">Total pengeluaran</p>
              <p className="text-2xl font-bold text-green-900">Rp {totalExpenses.toLocaleString("id-ID")}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">Data yang disimpan akan muncul di tabel di samping, sehingga pengeluaran Anda tercatat langsung di database.</div>
          </div>
        </Card>
      </div>

      <Card title="Daftar Pengeluaran">
        <Table rowKey="id" loading={loading} dataSource={expenses} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
