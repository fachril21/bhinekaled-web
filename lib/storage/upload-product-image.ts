"use client";

import { createClient } from "@/lib/supabase/client";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES, PRODUCT_IMAGES_BUCKET } from "@/lib/storage/config";

export type UploadImageResult = { success: true; url: string } | { success: false; error: string };

/**
 * Upload langsung dari browser ke Supabase Storage (bukan lewat Server
 * Action) — menghindari serverActions.bodySizeLimit untuk upload multi
 * gambar. Proteksi ada di Storage RLS (is_admin()), bukan cuma UI. Lihat
 * docs/plan/epic-5-admin-kelola-produk-kategori.md Temuan #2.
 */
export async function uploadProductImage(file: File, folder: string): Promise<UploadImageResult> {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { success: false, error: `${file.name}: format harus JPEG/PNG/WEBP.` };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { success: false, error: `${file.name}: ukuran melebihi 5MB.` };
  }

  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file);
  if (error) return { success: false, error: `${file.name}: gagal diupload.` };

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}
