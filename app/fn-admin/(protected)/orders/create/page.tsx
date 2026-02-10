"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Row, Col, DatePicker, TimePicker, Select, InputNumber, Table, Space, Spin, message } from "antd";
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

  const onFinish = async (values: any) => {
    if (orderItems.length === 0) {
      message.error("Tambahkan minimal 1 item ke pesanan");
      return;
    }

    try {
      setLoading(true);

      // Buat customer baru
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

      const payload = {
        customerId,
        items: orderItems,
        deliveryMethod: values.deliveryMethod,
        pickupDate: values.pickupDate ? values.pickupDate.toDate() : null,
        pickupTime: values.pickupTime ? values.pickupTime.format("HH:mm") : null,
        deliveryDate: values.deliveryDate ? values.deliveryDate.toDate() : null,
        deliveryTime: values.deliveryTime ? values.deliveryTime.format("HH:mm") : null,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        deliveryAddress: values.deliveryAddress,
        notes: values.notes,
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
    },
    {
      title: "Harga",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `Rp ${price.toLocaleString()}`,
    },
    {
      title: "Jumlah",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (subtotal: number) => `Rp ${subtotal.toLocaleString()}`,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: OrderItem) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.productId)} />,
    },
  ];

  if (initialLoading) {
    return <Spin />;
  }

  return (
    <div className="px-2 sm:px-0">
      <h1 className="text-2xl font-bold mb-6">Buat Pesanan Baru</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Detail Pesanan">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                deliveryMethod: "PICKUP",
              }}
            >
              <h3 className="text-lg font-semibold mb-4">Data Customer</h3>

              <Form.Item label="Nama Customer" name="customerName" rules={[{ required: true, message: "Masukkan nama customer" }]}>
                <Input placeholder="Nama customer" />
              </Form.Item>

              <Form.Item label="No. Telepon Customer" name="customerPhone" rules={[{ required: true, message: "Masukkan no. telepon" }]}>
                <Input placeholder="No. telepon customer" />
              </Form.Item>

              <Form.Item label="Email Customer" name="customerEmail">
                <Input placeholder="Email customer" type="email" />
              </Form.Item>

              <hr className="my-4" />

              <h3 className="text-lg font-semibold mb-4">Detail Pengiriman</h3>

              <Form.Item label="Metode Pengiriman" name="deliveryMethod">
                <Select
                  options={[
                    { label: "Ambil di Tempat (Pickup)", value: "PICKUP" },
                    { label: "Diantar (Delivery)", value: "DELIVERY" },
                  ]}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Tanggal Pickup" name="pickupDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Jam Pickup" name="pickupTime">
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Nama Penerima" name="recipientName">
                <Input />
              </Form.Item>

              <Form.Item label="No. Telepon Penerima" name="recipientPhone">
                <Input />
              </Form.Item>

              <Form.Item label="Alamat Pengiriman" name="deliveryAddress">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Catatan" name="notes">
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Buat Pesanan
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Tambah Item">
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Select
                placeholder="Pilih produk"
                value={selectedProduct?.id}
                onChange={(value) => {
                  const product = products.find((p) => p.id === value);
                  setSelectedProduct(product || null);
                }}
                options={products.map((p) => ({
                  label: `${p.name} (Rp ${p.price.toLocaleString()})`,
                  value: p.id,
                }))}
              />
              <InputNumber min={1} value={quantity} onChange={(val) => setQuantity(val || 1)} placeholder="Jumlah" style={{ width: "100%" }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={addItemToOrder} block>
                Tambah Item
              </Button>
            </Space>
          </Card>

          <Card title="Ringkasan Pesanan" style={{ marginTop: 16 }} className="bg-blue-50">
            <Space orientation="vertical" style={{ width: "100%" }}>
              <div>
                <p className="text-sm text-gray-600">Total Item</p>
                <p className="text-lg font-bold">{orderItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Harga</p>
                <p className="text-xl font-bold text-blue-600">Rp {getTotalAmount().toLocaleString()}</p>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Item Pesanan" style={{ marginTop: 16 }}>
        <Table columns={itemColumns} dataSource={orderItems} rowKey="key" pagination={false} />
      </Card>
    </div>
  );
}
