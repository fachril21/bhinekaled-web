/**
 * product_images.url cuma menyimpan public URL (docs/schema.sql tidak boleh
 * diubah untuk menambah kolom storage_path terpisah — lihat
 * docs/plan/epic-5-admin-kelola-produk-kategori.md Temuan #3). Untuk
 * menghapus file fisik di Supabase Storage, path object diturunkan dari URL
 * publiknya di sini.
 */
export function publicUrlToStoragePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}
