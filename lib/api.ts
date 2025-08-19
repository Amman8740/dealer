// lib/api.ts
import { enqueue } from '@/lib/offlineQueue';

type Res<T> = { ok: true; data: T } | { ok: false; error: string };

function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}
function isSameOrigin(u: string) {
  try {
    const url = new URL(u, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return typeof window === 'undefined' || url.origin === window.location.origin;
  } catch {
    return true; // relative URLs are same-origin
  }
}

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase() as 'GET'|'POST'|'PATCH'|'DELETE';
  const bodyObj = init?.body ? (() => { try { return JSON.parse(String(init.body)); } catch { return undefined; } })() : undefined;

  // Always go through SW; (no-store) only bypasses the browser HTTP cache, not the SW.
  const reqInit: RequestInit = {
    cache: 'no-store',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  };

  // Helper to queue (for Safari / no background sync)
  const queueIfNeeded = () => {
    if (method !== 'GET' && isSameOrigin(url)) {
      enqueue({
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        url,
        method: method as 'POST' | 'PATCH' | 'DELETE',
        body: bodyObj,
      });
    }
  };

  // If offline up-front and this is a write, queue immediately and return a soft value
  if (!isOnline() && method !== 'GET') {
    queueIfNeeded();
    // Soft OK (UI usually re-lists later)
    return { id: `offline-${crypto?.randomUUID?.() ?? Date.now()}` } as any as T;
  }

  try {
    const res = await fetch(url, reqInit);
    const text = await res.text();
    let json: Res<T> | null = null;
    try { json = text ? (JSON.parse(text) as Res<T>) : null; } catch {}

    if (!res.ok || !json || json.ok !== true) {
      // Network may be up but server responded 4xx/5xx — don't queue these
      const msg = json?.error || text || `Request failed: ${res.status}`;
      throw new Error(msg);
    }
    return (json as any).data as T;
  } catch (err) {
    // If it *looks* like a network error (TypeError) on a write, queue & soft succeed
    if (method !== 'GET' && (err instanceof TypeError || !isOnline())) {
      queueIfNeeded();
      return { id: `offline-${crypto?.randomUUID?.() ?? Date.now()}` } as any as T;
    }
    throw err;
  }
}

// Export your API
export const api = {
  // ---------- Items ----------
  listItems: () => j<any[]>('/api/items'),
  createItem: (body: { name: string; sku: string; unit: string; category?: string | null }) =>
    j<{ id: string }>('/api/items', { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (id: string, patch: any) =>
    j<{ id: string }>(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteItem: (id: string) =>
    j<{ id: string }>(`/api/items/${id}`, { method: 'DELETE' }),

  // ---------- Warehouses ----------
  listWarehouses: () => j<any[]>('/api/warehouses'),
  createWarehouse: (body: { name: string }) =>
    j<{ id: string }>('/api/warehouses', { method: 'POST', body: JSON.stringify(body) }),
  updateWarehouse: (id: string, patch: any) =>
    j<{ id: string }>(`/api/warehouses/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteWarehouse: (id: string) =>
    j<{ id: string }>(`/api/warehouses/${id}`, { method: 'DELETE' }),

  // ---------- Parties ----------
  listSuppliers: () => j<any[]>('/api/parties?type=SUPPLIER'),
  listCustomers: () => j<any[]>('/api/parties?type=CUSTOMER'),
  createParty: (body: { name: string; type: 'SUPPLIER' | 'CUSTOMER'; phone?: string }) =>
    j<{ id: string }>('/api/parties', { method: 'POST', body: JSON.stringify(body) }),

  // Convenience
  createSupplier: (body: { name: string; phone?: string }) =>
    j<{ id: string }>('/api/parties', { method: 'POST', body: JSON.stringify({ ...body, type: 'SUPPLIER' }) }),
  createCustomer: (body: { name: string; phone?: string }) =>
    j<{ id: string }>('/api/parties', { method: 'POST', body: JSON.stringify({ ...body, type: 'CUSTOMER' }) }),

  // ---------- Purchases ----------
  listPurchases: () => j<any[]>('/api/purchases'),
  createPurchase: (body: {
    supplierId: string; date: string;
    lines: Array<{ itemId: string; warehouseId: string; qty: number; unitCost: number; tax?: number; discount?: number }>;
  }) => j<{ id: string; total: number }>('/api/purchases', { method: 'POST', body: JSON.stringify(body) }),

  // ---------- Sales ----------
  listSales: () => j<any[]>('/api/sales'),
  createSale: (body: {
    customerId: string; date: string;
    lines: Array<{ itemId: string; warehouseId: string; qty: number; unitPrice: number; tax?: number; discount?: number }>;
  }) => j<{ id: string; total: number }>('/api/sales', { method: 'POST', body: JSON.stringify(body) }),
};
