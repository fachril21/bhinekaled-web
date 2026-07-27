// Diekstrak dari app/api/checkout/route.ts (Epic 3) supaya bisa dipakai juga
// oleh app/api/payments/midtrans/token/route.ts (Epic 13) — isi & perilaku
// fungsi ini IDENTIK, hanya lokasinya pindah. Lihat
// docs/plan/epic-13-midtrans-payment-integration.md bagian 6 & 8.2.
//
// Route Handler tidak dapat proteksi CSRF bawaan yang otomatis didapat
// Server Action (lihat docs/plan/epic-3-checkout-flow.md Temuan #7). Ini
// mitigasi ringan (defense-in-depth), bukan proteksi keamanan kuat — header
// Origin/Referer bisa dipalsukan non-browser client.
//
// ⚠️ JANGAN pasang guard ini di webhook Midtrans
// (app/api/payments/midtrans/notification/route.ts) — request itu datang
// dari server Midtrans, bukan browser, jadi tidak akan pernah match Origin
// (Keputusan F, plan bagian 2).

import type { NextRequest } from "next/server";

export function isSameOriginRequest(request: NextRequest): boolean {
  const ownOrigin = request.nextUrl.origin;

  const origin = request.headers.get("origin");
  if (origin) return origin === ownOrigin;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === ownOrigin;
    } catch {
      return false;
    }
  }

  return true; // tidak ada header sama sekali — biarkan lolos, lihat catatan di atas
}
