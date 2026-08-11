// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 5.1.

import { getAdminFeeList } from "@/lib/queries/admin-fees";
import { FeeManager } from "@/components/admin/FeeManager";

export default async function Page() {
  const fees = await getAdminFeeList();

  return (
    <div>
      <h1 className="text-title-sm font-bold text-gray-800">Pengaturan Biaya Lainnya</h1>
      <p className="mt-1 text-sm text-gray-500">
        Biaya berstatus aktif otomatis ditambahkan ke total order saat checkout.
      </p>
      <div className="mt-6">
        <FeeManager fees={fees} />
      </div>
    </div>
  );
}
