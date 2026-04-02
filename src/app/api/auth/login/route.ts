import { NextResponse } from "next/server";
import { z } from "zod";

import { attachSessionCookie, loginUser } from "@/lib/server/auth";
import { badRequest, unauthorized } from "@/lib/server/http";

const loginSchema = z.object({
  email: z.string().email("请输入合法邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("登录参数不合法", parsed.error.flatten());
  }

  const result = await loginUser(parsed.data.email, parsed.data.password);

  if (!result) {
    return unauthorized("邮箱或密码错误");
  }

  await attachSessionCookie(result.token, result.expiresAt);

  return NextResponse.json({
    user: result.user,
    expiresAt: result.expiresAt.toISOString(),
  });
}
