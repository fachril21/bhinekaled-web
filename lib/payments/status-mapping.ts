// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md Keputusan A (bagian 2) & bagian 5.4 (PRD §7.3).
//
// Pure function — SATU-SATUNYA tempat mapping transaction_status/fraud_status
// Midtrans jadi payment_status internal kita. Dipakai webhook (US-13.3) &
// rekonsiliasi manual admin (US-13.4) supaya logic tidak duplikat.

import type { PaymentStatus } from "@/types/database.types";

export type MidtransTransactionStatus =
  | "capture"
  | "settlement"
  | "pending"
  | "deny"
  | "cancel"
  | "expire"
  | "refund"
  | "partial_refund";

export type MidtransFraudStatus = "accept" | "challenge" | "deny";

export function mapMidtransStatus(
  transactionStatus: MidtransTransactionStatus,
  fraudStatus: MidtransFraudStatus | null
): PaymentStatus {
  if (transactionStatus === "capture") {
    if (fraudStatus === "challenge") return "review";
    if (fraudStatus === "deny") return "failed";
    return "paid"; // accept, atau capture non-kartu tanpa fraud_status
  }
  switch (transactionStatus) {
    case "settlement":
      return "paid";
    case "pending":
      return "pending";
    case "deny":
      return "failed";
    case "cancel":
      return "cancelled";
    case "expire":
      return "expired";
    case "refund":
      return "refunded";
    case "partial_refund":
      return "partially_refunded";
  }
}
