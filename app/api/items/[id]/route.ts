// app/api/items/[id]/route.ts
import { db } from "@/lib/firebase/admin";
import { ok } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const body = await _req.json().catch(() => ({}));
  await db.collection("items").doc(params.id).set(body, { merge: true });
  return ok({ id: params.id });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await db.collection("items").doc(params.id).delete();
  return ok({ id: params.id });
}
