"use client";

import { Row, Col, Card, Statistic, Table, Tag, Spin, Input, Button, message, Select, Modal, Alert } from "antd";
import { ShoppingOutlined, ShoppingCartOutlined, DollarOutlined, CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayPickups: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer?: { name: string };
  customerName?: string;
  totalAmount: number;
  status: string;
  pickupDate: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayPickups: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pickedUpOrders, setPickedUpOrders] = useState<Order[]>([]);
  const [searchPickedUp, setSearchPickedUp] = useState("");
  const [filterDate, setFilterDate] = useState("today");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const searchOrder = async () => {
    if (!verificationCode.trim()) return;

    try {
      setSearchLoading(true);
      const ordersRes = await fetch("/api/orders?limit=1000");
      const ordersData = await ordersRes.json();
      const orders = ordersData.data || [];

      const order = orders.find((o: Order) => o.orderNumber.toUpperCase() === verificationCode.toUpperCase() || o.id.toUpperCase() === verificationCode.toUpperCase());

      if (order) {
        setSearchedOrder(order);
        setModalType("success");
        const custName = order.customer?.name || order.customerName || "Unknown";
        setModalMessage(`Order ditemukan!\n\nNama: ${custName}\nNo Order: ${order.orderNumber}\nTotal: Rp ${(order.totalAmount || 0).toLocaleString()}\n\nKlik "Tandai Diambil" untuk melanjutkan.`);
        setModalVisible(true);
      } else {
        setSearchedOrder(null);
        setModalType("error");
        setModalMessage(`Order tidak ditemukan!\n\nSilakan cek kembali kode yang Anda masukkan.`);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error searching order:", error);
      setSearchedOrder(null);
      setModalType("error");
      setModalMessage("Terjadi kesalahan saat mencari order.");
      setModalVisible(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const markAsPickedUp = async () => {
    if (!searchedOrder) return;

    try {
      setSearchLoading(true);
      const res = await fetch(`/api/orders/${searchedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (res.ok) {
        setModalType("success");
        setModalMessage(`✅ Pesanan berhasil ditandai diambil!\n\nNama: ${searchedOrder.customerName}\nNo Order: ${searchedOrder.orderNumber}`);
        setVerificationCode("");
        setSearchedOrder(null);
        fetchDashboardData(); // Refresh dashboard
        setTimeout(() => {
          setModalVisible(false);
        }, 2000);
      } else {
        setModalType("error");
        setModalMessage("Gagal menandai pesanan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error marking order as picked up:", error);
      setModalType("error");
      setModalMessage("Terjadi kesalahan saat menandai pesanan.");
    } finally {
      setSearchLoading(false);
    }
  };

  const getFilteredPickedUpOrders = () => {
    let filtered = pickedUpOrders;

    if (filterDate === "today") {
      const today = dayjs().format("YYYY-MM-DD");
      filtered = filtered.filter((order: Order) => dayjs(order.pickupDate).format("YYYY-MM-DD") === today);
    }

    if (searchPickedUp.trim()) {
      const search = searchPickedUp.toLowerCase();
      filtered = filtered.filter((order: Order) => {
        const customerName = (order.customerName ?? order.customer?.name ?? "").toLowerCase();
        return order.orderNumber.toLowerCase().includes(search) || customerName.includes(search);
      });
    }

    return filtered;
  };

  const pickedUpColumns = [
    {
      title: "No Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Kode Ambil",
      key: "pickupCode",
      render: () => "BK-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      width: 120,
    },
    {
      title: "Nama",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Jadwal",
      dataIndex: "pickupDate",
      key: "pickupDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="green">Sudah Diambil</Tag>,
    },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch products count
      const productsRes = await fetch("/api/products?limit=1");
      const productsData = await productsRes.json();
      const totalProducts = productsData.pagination?.total || 0;

      // Fetch orders
      const ordersRes = await fetch("/api/orders?limit=1000");
      const ordersData = await ordersRes.json();
      const orders = ordersData.data || [];

      // Calculate stats
      const totalOrders = orders.length;
      const totalRevenue = orders.filter((order: Order) => order.status !== "CANCELLED").reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0);

      // Today's pickups
      const today = dayjs().format("YYYY-MM-DD");
      const todayPickups = orders.filter((order: Order) => dayjs(order.pickupDate).format("YYYY-MM-DD") === today && order.status !== "CANCELLED").length;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        todayPickups,
      });

      // Recent orders (last 5)
      const recent = orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
      setRecentOrders(recent);

      // Upcoming deliveries (next 7 days, not completed)
      const nextWeek = dayjs().add(7, "day");
      const upcoming = orders
        .filter((order: Order) => dayjs(order.pickupDate).isAfter(dayjs()) && dayjs(order.pickupDate).isBefore(nextWeek) && order.status !== "COMPLETED" && order.status !== "CANCELLED")
        .sort((a: Order, b: Order) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime())
        .slice(0, 5);
      setUpcomingDeliveries(upcoming);

      // Picked up orders (COMPLETED status)
      const pickedUp = orders.filter((order: Order) => order.status === "COMPLETED").sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPickedUpOrders(pickedUp);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "orange",
      PROCESSING: "blue",
      READY: "cyan",
      COMPLETED: "green",
      CANCELLED: "red",
    };
    return colors[status] || "default";
  };

  const orderColumns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `Rp ${(price || 0).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
  ];

  const deliveryColumns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Pickup Date",
      dataIndex: "pickupDate",
      key: "pickupDate",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Dashboard</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Products" value={stats.totalProducts} prefix={<ShoppingOutlined />} className="[&_.ant-statistic-content]:text-green-600" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Orders" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} className="[&_.ant-statistic-content]:text-blue-500" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Revenue" value={stats.totalRevenue} prefix="Rp " className="[&_.ant-statistic-content]:text-red-600" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Today's Pickups" value={stats.todayPickups} prefix={<CalendarOutlined />} className="[&_.ant-statistic-content]:text-purple-600" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col xs={24} lg={16}>
          <Card className="mb-6">
            <h2 className="text-lg font-bold mb-4">Verifikasi Manual</h2>
            <p className="text-gray-600 mb-4">Tempelkan hasil scan atau ketik Kode Ambil / No Order, lalu klik Tandai Diambil.</p>
            <div className="mb-4">
              <Input placeholder="Contoh: BK-4F9C2A atau ORD-000127" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} onPressEnter={searchOrder} size="large" />
            </div>

            {searchedOrder && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold">Order: {searchedOrder.orderNumber}</p>
                <p className="text-sm">Customer: {searchedOrder.customer?.name || searchedOrder.customerName || "Unknown"}</p>
                <p className="text-sm">Total: Rp {(searchedOrder.totalAmount || 0).toLocaleString()}</p>
                <p className="text-sm">
                  Status: <Tag color={getStatusColor(searchedOrder.status)}>{searchedOrder.status}</Tag>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={searchOrder} loading={searchLoading} size="large" className="bg-slate-900 text-white hover:bg-slate-800">
                Cari Pesanan
              </Button>
              {searchedOrder && (
                <Button onClick={markAsPickedUp} loading={searchLoading} size="large" className="bg-green-600 text-white hover:bg-green-700">
                  Tandai Diambil
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Orders" className="h-full">
            {recentOrders.length > 0 ? <Table dataSource={recentOrders} columns={orderColumns} pagination={false} size="small" rowKey="id" /> : <p className="text-gray-500">No orders yet</p>}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Upcoming Deliveries (Next 7 Days)" className="h-full">
            {upcomingDeliveries.length > 0 ? <Table dataSource={upcomingDeliveries} columns={deliveryColumns} pagination={false} size="small" rowKey="id" /> : <p className="text-gray-500">No scheduled deliveries</p>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Daftar Pesanan">
            <div className="mb-4 flex gap-2 flex-col sm:flex-row">
              <Input placeholder="Cari nama / order / pickup code..." value={searchPickedUp} onChange={(e) => setSearchPickedUp(e.target.value)} prefix={<SearchOutlined />} className="flex-1" />
              <Select
                value={filterDate}
                onChange={setFilterDate}
                style={{ width: 150 }}
                options={[
                  { label: "Hari Ini", value: "today" },
                  { label: "Semua", value: "all" },
                ]}
              />
            </div>

            <Table dataSource={getFilteredPickedUpOrders()} columns={pickedUpColumns} pagination={{ pageSize: 10 }} size="small" rowKey="id" />
          </Card>
        </Col>
      </Row>

      <Modal
        title={modalType === "success" ? "✅ Pesanan Ditemukan" : modalType === "error" ? "❌ Pesanan Tidak Ditemukan" : "⚠️ Peringatan"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={
          searchedOrder && modalType === "success"
            ? [
                <Button
                  key="cancel"
                  onClick={() => {
                    setModalVisible(false);
                    setSearchedOrder(null);
                    setVerificationCode("");
                  }}
                >
                  Batal
                </Button>,
                <Button key="submit" type="primary" loading={searchLoading} onClick={markAsPickedUp} className="bg-green-600 hover:bg-green-700">
                  Tandai Diambil
                </Button>,
              ]
            : [
                <Button
                  key="close"
                  onClick={() => {
                    setModalVisible(false);
                    setVerificationCode("");
                  }}
                >
                  Tutup
                </Button>,
              ]
        }
      >
        <p className="whitespace-pre-wrap text-base">{modalMessage}</p>
      </Modal>
    </div>
  );
}
