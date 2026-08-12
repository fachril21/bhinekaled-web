// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// Satu-satunya titik percabangan Sandbox/Production di seluruh codebase —
// config-only switch, pola sama persis lib/payments/midtrans-config.ts
// sebelumnya. Jangan tambah pengecekan environment terpisah di tempat lain.

export function isDuitkuProduction(): boolean {
  return process.env.DUITKU_IS_PRODUCTION === "true";
}

// ⚠️ Server-only — DUITKU_API_KEY tidak pernah punya prefix NEXT_PUBLIC_,
// TIDAK PERNAH diimpor dari Client Component.
export function duitkuApiKey(): string {
  const key = process.env.DUITKU_API_KEY;
  if (!key) throw new Error("DUITKU_API_KEY belum diisi.");
  return key;
}

export function duitkuMerchantCode(): string {
  const code = process.env.DUITKU_MERCHANT_CODE;
  if (!code) throw new Error("DUITKU_MERCHANT_CODE belum diisi.");
  return code;
}

export function duitkuCreateInvoiceUrl(): string {
  return isDuitkuProduction()
    ? "https://api-prod.duitku.com/api/merchant/createInvoice"
    : "https://api-sandbox.duitku.com/api/merchant/createInvoice";
}

export function duitkuTransactionStatusUrl(): string {
  return isDuitkuProduction()
    ? "https://passport.duitku.com/webapi/api/merchant/transactionStatus"
    : "https://sandbox.duitku.com/webapi/api/merchant/transactionStatus";
}
