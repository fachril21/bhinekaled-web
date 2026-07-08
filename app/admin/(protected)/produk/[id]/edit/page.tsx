// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.3.

import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/queries/admin-products";
import { getAllCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";

type EditProdukPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: EditProdukPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([getAdminProductById(id), getAllCategories()]);

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Edit Produk: {product.name}</h1>
      <div className="mt-6">
        <ProductForm mode="edit" categories={categories} initialProduct={product} />
      </div>
    </main>
  );
}
