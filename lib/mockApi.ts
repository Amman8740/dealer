
import { Item, Warehouse, Party, Purchase, Sale, ID } from "./types";

let ITEMS: Item[] = [
  { id: "i1", name: "Potato", sku: "POT-001", unit: "kg", category: "Vegetable" },
  { id: "i2", name: "Tomato", sku: "TOM-002", unit: "kg", category: "Vegetable" },
];
let WAREHOUSES: Warehouse[] = [{ id: "w1", name: "Main" }];
const PARTIES: Party[] = [
  { id: "s1", type: "SUPPLIER", name: "Green Farms" },
  { id: "c1", type: "CUSTOMER", name: "City Mart" },
];
const PURCHASES: Purchase[] = [];
const SALES: Sale[] = [];

const sleep = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const api = {
  // Catalog
  async listItems() { await sleep(); return ITEMS; },
  async createItem(input: Omit<Item, "id">) { await sleep(); const it = { ...input, id: crypto.randomUUID() }; ITEMS.push(it); return it; },
  async listWarehouses() { await sleep(); return WAREHOUSES; },

  // Parties
  async listSuppliers() { await sleep(); return PARTIES.filter(p => p.type === "SUPPLIER"); },
  async listCustomers() { await sleep(); return PARTIES.filter(p => p.type === "CUSTOMER"); },

  // Trade
  async createPurchase(p: Omit<Purchase, "id"|"total">) {
    await sleep();
    const total = p.lines.reduce((s, l) => s + l.qty * l.unitCost + (l.tax||0) - (l.discount||0), 0);
    const doc = { ...p, total, id: crypto.randomUUID() };
    PURCHASES.unshift(doc);
    return doc;
  },
  async listPurchases() { await sleep(); return PURCHASES; },

  async createSale(s: Omit<Sale, "id"|"total">) {
    await sleep();
    const total = s.lines.reduce((x, l) => x + l.qty * l.unitPrice + (l.tax||0) - (l.discount||0), 0);
    const doc = { ...s, total, id: crypto.randomUUID() };
    SALES.unshift(doc);
    return doc;
  },
// inside api object
async updateItem(id: ID, patch: Partial<Omit<Item, "id">>) {
  await sleep();
  const idx = ITEMS.findIndex(i => i.id === id);
  if (idx === -1) throw new Error("Item not found");
  ITEMS[idx] = { ...ITEMS[idx], ...patch };
  return ITEMS[idx];
},
async deleteItem(id: ID) {
  await sleep();
  const before = ITEMS.length;
  ITEMS = ITEMS.filter(i => i.id !== id);
  return { removed: before !== ITEMS.length };
},
async createWarehouse(input: Omit<Warehouse, "id">) {
  await sleep();
  const wh = { ...input, id: crypto.randomUUID() };
  WAREHOUSES.push(wh);
  return wh;
},
async updateWarehouse(id: ID, patch: Partial<Omit<Warehouse, "id">>) {
  await sleep();
  const idx = WAREHOUSES.findIndex(w => w.id === id);
  if (idx === -1) throw new Error("Warehouse not found");
  WAREHOUSES[idx] = { ...WAREHOUSES[idx], ...patch };
  return WAREHOUSES[idx];
},
async deleteWarehouse(id: ID) {
  await sleep();
  const before = WAREHOUSES.length;
  WAREHOUSES = WAREHOUSES.filter(w => w.id !== id);
  return { removed: before !== WAREHOUSES.length };
},
  async listSales() { await sleep(); return SALES; },
};
