"use client";

// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 8.3.

import { useState, useTransition } from "react";

type PayNowButtonProps = {
  orderNumber: string;
};

export function PayNowButton({ orderNumber }: PayNowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/payments/midtrans/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Gagal memulai pembayaran, coba lagi.");
          return;
        }
        // window.location.href (bukan router.push) karena redirect menuju
        // domain eksternal (Midtrans), bukan route internal Next.js.
        window.location.href = data.redirectUrl;
      } catch {
        setError("Gagal terhubung ke server, periksa koneksi Anda.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="w-full rounded-full bg-brand-red px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Menyiapkan pembayaran..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}
