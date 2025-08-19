// lib/firebaseApi.ts
import { db } from "@/lib/firebase/client";
import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc,
} from "firebase/firestore";
import type { Item, Warehouse, Party, Purchase, Sale, ID } from "@/lib/types";

function mapDocs<T extends { id: string }>(snap: any): T[] {
  const out: T[] = [];
  snap.forEach((d: any) => out.push({ id: d.id, ...d.data() }));
  return out as T[];
}

export const firebaseApi = {
  // ----- Catalog -----
  async listItems(): Promise<Item[]> {
    const snap = await getDocs(query(collection(db, "items"), orderBy("name")));
    return mapDocs<Item>(snap);
  },
  async createItem(input: Omit<Item, "id">) {
    await addDoc(collection(db, "items"), input);
  },
  async updateItem(id: ID, patch: Partial<Omit<Item, "id">>) {
    await updateDoc(doc(db, `items/${id}`), patch as any);
  },
  async deleteItem(id: ID) {
    await deleteDoc(doc(db, `items/${id}`));
  },

  async listWarehouses(): Promise<Warehouse[]> {
    const snap = await getDocs(query(collection(db, "warehouses"), orderBy("name")));
    return mapDocs<Warehouse>(snap);
  },
  async createWarehouse(input: Omit<Warehouse, "id">) {
    await addDoc(collection(db, "warehouses"), input);
  },
  async updateWarehouse(id: ID, patch: Partial<Omit<Warehouse, "id">>) {
    await updateDoc(doc(db, `warehouses/${id}`), patch as any);
  },
  async deleteWarehouse(id: ID) {
    await deleteDoc(doc(db, `warehouses/${id}`));
  },

  // ----- Parties -----
  async listSuppliers(): Promise<Party[]> {
    const snap = await getDocs(query(collection(db, "parties"), orderBy("name")));
    return mapDocs<Party>(snap).filter(p => p.type === "SUPPLIER");
  },
  async listCustomers(): Promise<Party[]> {
    const snap = await getDocs(query(collection(db, "parties"), orderBy("name")));
    return mapDocs<Party>(snap).filter(p => p.type === "CUSTOMER");
  },

  // ----- Trade -----
  async createPurchase(p: Omit<Purchase, "id"|"total">) {
    const total = p.lines.reduce((s, l) => s + l.qty * l.unitCost + (l.tax||0) - (l.discount||0), 0);
    await addDoc(collection(db, "purchases"), { ...p, total });
  },
  async listPurchases(): Promise<Purchase[]> {
    const snap = await getDocs(query(collection(db, "purchases"), orderBy("date", "desc")));
    return mapDocs<Purchase>(snap);
  },

  async createSale(s: Omit<Sale, "id"|"total">) {
    const total = s.lines.reduce((t, l) => t + l.qty * l.unitPrice + (l.tax||0) - (l.discount||0), 0);
    await addDoc(collection(db, "sales"), { ...s, total });
  },
  async listSales(): Promise<Sale[]> {
    const snap = await getDocs(query(collection(db, "sales"), orderBy("date", "desc")));
    return mapDocs<Sale>(snap);
  },
};
