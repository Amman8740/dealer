// app/(trade)/sales/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTrade } from "@/lib/store/trade";
import { useCatalog } from "@/lib/store/catalog";
import { api } from "@/lib/api"; // ✅ use your HTTP wrapper to Next API routes
import { Input, Button, Select } from "@/components/ui";

type Customer = { id: string; name: string };

export default function SalesPage() {
  const {
    sales,
    load: loadTrade,
    loading: loadingTrade,
    error: errorTrade,
  } = useTrade();

  const {
    items,
    warehouses,
    load: loadCatalog,
    loading: loadingCatalog,
    error: errorCatalog,
  } = useCatalog();

  // UI state
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerFilter, setCustomerFilter] = useState<string>("ALL");
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    loadTrade();
    loadCatalog();
    api.listCustomers().then(setCustomers).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customerById = useMemo(() => {
    const m = new Map<string, string>();
    customers.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [customers]);

  const itemById = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach((i) => m.set(i.id, i.name));
    return m;
  }, [items]);

  const whById = useMemo(() => {
    const m = new Map<string, string>();
    warehouses.forEach((w) => m.set(w.id, w.name));
    return m;
  }, [warehouses]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    const sorted = [...sales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sorted.filter((s) => {
      const when = new Date(s.date);
      const custName = customerById.get(s.customerId) || "";
      const matchesQ =
        !needle ||
        s.id.toLowerCase().includes(needle) ||
        custName.toLowerCase().includes(needle);
      const after = !fromDate || when >= fromDate;
      const before = !toDate || when <= toDate;
      const matchesCustomer = customerFilter === "ALL" || s.customerId === customerFilter;

      return matchesQ && after && before && matchesCustomer;
    });
  }, [sales, q, from, to, customerFilter, customerById]);

  // ✅ this was missing in your snippet
  const view = viewId ? filtered.find((s) => s.id === viewId) : null;

  const money = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);

  const loading = loadingTrade || loadingCatalog;
  const error = errorTrade || errorCatalog;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
          <p className="text-sm text-neutral-500">All sales invoices and totals</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-xs text-neutral-500">
            {filtered.length} of {sales.length}
          </span>
          <Link href="/sales/new" className="rounded bg-black px-3 py-2 text-white hover:opacity-90">
            New Sale
          </Link>
        </div>
      </header>

      {/* Error banner */}
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {/* Filters */}
      <div className="rounded-lg border">
        <div className="flex flex-wrap items-end gap-3 border-b p-3">
          <div className="min-w-[260px] flex-1">
            <Input
              placeholder="Search customer or invoice ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="w-[220px]">
            <label className="mb-1 block text-xs text-neutral-500">Customer</label>
            <Select value={customerFilter} onChange={(v) => setCustomerFilter(v)}>
              <option value="ALL">All customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-[170px]">
            <label className="mb-1 block text-xs text-neutral-500">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="w-[170px]">
            <label className="mb-1 block text-xs text-neutral-500">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="ml-auto">
            <Button onClick={() => { setQ(""); setFrom(""); setTo(""); setCustomerFilter("ALL"); }}>
              Reset
            </Button>
          </div>
        </div>

        {/* Table / states */}
        {loading ? (
          <div className="p-6 text-sm text-neutral-500">Loading sales…</div>
        ) : sales.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full border" />
            <p className="mb-3">No sales yet</p>
            <Link href="/sales/new" className="rounded bg-black px-3 py-2 text-white">
              Create your first sale
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-b-lg">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white text-left dark:bg-neutral-950">
                  <tr className="border-b">
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Lines</th>
                    <th className="p-3 font-medium text-right">Amount</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-b hover:bg-black/5 dark:hover:bg-white/5 ${
                        idx % 2 ? "bg-black/[0.02] dark:bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="p-3">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="p-3">{customerById.get(s.customerId) || s.customerId}</td>
                      <td className="p-3">{s.lines.length}</td>
                      <td className="p-3 text-right font-medium">{money(s.total)}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => setViewId(s.id)}>View</Button>
                          {/* TODO: add Delete when you implement /api/sales/[id] DELETE */}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">
                        No sales match your filters
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="p-3 text-neutral-500" colSpan={3}>
                      Page total
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {money(filtered.reduce((s, r) => s + r.total, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View modal */}
      {view && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onKeyDown={(e) => { if (e.key === "Escape") setViewId(null); }}
        >
          <div className="w-full max-w-3xl rounded-lg border bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Sale {view.id.slice(0, 8)}</h2>
                <p className="text-xs text-neutral-500">
                  {new Date(view.date).toLocaleDateString()} &middot; Customer:{" "}
                  {customerById.get(view.customerId) || view.customerId}
                </p>
              </div>
              <button
                className="text-sm text-neutral-500 hover:underline"
                onClick={() => setViewId(null)}
              >
                Close
              </button>
            </div>

            <div className="overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left dark:bg-neutral-900">
                  <tr className="border-b">
                    <th className="p-2 font-medium">Item</th>
                    <th className="p-2 font-medium">Warehouse</th>
                    <th className="p-2 font-medium text-right">Qty</th>
                    <th className="p-2 font-medium text-right">Unit Price</th>
                    <th className="p-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {view.lines.map((l, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{itemById.get(l.itemId) || l.itemId}</td>
                      <td className="p-2">{whById.get(l.warehouseId) || l.warehouseId}</td>
                      <td className="p-2 text-right">{l.qty}</td>
                      <td className="p-2 text-right">{l.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right">{(l.qty * l.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="p-2" colSpan={4}>
                      <span className="text-neutral-500">Total</span>
                    </td>
                    <td className="p-2 text-right font-semibold">{money(view.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => setViewId(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
