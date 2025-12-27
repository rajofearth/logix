import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(message: string, status = 400) {
  // Include both nested and top-level message for compatibility
  // Some clients check body.message, others check body.error.message
  return NextResponse.json({ error: { message }, message }, { status });
}


