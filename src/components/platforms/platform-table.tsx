"use client";

import Link from "next/link";
import { Button, Space, Table } from "antd";
import type { TableProps } from "antd";

import { DeletePlatformButton } from "@/components/platforms/delete-platform-button";

type PlatformRow = {
  id: string;
  name: string;
  websiteUrl: string | null;
  accountCount: number;
  updatedAt: string;
};

export function PlatformTable({ data }: { data: PlatformRow[] }) {
  const columns: TableProps<PlatformRow>["columns"] = [
    {
      title: "平台",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "网站地址",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      render: (value: string | null) => value ?? "未设置",
    },
    {
      title: "账号数量",
      dataIndex: "accountCount",
      key: "accountCount",
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
        <Space>
          <Link href={`/accounts?platformId=${record.id}`}>
            <Button type="link">查看账号</Button>
          </Link>
          <Link href={`/platforms/${record.id}/edit`}>
            <Button type="link">编辑</Button>
          </Link>
          <DeletePlatformButton platformId={record.id} />
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 8 }} />;
}
