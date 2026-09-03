import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: file ini dulu bernama middleware.ts.
//
// Scope-nya sempit dengan sengaja: lihat catatan di lib/guest-session.ts soal
// menghindari proxy untuk jalur guest storefront. Visitor storefront normal
// tidak membawa cookie auth Supabase, jadi kita early-return tanpa kerja
// apa-apa — nol overhead untuk mereka. Hanya request yang membawa cookie
// `sb-*` (admin yang login, atau browser dengan cookie auth basi dari sesi
// testing) yang masuk ke updateSession untuk di-refresh / dibersihkan.

const SUPABASE_AUTH_COOKIE_PREFIX = "sb-";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith(SUPABASE_AUTH_COOKIE_PREFIX));

  if (!hasAuthCookie) return NextResponse.next();

  return updateSession(request);
}

export const config = {
  // Jangan jalan untuk asset statis, image optimizer, dan route API
  // (callback pembayaran Duitku tidak boleh disentuh proxy).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
