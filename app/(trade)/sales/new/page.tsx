// app/(trade)/sales/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCatalog } from "@/lib/store/catalog";
import { useTrade } from "@/lib/store/trade";
import { api } from "@/lib/api";
import { Input, Select, Button } from "@/components/ui";
import LineItemsEditor from "@/components/forms/LineItemEditor";

type Customer = { id: string; name: string };

export default function NewSalePage() {
  const { items, warehouses, load: loadCatalog } = useCatalog();
  const { draftSale, addSaleLine, submitSale, setSaleCustomer } = useTrade();

  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadCatalog();
    api.listCustomers().then(setCustomers).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lookups
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

  const total = draftSale.lines.reduce(
    (s, l) => s + l.qty * l.unitPrice + (l.tax || 0) - (l.discount || 0),
    0
  );

  const canSave = Boolean(draftSale.customerId) && draftSale.lines.length > 0;
  const money = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Sale</h1>
          <p className="text-sm text-neutral-500">
            Select a customer, add line items, and save the invoice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sales"
            className="rounded border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cancel
          </Link>
          <Button
            disabled={!canSave}
            onClick={async () => {
              try {
                await submitSale();
                alert("Sale saved.");
              } catch (e: any) {
                alert(e.message);
              }
            }}
          >
            Save Sale
          </Button>
        </div>
      </header>

      {/* Customer & Date */}
      <section className="rounded-lg border">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Customer</label>
            <Select
              value={draftSale.customerId || ""}
              onChange={(val) => setSaleCustomer(val)}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Date</label>
            <Input type="date" defaultValue={draftSale.date} readOnly />
          </div>
          <div className="flex items-end">
            <div className="rounded-md border px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">
              Lines: <span className="font-medium">{draftSale.lines.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Line entry */}
      <section className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold tracking-tight">Add Line Items</h2>
          <p className="text-xs text-neutral-500">
            Choose item, warehouse, quantity, and unit price
          </p>
        </div>
        <div className="p-4">
          <LineItemsEditor mode="sale" onAdd={addSaleLine} />
        </div>
      </section>

      {/* Lines table */}
      <section className="overflow-hidden rounded-lg border">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white text-left dark:bg-neutral-950">
              <tr className="border-b">
                <th className="p-3 font-medium">Item</th>
                <th className="p-3 font-medium">Warehouse</th>
                <th className="p-3 font-medium text-right">Qty</th>
                <th className="p-3 font-medium text-right">Unit Price</th>
                <th className="p-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {draftSale.lines.map((l, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-black/5 dark:hover:bg-white/5 ${
                    idx % 2 ? "bg-black/[0.02] dark:bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="p-3">{itemById.get(l.itemId) || l.itemId}</td>
                  <td className="p-3">{whById.get(l.warehouseId) || l.warehouseId}</td>
                  <td className="p-3 text-right">{l.qty}</td>
                  <td className="p-3 text-right">{l.unitPrice.toFixed(2)}</td>
                  <td className="p-3 text-right">{(l.qty * l.unitPrice).toFixed(2)}</td>
                </tr>
              ))}

              {draftSale.lines.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-neutral-500">
                    No lines yet — add an item above to get started
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="p-3 text-right text-neutral-500">Total</td>
                <td className="p-3 text-right text-base font-semibold">{money(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
