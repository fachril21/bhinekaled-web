// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 6.3.

type StatCardProps = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-6 py-5">
      <p className="text-sm font-medium text-neutral-600">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-neutral-900">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}
