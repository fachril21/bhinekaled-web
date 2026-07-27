"use server";

// Epic 12: Cek Ongkir Real-Time (RajaOngkir) — US-12.4
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 6.8.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ShippingCacheActionResult = { success: true } | { success: false; error: string };

/** Hanya hapus shipping_rate_cache (US-12.4 AC) — destination cache TIDAK di-clear manual. */
export async function clearShippingRateCacheAction(): Promise<ShippingCacheActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shipping_rate_cache")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) return { success: false, error: "Gagal membersihkan cache ongkir." };

  revalidatePath("/admin/pengiriman");
  return { success: true };
}
