"use client";

import { useState } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";

export function RevealPasswordButton({ accountId }: { accountId: string }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState<string | null>(null);

  async function revealPassword() {
    setLoading(true);

    try {
      const response = await fetch(`/api/accounts/${accountId}?action=reveal`, { method: "POST" });
      const result = (await response.json()) as { data?: { password?: string } };
      setPassword(result.data?.password ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Space orientation="vertical" size={8}>
      <Button icon={<EyeOutlined />} onClick={revealPassword} loading={loading}>
        显示明文密码
      </Button>
      {password ? <code>{password}</code> : null}
    </Space>
  );
}
