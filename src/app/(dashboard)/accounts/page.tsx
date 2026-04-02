import Link from "next/link";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Space } from "antd";

import { AccountPlatformFilter } from "@/components/accounts/account-platform-filter";
import { AccountTable } from "@/components/accounts/account-table";
import { listAccounts } from "@/lib/server/accounts";
import { requireCurrentUser } from "@/lib/server/auth";
import { listPlatforms } from "@/lib/server/platforms";

type AccountListItem = Awaited<ReturnType<typeof listAccounts>>[number];

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ platformId?: string }>;
}) {
  const user = await requireCurrentUser();
  const { platformId } = await searchParams;
  const [accounts, platforms] = await Promise.all([
    listAccounts(user.id, { platformId }),
    listPlatforms(user.id),
  ]);

  return (
    <Card
      title="账号总览"
      extra={
        <Link href="/accounts/new">
          <Button type="primary" icon={<PlusOutlined />}>
            新增账号
          </Button>
        </Link>
      }
    >
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <AccountPlatformFilter
          value={platformId}
          options={platforms.map((platform) => ({ label: platform.name, value: platform.id }))}
        />
        {accounts.length ? (
          <AccountTable
            data={accounts.map((account: AccountListItem) => ({
              ...account,
              updatedAt: account.updatedAt.toISOString(),
            }))}
          />
        ) : (
          <Empty description="当前筛选条件下还没有账号条目" />
        )}
      </Space>
    </Card>
  );
}
