"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";

export function DeleteAccountButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Popconfirm
      title="确认删除该账号条目？"
      description="删除后不可恢复，请确认你不再需要这条凭据。"
      okText="删除"
      cancelText="取消"
      onConfirm={() => {
        startTransition(async () => {
          await fetch(`/api/accounts/${accountId}`, { method: "DELETE" });
          router.push("/accounts");
          router.refresh();
        });
      }}
    >
      <Button danger icon={<DeleteOutlined />} loading={pending}>
        删除条目
      </Button>
    </Popconfirm>
  );
}
