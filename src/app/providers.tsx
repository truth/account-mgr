"use client";

import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <ConfigProvider locale={zhCN}>{children}</ConfigProvider>;
}
