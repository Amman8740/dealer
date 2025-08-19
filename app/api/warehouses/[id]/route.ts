import { db } from "@/lib/firebase/admin";
import { ok } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await db.collection("warehouses").doc(params.id).set(await req.json(), { merge: true });
  return ok({ id: params.id });
}
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await db.collection("warehouses").doc(params.id).delete();
  return ok({ id: params.id });
}
