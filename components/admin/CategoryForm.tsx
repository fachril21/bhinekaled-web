"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.6.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { saveCategoryAction } from "@/lib/actions/categories";
import { Label } from "@/components/admin/ui/form/Label";
import { Input } from "@/components/admin/ui/form/Input";
import { Select } from "@/components/admin/ui/form/Select";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
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

  const parentSelectOptions = parentOptions.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-800">
        {mode === "edit" ? `Edit Kategori: ${initialCategory?.name}` : "Tambah Kategori"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="category-name">Nama</Label>
          <Input id="category-name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="category-slug">Slug</Label>
          <Input
            id="category-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
          />
        </div>

        <div>
          <Label htmlFor="category-parent">Kategori Induk</Label>
          <Select
            id="category-parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="Tidak ada (top-level)"
            options={parentSelectOptions}
          />
        </div>
      </div>

      {error && <Alert variant="error" title="Gagal menyimpan kategori" message={error} />}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah Kategori"}
        </Button>
        {mode === "edit" && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
