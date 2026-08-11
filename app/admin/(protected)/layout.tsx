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
import { SidebarProvider } from "@/components/admin/layout/SidebarContext";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="transition-all duration-300 ease-in-out lg:ml-[90px]">
          <AdminTopbar admin={session} />
          <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
