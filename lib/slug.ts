const SLUG_SAFE_PATTERN = /[^a-z0-9]+/g;

/** "Lampu LED H4 6000K" -> "lampu-led-h4-6000k". Dipakai untuk auto-isi field
 * slug di form admin (tetap bisa diedit manual) — lihat
 * docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 3.2. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(SLUG_SAFE_PATTERN, "-")
    .replace(/^-+|-+$/g, "");
}

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
