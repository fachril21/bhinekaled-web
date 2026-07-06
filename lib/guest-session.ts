// Epic 2: Cart & Wishlist (Guest Session)
//
// Cart & wishlist fase 1 tidak pakai akun customer — cukup identifier acak
// yang disimpan di cookie browser. Lihat docs/PRD.md section 3 untuk
// keputusan ini.

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

// TODO: implementasi helper untuk baca guest_session_id dari cookie di
// Server Component (pakai next/headers `cookies()`), dan set cookie baru
// kalau belum ada — dipakai konsisten di cart, wishlist, dan checkout.
