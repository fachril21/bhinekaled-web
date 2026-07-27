// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 6.5.
//
// Pakai createAdminClient() — RLS shipping_destination_cache/shipping_destinations
// TIDAK ADA policy publik sama sekali (Keputusan E), tapi endpoint yang
// memanggil fungsi ini (/api/shipping/destinations) memang harus melayani
// semua customer publik. Pola sama seperti getCartItems/route checkout yang
// sudah baca/tulis cart_items/orders lewat admin client meski dipicu request
// publik — bukan bypass baru.

import { createAdminClient } from "@/lib/supabase/admin";
import { searchDestination, type RajaOngkirDestination } from "@/lib/shipping/rajaongkir-client";

const DESTINATION_CACHE_TTL_DAYS = 30;

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/** Cache-first: exact match query, TTL 30 hari (docs/schema.sql section 15). */
export async function findDestinations(rawQuery: string): Promise<RajaOngkirDestination[]> {
  const query = normalizeQuery(rawQuery);
  const supabase = createAdminClient();

  const { data: cached } = await supabase
    .from("shipping_destination_cache")
    .select("results, expires_at")
    .eq("search_query", query)
    .maybeSingle();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.results as unknown as RajaOngkirDestination[];
  }

  const results = await searchDestination(query);

  await supabase.from("shipping_destination_cache").upsert(
    {
      search_query: query,
      results,
      expires_at: new Date(Date.now() + DESTINATION_CACHE_TTL_DAYS * 86_400_000).toISOString(),
    },
    { onConflict: "search_query" }
  );

  // Simpan tiap destination ke tabel referensi (lookup by id tanpa search ulang, US-12.1).
  if (results.length > 0) {
    await supabase.from("shipping_destinations").upsert(
      results.map((d) => ({
        id: d.id,
        label: d.label,
        province: d.province,
        city: d.city,
        district: d.district,
        subdistrict: d.subdistrict,
        zip_code: d.zipCode,
      })),
      { onConflict: "id" }
    );
  }

  return results;
}

/** Lookup cepat by ID (dipakai saat resolve destinationId yang dikirim client saat checkout). */
export async function getDestinationLabel(destinationId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("shipping_destinations")
    .select("label")
    .eq("id", destinationId)
    .maybeSingle();
  return data?.label ?? null;
}
