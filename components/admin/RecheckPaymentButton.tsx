"use client";

// Epic 13: Midtrans Payment Integration (Snap Redirect) — US-13.4
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 8.5.
// Pola sama ClearShippingCacheButton (Epic 12): startTransition + router.refresh().

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recheckPaymentStatusAction } from "@/lib/actions/payments";

type RecheckPaymentButtonProps = {
  orderId: string;
};

export function RecheckPaymentButton({ orderId }: RecheckPaymentButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await recheckPaymentStatusAction(orderId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="self-start rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Mengecek..." : "Cek Ulang Status Pembayaran"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-700">Status pembayaran berhasil diperbarui.</p>}
    </div>
  );
}
