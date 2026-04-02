"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Input } from "antd";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "登录失败，请检查输入信息");
        return;
      }

      router.push("/accounts");
      router.refresh();
    } catch {
      setError("登录请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card style={{ width: "100%", maxWidth: 460 }}>
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ color: "#1677ff", textTransform: "uppercase", fontSize: 12 }}>Secure operator access</div>
          <h1 style={{ margin: 0, color: "#111827", fontSize: 32, lineHeight: 1.2 }}>登录账号保险库</h1>
          <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.7 }}>
            仅允许服务端会话访问，密码与敏感注册信息都按字段加密存储。
          </p>
        </div>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 8, color: "#111827" }}>
            <span>邮箱</span>
            <Input
              size="large"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>
          <label style={{ display: "grid", gap: 8, color: "#111827" }}>
            <span>密码</span>
            <Input
              size="large"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入登录密码"
              required
            />
          </label>
          <Button type="primary" htmlType="submit" loading={loading} size="large" block>
            登录并进入管理台
          </Button>
        </form>
      </div>
    </Card>
  );
}
