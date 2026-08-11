// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.2.

import { getAllCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function Page() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-title-sm font-bold text-gray-800">Tambah Produk</h1>
      <div className="mt-6">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
