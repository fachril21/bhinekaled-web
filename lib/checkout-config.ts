// PLACEHOLDER — nilai final ditentukan PO (lihat docs/PRD.md bagian 8,
// "Sisa Action Item": nilai flat rate ongkir belum diputuskan). Satu tempat
// perubahan kalau nilai ini di-update nanti.
export const FLAT_SHIPPING_COST = 15000;

export const PAYMENT_METHOD_PLACEHOLDER_LABEL =
  "Transfer manual — instruksi pembayaran akan dikirimkan admin melalui WhatsApp setelah pesanan dikonfirmasi.";

// Epic 12: Cek Ongkir Real-Time (RajaOngkir) — kode wilayah asal toko (id
// district RajaOngkir), diminta eksplisit oleh user untuk di-hardcode ke
// "63181". Tetap bisa dioverride via env SHIPPING_ORIGIN_ID kalau toko
// pindah lokasi nanti, tanpa perlu ubah kode.
const SHIPPING_ORIGIN_ID_DEFAULT = "63181";

export function getShippingOriginId(): string {
  return process.env.SHIPPING_ORIGIN_ID || SHIPPING_ORIGIN_ID_DEFAULT;
}
