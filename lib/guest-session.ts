// Epic 2: Cart & Wishlist (Guest Session)
//
// Cart & wishlist fase 1 tidak pakai akun customer — cukup identifier acak
// yang disimpan di cookie browser. Lihat docs/PRD.md section 3 untuk
// keputusan ini.
//
// Next.js tidak mengizinkan set-cookie saat render Server Component (hanya
// boleh di Server Action/Route Handler) — lihat
// docs/plan/epic-2-cart-wishlist.md Temuan #1 & #2 untuk kenapa ini dipecah
// jadi 2 fungsi dengan kontrak berbeda, dan kenapa kita sengaja TIDAK pakai
// proxy.ts (Next.js 16 merename middleware->proxy dan merekomendasikan
// menghindarinya kecuali perlu).

import { cookies } from "next/headers";

const GUEST_SESSION_COOKIE = "bhinekaled_guest_session";
const GUEST_SESSION_MAX_AGE_DAYS = 90;

export function generateGuestSessionId(): string {
  return crypto.randomUUID();
}

export const guestSessionCookieOptions = {
  name: GUEST_SESSION_COOKIE,
  maxAge: 60 * 60 * 24 * GUEST_SESSION_MAX_AGE_DAYS,
  path: "/",
  sameSite: "lax" as const,
};

/**
 * Read-only — aman dipanggil di Server Component manapun (termasuk saat
 * render halaman cart/wishlist). TIDAK PERNAH menulis cookie. Return `null`
 * kalau guest belum pernah melakukan aksi cart/wishlist apapun.
 */
export async function readGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_SESSION_COOKIE)?.value ?? null;
}

/**
 * HANYA boleh dipanggil dari dalam Server Action ("use server") atau Route
 * Handler — karena bisa menulis cookie baru. Baca cookie kalau ada; kalau
 * belum ada, generate id baru, set cookie, lalu return id tersebut.
 */
export async function ensureGuestSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = generateGuestSessionId();
  cookieStore.set(guestSessionCookieOptions.name, id, {
    maxAge: guestSessionCookieOptions.maxAge,
    path: guestSessionCookieOptions.path,
    sameSite: guestSessionCookieOptions.sameSite,
  });
  return id;
}
