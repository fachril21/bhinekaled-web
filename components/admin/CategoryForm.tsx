"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.6.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { saveCategoryAction } from "@/lib/actions/categories";
import type { AdminCategoryListItem } from "@/lib/queries/admin-categories";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialCategory?: AdminCategoryListItem;
  categories: AdminCategoryListItem[];
  onSaved: () => void;
  onCancelEdit?: () => void;
};

// Catatan: tidak ada useEffect untuk sinkronisasi state dari initialCategory
// saat berganti kategori yang diedit — parent (CategoryManager) me-remount
// komponen ini lewat `key` setiap kali target edit berubah, sesuai pola
// React "reset state via key" (lihat rules/react/hooks.md: resetting state
// on prop change -> key, bukan useEffect + setState).
export function CategoryForm({ mode, initialCategory, categories, onSaved, onCancelEdit }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialCategory?.name ?? "");
  const [slug, setSlug] = useState(initialCategory?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [parentId, setParentId] = useState<string>(initialCategory?.parentId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  const parentOptions = categories.filter((c) => c.id !== initialCategory?.id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveCategoryAction({
        id: initialCategory?.id,
        name,
        slug,
        parentId: parentId || null,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setName("");
      setSlug("");
      setSlugTouched(false);
      setParentId("");
      onSaved();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
      <h2 className="text-sm font-semibold text-neutral-900">
        {mode === "edit" ? `Edit Kategori: ${initialCategory?.name}` : "Tambah Kategori"}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="category-name" className="text-sm font-medium text-neutral-700">
            Nama
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category-slug" className="text-sm font-medium text-neutral-700">
            Slug
          </label>
          <input
            id="category-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category-parent" className="text-sm font-medium text-neutral-700">
            Kategori Induk
          </label>
          <select
            id="category-parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          >
            <option value="">Tidak ada (top-level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah Kategori"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
