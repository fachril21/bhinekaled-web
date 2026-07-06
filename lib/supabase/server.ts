import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

// Dipakai di Server Component & Route Handler (misal: fetch data produk
// untuk halaman katalog, atau proses insert order di app/api/checkout).
// Tetap pakai anon key — proteksi tetap dari RLS, bukan dari key ini.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Bisa diabaikan kalau dipanggil dari Server Component tanpa
            // akses set-cookie (misal saat prerendering).
          }
        },
      },
    }
  );
}
