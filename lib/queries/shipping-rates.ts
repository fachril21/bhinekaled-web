// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 6.6.
//
// Dipanggil dari DUA tempat (preview /api/shipping/rates & final di route
// checkout, Keputusan A) — logic HARUS identik di kedua tempat supaya nilai
// yang customer pilih di preview bisa ditemukan lagi saat submit.

import { createAdminClient } from "@/lib/supabase/admin";
import { calculateDomesticCost, type RajaOngkirRateOption } from "@/lib/shipping/rajaongkir-client";
import { bucketWeight } from "@/lib/shipping/weight";

const WEIGHT_BUCKET_GRAM = Number(process.env.SHIPPING_WEIGHT_BUCKET_GRAM ?? "100");
const RATE_CACHE_TTL_HOURS = Number(process.env.SHIPPING_RATE_CACHE_TTL_HOURS ?? "12");
const COURIER_SET = process.env.SHIPPING_COURIER_SET ?? "jne:jnt:sicepat";

export type ShippingRateResult = {
  weightBucket: number;
  options: RajaOngkirRateOption[];
};

export async function getShippingRates(params: {
  originId: string;
  destinationId: string;
  cartWeightGram: number;
}): Promise<ShippingRateResult> {
  const weightBucket = bucketWeight(params.cartWeightGram, WEIGHT_BUCKET_GRAM);
  const supabase = createAdminClient();

  const { data: cached } = await supabase
    .from("shipping_rate_cache")
    .select("results, expires_at")
    .eq("origin_id", params.originId)
    .eq("destination_id", params.destinationId)
    .eq("weight_bucket", weightBucket)
    .eq("courier_set", COURIER_SET)
    .maybeSingle();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return { weightBucket, options: cached.results as unknown as RajaOngkirRateOption[] };
  }

  const options = await calculateDomesticCost({
    originId: params.originId,
    destinationId: params.destinationId,
    weightGram: weightBucket,
    courierSet: COURIER_SET,
  });

  // Hanya response SUKSES yang di-cache (US-12.3 AC) — kalau baris di atas
  // throw, upsert ini tidak pernah tercapai, tidak ada cache untuk error.
  await supabase.from("shipping_rate_cache").upsert(
    {
      origin_id: params.originId,
      destination_id: params.destinationId,
      weight_bucket: weightBucket,
      courier_set: COURIER_SET,
      results: options,
      expires_at: new Date(Date.now() + RATE_CACHE_TTL_HOURS * 3_600_000).toISOString(),
    },
    { onConflict: "origin_id,destination_id,weight_bucket,courier_set" }
  );

  return { weightBucket, options };
}
