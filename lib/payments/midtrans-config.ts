// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md Keputusan J (bagian 2).
//
// Satu-satunya titik percabangan Sandbox/Production di seluruh codebase —
// config-only switch (NFR PRD §9). Jangan tambah pengecekan environment
// terpisah di tempat lain, tambahkan di sini.

export function isMidtransProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

// ⚠️ Server-only — MIDTRANS_SERVER_KEY tidak pernah punya prefix
// NEXT_PUBLIC_, TIDAK PERNAH diimpor dari Client Component (pola sama
// lib/supabase/admin.ts & lib/shipping/rajaongkir-client.ts).
export function midtransServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY belum diisi.");
  return key;
}

export function midtransSnapTransactionUrl(): string {
  return isMidtransProduction()
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export function midtransStatusUrl(orderId: string): string {
  const host = isMidtransProduction() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
  return `${host}/v2/${encodeURIComponent(orderId)}/status`;
}
