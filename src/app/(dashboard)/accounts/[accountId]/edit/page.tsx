import { notFound } from "next/navigation";

import { AccountForm } from "@/components/accounts/account-form";
import { getAccountById } from "@/lib/server/accounts";
import { requireCurrentUser } from "@/lib/server/auth";
import { listPlatforms } from "@/lib/server/platforms";

export default async function EditAccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const user = await requireCurrentUser();
  const { accountId } = await params;
  const [account, platforms] = await Promise.all([getAccountById(user.id, accountId), listPlatforms(user.id)]);

  if (!account || !platforms.length) {
    notFound();
  }

  return (
    <AccountForm
      mode="edit"
      accountId={account.id}
      platforms={platforms.map((platform) => ({ id: platform.id, name: platform.name, websiteUrl: platform.websiteUrl }))}
      initialValues={{
        platformId: account.platformId ?? undefined,
        siteName: account.siteName,
        username: account.username,
        notes: account.notes ?? undefined,
        registrationInfo: account.registrationInfo ?? undefined,
        tags: account.tags,
        isFavorite: account.isFavorite,
      }}
    />
  );
}
