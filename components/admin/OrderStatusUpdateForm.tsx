"use client";

// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.5.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { ORDER_STATUS_LABEL } from "@/components/admin/AdminOrderStatusBadge";
import type { OrderStatus } from "@/types/database.types";

type OrderStatusUpdateFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export function OrderStatusUpdateForm({ orderId, currentStatus }: OrderStatusUpdateFormProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, selectedStatus);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Update Status Order</h2>
      <div className="mt-3 flex flex-col gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value as OrderStatus);
            setSuccess(false);
          }}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABEL[status]}
            </option>
          ))}
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Status berhasil diperbarui.</p>}

        <button
          type="button"
          onClick={handleUpdate}
          disabled={selectedStatus === currentStatus || isPending}
          className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Memproses..." : "Update Status"}
        </button>
      </div>
    </div>
  );
}
