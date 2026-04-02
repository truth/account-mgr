"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DeleteOutlined } from "@ant-design/icons";
import { Alert, Button, Popconfirm, Space } from "antd";

export function DeletePlatformButton({ platformId }: { platformId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Space orientation="vertical" size={8}>
      {error ? <Alert type="error" message={error} showIcon /> : null}
      <Popconfirm
        title="确认删除该平台？"
        description="如果平台下仍有关联账号，将阻止删除。"
        okText="删除"
        cancelText="取消"
        onConfirm={() => {
          startTransition(async () => {
            setError(null);
            const response = await fetch(`/api/platforms/${platformId}`, { method: "DELETE" });

            if (!response.ok) {
              const result = (await response.json()) as { error?: string };
              setError(result.error ?? "删除平台失败");
              return;
            }

            router.push("/platforms");
            router.refresh();
          });
        }}
      >
        <Button danger icon={<DeleteOutlined />} loading={pending}>
          删除平台
        </Button>
      </Popconfirm>
    </Space>
  );
}
