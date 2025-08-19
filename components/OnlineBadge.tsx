"use client";

import { useEffect, useState } from "react";

export default function OnlineBadge() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;
  return (
    <div className="fixed right-4 bottom-4 rounded bg-amber-400 px-3 py-2 text-xs font-medium text-black shadow">
      Offline mode — changes will sync when you’re back online
    </div>
  );
}