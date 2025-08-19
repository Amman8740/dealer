// lib/store/catalog.ts
import { create } from "zustand";
import { api } from "@/lib/api";
import type { Item, Warehouse } from "../types";

type CatalogState = {
  items: Item[];
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;

  addItem: (input: Omit<Item, "id">) => Promise<void>;
  updateItem: (id: string, patch: Partial<Omit<Item, "id">>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  addWarehouse: (input: Omit<Warehouse, "id">) => Promise<void>;
  updateWarehouse: (id: string, patch: Partial<Omit<Warehouse, "id">>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
};

export const useCatalog = create<CatalogState>((set, get) => {
  // local helpers to keep code DRY
  const refreshItems = async () => {
    const items = await api.listItems();
    set({ items });
  };
  const refreshWarehouses = async () => {
    const warehouses = await api.listWarehouses();
    set({ warehouses });
  };

  return {
    items: [],
    warehouses: [],
    loading: false,
    error: null,

    load: async () => {
      set({ loading: true, error: null });
      try {
        const [items, warehouses] = await Promise.all([
          api.listItems(),
          api.listWarehouses(),
        ]);
        set({ items, warehouses });
      } catch (e: any) {
        set({ error: e?.message || String(e) });
      } finally {
        set({ loading: false });
      }
    },

    // ---------- Items ----------
    addItem: async (input) => {
      set({ loading: true, error: null });
      try {
        await api.createItem(input as any);
        await refreshItems();
      } catch (e: any) {
        set({ error: e?.message || String(e) });
      } finally {
        set({ loading: false });
      }
    },

    updateItem: async (id, patch) => {
      set({ loading: true, error: null });
      try {
        await api.updateItem(id, patch);
        await refreshItems();
      } catch (e: any) {
        set({ error: e?.message || String(e) });
      } finally {
        set({ loading: false });
      }
    },

    deleteItem: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.deleteItem(id);
        await refreshItems();
      } catch (e: any) {
        set({ error: e?.message || String(e) });
      } finally {
        set({ loading: false });
      }
    },

    // ---------- Warehouses ----------
    addWarehouse: async (input) => {
      set({ loading: true, error: null });
      try {
        await api.createWarehouse(input as any);
        await refreshWarehouses();
      } catch (e: any) {
        set({ error: e?.message || String(e) });
      } finally {
        set({ loading: false });
      }
    },

    updateWarehouse: async (id, patch) => {
      set({ loading: true, error: null });
      try {
        await api.updateWarehouse(id, patch);
        await refreshWarehouses();
      } catch (e: any) {
        set({ error: e?.message || String(e) });
      } finally {
        set({ loading: false });
      }
    },

    deleteWarehouse: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.deleteWarehouse(id);
        await refreshWarehouses();
      } catch (e: any) {
        set({ error: e?.message || String(e) });
      } finally {
        set({ loading: false });
      }
    },
  };
});
