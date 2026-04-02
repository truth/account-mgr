import { NextResponse } from "next/server";

export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}

export function unauthorized(message = "未授权") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function notFound(message = "未找到资源") {
  return NextResponse.json({ error: message }, { status: 404 });
}
