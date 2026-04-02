"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Input, Space } from "antd";

type PlatformFormValues = {
  name: string;
  websiteUrl?: string;
};

type PlatformFormProps = {
  mode: "create" | "edit";
  platformId?: string;
  initialValues?: Partial<PlatformFormValues>;
};

export function PlatformForm({ mode, platformId, initialValues }: PlatformFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: PlatformFormValues) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(mode === "create" ? "/api/platforms" : `/api/platforms/${platformId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "保存平台失败");
        return;
      }

      router.push("/platforms");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Space orientation="vertical" size={24} style={{ width: "100%" }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Form<PlatformFormValues>
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={initialValues}
        >
          <Form.Item label="平台名称" name="name" rules={[{ required: true, message: "请输入平台名称" }]}> 
            <Input size="large" placeholder="例如 github / cloudflare / tidbcloud" />
          </Form.Item>
          <Form.Item label="网站地址" name="websiteUrl">
            <Input size="large" placeholder="https://example.com" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === "create" ? "创建平台" : "保存修改"}
            </Button>
            <Button onClick={() => router.push("/platforms")}>取消</Button>
          </Space>
        </Form>
      </Space>
    </Card>
  );
}
