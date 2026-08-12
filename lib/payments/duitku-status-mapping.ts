// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// Pure functions — SATU-SATUNYA tempat mapping resultCode/statusCode Duitku
// jadi payment_status internal kita. Dipakai webhook & rekonsiliasi manual
// admin supaya logic tidak duplikat (pola sama lib/payments/status-mapping.ts
// sebelumnya untuk Midtrans).
//
// ⚠️ Callback resultCode dan transactionStatus statusCode PAKAI KODE YANG
// TERLIHAT SAMA ("00"/"01") TAPI ARTINYA BEDA per endpoint Duitku:
//   - Callback:      00 = Success, 01 = Failed
//   - Status Check:  00 = Success, 01 = Pending, 02 = Canceled
// Karena itu sengaja dipisah jadi dua fungsi & dua type, bukan digabung.

import type { PaymentStatus } from "@/types/database.types";

export type DuitkuCallbackResultCode = "00" | "01";
export type DuitkuStatusCheckCode = "00" | "01" | "02";

export function mapDuitkuCallbackResult(resultCode: DuitkuCallbackResultCode): PaymentStatus {
  switch (resultCode) {
    case "00":
      return "paid";
    case "01":
      return "failed";
  }
}

export function mapDuitkuStatusCheckResult(statusCode: DuitkuStatusCheckCode): PaymentStatus {
  switch (statusCode) {
    case "00":
      return "paid";
    case "01":
      return "pending";
    case "02":
      return "cancelled";
  }
}
