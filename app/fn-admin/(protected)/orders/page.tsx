"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Descriptions,
  Select,
  message,
  DatePicker,
} from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
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

  const columns: ColumnsType<Order> = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 150,
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customerName",
    },
    {
      title: "Phone",
      dataIndex: ["customer", "phone"],
      key: "phone",
    },
    {
      title: "Method",
      dataIndex: "deliveryMethod",
      key: "deliveryMethod",
      render: (method) => (
        <Tag color={method === "PICKUP" ? "purple" : "magenta"}>{method}</Tag>
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
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="px-2 sm:px-0">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Orders Management</h1>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
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

      <Modal
        title="Order Details"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: 700 }}
        centered
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Number" span={2}>
                {selectedOrder.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedOrder.customer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedOrder.customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedOrder.status]}>
                  {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Method">
                {selectedOrder.deliveryMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                Rp {selectedOrder.totalAmount.toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <h3 className="text-lg font-semibold mt-6 mb-3">Order Items</h3>
            <Table
              dataSource={selectedOrder.items}
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
                  render: (_, record) =>
                    `Rp ${(record.price * record.quantity).toLocaleString()}`,
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
