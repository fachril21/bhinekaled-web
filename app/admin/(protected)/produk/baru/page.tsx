// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.2.

import { getAllCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function Page() {
  const categories = await getAllCategories();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Tambah Produk</h1>
      <div className="mt-6">
        <ProductForm mode="create" categories={categories} />
      </div>
    </main>
  );
}
