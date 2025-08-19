"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useCatalog } from "@/lib/store/catalog";
import ItemsTable from "@/components/tables/ItemTable"; // keep your path
import { Input, Select, Button } from "@/components/ui";

type Form = { name: string; sku: string; unit: "kg" | "pcs" | "crate"; category: string };

export default function ItemsPage() {
  const { items, load, addItem, loading, error } = useCatalog();

  // UI state
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState<string>("ALL");
  const [category, setCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add form
  const [form, setForm] = useState<Form>({ name: "", sku: "", unit: "kg", category: "" });

  // initial load
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Units for filter (fallback to common units if list is empty yet)
  const units = useMemo(() => {
    const fromData = Array.from(new Set(items.map((i) => i.unit).filter(Boolean)));
    return fromData.length ? fromData : ["kg", "pcs", "crate"];
  }, [items]);

  // Duplicate SKU check
  const skuExists = useMemo(
    () => form.sku.trim() && items.some((i) => i.sku.toLowerCase() === form.sku.trim().toLowerCase()),
    [items, form.sku]
  );

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const cf = category.trim().toLowerCase();
    return items.filter(
      (i) =>
        (qn === "" || i.name.toLowerCase().includes(qn) || i.sku.toLowerCase().includes(qn)) &&
        (unit === "ALL" || i.unit === unit) &&
        (cf === "" || (i.category || "").toLowerCase().includes(cf))
    );
  }, [items, q, unit, category]);

  const canSave = form.name.trim() !== "" && form.sku.trim() !== "" && !skuExists && !saving;

  const closeModal = useCallback(() => {
    setShowAdd(false);
    setForm({ name: "", sku: "", unit: "kg", category: "" });
    setSaving(false);
  }, []);

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSave) return;
    try {
      setSaving(true);
      await addItem(form as any);
      closeModal();
    } catch (err: any) {
      alert(err?.message || "Failed to save item");
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
          <p className="text-sm text-neutral-500">Manage your catalog (name, SKU, unit, category)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-xs text-neutral-500">
            {filtered.length} of {items.length}
          </span>
          <Button onClick={() => setShowAdd(true)}>New Item</Button>
        </div>
      </header>

      {/* Error banner (if store errored) */}
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {/* Filters / Toolbar */}
      <div className="rounded-lg border">
        <div className="flex flex-wrap items-center gap-3 border-b p-3">
          <div className="min-w-[240px] flex-1">
            <Input placeholder="Search name or SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="w-[160px]">
            <Select
              value={unit}
              // If your Select passes a synthetic event, swap to: (e)=>setUnit((e.target as HTMLSelectElement).value)
              onChange={(v) => setUnit(v)}
            >
              <option value="ALL">All units</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-[200px]">
            <Input placeholder="Category filter" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 text-sm text-neutral-500">Loading items…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full border" />
            <p className="mb-3">No items yet</p>
            <Button onClick={() => setShowAdd(true)}>Create your first item</Button>
          </div>
        ) : (
          <div className="p-0">
            <ItemsTable items={filtered} />
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeModal();
          }}
        >
          <div className="w-full max-w-lg rounded-lg border bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Item</h2>
              <button className="text-sm text-neutral-500 hover:underline" onClick={closeModal}>
                Close
              </button>
            </div>

            <form
              className="grid grid-cols-2 gap-3"
              onSubmit={handleAdd}
            >
              <Input
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div>
                <Input
                  placeholder="SKU *"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
                {skuExists ? (
                  <div className="mt-1 text-xs text-red-600 dark:text-red-400">SKU already exists</div>
                ) : null}
              </div>

              <Select
                value={form.unit}
                onChange={(v) => setForm({ ...form, unit: v as Form["unit"] })}
              >
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="crate">crate</option>
              </Select>

              <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />

              <div className="col-span-2 mt-5 flex justify-end gap-2">
                <Button type="button" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSave}>
                  {saving ? "Saving…" : "Save Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
