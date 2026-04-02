import { notFound } from "next/navigation";

import { PlatformForm } from "@/components/platforms/platform-form";
import { getPlatformById } from "@/lib/server/platforms";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function EditPlatformPage({ params }: { params: Promise<{ platformId: string }> }) {
  const user = await requireCurrentUser();
  const { platformId } = await params;
  const platform = await getPlatformById(user.id, platformId);

  if (!platform) {
    notFound();
  }

  return <PlatformForm mode="edit" platformId={platform.id} initialValues={{ name: platform.name, websiteUrl: platform.websiteUrl ?? undefined }} />;
}
