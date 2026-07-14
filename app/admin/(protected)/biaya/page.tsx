// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 5.1.

import { getAdminFeeList } from "@/lib/queries/admin-fees";
import { FeeManager } from "@/components/admin/FeeManager";

export default async function Page() {
  const fees = await getAdminFeeList();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Pengaturan Biaya Lainnya</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Biaya berstatus aktif otomatis ditambahkan ke total order saat checkout.
      </p>
      <div className="mt-6">
        <FeeManager fees={fees} />
      </div>
    </main>
  );
}
