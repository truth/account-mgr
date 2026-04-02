import { NextResponse } from "next/server";

import { logoutUser } from "@/lib/server/auth";

export async function POST(request: Request) {
  await logoutUser();
  return NextResponse.redirect(new URL("/login", request.url));
}
