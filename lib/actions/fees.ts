"use server";

// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 3.5.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { additionalFeeFormSchema, type AdditionalFeeFormValues } from "@/lib/validations";

export type FeeActionResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = "Gagal menyimpan biaya, coba lagi.";

/** Upsert by id, dipanggil langsung sebagai fungsi dari FeeForm — pola sama saveCategoryAction (Epic 5). */
export async function saveFeeAction(input: AdditionalFeeFormValues & { id?: string }): Promise<FeeActionResult> {
  const parsed = additionalFeeFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid, cek kembali form." };
  }

  const { label, feeType, amount, isActive } = parsed.data;
  const supabase = await createClient();
  const payload = { label, fee_type: feeType, amount, is_active: isActive };

  const { error } = input.id
    ? await supabase.from("additional_fees").update(payload).eq("id", input.id)
    : await supabase.from("additional_fees").insert(payload);

  if (error) return { success: false, error: GENERIC_ERROR };

  revalidatePath("/admin/biaya");
  return { success: true };
}

/**
 * fee_id di order_fees adalah `on delete set null` (docs/schema.sql bagian 11)
 * — hapus di sini TIDAK menghapus/mengubah histori order_fees, cuma melepas
 * relasinya (label_snapshot dkk. tetap utuh). Konfirmasi ditampilkan di UI
 * sebelum action ini dipanggil (AdminConfirmDialog).
 */
export async function deleteFeeAction(id: string): Promise<FeeActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("additional_fees").delete().eq("id", id);
  if (error) return { success: false, error: "Gagal menghapus biaya." };

  revalidatePath("/admin/biaya");
  return { success: true };
}
