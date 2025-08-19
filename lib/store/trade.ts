// lib/store/trade.ts
import { create } from "zustand";
import { PurchaseLine, SaleLine, Purchase, Sale } from "../types";
import { api } from "@/lib/api";

type DraftPurchase = { supplierId?: string; date: string; lines: PurchaseLine[] };
type DraftSale = { customerId?: string; date: string; lines: SaleLine[] };

type TradeState = {
  purchases: Purchase[];
  sales: Sale[];
  draftPurchase: DraftPurchase;
  draftSale: DraftSale;

  // NEW: ui flags (optional but useful)
  loading: boolean;
  error?: string;

  // NEW: setters so forms can write the selected party id
  setPurchaseSupplier: (id: string) => void;
  setSaleCustomer: (id: string) => void;

  addPurchaseLine: (l: PurchaseLine) => void;
  addSaleLine: (l: SaleLine) => void;
  submitPurchase: () => Promise<Purchase>;
  submitSale: () => Promise<Sale>;
  load: () => Promise<void>;
  resetDrafts: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export const useTrade = create<TradeState>((set, get) => ({
  purchases: [],
  sales: [],
  draftPurchase: { date: today(), lines: [] },
  draftSale: { date: today(), lines: [] },

  loading: false,
  error: undefined,

  // NEW
  setPurchaseSupplier: (id) =>
    set((s) => ({ draftPurchase: { ...s.draftPurchase, supplierId: id } })),
  setSaleCustomer: (id) =>
    set((s) => ({ draftSale: { ...s.draftSale, customerId: id } })),

  addPurchaseLine: (l) =>
    set((s) => ({
      draftPurchase: { ...s.draftPurchase, lines: [...s.draftPurchase.lines, l] },
    })),
  addSaleLine: (l) =>
    set((s) => ({ draftSale: { ...s.draftSale, lines: [...s.draftSale.lines, l] } })),

  submitPurchase: async () => {
    const { draftPurchase } = get();
    if (!draftPurchase.supplierId || draftPurchase.lines.length === 0) {
      throw new Error("Supplier & at least one line required");
    }
    set({ loading: true, error: undefined });
    try {
      const doc = await api.createPurchase(draftPurchase as any);
      const purchases = await api.listPurchases();
      set({
        purchases,
        draftPurchase: { date: today(), lines: [] },
        loading: false,
      });
      return doc;
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Failed to save purchase" });
      throw e;
    }
  },

  submitSale: async () => {
    const { draftSale } = get();
    if (!draftSale.customerId || draftSale.lines.length === 0) {
      throw new Error("Customer & at least one line required");
    }
    set({ loading: true, error: undefined });
    try {
      const doc = await api.createSale(draftSale as any);
      const sales = await api.listSales();
      set({
        sales,
        draftSale: { date: today(), lines: [] },
        loading: false,
      });
      return doc;
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Failed to save sale" });
      throw e;
    }
  },

  load: async () => {
    set({ loading: true, error: undefined });
    try {
      const [purchases, sales] = await Promise.all([
        api.listPurchases(),
        api.listSales(),
      ]);
      set({ purchases, sales, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Failed to load" });
    }
  },

  resetDrafts: () =>
    set({
      draftPurchase: { date: today(), lines: [] },
      draftSale: { date: today(), lines: [] },
    }),
}));
