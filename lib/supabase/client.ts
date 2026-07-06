import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// Dipakai di Client Component (misal: cart, wishlist, form interaktif).
// Pakai anon key — aman diekspos ke browser karena dibatasi oleh RLS
// (lihat docs/schema.sql).
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
