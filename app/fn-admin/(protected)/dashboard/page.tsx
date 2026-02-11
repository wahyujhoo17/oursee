"use client";

import { Table, Tag, Spin, Input, Button, message, Select, Modal } from "antd";
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
  notes?: string | null;
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

  const getPickupCode = (notes?: string | null) => {
    const match = (notes || "").match(/Pickup Code: (OS-\d+)/);
    return match ? match[1] : "-";
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
      render: (_: unknown, record: Order) => getPickupCode(record.notes),
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
      const totalRevenue = orders.filter((order: Order) => order.status === "COMPLETED").reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0);

      // Today's pickups
      const today = dayjs().format("YYYY-MM-DD");
      const todayPickups = orders.filter((order: Order) => dayjs(order.pickupDate).format("YYYY-MM-DD") === today && order.status !== "CANCELLED").length;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        todayPickups,
      });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">Good Morning, Admin!</h1>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {/* Total Produk */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-100 via-blue-50 to-purple-50 p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <ShoppingOutlined className="text-sm text-gray-600" />
              <p className="text-xs font-medium text-gray-600">Products</p>
            </div>
            <p className="text-5xl font-bold text-gray-900">{stats.totalProducts}</p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">Total active products in your catalog right now.</p>
          </div>

          {/* Total Orders */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-purple-100 via-purple-50 to-pink-50 p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <ShoppingCartOutlined className="text-sm text-gray-600" />
              <p className="text-xs font-medium text-gray-600">Orders</p>
            </div>
            <p className="text-5xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">All orders received from customers.</p>
          </div>

          {/* Revenue */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-green-100 via-green-50 to-blue-50 p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <DollarOutlined className="text-sm text-gray-600" />
              <p className="text-xs font-medium text-gray-600">Revenue</p>
            </div>
            <p className="text-4xl font-bold text-gray-900">Rp {stats.totalRevenue.toLocaleString()}</p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">Total revenue from completed orders only.</p>
          </div>

          {/* Pickup Hari Ini */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-orange-100 via-orange-50 to-yellow-50 p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <CalendarOutlined className="text-sm text-gray-600" />
              <p className="text-xs font-medium text-gray-600">Today's Pickup</p>
            </div>
            <p className="text-5xl font-bold text-gray-900">{stats.todayPickups}</p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">Scheduled pickups for today.</p>
          </div>
        </div>

        {/* Verification Section */}
        <div className="mt-10">
          <div className="rounded-2xl bg-gray-100 p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Order Verification</h2>
              <p className="mt-1 text-sm text-gray-500">Scan or enter pickup code to mark as completed</p>
            </div>

            <div className="relative space-y-5">
              <Input
                placeholder="Enter pickup code or order number..."
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onPressEnter={searchOrder}
                size="large"
                prefix={<SearchOutlined className="text-gray-400" />}
                className="rounded-lg"
              />

              {searchedOrder && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-gray-900">{searchedOrder.orderNumber}</p>
                      <p className="text-sm text-gray-600">{searchedOrder.customer?.name || searchedOrder.customerName || "Unknown"}</p>
                      <p className="text-sm font-medium text-gray-900">Rp {(searchedOrder.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <Tag color={getStatusColor(searchedOrder.status)}>{searchedOrder.status}</Tag>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={searchOrder} loading={searchLoading} size="large" className="flex-1 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                  Search Order
                </Button>
                {searchedOrder && (
                  <Button onClick={markAsPickedUp} loading={searchLoading} size="large" className="flex-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    Mark as Picked Up
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order List Section */}
        <div className="mt-10">
          <div className="rounded-2xl bg-gray-100 p-8 shadow-sm">
            <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Order History</h3>
                <p className="mt-1 text-sm text-gray-500">Completed pickup orders</p>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Search orders..."
                  value={searchPickedUp}
                  onChange={(e) => setSearchPickedUp(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="w-64 rounded-lg"
                  size="large"
                />
                <Select
                  value={filterDate}
                  onChange={setFilterDate}
                  size="large"
                  className="w-40"
                  options={[
                    { label: "Hari Ini", value: "today" },
                    { label: "Semua", value: "all" },
                  ]}
                />
              </div>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-xl border border-gray-200">
              <Table dataSource={getFilteredPickedUpOrders()} columns={pickedUpColumns} pagination={{ pageSize: 10, showSizeChanger: false }} size="middle" rowKey="id" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={modalType === "success" ? "✅ Order Found" : modalType === "error" ? "❌ Order Not Found" : "⚠️ Warning"}
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
                  className="rounded-lg"
                >
                  Cancel
                </Button>,
                <Button key="submit" type="primary" loading={searchLoading} onClick={markAsPickedUp} className="rounded-lg bg-blue-600 hover:bg-blue-700">
                  Mark as Picked Up
                </Button>,
              ]
            : [
                <Button
                  key="close"
                  onClick={() => {
                    setModalVisible(false);
                    setVerificationCode("");
                  }}
                  className="rounded-lg"
                >
                  Close
                </Button>,
              ]
        }
      >
        <p className="whitespace-pre-wrap text-base">{modalMessage}</p>
      </Modal>
    </div>
  );
}
