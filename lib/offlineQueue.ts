// lib/offlineQueue.ts
type Job = {
  id: string;
  url: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

const KEY = '__offline_jobs__';

const load = (): Job[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};
const save = (x: Job[]) => localStorage.setItem(KEY, JSON.stringify(x));

export function enqueue(job: Job) {
  const jobs = load();
  jobs.push(job);
  save(jobs);
}

export async function flushJobs() {
  if (!navigator.onLine) return;
  const jobs = load();
  if (!jobs.length) return;

  const remaining: Job[] = [];
  for (const j of jobs) {
    try {
      const res = await fetch(j.url, {
        method: j.method,
        headers: { 'Content-Type': 'application/json', ...(j.headers || {}) },
        body: j.body ? JSON.stringify(j.body) : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      remaining.push(j);
    }
  }
  save(remaining);
}
