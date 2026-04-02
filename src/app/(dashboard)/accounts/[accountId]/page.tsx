import Link from "next/link";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag } from "antd";

import { DeleteAccountButton } from "@/components/accounts/delete-account-button";
import { RevealPasswordButton } from "@/components/accounts/reveal-password-button";
import { getAccountById } from "@/lib/server/accounts";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function AccountDetailPage({ params }: { params: Promise<{ accountId: string }> }) {
  const user = await requireCurrentUser();
  const { accountId } = await params;
  const account = await getAccountById(user.id, accountId);

  if (!account) {
    return <span>账号条目不存在</span>;
  }

  return (
    <Space orientation="vertical" size={24} style={{ width: "100%" }}>
      <Space>
        <Link href="/accounts">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
        <Link href={`/accounts/${account.id}/edit`}>
          <Button type="primary" icon={<EditOutlined />}>
            编辑条目
          </Button>
        </Link>
        <DeleteAccountButton accountId={account.id} />
      </Space>

      <Card title={account.siteName} extra={account.isFavorite ? <Tag color="gold">收藏</Tag> : null}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <strong>所属平台</strong>
            <span>{account.platformName ?? "未分配平台"}</span>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong>网址</strong>
            <span>{account.websiteUrl ?? "未填写"}</span>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong>账号</strong>
            <span>{account.username}</span>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong>密码</strong>
            <span>{account.passwordMasked}</span>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong>标签</strong>
            <div>{account.tags.length ? account.tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : "未设置"}</div>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong>备注</strong>
            <span>{account.notes ?? "未填写"}</span>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <strong>注册关联信息</strong>
            <span>{account.registrationInfo ?? "未填写"}</span>
          </div>
        </div>
      </Card>

      <Card title="高风险操作">
        <RevealPasswordButton accountId={account.id} />
      </Card>
    </Space>
  );
}
