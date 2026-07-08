// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 5.2.
//
// Satu-satunya titik proteksi terpusat untuk semua route di bawah
// app/admin/(protected)/ — route group ini TIDAK mengubah URL (tetap
// /admin, /admin/produk, dst), hanya memisahkan subtree yang dibungkus
// auth check dari app/admin/login yang sengaja di luar grup ini
// (lihat Temuan #1 plan tsb untuk kenapa).

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminHeader admin={session} />
      <div className="mx-auto max-w-5xl p-6">{children}</div>
    </div>
  );
}
