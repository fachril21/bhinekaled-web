// Epic 4: Admin Auth & Dashboard Shell
//
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 3.3 & Temuan
// #4 — dipanggil HANYA dari halaman yang sudah lolos getAdminSession() di
// layout. Pakai createClient() (sesi admin asli), BUKAN admin client,
// supaya RLS is_admin() tetap jadi lapisan pertahanan kedua yang nyata,
// bukan cuma proteksi UI di layout saja.

import { createClient } from "@/lib/supabase/server";

export type AdminDashboardSummary = {
  totalOrders: number;
  totalActiveProducts: number;
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const supabase = await createClient();

  const [
    { count: totalOrders, error: ordersError },
    { count: totalActiveProducts, error: productsError },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);
  if (ordersError) throw ordersError;
  if (productsError) throw productsError;

  return {
    totalOrders: totalOrders ?? 0,
    totalActiveProducts: totalActiveProducts ?? 0,
  };
}
