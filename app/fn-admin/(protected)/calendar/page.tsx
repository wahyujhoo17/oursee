"use client";

import { useState, useEffect } from "react";
import { Calendar, Badge, Modal, Tag, Card, Button, Select, Tooltip } from "antd";
import { ClockCircleOutlined, UserOutlined, PhoneOutlined, ShoppingOutlined, EnvironmentOutlined, CalendarOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; phone: string };
  status: string;
  deliveryMethod: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  pickupTime?: string;
  deliveryTime?: string;
  totalAmount: number;
}

export default function AdminCalendarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [modalOpen, setModalOpen] = useState(false);
  const [dayOrders, setDayOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch all orders for calendar (limit=1000 to get all)
      const res = await fetch("/api/orders?limit=1000");
      const data = await res.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders");
    }
  };

  const getOrdersForDate = (date: Dayjs) => {
    return orders.filter((order) => {
      const orderDate = order.pickupDate || order.deliveryDate;
      if (!orderDate) return false;
      return dayjs(orderDate).isSame(date, "day");
    });
  };

  const dateCellRender = (date: Dayjs) => {
    const dayOrders = getOrdersForDate(date);
    if (dayOrders.length === 0) return null;

    return (
      <div className="flex flex-col gap-1 mt-1">
        {dayOrders.map((order) => {
          const isPickup = order.deliveryMethod === "PICKUP";
          const bgColor = isPickup ? "bg-purple-100" : "bg-pink-100";
          const textColor = isPickup ? "text-purple-700" : "text-pink-700";
          const borderColor = isPickup ? "border-purple-200" : "border-pink-200";

          return (
            <Tooltip key={order.id} title={`${order.customer.name} - ${order.status}`}>
              <div className={`text-[10px] px-1.5 py-0.5 rounded border ${bgColor} ${borderColor} ${textColor} truncate font-medium flex items-center gap-1 hover:brightness-95 transition-all`}>
                {isPickup ? <ShoppingOutlined className="text-[10px]" /> : <EnvironmentOutlined className="text-[10px]" />}
                <span>{order.customer.name}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    const ordersForDay = getOrdersForDate(date);
    setDayOrders(ordersForDay);
    if (ordersForDay.length > 0) {
      setModalOpen(true);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "orange",
    CONFIRMED: "blue",
    PREPARING: "cyan",
    READY: "green",
    COMPLETED: "success",
    CANCELLED: "red",
  };

  return (
    <div className="px-2 sm:px-4 py-4">
      <Card className="shadow-lg rounded-xl border-0" styles={{ body: { padding: 0 } }}>
        <div className="overflow-x-auto">
          <Calendar
            cellRender={dateCellRender}
            onSelect={handleDateSelect}
            fullscreen={true}
            headerRender={({ value, onChange }) => {
              const start = 0;
              const end = 12;
              const monthOptions = [];

              // Get month names using dayjs format
              const months = [];
              for (let i = 0; i < 12; i++) {
                months.push(dayjs().month(i).format("MMM"));
              }

              for (let i = start; i < end; i++) {
                monthOptions.push(
                  <Select.Option key={i} value={i} className="month-item">
                    {months[i]}
                  </Select.Option>,
                );
              }

              const year = value.year();
              const month = value.month();
              const options = [];
              for (let i = year - 10; i < year + 10; i += 1) {
                options.push(
                  <Select.Option key={i} value={i} className="year-item">
                    {i}
                  </Select.Option>,
                );
              }
              return (
                <div className="px-3 py-3 sm:px-6 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center bg-linear-to-r from-blue-50 to-indigo-50 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                      <CalendarOutlined className="text-lg sm:text-xl text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-bold text-gray-800 m-0">Kalender Pemesanan</h2>
                      <p className="text-xs sm:text-sm text-gray-600 m-0 hidden sm:block">Kelola jadwal pengiriman dan pickup</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      icon={<LeftOutlined />}
                      onClick={() => {
                        const newValue = value.clone().subtract(1, "month");
                        onChange(newValue);
                      }}
                    />
                    <Select
                      popupMatchSelectWidth={false}
                      className="w-28 font-medium"
                      value={month}
                      onChange={(newMonth) => {
                        const newValue = value.clone().month(newMonth);
                        onChange(newValue);
                      }}
                    >
                      {monthOptions}
                    </Select>
                    <Select
                      popupMatchSelectWidth={false}
                      className="w-24 font-medium"
                      value={year}
                      onChange={(newYear) => {
                        const newValue = value.clone().year(newYear);
                        onChange(newValue);
                      }}
                    >
                      {options}
                    </Select>
                    <Button
                      icon={<RightOutlined />}
                      onClick={() => {
                        const newValue = value.clone().add(1, "month");
                        onChange(newValue);
                      }}
                    />
                    <Button
                      type="primary"
                      className="ml-1 border-0 shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #93c5fd 0%, #c4b5fd 100%)",
                        color: "#1e293b",
                      }}
                      onClick={() => {
                        const now = dayjs();
                        onChange(now);
                      }}
                    >
                      Hari Ini
                    </Button>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <CalendarOutlined className="text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-gray-800">Pesanan - {selectedDate.format("DD MMMM YYYY")}</div>
              <div className="text-xs text-gray-500 font-normal">{dayOrders.length} pesanan</div>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width="100%"
        style={{ maxWidth: 900, top: 20 }}
        className="calendar-modal"
      >
        <div className="space-y-3 mt-4 max-h-[70vh] overflow-y-auto px-1">
          {dayOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarOutlined className="text-4xl mb-2" />
              <p>Tidak ada pesanan untuk tanggal ini</p>
            </div>
          ) : (
            dayOrders.map((order) => (
              <Card
                key={order.id}
                size="small"
                className="shadow-sm hover:shadow-lg transition-all border-l-4 hover:scale-[1.01]"
                style={{
                  borderLeftColor: order.deliveryMethod === "PICKUP" ? "#722ed1" : "#eb2f96",
                }}
                styles={{ body: { padding: "12px 16px" } }}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
                    <Tag color="blue" className="text-xs font-semibold">
                      {order.orderNumber}
                    </Tag>
                    <Tag color={statusColors[order.status]} className="font-medium">
                      {order.status}
                    </Tag>
                    <Tag color={order.deliveryMethod === "PICKUP" ? "purple" : "magenta"} icon={order.deliveryMethod === "PICKUP" ? <ShoppingOutlined /> : <EnvironmentOutlined />} className="font-medium">
                      {order.deliveryMethod}
                    </Tag>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="p-1.5 bg-white rounded shadow-sm">
                        <UserOutlined className="text-blue-500 text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-0.5">Pelanggan</div>
                        <div className="font-semibold text-gray-800">{order.customer.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="p-1.5 bg-white rounded shadow-sm">
                        <PhoneOutlined className="text-green-500 text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-0.5">Telepon</div>
                        <div className="font-semibold text-gray-800">{order.customer.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="p-1.5 bg-white rounded shadow-sm">
                        <ClockCircleOutlined className="text-orange-500 text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-0.5">Waktu</div>
                        <div className="font-semibold text-gray-800">{order.pickupTime || order.deliveryTime || "Belum ditentukan"}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-lg bg-linear-to-br from-green-50 to-emerald-50 border border-green-200">
                      <div className="p-1.5 bg-white rounded shadow-sm">
                        <ShoppingOutlined className="text-green-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-green-600 mb-0.5">Total Pembayaran</div>
                        <div className="font-bold text-lg text-green-700">Rp {order.totalAmount.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
