"use client";
import { useEffect } from 'react';
import { flushJobs } from '@/lib/offlineQueue';

export default function OfflineSync() {
  useEffect(() => {
    const run = () => flushJobs().catch(() => {});
    run();
    window.addEventListener('online', run);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') run();
    });
    return () => window.removeEventListener('online', run);
  }, []);
  return null;
}