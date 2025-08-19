// components/tables/ItemTable.tsx
"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { Input, Select, Button } from "@/components/ui";
import { useCatalog } from "@/lib/store/catalog";

type Props = { items: Item[] };

export default function ItemTable({ items }: Props) {
  const { updateItem, deleteItem } = useCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Item>>({});

  const startEdit = (row: Item) => {
    setEditingId(row.id);
    setDraft({ id: row.id, name: row.name, sku: row.sku, unit: row.unit, category: row.category });
  };

  const cancel = () => {
    setEditingId(null);
    setDraft({});
  };

  const save = async () => {
    if (!editingId) return;
    await updateItem(editingId, {
      name: draft.name?.trim() || "",
      sku: draft.sku?.trim() || "",
      unit: (draft.unit as Item["unit"]) || "kg",
      category: draft.category || "",
    });
    cancel();
  };

  const remove = async (id: string) => {
    if (confirm("Delete this item?")) {
      await deleteItem(id);
      if (editingId === id) cancel();
    }
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white text-left dark:bg-neutral-950">
            <tr className="border-b">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Unit</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => {
              const isEditing = editingId === row.id;
              return (
                <tr
                  key={row.id}
                  className={`border-b hover:bg-black/5 dark:hover:bg-white/5 ${
                    idx % 2 ? "bg-black/[0.02] dark:bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="p-3">
                    {isEditing ? (
                      <Input
                        value={draft.name ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      />
                    ) : (
                      row.name
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <Input
                        value={draft.sku ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
                      />
                    ) : (
                      row.sku
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <Select
                        value={(draft.unit as string) ?? row.unit}
                        onChange={(v) => setDraft((d) => ({ ...d, unit: v as Item["unit"] }))}
                      >
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                        <option value="crate">crate</option>
                      </Select>
                    ) : (
                      row.unit
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <Input
                        value={draft.category ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                      />
                    ) : (
                      row.category || "-"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button onClick={save}>Save</Button>
                          <Button onClick={cancel}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => startEdit(row)}>Edit</Button>
                          <Button onClick={() => remove(row.id)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
