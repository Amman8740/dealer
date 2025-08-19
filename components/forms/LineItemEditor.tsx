"use client";
import { useState } from "react";
import { Button, Select, Input } from "../ui";
import { useCatalog } from "@/lib/store/catalog";

type Props = {
  mode: "purchase" | "sale";
  onAdd: (line: any) => void;
};

export default function LineItemsEditor({ mode, onAdd }: Props) {
  const { items, warehouses } = useCatalog();
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  const priceLabel = mode === "purchase" ? "Unit Cost" : "Unit Price";

  return (
    <div className="grid grid-cols-5 gap-3 items-end">
      <Select value={itemId} onChange={setItemId}>
        <option value="">Select item</option>
        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
      </Select>
      <Select value={warehouseId} onChange={setWarehouseId}>
        <option value="">Warehouse</option>
        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </Select>
      <Input type="number" min={0.001} step="0.001" value={qty} onChange={e=>setQty(parseFloat(e.target.value)||0)} placeholder="Qty" />
      <Input type="number" min={0} step="0.01" value={price} onChange={e=>setPrice(parseFloat(e.target.value)||0)} placeholder={priceLabel} />
      <Button
        onClick={() => {
          if (!itemId || !warehouseId || qty <= 0) return;
          onAdd(mode === "purchase"
            ? { itemId, warehouseId, qty, unitCost: price }
            : { itemId, warehouseId, qty, unitPrice: price });
          setItemId(""); setWarehouseId(""); setQty(1); setPrice(0);
        }}
      >
        Add
      </Button>
    </div>
  );
}
