"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Space, Button, Drawer } from "antd";
import { DashboardOutlined, ShoppingOutlined, ShoppingCartOutlined, CalendarOutlined, DollarOutlined, UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, FormOutlined, GiftOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    {
      key: "/fn-admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/fn-admin/products",
      icon: <ShoppingOutlined />,
      label: "Products",
    },
    {
      key: "/fn-admin/orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
    },
    {
      key: "/fn-admin/orders/manual",
      icon: <FormOutlined />,
      label: "Pemesanan Manual",
    },
    {
      key: "/fn-admin/stok-hampers",
      icon: <GiftOutlined />,
      label: "Stok Hampers",
    },
    {
      key: "/fn-admin/expenses",
      icon: <DollarOutlined />,
      label: "Pengeluaran",
    },
    {
      key: "/fn-admin/pembukuan",
      icon: <DollarOutlined />,
      label: "Pembukuan",
    },
    {
      key: "/fn-admin/calendar",
      icon: <CalendarOutlined />,
      label: "Calendar",
    },
  ];

  const handleMenuClick = (key: string) => {
    router.push(key);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/fn-admin/login" });
  };

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: collapsed ? 16 : 20,
              fontWeight: "bold",
            }}
          >
            {collapsed ? "OS" : "Oursee Admin"}
          </div>
          <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={menuItems} onClick={({ key }) => handleMenuClick(key)} />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer title="Oursee Admin" placement="left" onClose={() => setMobileDrawerOpen(false)} open={mobileDrawerOpen} styles={{ body: { padding: 0 } }}>
        <Menu mode="inline" selectedKeys={[pathname]} items={menuItems} onClick={({ key }) => handleMenuClick(key)} />
      </Drawer>

      <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 200 }}>
        <Header
          style={{
            padding: isMobile ? "0 16px" : "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (isMobile) {
                setMobileDrawerOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Dropdown menu={{ items: userMenuItems }}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} size={isMobile ? "small" : "default"} />
              {!isMobile && <span>Admin</span>}
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: isMobile ? "16px 8px" : "24px 16px",
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: "#fff",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
