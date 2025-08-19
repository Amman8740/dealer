"use client";
import { useEffect } from "react";

export default function Precache() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const endpoints = [
      "/api/items",
      "/api/warehouses",
      "/api/parties?type=SUPPLIER",
      "/api/parties?type=CUSTOMER",
      "/api/purchases",
      "/api/sales",
    ];
    endpoints.forEach((u) => fetch(u).catch(() => {}));
  }, []);
  return null;
}