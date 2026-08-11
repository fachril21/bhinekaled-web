"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 4 & 6.5.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/lib/actions/categories";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/admin/ui/Table";
import { Alert } from "@/components/admin/ui/Alert";
import type { AdminCategoryListItem } from "@/lib/queries/admin-categories";

const HEADER_CELL_CLASS = "px-5 py-3 text-start text-theme-xs font-medium uppercase text-gray-500";
const BODY_CELL_CLASS = "px-5 py-4 text-start text-theme-sm text-gray-500";

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
      <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        Belum ada kategori.
      </p>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Gagal menghapus kategori" message={error} />
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Nama
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Slug
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Induk
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Produk
                </TableCell>
                <TableCell isHeader className={`${HEADER_CELL_CLASS} text-right`}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className={`${BODY_CELL_CLASS} font-medium text-gray-800`}>{category.name}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>{category.slug}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>{category.parentName ?? "-"}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>{category.productCount}</TableCell>
                  <TableCell className={`${BODY_CELL_CLASS} text-right`}>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setPendingDeleteId(category.id);
                        }}
                        className="font-medium text-gray-500 hover:text-error-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
