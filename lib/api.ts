type Res<T> = { ok: true; data: T } | { ok: false; error: string };

function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      cache: "no-store", // SW cache still works; this only skips browser's HTTP cache
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });

    // Read body safely
    const text = await res.text();
    let json: Res<T> | null = null;
    try { json = text ? (JSON.parse(text) as Res<T>) : null; } catch {}

    if (!res.ok || !json || json.ok !== true) {
      const msg = json?.error || text || `Request failed: ${res.status}`;
      throw new Error(msg);
    }
    return (json as any).data as T;
  } catch (err) {
    // If offline and it's a write, assume Workbox queued it → return a soft OK
    const method = (init?.method || 'GET').toUpperCase();
    if (!isOnline() && method !== 'GET') {
      // Return a minimal placeholder so calling code doesn’t crash.
      // (Your stores usually re-list after creates; SW will sync later.)
      return { id: `offline-${crypto?.randomUUID?.() ?? Date.now()}` } as any as T;
    }
    throw err;
  }
}

export const api = {
  // ---------- Items ----------
  listItems: () => j<any[]>("/api/items"),
  createItem: (body: { name: string; sku: string; unit: string; category?: string | null }) =>
    j<{ id: string }>("/api/items", { method: "POST", body: JSON.stringify(body) }),
  updateItem: (id: string, patch: any) =>
    j<{ id: string }>(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteItem: (id: string) => j<{ id: string }>(`/api/items/${id}`, { method: "DELETE" }),

  // ---------- Warehouses ----------
  listWarehouses: () => j<any[]>("/api/warehouses"),
  createWarehouse: (body: { name: string }) =>
    j<{ id: string }>("/api/warehouses", { method: "POST", body: JSON.stringify(body) }),
  updateWarehouse: (id: string, patch: any) =>
    j<{ id: string }>(`/api/warehouses/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteWarehouse: (id: string) => j<{ id: string }>(`/api/warehouses/${id}`, { method: "DELETE" }),

  // ---------- Parties ----------
  listSuppliers: () => j<any[]>("/api/parties?type=SUPPLIER"),
  listCustomers: () => j<any[]>("/api/parties?type=CUSTOMER"),
  createParty: (body: { name: string; type: "SUPPLIER" | "CUSTOMER"; phone?: string }) =>
    j<{ id: string }>("/api/parties", { method: "POST", body: JSON.stringify(body) }),

  // ✅ add these two wrappers so pages can call them directly
  createSupplier: (body: { name: string; phone?: string }) =>
    j<{ id: string }>("/api/parties", {
      method: "POST",
      body: JSON.stringify({ ...body, type: "SUPPLIER" }),
    }),
  createCustomer: (body: { name: string; phone?: string }) =>
    j<{ id: string }>("/api/parties", {
      method: "POST",
      body: JSON.stringify({ ...body, type: "CUSTOMER" }),
    }),

  // ---------- Purchases ----------
  listPurchases: () => j<any[]>("/api/purchases"),
  createPurchase: (body: {
    supplierId: string;
    date: string;
    lines: Array<{ itemId: string; warehouseId: string; qty: number; unitCost: number; tax?: number; discount?: number }>;
  }) => j<{ id: string; total: number }>("/api/purchases", { method: "POST", body: JSON.stringify(body) }),

  // ---------- Sales ----------
  listSales: () => j<any[]>("/api/sales"),
  createSale: (body: {
    customerId: string;
    date: string;
    lines: Array<{ itemId: string; warehouseId: string; qty: number; unitPrice: number; tax?: number; discount?: number }>;
  }) => j<{ id: string; total: number }>("/api/sales", { method: "POST", body: JSON.stringify(body) }),
};
