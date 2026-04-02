import { NextResponse } from "next/server";

import { deletePlatform, getPlatformById, PlatformDeleteBlockedError, PlatformNameConflictError, updatePlatform } from "@/lib/server/platforms";
import { requireApiUser } from "@/lib/server/auth";
import { badRequest, notFound, unauthorized } from "@/lib/server/http";
import { platformSchema } from "@/lib/validation/platform";

type Context = {
  params: Promise<{ platformId: string }>;
};

export async function GET(_request: Request, context: Context) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const { platformId } = await context.params;
  const platform = await getPlatformById(user.id, platformId);

  if (!platform) {
    return notFound();
  }

  return NextResponse.json({ data: platform });
}

export async function PATCH(request: Request, context: Context) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const { platformId } = await context.params;
  const body = await request.json();
  const parsed = platformSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("平台参数不合法", parsed.error.flatten());
  }

  try {
    const platform = await updatePlatform(user.id, platformId, parsed.data);

    if (!platform) {
      return notFound();
    }

    return NextResponse.json({ data: platform });
  } catch (error) {
    if (error instanceof PlatformNameConflictError) {
      return badRequest(error.message);
    }

    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const { platformId } = await context.params;

  try {
    const deleted = await deletePlatform(user.id, platformId);

    if (!deleted) {
      return notFound();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PlatformDeleteBlockedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
