// app/api/items/route.ts
import { db } from "@/lib/firebase/admin";
import { ok, bad } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await db.collection("items").orderBy("name").get();
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return ok(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, sku, unit, category } = body || {};
  if (!name || !sku || !unit) return bad("name, sku, unit are required");
  const doc = await db.collection("items").add({ name, sku, unit, category: category || null });
  return ok({ id: doc.id }, 201);
}
