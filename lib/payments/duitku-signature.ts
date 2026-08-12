// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// Duitku uses HMAC_SHA256 hex signatures (MD5/SHA256-only formulas are
// obsolete per Duitku docs, Apr 2026 changelog) in three places, each with
// a DIFFERENT string-to-sign formula:
//   - POP createInvoice request auth header (x-duitku-signature)
//   - callback (webhook) verification
//   - transactionStatus (manual recheck) request signing
//
// ⚠️ Server-only (pakai node:crypto) — sama pola lib/payments/midtrans
// sebelumnya, endpoint webhook WAJIB jalan di Node runtime, bukan edge.

import { createHmac, timingSafeEqual } from "node:crypto";

function hmacSha256Hex(stringToSign: string, key: string): string {
  return createHmac("sha256", key).update(stringToSign).digest("hex");
}

/** x-duitku-signature header untuk POST /api/merchant/createInvoice. */
export function buildPopRequestSignature(params: { merchantCode: string; timestamp: string; apiKey: string }): string {
  return hmacSha256Hex(params.merchantCode + params.timestamp, params.apiKey);
}

/** signature field untuk POST /api/merchant/transactionStatus. */
export function buildStatusCheckSignature(params: { merchantCode: string; merchantOrderId: string; apiKey: string }): string {
  return hmacSha256Hex(params.merchantCode + params.merchantOrderId, params.apiKey);
}

/**
 * Verifikasi signature callback Duitku: HMAC_SHA256(merchantCode + amount +
 * merchantOrderId, apiKey). Pakai timingSafeEqual (bukan `===`) — sama
 * alasan seperti verifyMidtransSignature sebelumnya, boundary paling
 * sensitif di aplikasi (langsung berhubungan dengan status pembayaran).
 */
export function verifyDuitkuCallbackSignature(params: {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  signature: string;
  apiKey: string;
}): boolean {
  const expectedHex = hmacSha256Hex(params.merchantCode + params.amount + params.merchantOrderId, params.apiKey);
  const expected = Buffer.from(expectedHex, "hex");

  let actual: Buffer;
  try {
    actual = Buffer.from(params.signature, "hex");
  } catch {
    return false; // signature bukan hex valid — pasti bukan signature asli
  }

  // timingSafeEqual throw kalau panjang buffer beda, bukan return false.
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

/**
 * Defense-in-depth: signature callback sudah memverifikasi keaslian Duitku,
 * tapi tetap dicocokkan dengan orders.total kita sendiri (guard sama seperti
 * isGrossAmountMatching Midtrans sebelumnya) — kalau beda, ada kemungkinan
 * bug harga di sisi createInvoice, bukan berarti signature dipalsukan.
 */
export function isDuitkuAmountMatching(orderTotal: number, callbackAmount: string): boolean {
  const parsed = Number.parseFloat(callbackAmount);
  if (Number.isNaN(parsed)) return false;
  return Math.abs(Math.round(parsed) - Math.round(orderTotal)) < 1;
}
