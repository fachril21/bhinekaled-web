// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 8.6.
// Pola sama AdminOrderStatusBadge (Epic 7) — komponen terpisah karena enum
// tidak overlap (PaymentStatus vs OrderStatus).

import type { PaymentStatus } from "@/types/database.types";

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

const STATUS_CLASSNAME: Record<PaymentStatus, string> = {
  "n/a": "bg-neutral-100 text-neutral-600",
  unpaid: "bg-neutral-100 text-neutral-600",
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
  review: "bg-amber-100 text-amber-700",
  refunded: "bg-indigo-100 text-indigo-700",
  partially_refunded: "bg-indigo-100 text-indigo-700",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSNAME[status]}`}>
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}
