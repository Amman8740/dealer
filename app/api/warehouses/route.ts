import { db } from "@/lib/firebase/admin";
import { ok, bad } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await db.collection("warehouses").orderBy("name").get();
  return ok(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}
export async function POST(req: Request) {
  const { name } = (await req.json().catch(() => ({}))) || {};
  if (!name) return bad("name is required");
  const doc = await db.collection("warehouses").add({ name });
  return ok({ id: doc.id }, 201);
}
