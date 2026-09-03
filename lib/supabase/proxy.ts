import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

// Refresh sesi Supabase Auth di layer proxy (Next.js 16 rename middleware ->
// proxy). Ini SATU-SATUNYA context yang bisa menulis cookie hasil refresh
// token balik ke browser di antara request dan render Server Component —
// lib/supabase/server.ts sengaja menelan kegagalan set-cookie karena RSC
// tidak boleh menulis cookie.
//
// Kenapa perlu: refresh token Supabase itu rotating (sekali pakai). Kalau
// access token kadaluarsa lalu di-refresh saat render RSC, token baru tidak
// pernah tersimpan, dan token lama jadi invalid di server Supabase. Request
// berikutnya => "Invalid Refresh Token: Refresh Token Not Found". Memanggil
// getUser() di sini menyelesaikan itu: token di-refresh dan cookie-nya
// ditulis, atau kalau refresh token memang sudah invalid, cookie auth
// dihapus supaya request selanjutnya bersih.
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // getUser() normalnya mengembalikan { error } bukan throw untuk kasus
    // auth, tapi error jaringan bisa throw — jangan sampai proxy menjatuhkan
    // seluruh request cuma karena gagal refresh sesi.
  }

  return response;
}
