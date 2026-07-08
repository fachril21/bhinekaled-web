"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validations";
import { isUniqueViolation } from "@/lib/db-errors";

export type CategoryActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: { slug?: string } };

const GENERIC_ERROR = "Gagal menyimpan kategori, coba lagi.";

/**
 * Dipanggil langsung sebagai fungsi async dari CategoryForm (bukan
 * <form action> + FormData) — lihat
 * docs/plan/epic-5-admin-kelola-produk-kategori.md Temuan #8.
 * Upsert by id: update kalau ada id, insert kalau tidak.
 */
export async function saveCategoryAction(
  input: CategoryFormValues & { id?: string }
): Promise<CategoryActionResult> {
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Data tidak valid, cek kembali form." };

  const { name, slug, parentId } = parsed.data;
  const supabase = await createClient();

  try {
    if (input.id) {
      const { error } = await supabase
        .from("categories")
        .update({ name, slug, parent_id: parentId })
        .eq("id", input.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("categories").insert({ name, slug, parent_id: parentId });
      if (error) throw error;
    }
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: "Slug sudah dipakai, ganti nama atau slug secara manual.",
        fieldErrors: { slug: "Slug sudah dipakai." },
      };
    }
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/kategori");
  return { success: true };
}

/**
 * FK categories.parent_id & products.category_id sama-sama `on delete set
 * null` — hapus di sini TIDAK menghapus produk/sub-kategori terkait, cuma
 * melepas relasinya. Konfirmasi + angka terdampak ditampilkan di UI
 * (AdminConfirmDialog) sebelum action ini dipanggil — lihat Temuan #6.
 */
export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: "Gagal menghapus kategori." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/kategori");
  return { success: true };
}
