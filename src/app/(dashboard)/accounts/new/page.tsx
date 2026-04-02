import Link from "next/link";
import { Alert, Button, Card } from "antd";

import { AccountForm } from "@/components/accounts/account-form";
import { listPlatforms } from "@/lib/server/platforms";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function NewAccountPage() {
  const user = await requireCurrentUser();
  const platforms = await listPlatforms(user.id);

  if (!platforms.length) {
    return (
      <Card>
        <Alert
          type="warning"
          showIcon
          message="当前没有可用平台，请先创建平台"
          action={
            <Link href="/platforms/new">
              <Button type="primary">前往创建平台</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <AccountForm
      mode="create"
      platforms={platforms.map((platform) => ({
        id: platform.id,
        name: platform.name,
        websiteUrl: platform.websiteUrl,
      }))}
    />
  );
}
