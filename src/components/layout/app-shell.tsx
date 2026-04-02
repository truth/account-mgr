"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppstoreOutlined, KeyOutlined, LockOutlined, LogoutOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, Space } from "antd";

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
};

const navItems = [
  {
    key: "/accounts",
    icon: <KeyOutlined />,
    label: <Link href="/accounts">账号总览</Link>,
  },
  {
    key: "/accounts/new",
    icon: <StarOutlined />,
    label: <Link href="/accounts/new">新增账号</Link>,
  },
  {
    key: "/platforms",
    icon: <AppstoreOutlined />,
    label: <Link href="/platforms">平台管理</Link>,
  },
];

export function AppShell({ children, userEmail }: AppShellProps) {
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb", display: "flex", flexDirection: "row" }}>
      <aside
        style={{
          flex: "0 0 260px",
          width: 260,
          minHeight: "100vh",
          background: "#ffffff",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <div style={{ padding: 24 }}>
          <Space orientation="vertical" size={6}>
            <span style={{ color: "#1677ff", fontSize: 12, textTransform: "uppercase" }}>
              Secure Vault
            </span>
            <h2 style={{ margin: 0, color: "#111827", fontSize: 24, lineHeight: 1.3 }}>
              Account Manager
            </h2>
            <span style={{ color: "#6b7280" }}>
              {userEmail}
            </span>
          </Space>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[
            pathname.startsWith("/accounts/new")
              ? "/accounts/new"
              : pathname.startsWith("/platforms")
                ? "/platforms"
                : "/accounts",
          ]}
          items={navItems}
          style={{ background: "transparent", borderInlineEnd: "none" }}
        />
      </aside>
      <Layout style={{ background: "#f5f7fb", flex: 1, minWidth: 0 }}>
        <header
          style={{
            background: "#ffffff",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Space size="middle">
            <LockOutlined style={{ color: "#1677ff" }} />
            <span style={{ color: "#6b7280" }}>
              所有敏感字段仅在服务端解密
            </span>
          </Space>
          <form action="/api/auth/logout" method="post">
            <Button icon={<LogoutOutlined />} htmlType="submit">
              退出登录
            </Button>
          </form>
        </header>
        <main style={{ padding: 24, flex: 1 }}>{children}</main>
      </Layout>
    </Layout>
  );
}
