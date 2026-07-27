"use client";

// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Belum ada hook debounce serupa di project — dipakai ShippingSelector
// untuk debounce pencarian destinasi (AC US-12.1: delay >=400ms).

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
