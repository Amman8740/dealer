"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useCatalog } from "@/lib/store/catalog";
import WarehouseTable from "@/components/tables/WareHousesTable"; // keep your path/name
import { Input, Button } from "@/components/ui";

export default function WarehousesPage() {
  const { warehouses, load, addWarehouse, loading, error } = useCatalog();

  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // initial load
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return warehouses.filter((w) => !needle || w.name.toLowerCase().includes(needle));
  }, [warehouses, q]);

  const nameExists = useMemo(() => {
    const n = name.trim().toLowerCase();
    return !!n && warehouses.some((w) => w.name.toLowerCase() === n);
  }, [name, warehouses]);

  const canSave = name.trim().length > 0 && !nameExists && !saving;

  const closeModal = useCallback(() => {
    setShowAdd(false);
    setName("");
    setSaving(false);
  }, []);

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSave) return;
    try {
      setSaving(true);
      await addWarehouse({ name: name.trim() } as any);
      closeModal();
    } catch (err: any) {
      alert(err?.message || "Failed to create warehouse");
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Warehouses</h1>
          <p className="text-sm text-neutral-500">Manage the locations where you store stock</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-xs text-neutral-500">
            {filtered.length} of {warehouses.length}
          </span>
          <Button onClick={() => setShowAdd(true)}>New Warehouse</Button>
        </div>
      </header>

      {/* Error banner */}
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {/* Toolbar + content */}
      <div className="rounded-lg border">
        <div className="flex flex-wrap items-center gap-3 border-b p-3">
          <div className="min-w-[260px] flex-1">
            <Input
              placeholder="Search warehouse…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-neutral-500">Loading warehouses…</div>
        ) : warehouses.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full border" />
            <p className="mb-3">No warehouses yet</p>
            <Button onClick={() => setShowAdd(true)}>Create your first warehouse</Button>
          </div>
        ) : (
          <WarehouseTable warehouses={filtered} />
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeModal();
          }}
        >
          <div className="w-full max-w-md rounded-lg border bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Warehouse</h2>
              <button
                className="text-sm text-neutral-500 hover:underline"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-2">
              <div>
                <Input
                  placeholder="Warehouse name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameExists ? (
                  <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                    A warehouse with this name already exists
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSave}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
