// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 5.3.

import { getAdminDashboardSummary } from "@/lib/queries/admin-dashboard";
import { StatCard } from "@/components/admin/StatCard";

export default async function Page() {
  const summary = await getAdminDashboardSummary();

  return (
    <main>
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard Admin</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Order" value={summary.totalOrders} />
        <StatCard label="Produk Aktif" value={summary.totalActiveProducts} />
      </div>
    </main>
  );
}
