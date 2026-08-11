// Epic 12: Cek Ongkir Real-Time (RajaOngkir) — US-12.4
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 10.7. Pola identik biaya/page.tsx (Epic 11).

import { clearShippingRateCacheAction } from "@/lib/actions/shipping-cache";
import { ClearShippingCacheButton } from "@/components/admin/ClearShippingCacheButton";

export default function Page() {
  return (
    <div>
      <h1 className="text-title-sm font-bold text-gray-800">Pengaturan Pengiriman</h1>
      <p className="mt-1 text-sm text-gray-500">
        Bersihkan cache ongkir kalau ada perubahan tarif kurir besar (musim lebaran, dll). Cache pencarian alamat
        tidak perlu dibersihkan manual (jarang berubah).
      </p>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <ClearShippingCacheButton action={clearShippingRateCacheAction} />
      </div>
    </div>
  );
}
