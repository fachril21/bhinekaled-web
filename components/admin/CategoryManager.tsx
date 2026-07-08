"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.4.
//
// Client wrapper yang menyimpan state "kategori mana yang sedang diedit" —
// CategoryForm di atas berganti mode tambah/edit tanpa navigasi halaman
// terpisah (tidak ada sub-route kategori/baru atau kategori/[id]/edit).

import { useState } from "react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminCategoryTable } from "@/components/admin/AdminCategoryTable";
import type { AdminCategoryListItem } from "@/lib/queries/admin-categories";

type CategoryManagerProps = {
  categories: AdminCategoryListItem[];
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<AdminCategoryListItem | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <CategoryForm
        key={editingCategory?.id ?? "new"}
        mode={editingCategory ? "edit" : "create"}
        initialCategory={editingCategory ?? undefined}
        categories={categories}
        onSaved={() => setEditingCategory(null)}
        onCancelEdit={() => setEditingCategory(null)}
      />
      <AdminCategoryTable categories={categories} onEdit={setEditingCategory} />
    </div>
  );
}
