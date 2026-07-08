"use server";

// Epic 4: Admin Auth & Dashboard Shell
//
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 3.5.
//
// Pola (prevState, formData) => ... dipilih supaya kompatibel dengan
// useActionState di LoginForm (Client Component) — ikut contoh resmi
// Next.js untuk auth (node_modules/next/dist/docs/01-app/02-guides/
// authentication.md), beda dari pola lib/actions/cart.ts (Epic 2) yang
// dipanggil langsung dari event handler.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validations";

export type LoginActionState = { error: string } | undefined;

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Email atau password tidak valid." };

  const supabase = await createClient();

  const { data, error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
  if (signInError || !data.user) {
    return { error: "Email atau password salah." };
  }

  // Login Supabase Auth sukses tidak otomatis berarti admin — wajib
  // re-check admin_profiles (lihat Temuan #5 plan tsb).
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Akun ini tidak memiliki akses admin." };
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
