// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md Keputusan G (bagian 2) & bagian 5.3.
//
// ⚠️ Server-only (pakai node:crypto) — endpoint webhook notification WAJIB
// jalan di Node runtime, bukan edge (lihat app/api/payments/midtrans/notification/route.ts).

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Verifikasi signature Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey).
 * Pakai timingSafeEqual (bukan `===`) untuk menghindari timing attack — endpoint
 * ini adalah salah satu boundary paling sensitif di aplikasi (berhubungan
 * langsung dengan status pembayaran uang sungguhan).
 */
export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  serverKey: string;
}): boolean {
  const expectedHex = createHash("sha512")
    .update(params.orderId + params.statusCode + params.grossAmount + params.serverKey)
    .digest("hex");

  const expected = Buffer.from(expectedHex, "hex");

  let actual: Buffer;
  try {
    actual = Buffer.from(params.signatureKey, "hex");
  } catch {
    return false; // signature_key bukan hex valid — pasti bukan signature asli
  }

  // timingSafeEqual throw kalau panjang buffer beda, bukan return false.
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

/**
 * Toleransi kecil untuk perbedaan pembulatan — gross_amount Midtrans dikirim
 * sebagai string desimal ("150000.00"), order.total kita numeric(12,2)/rupiah
 * (edge case #11, plan bagian 10).
 */
export function isGrossAmountMatching(orderTotal: number, notificationGrossAmount: string): boolean {
  const parsed = Number.parseFloat(notificationGrossAmount);
  if (Number.isNaN(parsed)) return false;
  return Math.abs(Math.round(parsed) - Math.round(orderTotal)) < 1;
}
