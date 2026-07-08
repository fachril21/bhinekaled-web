"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 4 & 6.5.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/lib/actions/categories";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import type { AdminCategoryListItem } from "@/lib/queries/admin-categories";

type AdminCategoryTableProps = {
  categories: AdminCategoryListItem[];
  onEdit: (category: AdminCategoryListItem) => void;
};

export function AdminCategoryTable({ categories, onEdit }: AdminCategoryTableProps) {
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingDeleteCategory = categories.find((c) => c.id === pendingDeleteId) ?? null;

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(pendingDeleteId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setPendingDeleteId(null);
      router.refresh();
    });
  }

  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
        Belum ada kategori.
      </p>
    );
  }

  return (
    <>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Induk</th>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 font-medium text-neutral-900">{category.name}</td>
                <td className="px-4 py-3 text-neutral-600">{category.slug}</td>
                <td className="px-4 py-3 text-neutral-600">{category.parentName ?? "-"}</td>
                <td className="px-4 py-3 text-neutral-600">{category.productCount}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => onEdit(category)} className="font-medium text-brand-red hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPendingDeleteId(category.id);
                      }}
                      className="font-medium text-neutral-500 hover:text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={pendingDeleteCategory !== null}
        title={`Hapus kategori "${pendingDeleteCategory?.name ?? ""}"?`}
        description={
          <div className="flex flex-col gap-2">
            <p>Kategori ini tidak akan menghapus produk atau sub-kategori terkait, hanya melepas relasinya:</p>
            <ul className="list-disc pl-5">
              <li>{pendingDeleteCategory?.productCount ?? 0} produk akan menjadi &quot;tanpa kategori&quot;.</li>
              <li>{pendingDeleteCategory?.childCategoryCount ?? 0} sub-kategori akan menjadi kategori top-level.</li>
            </ul>
          </div>
        }
        confirmLabel="Hapus Kategori"
        isPending={isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
