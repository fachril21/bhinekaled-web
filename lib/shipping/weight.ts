// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 6.2.
//
// Pure function, tidak bergantung Supabase — dipakai dari preview
// (/api/shipping/rates) & kalkulasi otoritatif final (app/api/checkout/route.ts),
// pola sama seperti lib/fees.ts (Epic 11).

const MIN_WEIGHT_GRAM = 1; // hindari kirim weight=0 ke RajaOngkir (kemungkinan ditolak API)

export type WeighableCartItem = { weightGram: number; qty: number };

export function calculateCartWeightGram(items: WeighableCartItem[]): number {
  const total = items.reduce((sum, item) => sum + item.weightGram * item.qty, 0);
  return Math.max(total, MIN_WEIGHT_GRAM);
}

/** Bulatkan KE ATAS ke kelipatan bucket — never under-charge shipping. */
export function bucketWeight(weightGram: number, bucketSizeGram: number): number {
  return Math.ceil(weightGram / bucketSizeGram) * bucketSizeGram;
}
