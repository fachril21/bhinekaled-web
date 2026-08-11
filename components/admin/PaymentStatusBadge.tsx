// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 8.6.
// Pola sama AdminOrderStatusBadge (Epic 7) — komponen terpisah karena enum
// tidak overlap (PaymentStatus vs OrderStatus).

import type { PaymentStatus } from "@/types/database.types";
import { Badge, type BadgeColor } from "@/components/admin/ui/Badge";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  "n/a": "Belum Ada Pembayaran",
  unpaid: "Belum Dibayar",
  pending: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  failed: "Pembayaran Gagal",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
  review: "Menunggu Verifikasi",
  refunded: "Direfund",
  partially_refunded: "Direfund Sebagian",
};

const STATUS_COLOR: Record<PaymentStatus, BadgeColor> = {
  "n/a": "light",
  unpaid: "light",
  pending: "warning",
  paid: "success",
  failed: "error",
  cancelled: "error",
  expired: "error",
  review: "warning",
  refunded: "info",
  partially_refunded: "info",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <Badge size="sm" color={STATUS_COLOR[status]}>
      {PAYMENT_STATUS_LABEL[status]}
    </Badge>
  );
}
