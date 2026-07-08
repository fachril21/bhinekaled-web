// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.4.

import { getAdminCategoryList } from "@/lib/queries/admin-categories";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function Page() {
  const categories = await getAdminCategoryList();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Kelola Kategori</h1>
      <p className="mt-1 text-sm text-neutral-600">Tambah, ubah, dan hapus kategori produk (termasuk sub-kategori).</p>

      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </main>
  );
}
