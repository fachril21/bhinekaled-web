// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.1.
//
// Komponen terpisah dari AdminStatusBadge (Epic 5, khusus ProductStatus) —
// enum status tidak overlap, memaksakan union di satu komponen generik
// hanya menambah kerumitan tipe tanpa manfaat nyata.

import type { OrderStatus } from "@/types/database.types";

type AdminOrderStatusBadgeProps = {
  status: OrderStatus;
};

// Diekspor supaya dipakai ulang oleh OrderStatusUpdateForm (dropdown) — label
// tidak boleh duplikat di 2 tempat.
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const STATUS_CLASSNAME: Record<OrderStatus, string> = {
  menunggu_konfirmasi: "bg-amber-100 text-amber-700",
  diproses: "bg-blue-100 text-blue-700",
  dikirim: "bg-indigo-100 text-indigo-700",
  selesai: "bg-green-100 text-green-700",
  dibatalkan: "bg-red-100 text-red-700",
};

export function AdminOrderStatusBadge({ status }: AdminOrderStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSNAME[status]}`}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
