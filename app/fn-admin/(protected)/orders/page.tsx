"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Tag, Space, Button, Modal, Descriptions, Select, message, DatePicker, Row, Col, Input } from "antd";
import { EyeOutlined, EditOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  recipientName?: string | null;
  recipientPhone?: string | null;
  notes?: string | null;
  status: string;
  totalAmount: number;
  deliveryMethod: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  createdAt: Date;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: "orange",
  CONFIRMED: "blue",
  PREPARING: "cyan",
  READY: "green",
  COMPLETED: "success",
  CANCELLED: "red",
};

const getAddonInfo = (notes?: string | null) => {
  const text = notes || "";
  return {
    greeting: /greeting card:\s*ya/i.test(text),
    stick: /stick card:\s*ya/i.test(text),
  };
};

const getPickupCode = (notes?: string | null) => {
  const match = (notes || "").match(/Pickup Code: (OS-\d+)/);
  return match ? match[1] : "-";
};

const getOrderDescription = (notes?: string | null) => {
  const text = notes || "";
  const match = text.match(/Katatan Tambahan:\s*([\s\S]*?)\n\nAdd-ons:/i);
  const description = match ? match[1].trim() : "";
  return description || "-";
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchOrders(1, 10);
  }, []);

  const fetchOrders = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${page}&limit=${limit}`);
      const data = await res.json();
      setOrders(data.data || []);
      setPagination({
        current: data.pagination.page,
        pageSize: data.pagination.limit,
        total: data.pagination.total,
      });
    } catch (error) {
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      message.success("Order status updated");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const handleCancelOrder = (order: Order) => {
    Modal.confirm({
      title: "Cancel Order",
      content: `Apakah Anda yakin ingin membatalkan order ${order.orderNumber}?`,
      okText: "Cancel Order",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
        cancelOrder(order.id);
      },
    });
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      message.success("Order berhasil dibatalkan");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Failed to cancel order");
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 150,
    },
    {
      title: "Kode Ambil",
      key: "pickupCode",
      render: (_, record) => getPickupCode(record.notes),
      width: 120,
    },
    {
      title: "Customer",
      key: "customerName",
      render: (_, record) => record.recipientName || record.customer?.name || "-",
    },
    {
      title: "Phone",
      key: "phone",
      render: (_, record) => record.recipientPhone || record.customer?.phone || "-",
    },
    {
      title: "Method",
      dataIndex: "deliveryMethod",
      key: "deliveryMethod",
      render: (method) => (
        <Tag
          style={{
            border: method === "PICKUP" ? "2px solid #9333ea" : "2px solid #2563eb",
            color: method === "PICKUP" ? "#9333ea" : "#2563eb",
            background: method === "PICKUP" ? "#f3e8ff" : "#dbeafe",
            borderRadius: "9999px",
            padding: "4px 12px",
          }}
        >
          {method}
        </Tag>
      ),
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => {
        const date = record.pickupDate || record.deliveryDate;
        return date ? dayjs(date).format("DD MMM YYYY") : "-";
      },
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `Rp ${amount.toLocaleString()}`,
    },
    {
      title: "Add-ons",
      key: "addons",
      render: (_, record) => {
        const addons = getAddonInfo(record.notes);
        return (
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              {addons.greeting ? <CheckCircleOutlined title="Greeting Card Cetak" style={{ color: "#16a34a" }} /> : <CloseCircleOutlined title="Greeting Card Cetak" style={{ color: "#dc2626" }} />}
              <span>Greeting Card Cetak</span>
            </span>
            <span className="flex items-center gap-2">
              {addons.stick ? <CheckCircleOutlined title="Stick Card" style={{ color: "#16a34a" }} /> : <CloseCircleOutlined title="Stick Card" style={{ color: "#dc2626" }} />}
              <span>Stick Card</span>
            </span>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 140 }}
          options={[
            { label: "Pending", value: "PENDING" },
            { label: "Confirmed", value: "CONFIRMED" },
            { label: "Preparing", value: "PREPARING" },
            { label: "Ready", value: "READY" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Cancelled", value: "CANCELLED" },
          ]}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} size="small">
            View
          </Button>
          {record.status !== "CANCELLED" && (
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleCancelOrder(record)} size="small">
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchSearch = searchText ? order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) || (order.recipientName || order.customer?.name || "").toLowerCase().includes(searchText.toLowerCase()) : true;
    const matchStatus = statusFilter ? order.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="px-2 sm:px-0">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Orders Management</h1>
        <Link href="/fn-admin/orders/create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="border-0 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #93c5fd 0%, #c4b5fd 100%)",
              color: "#00008B",
            }}
            size="large"
          >
            Buat Pesanan Baru
          </Button>
        </Link>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Input.Search placeholder="Cari order number atau nama..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 280 }} allowClear />
        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
          allowClear
          options={[
            { label: "Pending", value: "PENDING" },
            { label: "Confirmed", value: "CONFIRMED" },
            { label: "Preparing", value: "PREPARING" },
            { label: "Ready", value: "READY" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Cancelled", value: "CANCELLED" },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} orders`,
        }}
        onChange={(pagination) => {
          fetchOrders(pagination.current, pagination.pageSize);
        }}
        scroll={{ x: 1000 }}
      />

      <Modal title="Order Details" open={detailModalOpen} onCancel={() => setDetailModalOpen(false)} footer={null} width="95%" style={{ maxWidth: 700 }} centered>
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Number" span={2}>
                {selectedOrder.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Kode Ambil" span={2}>
                {getPickupCode(selectedOrder.notes)}
              </Descriptions.Item>
              <Descriptions.Item label="Deskripsi" span={2}>
                {getOrderDescription(selectedOrder.notes)}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">{selectedOrder.recipientName || selectedOrder.customer?.name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedOrder.recipientPhone || selectedOrder.customer?.phone || "-"}</Descriptions.Item>
              <Descriptions.Item label="Add-ons" span={2}>
                {(() => {
                  const addons = getAddonInfo(selectedOrder.notes);
                  return (
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        {addons.greeting ? <CheckCircleOutlined title="Greeting Card Cetak" style={{ color: "#16a34a" }} /> : <CloseCircleOutlined title="Greeting Card Cetak" style={{ color: "#dc2626" }} />}
                        <span>Greeting Card Cetak</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {addons.stick ? <CheckCircleOutlined title="Stick Card" style={{ color: "#16a34a" }} /> : <CloseCircleOutlined title="Stick Card" style={{ color: "#dc2626" }} />}
                        <span>Stick Card</span>
                      </span>
                    </div>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedOrder.status]}>{selectedOrder.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Method">{selectedOrder.deliveryMethod}</Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                Rp {selectedOrder.totalAmount.toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <h3 className="text-lg font-semibold mt-6 mb-3">Order Items</h3>
            <Table
              dataSource={selectedOrder.items}
              rowKey={(_, index) => `item-${index}`}
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Product",
                  dataIndex: "productName",
                  key: "productName",
                },
                { title: "Quantity", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  render: (price) => `Rp ${price.toLocaleString()}`,
                },
                {
                  title: "Subtotal",
                  key: "subtotal",
                  render: (_, record) => `Rp ${(record.price * record.quantity).toLocaleString()}`,
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
