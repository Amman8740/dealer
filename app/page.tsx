// app/page.tsx (Dashboard)
"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useTrade } from "@/lib/store/trade";
import { useCatalog } from "@/lib/store/catalog";

/** Helpers to keep all date math in UTC using ISO yyyy-mm-dd strings */
const isoToday = () => new Date().toISOString().slice(0, 10);
const addDaysUTC = (isoDate: string, days: number) => {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function Dashboard() {
  const {
    purchases,
    sales,
    load: loadTrade,
    loading: loadingTrade,
    error: errorTrade,
  } = useTrade();
  const {
    items,
    load: loadCatalog,
    loading: loadingCatalog,
    error: errorCatalog,
  } = useCatalog();

  useEffect(() => {
    // run once; avoids StrictMode double work-loop issues from re-created functions
    loadTrade();
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayISO = isoToday();
  const weekStartISO = addDaysUTC(todayISO, -6); // last 7 days inclusive

  // ——— Helpers
 const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

  // ——— KPIs (use ISO string comparisons to avoid TZ issues)
  const salesToday = sales.filter((s) => s.date === todayISO);
  const purchasesToday = purchases.filter((p) => p.date === todayISO);

  const salesWeek = sales.filter((s) => s.date >= weekStartISO);
  const purchasesWeek = purchases.filter((p) => p.date >= weekStartISO);

  const kpi = {
    salesToday: salesToday.reduce((t, r) => t + r.total, 0),
    purchasesToday: purchasesToday.reduce((t, r) => t + r.total, 0),
    docsToday: salesToday.length + purchasesToday.length,
    salesWeek: salesWeek.reduce((t, r) => t + r.total, 0),
    purchasesWeek: purchasesWeek.reduce((t, r) => t + r.total, 0),
  };

  // ——— Stock on hand (derived from docs)
  const stockMap = useMemo(() => {
    const m = new Map<string, number>();
    purchases.forEach((p) =>
      p.lines.forEach((l) => m.set(l.itemId, (m.get(l.itemId) || 0) + l.qty))
    );
    sales.forEach((s) =>
      s.lines.forEach((l) => m.set(l.itemId, (m.get(l.itemId) || 0) - l.qty))
    );
    return m;
  }, [purchases, sales]);

  // ——— Stock alerts (minStock)
  const stockAlerts = useMemo(() => {
    return items
      .filter((i) => typeof i.minStock === "number")
      .map((i) => ({ item: i, qty: stockMap.get(i.id) || 0 }))
      .filter((r) => r.qty <= (r.item.minStock as number))
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);
  }, [items, stockMap]);

  // ——— Top items by sales qty (7d)
  const topItems7d = useMemo(() => {
    const acc = new Map<string, number>();
    salesWeek.forEach((s) =>
      s.lines.forEach((l) => acc.set(l.itemId, (acc.get(l.itemId) || 0) + l.qty))
    );
    const rows = [...acc.entries()].map(([itemId, qty]) => ({
      itemId,
      name: items.find((i) => i.id === itemId)?.name || itemId,
      qty,
    }));
    const max = Math.max(1, ...rows.map((r) => r.qty));
    return { max, rows: rows.sort((a, b) => b.qty - a.qty).slice(0, 5) };
  }, [salesWeek, items]);

  // ——— Latest activity (sort by ISO date desc)
  const activity = useMemo(() => {
    type Row = {
      id: string;
      type: "SALE" | "PURCHASE";
      date: string; // ISO yyyy-mm-dd from docs
      total: number;
      count: number;
    };
    const a: Row[] = [
      ...sales.map((s) => ({
        id: s.id,
        type: "SALE" as const,
        date: s.date,
        total: s.total,
        count: s.lines.length,
      })),
      ...purchases.map((p) => ({
        id: p.id,
        type: "PURCHASE" as const,
        date: p.date,
        total: p.total,
        count: p.lines.length,
      })),
    ];
    // ISO strings sort lexicographically by date
    return a.sort((x, y) => y.date.localeCompare(x.date)).slice(0, 6);
  }, [sales, purchases]);

  const loading = loadingTrade || loadingCatalog;
  const error = errorTrade || errorCatalog;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500">Today’s snapshot and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales/new" className="rounded bg-black px-3 py-2 text-white hover:opacity-90">
            New Sale
          </Link>
          <Link href="/purchases/new" className="rounded border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
            New Purchase
          </Link>
          <Link href="/items" className="rounded border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
            Add Item
          </Link>
          <Link href="/stock" className="rounded border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
            Stock
          </Link>
        </div>
      </div>

      {/* Error / Loading */}
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}
      {loading ? <div className="text-sm text-neutral-500">Loading data…</div> : null}

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Sales (Today)" value={money(kpi.salesToday)} sub={money(kpi.salesWeek) + " this week"} />
        <KpiCard title="Purchases (Today)" value={money(kpi.purchasesToday)} sub={money(kpi.purchasesWeek) + " this week"} />
        <KpiCard title="Documents (Today)" value={String(kpi.docsToday)} sub={`${salesWeek.length + purchasesWeek.length} this week`} />
        <KpiCard
          title="Items In Stock"
          value={String(items.filter((i) => (stockMap.get(i.id) || 0) > 0).length)}
          sub={`${items.length} total items`}
        />
      </section>

      {/* Two columns: activity + right rail */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: activity */}
        <div className="lg:col-span-2 rounded-lg border">
          <div className="flex items-center justify-between border-b p-4">
            <div className="text-sm font-semibold">Today’s Activity</div>
            <div className="text-xs text-neutral-500">{todayISO}</div>
          </div>
          {activity.length === 0 ? (
            <div className="p-10 text-center text-neutral-500">No activity yet</div>
          ) : (
            <div className="divide-y">
              {activity.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <Badge type={r.type} />
                    <div className="text-sm">
                      <div className="font-medium">
                        {r.type === "SALE" ? "Sale" : "Purchase"} · {r.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {r.date} · {r.count} lines
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{money(r.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: stock alerts + top items */}
        <div className="space-y-6">
          {/* Stock alerts */}
          <div className="rounded-lg border">
            <div className="border-b p-4">
              <div className="text-sm font-semibold">Stock Alerts</div>
              <div className="text-xs text-neutral-500">Items at or below min stock</div>
            </div>
            {stockAlerts.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">All good</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left dark:bg-neutral-900">
                    <tr className="border-b">
                      <th className="p-2 font-medium">Item</th>
                      <th className="p-2 font-medium text-right">Qty</th>
                      <th className="p-2 font-medium text-right">Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlerts.map(({ item, qty }) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right">{qty.toFixed(3)}</td>
                        <td className="p-2 text-right">
                          {typeof item.minStock === "number" ? item.minStock.toFixed(3) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top items 7d */}
          <div className="rounded-lg border">
            <div className="border-b p-4">
              <div className="text-sm font-semibold">Top Items (7 days)</div>
              <div className="text-xs text-neutral-500">By sales quantity</div>
            </div>
            {topItems7d.rows.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">No sales yet</div>
            ) : (
              <ul className="space-y-2 p-3">
                {topItems7d.rows.map((r) => {
                  const pct = Math.round((r.qty / topItems7d.max) * 100);
                  return (
                    <li key={r.itemId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate">{r.name}</span>
                        <span className="font-medium">{r.qty}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-black/10 dark:bg-white/10">
                        <div className="h-full rounded bg-black/70 dark:bg-white/70" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ——— Tiny UI helpers ——— */
function KpiCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-neutral-500">{sub}</div> : null}
    </div>
  );
}

function Badge({ type }: { type: "SALE" | "PURCHASE" }) {
  const cls =
    type === "SALE"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : "bg-blue-500/15 text-blue-600 dark:text-blue-400";
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs ${cls}`}>
      {type === "SALE" ? "Sale" : "Purchase"}
    </span>
  );
}
