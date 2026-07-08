// Epic 4: Admin Auth & Dashboard Shell
//
// Data Access Layer untuk sesi admin — lihat
// docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 3.2.
//
// WAJIB pakai supabase.auth.getUser() (revalidasi ke server Supabase Auth),
// TIDAK PERNAH getSession() (hanya baca cookie tanpa validasi ulang) untuk
// keputusan otorisasi — lihat Temuan #2 plan tsb.

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/types/database.types";

export type AdminSession = {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: AdminRole;
};

/**
 * Di-cache pakai React cache() supaya dipanggil berkali-kali dalam satu
 * render pass (layout + page yang sama-sama butuh sesi admin) tidak
 * memicu request berulang ke Supabase Auth.
 *
 * Return null kalau: belum login, ATAU sudah login tapi tidak ada row di
 * admin_profiles (bukan admin) — dua kasus ini sengaja tidak dibedakan di
 * level pemanggil (layout selalu redirect ke /admin/login untuk keduanya),
 * konsisten dengan AC "redirect ke login kalau belum auth ATAU bukan admin".
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    role: profile.role,
  };
});
