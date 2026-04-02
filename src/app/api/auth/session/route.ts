import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/server/auth";

export async function GET() {
  const user = await requireApiUser();

  return NextResponse.json({
    authenticated: Boolean(user),
    user: user ? { id: user.id, email: user.email } : null,
  });
}
