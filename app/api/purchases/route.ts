// app/api/purchases/route.ts
import { db } from "@/lib/firebase/admin";
import { ok, bad } from "@/lib/http";
import { FieldValue } from "firebase-admin/firestore";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await db.collection("purchases").orderBy("date", "desc").get();
  return ok(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { supplierId, date, lines } = body || {};
  if (!supplierId) return bad("supplierId is required");
  if (!date) return bad("date (YYYY-MM-DD) is required");
  if (!Array.isArray(lines) || lines.length === 0) return bad("lines[] required");

  const total = lines.reduce(
    (s: number, l: any) => s + Number(l.qty) * Number(l.unitCost) + Number(l.tax || 0) - Number(l.discount || 0),
    0
  );

  const doc = await db.collection("purchases").add({
    supplierId,
    date,
    lines,
    total,
    createdAt: FieldValue.serverTimestamp(),
  });

  return ok({ id: doc.id, total }, 201);
}
