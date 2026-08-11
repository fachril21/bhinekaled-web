"use client";

// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.5.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { ORDER_STATUS_LABEL } from "@/components/admin/AdminOrderStatusBadge";
import { Select } from "@/components/admin/ui/form/Select";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
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

  const statusOptions = STATUS_OPTIONS.map((status) => ({ value: status, label: ORDER_STATUS_LABEL[status] }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-800">Update Status Order</h2>
      <div className="mt-3 flex flex-col gap-3">
        <Select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value as OrderStatus);
            setSuccess(false);
          }}
          options={statusOptions}
        />

        {error && <Alert variant="error" title="Gagal memperbarui status" message={error} />}
        {success && <Alert variant="success" title="Berhasil" message="Status berhasil diperbarui." />}

        <Button type="button" onClick={handleUpdate} disabled={selectedStatus === currentStatus || isPending}>
          {isPending ? "Memproses..." : "Update Status"}
        </Button>
      </div>
    </div>
  );
}
