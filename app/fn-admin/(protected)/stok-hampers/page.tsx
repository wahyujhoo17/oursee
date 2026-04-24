"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  message,
  Popconfirm,
  Card,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface HampersItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_OPTIONS = [
  { label: "🍽️ Piring", value: "PIRING" },
  { label: "☕ Cangkir", value: "CANGKIR" },
  { label: "🥣 Mangkok", value: "MANGKOK" },
];

const CATEGORY_COLOR: Record<string, string> = {
  PIRING: "blue",
  CANGKIR: "volcano",
  MANGKOK: "green",
};

const CATEGORY_EMOJI: Record<string, string> = {
  PIRING: "🍽️",
  CANGKIR: "☕",
  MANGKOK: "🥣",
};

export default function StokHampersPage() {
  const [items, setItems] = useState<HampersItem[]>([]);
  const [loading, setLoading] = useState(false);

  // form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HampersItem | null>(null);
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);

  // adjust stock modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState<HampersItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustLoading, setAdjustLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hampers");
      const data = await res.json();
      setItems(data);
    } catch {
      message.error("Gagal memuat data stok hampers");
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──
  const totalByCategory = (cat: string) =>
    items.filter((i) => i.category === cat).reduce((s, i) => s + i.stock, 0);

  // ── Open Add / Edit modal ──
  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (item: HampersItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      description: item.description,
    });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaveLoading(true);
    try {
      if (editingItem) {
        const res = await fetch(`/api/hampers/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error();
        message.success("Item berhasil diperbarui");
      } else {
        const res = await fetch("/api/hampers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error();
        message.success("Item berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      message.error("Gagal menyimpan item");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/hampers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      message.success("Item berhasil dihapus");
      fetchItems();
    } catch {
      message.error("Gagal menghapus item");
    }
  };

  // ── Adjust stock ──
  const openAdjust = (item: HampersItem) => {
    setAdjustItem(item);
    setAdjustDelta(0);
    setAdjustModal(true);
  };

  const handleAdjust = async () => {
    if (!adjustItem || adjustDelta === 0) return;
    const newStock = Math.max(0, adjustItem.stock + adjustDelta);
    setAdjustLoading(true);
    try {
      const res = await fetch(`/api/hampers/${adjustItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error();
      message.success(
        `Stok ${adjustItem.name} diubah: ${adjustItem.stock} → ${newStock}`
      );
      setAdjustModal(false);
      fetchItems();
    } catch {
      message.error("Gagal mengubah stok");
    } finally {
      setAdjustLoading(false);
    }
  };

  const columns: ColumnsType<HampersItem> = [
    {
      title: "Nama Item",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <p className="font-semibold text-slate-800">{name}</p>
          {record.description && (
            <p className="text-xs text-slate-400 mt-0.5">{record.description}</p>
          )}
        </div>
      ),
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      width: 140,
      filters: CATEGORY_OPTIONS.map((c) => ({ text: c.label, value: c.value })),
      onFilter: (value, record) => record.category === value,
      render: (cat) => (
        <Tag color={CATEGORY_COLOR[cat]} className="font-medium">
          {CATEGORY_EMOJI[cat]} {cat}
        </Tag>
      ),
    },
    {
      title: "Stok",
      dataIndex: "stock",
      key: "stock",
      width: 100,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock, record) => (
        <span
          className={`text-lg font-bold ${
            stock === 0
              ? "text-red-500"
              : stock <= 5
              ? "text-amber-500"
              : "text-emerald-600"
          }`}
        >
          {stock}
          <span className="text-xs font-normal text-slate-400 ml-1">
            {record.unit}
          </span>
        </span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<InboxOutlined />}
            onClick={() => openAdjust(record)}
            style={{ borderColor: "#6366f1", color: "#6366f1" }}
          >
            Ubah Stok
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Hapus item ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-amber-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              📦 Stok Hampers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola stok piring, cangkir, dan mangkok untuk hampers
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={openAdd}
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
            }}
          >
            Tambah Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              cat: "PIRING",
              label: "Total Piring",
              emoji: "🍽️",
              color: "#2563eb",
              bg: "from-blue-50 to-blue-100",
              border: "border-blue-200",
            },
            {
              cat: "CANGKIR",
              label: "Total Cangkir",
              emoji: "☕",
              color: "#ea580c",
              bg: "from-orange-50 to-orange-100",
              border: "border-orange-200",
            },
            {
              cat: "MANGKOK",
              label: "Total Mangkok",
              emoji: "🥣",
              color: "#16a34a",
              bg: "from-green-50 to-green-100",
              border: "border-green-200",
            },
          ].map(({ cat, label, emoji, color, bg, border }) => (
            <div
              key={cat}
              className={`rounded-2xl bg-linear-to-br ${bg} border ${border} p-5`}
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                {label}
              </p>
              <div className="flex items-end gap-2">
                <span
                  className="text-4xl font-extrabold"
                  style={{ color }}
                >
                  {totalByCategory(cat)}
                </span>
                <span className="text-2xl mb-1">{emoji}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {items.filter((i) => i.category === cat).length} jenis item
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg">Daftar Item</h2>
          </div>
          <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15, showSizeChanger: false }}
            scroll={{ x: 600 }}
          />
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={
          <span className="font-bold text-lg">
            {editingItem ? "Edit Item" : "Tambah Item Baru"}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="mt-4"
          initialValues={{ unit: "pcs", stock: 0 }}
        >
          <Form.Item
            label="Nama Item"
            name="name"
            rules={[{ required: true, message: "Masukkan nama item" }]}
          >
            <Input placeholder="Contoh: Piring Putih Polos" size="large" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label="Kategori"
            name="category"
            rules={[{ required: true, message: "Pilih kategori" }]}
          >
            <Select
              size="large"
              className="rounded-lg"
              placeholder="Pilih kategori..."
              options={CATEGORY_OPTIONS}
            />
          </Form.Item>

          <div className="flex gap-3">
            <Form.Item
              label="Stok Awal"
              name="stock"
              className="flex-1"
              rules={[{ required: true, message: "Masukkan stok" }]}
            >
              <InputNumber
                min={0}
                size="large"
                style={{ width: "100%" }}
                className="rounded-lg"
              />
            </Form.Item>
            <Form.Item label="Satuan" name="unit" className="w-28">
              <Input placeholder="pcs" size="large" className="rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item label="Keterangan (Opsional)" name="description">
            <Input.TextArea
              rows={2}
              placeholder="Contoh: diameter 20cm, warna putih"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setModalOpen(false)}>Batal</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saveLoading}
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Adjust Stock Modal ── */}
      <Modal
        title={
          <span className="font-bold text-lg">
            Ubah Stok — {adjustItem?.name}
          </span>
        }
        open={adjustModal}
        onCancel={() => setAdjustModal(false)}
        footer={null}
        centered
        width={380}
      >
        {adjustItem && (
          <div className="mt-4">
            <p className="text-slate-600 mb-4 text-center">
              Stok saat ini:{" "}
              <span className="font-bold text-2xl text-slate-900">
                {adjustItem.stock}
              </span>{" "}
              <span className="text-slate-400">{adjustItem.unit}</span>
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                icon={<MinusOutlined />}
                size="large"
                shape="circle"
                danger
                onClick={() => setAdjustDelta((d) => d - 1)}
                disabled={adjustItem.stock + adjustDelta <= 0}
              />
              <div className="text-center w-24">
                <InputNumber
                  value={adjustDelta}
                  onChange={(v) => setAdjustDelta(v || 0)}
                  size="large"
                  style={{ width: 96, textAlign: "center" }}
                  className="rounded-lg font-bold"
                />
                <p className="text-xs text-slate-400 mt-1">perubahan</p>
              </div>
              <Button
                icon={<PlusOutlined />}
                size="large"
                shape="circle"
                style={{ borderColor: "#16a34a", color: "#16a34a" }}
                onClick={() => setAdjustDelta((d) => d + 1)}
              />
            </div>

            {adjustDelta !== 0 && (
              <div
                className={`text-center mb-4 rounded-xl py-2 font-semibold ${
                  adjustDelta > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {adjustDelta > 0 ? "+" : ""}
                {adjustDelta} → Stok baru:{" "}
                <span className="font-extrabold">
                  {Math.max(0, adjustItem.stock + adjustDelta)}{" "}
                  {adjustItem.unit}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={() => setAdjustModal(false)}>Batal</Button>
              <Button
                type="primary"
                onClick={handleAdjust}
                loading={adjustLoading}
                disabled={adjustDelta === 0}
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Simpan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
