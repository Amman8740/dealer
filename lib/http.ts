import { NextResponse } from "next/server";

export function ok(data: unknown, init: number = 200) {
  return NextResponse.json({ ok: true, data }, { status: init });
}
export function bad(msg: string, code = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status: code });
}