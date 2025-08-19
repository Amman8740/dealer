// /app/api/parties/route.ts
import { db } from "@/lib/firebase/admin";
import { ok, bad } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("type");
    const type = raw ? raw.toUpperCase() : null;

    let ref: FirebaseFirestore.Query = db.collection("parties");
    if (type) ref = ref.where("type", "==", type);

    // 🔧 remove orderBy to avoid composite-index requirement
    const snap = await ref.get();

    const rows = snap
      .docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

    return ok(rows);
  } catch (err: any) {
    console.error("[GET /api/parties]", err);
    return bad(err?.message || "Server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, phone } = (await req.json().catch(() => ({}))) || {};
    if (!name || !type) return bad("name and type are required", 400);
    const t = String(type).toUpperCase(); // normalize
    const doc = await db.collection("parties").add({ name, type: t, phone: phone || null });
    return ok({ id: doc.id }, 201);
  } catch (err: any) {
    console.error("[POST /api/parties]", err);
    return bad(err?.message || "Server error", 500);
  }
}
