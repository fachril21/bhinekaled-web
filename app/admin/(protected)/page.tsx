// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 5.3.

import { getAdminDashboardSummary } from "@/lib/queries/admin-dashboard";
import { StatCard } from "@/components/admin/StatCard";
import { OrderIcon, ProductIcon } from "@/components/admin/icons";

export default async function Page() {
  const summary = await getAdminDashboardSummary();

  return (
    <div>
      <h1 className="text-title-sm font-bold text-gray-800">Dashboard Admin</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <StatCard label="Total Order" value={summary.totalOrders} icon={<OrderIcon />} />
        <StatCard label="Produk Aktif" value={summary.totalActiveProducts} icon={<ProductIcon />} />
      </div>
    </div>
  );
}
