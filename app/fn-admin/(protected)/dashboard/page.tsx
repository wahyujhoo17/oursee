"use client";

import { Row, Col, Card, Statistic, Table, Tag, Spin } from "antd";
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
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
  customerName: string;
  totalPrice: number;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      const totalRevenue = orders
        .filter((order: Order) => order.status !== "CANCELLED")
        .reduce((sum: number, order: Order) => sum + order.totalPrice, 0);

      // Today's pickups
      const today = dayjs().format("YYYY-MM-DD");
      const todayPickups = orders.filter(
        (order: Order) =>
          dayjs(order.pickupDate).format("YYYY-MM-DD") === today &&
          order.status !== "CANCELLED",
      ).length;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        todayPickups,
      });

      // Recent orders (last 5)
      const recent = orders
        .sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);
      setRecentOrders(recent);

      // Upcoming deliveries (next 7 days, not completed)
      const nextWeek = dayjs().add(7, "day");
      const upcoming = orders
        .filter(
          (order: Order) =>
            dayjs(order.pickupDate).isAfter(dayjs()) &&
            dayjs(order.pickupDate).isBefore(nextWeek) &&
            order.status !== "COMPLETED" &&
            order.status !== "CANCELLED",
        )
        .sort(
          (a: Order, b: Order) =>
            new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime(),
        )
        .slice(0, 5);
      setUpcomingDeliveries(upcoming);
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
      render: (price: number) => `Rp ${price.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
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
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
              className="[&_.ant-statistic-content]:text-green-600"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              className="[&_.ant-statistic-content]:text-blue-500"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={stats.totalRevenue}
              prefix="Rp "
              className="[&_.ant-statistic-content]:text-red-600"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Pickups"
              value={stats.todayPickups}
              prefix={<CalendarOutlined />}
              className="[&_.ant-statistic-content]:text-purple-600"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Orders" className="h-full">
            {recentOrders.length > 0 ? (
              <Table
                dataSource={recentOrders}
                columns={orderColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            ) : (
              <p className="text-gray-500">No orders yet</p>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Upcoming Deliveries (Next 7 Days)" className="h-full">
            {upcomingDeliveries.length > 0 ? (
              <Table
                dataSource={upcomingDeliveries}
                columns={deliveryColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            ) : (
              <p className="text-gray-500">No scheduled deliveries</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
