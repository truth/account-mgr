"use client";

import Link from "next/link";
import { StarFilled } from "@ant-design/icons";
import { Button, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";

type AccountRow = {
  id: string;
  platformId: string | null;
  platformName: string | null;
  siteName: string;
  websiteUrl: string | null;
  username: string;
  passwordMasked: string;
  notes: string | null;
  registrationInfo: string | null;
  tags: string[];
  isFavorite: boolean;
  updatedAt: string;
};

export function AccountTable({ data }: { data: AccountRow[] }) {
  const columns: TableProps<AccountRow>["columns"] = [
    {
      title: "平台",
      dataIndex: "platformName",
      key: "platformName",
      render: (value: string | null) => value ?? "未分配平台",
    },
    {
      title: "站点",
      dataIndex: "siteName",
      key: "siteName",
      render: (_value, record) => (
        <Space orientation="vertical" size={2}>
          <Space>
            <strong>{record.siteName}</strong>
            {record.isFavorite ? <StarFilled style={{ color: "#facc15" }} /> : null}
          </Space>
          <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{record.websiteUrl ?? "未填写网址"}</span>
        </Space>
      ),
    },
    { title: "账号", dataIndex: "username", key: "username" },
    { title: "密码", dataIndex: "passwordMasked", key: "passwordMasked" },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      render: (tags: string[]) => (tags.length ? tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>未设置</span>),
    },
    {
      title: "最近更新",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => new Date(value).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "actions",
      render: (_value, record) => (
        <Link href={`/accounts/${record.id}`}>
          <Button type="link">查看详情</Button>
        </Link>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 8 }} />;
}
