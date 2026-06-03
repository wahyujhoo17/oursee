"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Row, Col, DatePicker, TimePicker, Select, InputNumber, Table, Space, Spin, message, Checkbox } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface Product {
  id: string;
  productCode: string;
  name: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
}

interface OrderItem {
  key: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [greetingCard, setGreetingCard] = useState(false);
  const [stickCard, setStickCard] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const productsRes = await fetch("/api/products?limit=1000");
      const productsData = await productsRes.json();
      setProducts(productsData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Gagal memuat data produk");
    } finally {
      setInitialLoading(false);
    }
  };

  const addItemToOrder = () => {
    if (!selectedProduct || quantity <= 0) {
      message.error("Pilih produk dan masukkan jumlah");
      return;
    }

    const existingItem = orderItems.find((item) => item.productId === selectedProduct.id);

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * selectedProduct.price,
              }
            : item,
        ),
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          key: selectedProduct.id,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          price: selectedProduct.price,
          quantity,
          subtotal: selectedProduct.price * quantity,
        },
      ]);
    }

    setSelectedProduct(null);
    setQuantity(1);
    message.success("Item ditambahkan");
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getAddOnsCost = (greetingCard?: boolean, stickCard?: boolean) => {
    let cost = 0;
    if (greetingCard) cost += 5000;
    if (stickCard) cost += 5000;
    return cost;
  };

  const onFinish = async (values: any) => {
    if (orderItems.length === 0) {
      message.error("Tambahkan minimal 1 item ke pesanan");
      return;
    }

    try {
      setLoading(true);

      const customerRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.customerName,
          phone: values.customerPhone,
          email: values.customerEmail,
          address: values.deliveryAddress,
        }),
      });

      if (!customerRes.ok) {
        message.error("Gagal membuat customer");
        return;
      }

      const customerData = await customerRes.json();
      const customerId = customerData.id;

      // Generate pickup code (OS-XXXX format)
      const pickupCodeNumber = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(2, "0");
      const pickupCode = `OS-${pickupCodeNumber}`;

      // Build notes with add-ons and additional notes
      const addonsText = [`Pickup Code: ${pickupCode}`, `Greeting Card: ${values.greetingCard ? "ya" : "tidak"}`, `Stick Card: ${values.stickCard ? "ya" : "tidak"}`].join("\n");

      const notes = [addonsText, values.additionalNotes ? `Keterangan Tambahan: ${values.additionalNotes}` : ""].filter(Boolean).join("\n\n");

      // Calculate totals
      const itemsTotal = getTotalAmount();
      const addOnsCost = getAddOnsCost(values.greetingCard, values.stickCard);
      const totalAmount = itemsTotal + addOnsCost;

      const payload = {
        customerId,
        items: orderItems,
        totalAmount: totalAmount,
        deliveryMethod: values.deliveryMethod,
        pickupDate: values.pickupDate ? values.pickupDate.toDate() : null,
        pickupTime: values.pickupTime ? values.pickupTime.format("HH:mm") : null,
        deliveryDate: values.deliveryDate ? values.deliveryDate.toDate() : null,
        deliveryTime: values.deliveryTime ? values.deliveryTime.format("HH:mm") : null,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        deliveryAddress: values.deliveryAddress,
        notes: notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const orderData = await res.json();
        message.success("Pesanan berhasil dibuat!");
        setTimeout(() => {
          router.push("/fn-admin/orders");
        }, 1000);
      } else {
        message.error("Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      message.error("Terjadi kesalahan saat membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: "Produk",
      dataIndex: "productName",
      key: "productName",
      render: (text: string) => <span className="font-semibold text-slate-900">{text}</span>,
    },
    {
      title: "Harga",
      dataIndex: "price",
      key: "price",
      render: (price: number) => <span className="text-slate-700">Rp {price.toLocaleString()}</span>,
    },
    {
      title: "Jumlah",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => <span className="font-medium text-slate-700">{qty}</span>,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (subtotal: number) => <span className="font-semibold text-blue-600">Rp {subtotal.toLocaleString()}</span>,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: OrderItem) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.productId)} size="small" />,
    },
  ];

  if (initialLoading) {
    return <Spin />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Buat Pesanan Baru</h1>
          <p className="mt-3 text-base text-slate-600">Isi formulir di bawah untuk menambahkan pesanan baru ke sistem</p>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div className="rounded-2xl bg-white p-8 shadow-md border border-slate-200">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Detail Pesanan</h2>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={(changedValues, allValues) => {
                  if (changedValues.greetingCard !== undefined) {
                    setGreetingCard(changedValues.greetingCard);
                  }
                  if (changedValues.stickCard !== undefined) {
                    setStickCard(changedValues.stickCard);
                  }
                }}
                initialValues={{
                  deliveryMethod: "PICKUP",
                }}
                autoComplete="off"
              >
                {/* Bagian Customer */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-900">Data Customer</h3>
                  </div>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span className="font-medium text-slate-700">Nama Customer</span>} name="customerName" rules={[{ required: true, message: "Masukkan nama customer" }]}>
                        <Input placeholder="Contoh: Budi Santoso" className="rounded-lg" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span className="font-medium text-slate-700">No. Telepon</span>} name="customerPhone" rules={[{ required: true, message: "Masukkan no. telepon" }]}>
                        <Input placeholder="Contoh: 08123456789" className="rounded-lg" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Col xs={24}>
                    <Form.Item label={<span className="font-medium text-slate-700">Email</span>} name="customerEmail">
                      <Input placeholder="Contoh: budi@email.com" type="email" className="rounded-lg" size="large" />
                    </Form.Item>
                  </Col>
                </div>

                <div className="border-t border-slate-200 my-8"></div>

                {/* Bagian Pengiriman */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-900">Detail Pengiriman</h3>
                  </div>

                  <Form.Item label={<span className="font-medium text-slate-700">Metode Pengiriman</span>} name="deliveryMethod">
                    <Select
                      size="large"
                      className="rounded-lg"
                      options={[
                        { label: "Ambil di Tempat (Pickup)", value: "PICKUP" },
                        { label: "Diantar (Delivery)", value: "DELIVERY" },
                      ]}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span className="font-medium text-slate-700">Tanggal Pickup</span>} name="pickupDate">
                        <DatePicker style={{ width: "100%" }} className="rounded-lg" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span className="font-medium text-slate-700">Jam Pickup</span>} name="pickupTime">
                        <TimePicker format="HH:mm" style={{ width: "100%" }} className="rounded-lg" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span className="font-medium text-slate-700">Nama Penerima</span>} name="recipientName">
                        <Input placeholder="Nama penerima pesanan" className="rounded-lg" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<span className="font-medium text-slate-700">No. Telepon Penerima</span>} name="recipientPhone">
                        <Input placeholder="No. telepon penerima" className="rounded-lg" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label={<span className="font-medium text-slate-700">Alamat Pengiriman</span>} name="deliveryAddress">
                    <Input.TextArea rows={3} placeholder="Masukkan alamat pengiriman lengkap" className="rounded-lg" />
                  </Form.Item>
                </div>

                <div className="border-t border-slate-200 my-8"></div>

                {/* Add-ons */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-900">Add-ons (Opsional)</h3>
                  </div>

                  <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <Form.Item name="greetingCard" valuePropName="checked" initialValue={false}>
                      <Checkbox className="text-slate-700">
                        <span className="font-medium">🎴 Greeting Card Cetak</span>
                        <span className="text-xs text-slate-500 ml-2">(Kartu ucapan cetak dengan desain khusus)</span>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item name="stickCard" valuePropName="checked" initialValue={false}>
                      <Checkbox className="text-slate-700">
                        <span className="font-medium">🏷️ Stick Card</span>
                        <span className="text-xs text-slate-500 ml-2">(Kartu kecil untuk ditempel pada bunga)</span>
                      </Checkbox>
                    </Form.Item>
                  </div>
                </div>

                <div className="border-t border-slate-200 my-8"></div>

                {/* Catatan */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-900">Catatan & Keterangan</h3>
                  </div>

                  <Form.Item label={<span className="font-medium text-slate-700">Catatan Tambahan (Opsional)</span>} name="additionalNotes">
                    <Input.TextArea rows={2} placeholder="Masukkan catatan tambahan untuk pesanan ini (pesan khusus, instruksi khusus, dll)" className="rounded-lg" />
                  </Form.Item>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    className="rounded-lg border-0 font-semibold h-12 w-full sm:w-auto"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                      color: "#ffffff",
                    }}
                  >
                    Buat Pesanan
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            {/* Tambah Item Card */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200 mb-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Pilih Produk</h3>
                <p className="text-sm text-slate-600 mt-1">Tambahkan item ke pesanan</p>
              </div>

              <Space orientation="vertical" style={{ width: "100%" }}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Produk</label>
                  <Select
                    placeholder="Pilih produk..."
                    value={selectedProduct?.id}
                    onChange={(value) => {
                      const product = products.find((p) => p.id === value);
                      setSelectedProduct(product || null);
                    }}
                    size="large"
                    className="rounded-lg w-full"
                    options={products.map((p) => ({
                      label: `${p.name} • Rp ${p.price.toLocaleString()}`,
                      value: p.id,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah</label>
                  <InputNumber min={1} value={quantity} onChange={(val) => setQuantity(val || 1)} placeholder="Jumlah" size="large" style={{ width: "100%" }} className="rounded-lg" />
                </div>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addItemToOrder}
                  block
                  size="large"
                  className="rounded-lg border-0 font-semibold h-11"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    color: "#ffffff",
                  }}
                >
                  Tambah Item
                </Button>
              </Space>
            </div>

            {/* Ringkasan Pesanan Card */}
            <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-6 border border-blue-200">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Ringkasan Pesanan</h3>
              </div>

              <Space orientation="vertical" style={{ width: "100%" }} size="large">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Total Item</p>
                  <p className="text-2xl font-bold text-blue-600">{orderItems.length}</p>
                </div>

                <div className="border-t border-blue-200"></div>

                {/* Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600">Subtotal Produk</p>
                    <p className="font-medium text-slate-700">Rp {getTotalAmount().toLocaleString()}</p>
                  </div>
                  {greetingCard && (
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600">Greeting Card</p>
                      <p className="font-medium text-slate-700">+Rp 5.000</p>
                    </div>
                  )}
                  {stickCard && (
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600">Stick Card</p>
                      <p className="font-medium text-slate-700">+Rp 5.000</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-blue-200"></div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Total Harga</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">Rp {(getTotalAmount() + getAddOnsCost(greetingCard, stickCard)).toLocaleString()}</p>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Item Table Card */}
        <div className="rounded-2xl bg-white p-8 shadow-md border border-slate-200 mt-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Daftar Item Pesanan</h3>
            <p className="text-sm text-slate-600 mt-2">Produk yang telah ditambahkan ke pesanan</p>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table columns={itemColumns} dataSource={orderItems} rowKey="key" pagination={false} className="bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
