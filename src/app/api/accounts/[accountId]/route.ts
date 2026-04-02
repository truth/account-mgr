import { NextResponse } from "next/server";

import { deleteAccount, getAccountById, revealAccountPassword, updateAccount } from "@/lib/server/accounts";
import { requireApiUser } from "@/lib/server/auth";
import { badRequest, notFound, unauthorized } from "@/lib/server/http";
import { accountUpdateSchema } from "@/lib/validation/account";

type Context = {
  params: Promise<{ accountId: string }>;
};

export async function GET(_request: Request, context: Context) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const { accountId } = await context.params;
  const account = await getAccountById(user.id, accountId);

  if (!account) {
    return notFound();
  }

  return NextResponse.json({ data: account });
}

export async function PATCH(request: Request, context: Context) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const { accountId } = await context.params;
  const body = await request.json();
  const parsed = accountUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("账号参数不合法", parsed.error.flatten());
  }

  const account = await updateAccount(user.id, accountId, parsed.data);

  if (!account) {
    return badRequest("账号不存在，或所选平台不属于当前用户");
  }

  return NextResponse.json({ data: account });
}

export async function DELETE(_request: Request, context: Context) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const { accountId } = await context.params;
  const deleted = await deleteAccount(user.id, accountId);

  if (!deleted) {
    return notFound();
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, context: Context) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const { accountId } = await context.params;
  const url = new URL(request.url);

  if (url.searchParams.get("action") !== "reveal") {
    return badRequest("不支持的操作");
  }

  const password = await revealAccountPassword(user.id, accountId);

  if (!password) {
    return notFound();
  }

  return NextResponse.json({ data: { password } });
}
