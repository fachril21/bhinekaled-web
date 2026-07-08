// Konsisten dengan bucket & policy di docs/storage-setup.sql — ubah bersamaan
// kalau salah satu berubah. File terpisah (bukan digabung ke
// upload-product-image.ts) supaya bisa diimpor dari kode client maupun
// server tanpa menyeret directive "use client".
export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
