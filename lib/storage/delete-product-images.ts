import { createClient } from "@/lib/supabase/server";
import { publicUrlToStoragePath } from "@/lib/storage/product-image-path";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/storage/config";

/**
 * Best-effort cleanup — dipanggil dari Server Action setelah baris DB
 * product_images/products berhasil dihapus. Kegagalan di sini sengaja TIDAK
 * dilempar ke caller (lihat docs/plan/epic-5-admin-kelola-produk-kategori.md
 * edge case #6) — orphan file diterima sebagai trade-off kecil, bukan
 * kegagalan yang harus memblokir aksi admin yang sudah berhasil di DB.
 */
export async function deleteProductImageFiles(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => publicUrlToStoragePath(url, PRODUCT_IMAGES_BUCKET))
    .filter((path): path is string => path !== null);

  if (paths.length === 0) return;

  try {
    const supabase = await createClient();
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  } catch {
    // best-effort — diabaikan dengan sengaja.
  }
}
