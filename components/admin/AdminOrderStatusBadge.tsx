// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.1.
//
// Komponen terpisah dari AdminStatusBadge (Epic 5, khusus ProductStatus) —
// enum status tidak overlap, memaksakan union di satu komponen generik
// hanya menambah kerumitan tipe tanpa manfaat nyata.

import type { OrderStatus } from "@/types/database.types";
import { Badge, type BadgeColor } from "@/components/admin/ui/Badge";

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

const STATUS_COLOR: Record<OrderStatus, BadgeColor> = {
  menunggu_konfirmasi: "warning",
  diproses: "info",
  dikirim: "primary",
  selesai: "success",
  dibatalkan: "error",
};

export function AdminOrderStatusBadge({ status }: AdminOrderStatusBadgeProps) {
  return (
    <Badge size="sm" color={STATUS_COLOR[status]}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
