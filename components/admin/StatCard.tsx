// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 6.3.

import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
      <div className="mt-5">
        <span className="text-sm text-gray-500">{label}</span>
        <h4 className="mt-2 text-title-sm font-bold text-gray-800">{value.toLocaleString("id-ID")}</h4>
      </div>
    </div>
  );
}
