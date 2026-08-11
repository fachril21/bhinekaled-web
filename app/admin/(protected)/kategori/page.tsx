// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.4.

import { getAdminCategoryList } from "@/lib/queries/admin-categories";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function Page() {
  const categories = await getAdminCategoryList();

  return (
    <div>
      <h1 className="text-title-sm font-bold text-gray-800">Kelola Kategori</h1>
      <p className="mt-1 text-sm text-gray-500">Tambah, ubah, dan hapus kategori produk (termasuk sub-kategori).</p>

      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
