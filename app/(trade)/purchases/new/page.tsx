// app/(trade)/purchases/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCatalog } from "@/lib/store/catalog";
import { useTrade } from "@/lib/store/trade";
import { api } from "@/lib/api";
import { Input, Select, Button } from "@/components/ui";
import LineItemsEditor from "@/components/forms/LineItemEditor";

type Supplier = { id: string; name: string };

export default function NewPurchasePage() {
  const { items, warehouses, load: loadCatalog } = useCatalog();
  const { draftPurchase, addPurchaseLine, submitPurchase, setPurchaseSupplier } = useTrade();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSup, setLoadingSup] = useState(true);
  const [showNewSup, setShowNewSup] = useState(false);
  const [newSupName, setNewSupName] = useState("");

  useEffect(() => {
    loadCatalog();
    (async () => {
      try {
        setLoadingSup(true);
        const list = await api.listSuppliers();
        setSuppliers(list || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSup(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quick-create supplier
async function handleCreateSupplier(e?: React.FormEvent) {
  e?.preventDefault();
  const name = newSupName.trim();
  if (!name) return;
  try {
    const created = await api.createSupplier({ name }); // returns { id: string }
    setSuppliers((prev) => [...prev, { id: created.id, name }]); // <-- add name
    setPurchaseSupplier(created.id);                              // <-- select it
    setShowNewSup(false);
    setNewSupName("");
  } catch (err: any) {
    alert(err?.message || "Failed to create supplier");
  }
}

  // Lookup maps
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

  const total = draftPurchase.lines.reduce(
    (s, l) => s + l.qty * l.unitCost + (l.tax || 0) - (l.discount || 0),
    0
  );

  const canSave = Boolean(draftPurchase.supplierId) && draftPurchase.lines.length > 0;
  const money = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Purchase</h1>
          <p className="text-sm text-neutral-500">Select a supplier, add line items, and save the bill</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/purchases" className="rounded border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
            Cancel
          </Link>
          <Button
            disabled={!canSave}
            onClick={async () => {
              try {
                await submitPurchase();
                alert("Purchase saved.");
              } catch (e: any) {
                alert(e.message);
              }
            }}
          >
            Save Purchase
          </Button>
        </div>
      </header>

      {/* Supplier & Date */}
      <section className="rounded-lg border">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Supplier</label>
            <div className="flex gap-2">
    <Select
  value={draftPurchase.supplierId || ""}
  onChange={(val) => setPurchaseSupplier(val)}
>
  <option value="">Select supplier</option>
  {suppliers.map((s) => (
    <option key={s.id} value={s.id}>{s.name}</option>
  ))}
</Select>
              <Button type="button" onClick={() => setShowNewSup(true)}>+ New</Button>
            </div>
            {(!loadingSup && suppliers.length === 0) && (
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                No suppliers yet — add one.
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-500">Date</label>
            <Input type="date" defaultValue={draftPurchase.date} readOnly />
          </div>

          <div className="flex items-end">
            <div className="rounded-md border px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">
              Lines: <span className="font-medium">{draftPurchase.lines.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Line entry */}
      <section className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold tracking-tight">Add Line Items</h2>
          <p className="text-xs text-neutral-500">Choose item, warehouse, quantity, and unit cost</p>
        </div>
        <div className="p-4">
          <LineItemsEditor mode="purchase" onAdd={addPurchaseLine} />
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
                <th className="p-3 font-medium text-right">Unit Cost</th>
                <th className="p-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {draftPurchase.lines.map((l, idx) => (
                <tr key={idx} className={`border-b hover:bg-black/5 dark:hover:bg-white/5 ${idx % 2 ? "bg-black/[0.02] dark:bg-white/[0.02]" : ""}`}>
                  <td className="p-3">{itemById.get(l.itemId) || l.itemId}</td>
                  <td className="p-3">{whById.get(l.warehouseId) || l.warehouseId}</td>
                  <td className="p-3 text-right">{l.qty}</td>
                  <td className="p-3 text-right">{l.unitCost.toFixed(2)}</td>
                  <td className="p-3 text-right">{(l.qty * l.unitCost).toFixed(2)}</td>
                </tr>
              ))}
              {draftPurchase.lines.length === 0 && (
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

      {/* Quick Add Supplier modal */}
      {showNewSup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onKeyDown={(e)=>{ if(e.key==="Escape") setShowNewSup(false) }}>
          <div className="w-full max-w-md rounded-lg border bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Supplier</h3>
              <button className="text-sm text-neutral-500 hover:underline" onClick={()=>setShowNewSup(false)}>Close</button>
            </div>
            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <Input placeholder="Supplier name *" value={newSupName} onChange={(e)=>setNewSupName(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={()=>setShowNewSup(false)}>Cancel</Button>
                <Button type="submit" disabled={!newSupName.trim()}>Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
