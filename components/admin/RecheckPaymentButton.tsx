"use client";

// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
// Pola sama ClearShippingCacheButton (Epic 12): startTransition + router.refresh().

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recheckPaymentStatusAction } from "@/lib/actions/payments";
import { Button } from "@/components/admin/ui/Button";

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
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={isPending} className="self-start">
        {isPending ? "Mengecek..." : "Cek Ulang Status Pembayaran"}
      </Button>
      {error && <p className="text-xs text-error-600">{error}</p>}
      {success && <p className="text-xs text-success-600">Status pembayaran berhasil diperbarui.</p>}
    </div>
  );
}
