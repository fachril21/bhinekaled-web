// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 3.3.

import { createClient } from "@/lib/supabase/server";
import { calculateFees, type CalculatedFee } from "@/lib/fees";

/**
 * Publik, RLS "public read active additional_fees" (is_active = true).
 * Preview saja — nilai final otoritatif dihitung ulang di
 * app/api/checkout/route.ts saat submit (lihat plan Temuan #3 soal race
 * preview vs. final, diterima sebagai trade-off yang sama dengan perubahan
 * harga produk di Epic 3).
 */
export async function getCheckoutFeePreview(subtotal: number): Promise<CalculatedFee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("additional_fees")
    .select("id, label, fee_type, amount")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return calculateFees(
    (data ?? []).map((row) => ({ id: row.id, label: row.label, feeType: row.fee_type, amount: row.amount })),
    subtotal
  );
}
