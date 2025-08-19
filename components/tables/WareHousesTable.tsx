"use client";

import { useState } from "react";
import { Warehouse } from "@/lib/types";
import { Input, Button } from "@/components/ui";
import { useCatalog } from "@/lib/store/catalog";

export default function WarehouseTable({ warehouses }: { warehouses: Warehouse[] }) {
  const { updateWarehouse, deleteWarehouse } = useCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const start = (w: Warehouse) => {
    setEditingId(w.id);
    setName(w.name);
  };
  const cancel = () => {
    setEditingId(null);
    setName("");
  };
  const save = async () => {
    if (!editingId) return;
    await updateWarehouse(editingId, { name: name.trim() });
    cancel();
  };
  const remove = async (id: string) => {
    if (confirm("Delete this warehouse?")) {
      await deleteWarehouse(id);
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
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w, idx) => {
              const isEditing = editingId === w.id;
              return (
                <tr
                  key={w.id}
                  className={`border-b hover:bg-black/5 dark:hover:bg-white/5 ${
                    idx % 2 ? "bg-black/[0.02] dark:bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="p-3">
                    {isEditing ? (
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    ) : (
                      w.name
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
                          <Button onClick={() => start(w)}>Edit</Button>
                          <Button onClick={() => remove(w.id)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {warehouses.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-neutral-500">
                  No warehouses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}