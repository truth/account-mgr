import { NextResponse } from "next/server";

import { createAccount, listAccounts } from "@/lib/server/accounts";
import { requireApiUser } from "@/lib/server/auth";
import { badRequest, unauthorized } from "@/lib/server/http";
import { accountSchema } from "@/lib/validation/account";

export async function GET(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const platformId = url.searchParams.get("platformId") ?? undefined;
  const accounts = await listAccounts(user.id, { platformId });

  return NextResponse.json({ data: accounts });
}

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = accountSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("账号参数不合法", parsed.error.flatten());
  }

  const account = await createAccount(user.id, parsed.data);

  if (!account) {
    return badRequest("所选平台不存在或不属于当前用户");
  }

  return NextResponse.json({ data: account }, { status: 201 });
}
