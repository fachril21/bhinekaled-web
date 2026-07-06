import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// ⚠️ PERINGATAN: client ini pakai SERVICE ROLE KEY yang bypass semua RLS.
// HANYA boleh diimpor di kode server-side (Route Handler/Server Action),
// TIDAK PERNAH di Client Component atau kode yang bisa berakhir di bundle
// browser. Dipakai untuk operasi admin seperti import produk massal dari
// Shopee (Epic 6).
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
