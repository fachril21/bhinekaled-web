// Epic 14: Halaman lacak pesanan publik (/lacak/[id]).
//
// Fungsi murni untuk halaman lacak — validasi id (UUID = "access token"
// pesanan) & label status Bahasa Indonesia untuk customer.

import type { OrderStatus, PaymentStatus } from "@/types/database.types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidOrderId(value: string): boolean {
  return UUID_REGEX.test(value);
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu_konfirmasi: "Baru",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  "n/a": "Belum Dibayar",
  unpaid: "Belum Dibayar",
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
  review: "Sedang Diverifikasi",
  refunded: "Dana Dikembalikan",
  partially_refunded: "Dana Dikembalikan Sebagian",
};

export function paymentStatusLabel(paymentStatus: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[paymentStatus] ?? "Belum Dibayar";
}
