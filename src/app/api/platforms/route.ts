import { NextResponse } from "next/server";

import { createPlatform, listPlatforms, PlatformNameConflictError } from "@/lib/server/platforms";
import { requireApiUser } from "@/lib/server/auth";
import { badRequest, unauthorized } from "@/lib/server/http";
import { platformSchema } from "@/lib/validation/platform";

export async function GET() {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const platforms = await listPlatforms(user.id);

  return NextResponse.json({ data: platforms });
}

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = platformSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("平台参数不合法", parsed.error.flatten());
  }

  try {
    const platform = await createPlatform(user.id, parsed.data);
    return NextResponse.json({ data: platform }, { status: 201 });
  } catch (error) {
    if (error instanceof PlatformNameConflictError) {
      return badRequest(error.message);
    }

    throw error;
  }
}
