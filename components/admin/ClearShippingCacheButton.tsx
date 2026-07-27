"use client";

// Epic 12: Cek Ongkir Real-Time (RajaOngkir) — US-12.4
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 10.7.
// Pola sama AdminFeeTable (Epic 11): AdminConfirmDialog + startTransition + router.refresh().

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import type { clearShippingRateCacheAction } from "@/lib/actions/shipping-cache";

type ClearShippingCacheButtonProps = {
  action: typeof clearShippingRateCacheAction;
};

export function ClearShippingCacheButton({ action }: ClearShippingCacheButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        setSuccess(false);
        return;
      }
      setError(null);
      setSuccess(true);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setSuccess(false);
          setOpen(true);
        }}
        className="self-start rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
      >
        Bersihkan Cache Ongkir
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">Cache ongkir berhasil dibersihkan.</p>}

      <AdminConfirmDialog
        open={open}
        title="Bersihkan cache ongkir?"
        description={
          <p>
            Ini menghapus semua cache hasil kalkulasi ongkir (shipping_rate_cache). Request berikutnya akan
            memanggil RajaOngkir ulang untuk menghitung ongkir terbaru — cache pencarian alamat tidak terpengaruh.
          </p>
        }
        confirmLabel="Bersihkan Cache"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
