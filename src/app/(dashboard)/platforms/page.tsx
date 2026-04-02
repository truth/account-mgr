import Link from "next/link";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty } from "antd";

import { PlatformTable } from "@/components/platforms/platform-table";
import { listPlatforms } from "@/lib/server/platforms";
import { requireCurrentUser } from "@/lib/server/auth";

type PlatformListItem = Awaited<ReturnType<typeof listPlatforms>>[number];

export default async function PlatformsPage() {
  const user = await requireCurrentUser();
  const platforms = await listPlatforms(user.id);

  return (
    <Card
      title="平台管理"
      extra={
        <Link href="/platforms/new">
          <Button type="primary" icon={<PlusOutlined />}>
            新增平台
          </Button>
        </Link>
      }
    >
      {platforms.length ? (
        <PlatformTable
          data={platforms.map((platform: PlatformListItem) => ({
            ...platform,
            updatedAt: platform.updatedAt.toISOString(),
          }))}
        />
      ) : (
        <Empty description="还没有平台，先创建一个吧" />
      )}
    </Card>
  );
}
