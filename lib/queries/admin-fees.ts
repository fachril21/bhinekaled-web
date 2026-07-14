// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 3.2.

import { createClient } from "@/lib/supabase/server";
import type { FeeType } from "@/types/database.types";

export type AdminFeeListItem = {
  id: string;
  label: string;
  feeType: FeeType;
  amount: number;
  isActive: boolean;
  createdAt: string;
};

/** Pakai createClient() (RLS is_admin()) — HANYA dipanggil dari route admin, konsisten Epic 5/7. */
export async function getAdminFeeList(): Promise<AdminFeeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("additional_fees")
    .select("id, label, fee_type, amount, is_active, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true }); // sort_order belum diekspos di UI, lihat plan Temuan #5

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    feeType: row.fee_type,
    amount: row.amount,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
}
