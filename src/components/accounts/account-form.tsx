"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Form, Input, Row, Select, Space, Switch } from "antd";
import Password from "antd/es/input/Password";
import TextArea from "antd/es/input/TextArea";

import { getInitialAutoSiteName, shouldAutofillSiteName } from "@/components/accounts/account-form.helpers";

type AccountFormValues = {
  platformId: string;
  siteName: string;
  username: string;
  password?: string;
  notes?: string;
  registrationInfo?: string;
  tags: string[];
  isFavorite: boolean;
};

type AccountFormProps = {
  mode: "create" | "edit";
  accountId?: string;
  platforms: Array<{ id: string; name: string; websiteUrl?: string | null }>;
  initialValues?: Partial<AccountFormValues>;
};

export function AccountForm({ mode, accountId, platforms, initialValues }: AccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<AccountFormValues>();
  const lastAutoSiteNameRef = useRef<string | null>(null);

  const selectedPlatformId = Form.useWatch("platformId", form);
  const currentSiteName = Form.useWatch("siteName", form);
  const selectedPlatform = platforms.find((platform) => platform.id === selectedPlatformId);

  useEffect(() => {
    const initialPlatform = platforms.find((platform) => platform.id === initialValues?.platformId);

    lastAutoSiteNameRef.current = getInitialAutoSiteName(initialValues?.siteName, initialPlatform?.name);
  }, [initialValues?.platformId, initialValues?.siteName, platforms]);

  useEffect(() => {
    if (!selectedPlatform) {
      return;
    }

    const suggestedSiteName = selectedPlatform.name;

    if (shouldAutofillSiteName(currentSiteName, lastAutoSiteNameRef.current)) {
      form.setFieldValue("siteName", suggestedSiteName);
      lastAutoSiteNameRef.current = suggestedSiteName;
    }
  }, [currentSiteName, form, selectedPlatform]);

  async function handleSubmit(values: AccountFormValues) {
    setLoading(true);

    try {
      const response = await fetch(mode === "create" ? "/api/accounts" : `/api/accounts/${accountId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      router.push("/accounts");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Space orientation="vertical" size={24} style={{ width: "100%" }}>
        <Form<AccountFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ tags: [], isFavorite: false, ...initialValues }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label="所属平台" name="platformId" rules={[{ required: true, message: "请选择所属平台" }]}> 
                <Select
                  size="large"
                  placeholder="请选择平台"
                  options={platforms.map((platform) => ({ label: platform.name, value: platform.id }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="站点名称" name="siteName" rules={[{ required: true, message: "请输入站点名称" }]}> 
                <Input size="large" placeholder="如：GitHub / 阿里云 / AWS" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="账号/用户名" name="username" rules={[{ required: true, message: "请输入账号" }]}>
                <Input size="large" placeholder="登录邮箱或用户名" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={mode === "create" ? "密码" : "新密码"} name="password" rules={mode === "create" ? [{ required: true, message: "请输入密码" }] : []}>
                <Password size="large" placeholder={mode === "create" ? "请输入密码" : "留空表示不修改密码"} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="标签" name="tags">
                <Select mode="tags" size="large" placeholder="输入后回车，可添加多个标签" tokenSeparators={[","]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="网站地址">
                <Input size="large" value={selectedPlatform?.websiteUrl ?? ""} placeholder="将从平台管理中自动带出" readOnly />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="收藏" name="isFavorite" valuePropName="checked">
                <Switch checkedChildren="已收藏" unCheckedChildren="普通" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="备注" name="notes">
                <TextArea rows={4} placeholder="业务备注、使用说明、风险提示等" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="注册关联信息" name="registrationInfo">
                <TextArea rows={4} placeholder="绑定邮箱、手机号、恢复信息、实名信息摘要等" />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === "create" ? "创建条目" : "保存修改"}
            </Button>
            <Button onClick={() => router.push("/accounts")}>取消</Button>
          </Space>
        </Form>
      </Space>
    </Card>
  );
}
