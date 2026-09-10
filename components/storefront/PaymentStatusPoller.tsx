"use client";

// Epic 14 follow-up: auto-refresh halaman konfirmasi selama pembayaran masih
// "menggantung". Saat customer baru di-redirect balik dari Duitku, status di
// transactionStatus API kadang butuh beberapa detik untuk jadi "paid" (dan
// webhook bisa datang belakangan). Komponen ini memanggil router.refresh()
// beberapa kali — tiap refresh, server page menjalankan ulang
// syncDuitkuOrderStatus() — lalu berhenti sendiri.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 4000;
const MAX_REFRESHES = 6; // ~24 detik

type PaymentStatusPollerProps = {
  /** true selama payment_status masih bisa berubah jadi lunas */
  active: boolean;
};

export function PaymentStatusPoller({ active }: PaymentStatusPollerProps) {
  const router = useRouter();
  const countRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    countRef.current = 0;
    const id = setInterval(() => {
      countRef.current += 1;
      router.refresh();
      if (countRef.current >= MAX_REFRESHES) clearInterval(id);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active, router]);

  return null;
}
