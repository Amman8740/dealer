export type ID = string;

export type Unit = "kg" | "pcs" | "crate";

export type Item = {
  id: ID;
  name: string;
  sku: string;
  unit: Unit;
  category?: string;
  minStock?: number;
};

export type Warehouse = { id: ID; name: string };

export type PartyType = "CUSTOMER" | "SUPPLIER";
export type Party = { id: ID; type: PartyType; name: string; phone?: string };

export type PurchaseLine = {
  itemId: ID;
  warehouseId: ID;
  qty: number;        // +IN
  unitCost: number;
  tax?: number;
  discount?: number;
};

export type SaleLine = {
  itemId: ID;
  warehouseId: ID;
  qty: number;        // -OUT
  unitPrice: number;
  tax?: number;
  discount?: number;
};

export type Purchase = {
  id: ID; supplierId: ID; date: string; lines: PurchaseLine[]; total: number;
};

export type Sale = {
  id: ID; customerId: ID; date: string; lines: SaleLine[]; total: number;
};

export type StockMovement = {
  id: ID; itemId: ID; warehouseId: ID; qty: number; unitCost: number;
  refType: "PURCHASE" | "SALE" | "ADJUSTMENT" | "TRANSFER";
  refId: ID; createdAt: string;
};