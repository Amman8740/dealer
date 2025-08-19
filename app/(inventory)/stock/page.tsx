// app/(inventory)/stock/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCatalog } from "@/lib/store/catalog";
import { useTrade } from "@/lib/store/trade";
import { Input, Button } from "@/components/ui";

type Row = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category?: string | null;
  minStock?: number | null;
  qty: number;
};

export default function StockPage() {
  const { items, load: loadCatalog, loading: loadingCatalog, error: errorCatalog } = useCatalog();
  const { purchases, sales, load: loadTrade, loading: loadingTrade, error: errorTrade } = useTrade();

  // UI state
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [sortBy, setSortBy] = useState<"qty" | "name" | "sku">("qty");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    loadCatalog();
    loadTrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build stock map from documents
  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    purchases.forEach((p) =>
      p.lines.forEach((l) => map.set(l.itemId, (map.get(l.itemId) || 0) + Number(l.qty)))
    );
    sales.forEach((s) =>
      s.lines.forEach((l) => map.set(l.itemId, (map.get(l.itemId) || 0) - Number(l.qty)))
    );
    return map;
  }, [purchases, sales]);

  // Compose table rows (join item info + qty)
  const rows: Row[] = useMemo(() => {
    return items.map((i) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      unit: i.unit,
      category: i.category ?? "",
      minStock: (i as any).minStock ?? null,
      qty: Number(stockMap.get(i.id) || 0),
    }));
  }, [items, stockMap]);

  // Filters + sorting
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    let out = rows.filter((r) => {
      const matches =
        !needle ||
        r.name.toLowerCase().includes(needle) ||
        r.sku.toLowerCase().includes(needle) ||
        (r.category || "").toLowerCase().includes(needle);
      const low =
        !onlyLow ||
        (typeof r.minStock === "number" && r.qty <= (r.minStock as number));
      return matches && low;
    });

    out.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "qty") cmp = a.qty - b.qty;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      if (sortBy === "sku") cmp = a.sku.localeCompare(b.sku);
      return dir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [rows, q, onlyLow, sortBy, dir]);

  const loading = loadingCatalog || loadingTrade;
  const error = errorCatalog || errorTrade;

  const toggleSort = (col: typeof sortBy) => {
    if (col === sortBy) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setDir(col === "qty" ? "desc" : "asc");
    }
  };

  const arrow = (col: typeof sortBy) =>
    sortBy === col ? (dir === "asc" ? " ↑" : " ↓") : "";

  const totalDistinct = rows.length;
  const positiveCount = rows.filter((r) => r.qty > 0).length;
  const lowCount = rows.filter((r) => typeof r.minStock === "number" && r.qty <= (r.minStock as number)).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock on Hand</h1>
          <p className="text-sm text-neutral-500">
            Current quantities derived from purchases and sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-xs text-neutral-500">
            {filtered.length} of {totalDistinct} items &middot; {positiveCount} in stock &middot; {lowCount} low
          </span>
          <Link
            href="/purchases/new"
            className="rounded border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            Receive Stock
          </Link>
          <Link href="/sales/new" className="rounded bg-black px-3 py-2 text-sm text-white hover:opacity-90">
            Issue Stock
          </Link>
        </div>
      </header>

      {/* Error banner */}
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {/* Card */}
      <section className="overflow-hidden rounded-lg border">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b p-3">
          <div className="min-w-[260px] flex-1">
            <Input
              placeholder="Search item name / SKU / category…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOnlyLow((v) => !v)}
              aria-pressed={onlyLow}
              className={onlyLow ? "bg-black text-white" : ""}
            >
              {onlyLow ? "Showing: Low stock" : "Show low stock only"}
            </Button>
            <Button onClick={() => { setQ(""); setOnlyLow(false); }}>
              Reset
            </Button>
          </div>
        </div>

        {/* Table / states */}
        {loading ? (
          <div className="p-6 text-sm text-neutral-500">Calculating stock…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full border" />
            <p className="mb-3">No items yet</p>
            <Link href="/items" className="rounded bg-black px-3 py-2 text-white">
              Create your first item
            </Link>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white text-left dark:bg-neutral-950">
                <tr className="border-b">
                  <th className="p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    Item{arrow("name")}
                  </th>
                  <th className="p-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("sku")}>
                    SKU{arrow("sku")}
                  </th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium text-right cursor-pointer select-none" onClick={() => toggleSort("qty")}>
                    Qty{arrow("qty")}
                  </th>
                  <th className="p-3 font-medium text-right">Min</th>
                  <th className="p-3 font-medium">Unit</th>
                  <th className="p-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const isLow = typeof r.minStock === "number" && r.qty <= (r.minStock as number);
                  const isNeg = r.qty < 0;
                  return (
                    <tr
                      key={r.id}
                      className={`border-b hover:bg-black/5 dark:hover:bg-white/5 ${
                        idx % 2 ? "bg-black/[0.02] dark:bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="p-3">{r.name}</td>
                      <td className="p-3">{r.sku}</td>
                      <td className="p-3">{r.category || "-"}</td>
                      <td className={`p-3 text-right tabular-nums ${isNeg ? "text-red-600 dark:text-red-400" : ""}`}>
                        {r.qty.toFixed(3)}
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        {typeof r.minStock === "number" ? (r.minStock as number).toFixed(3) : "—"}
                      </td>
                      <td className="p-3">{r.unit}</td>
                      <td className="p-3 text-right">
                        {isNeg ? (
                          <span className="rounded px-2 py-1 text-xs text-red-700 ring-1 ring-red-700/30 dark:text-red-400">
                            Negative
                          </span>
                        ) : isLow ? (
                          <span className="rounded px-2 py-1 text-xs text-amber-700 ring-1 ring-amber-700/30 dark:text-amber-400">
                            Reorder
                          </span>
                        ) : (
                          <span className="rounded px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-700/30 dark:text-emerald-400">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td className="p-3 text-neutral-500" colSpan={3}>
                    Totals
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {filtered.reduce((s, r) => s + r.qty, 0).toFixed(3)}
                  </td>
                  <td className="p-3" />
                  <td className="p-3" />
                  <td className="p-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
