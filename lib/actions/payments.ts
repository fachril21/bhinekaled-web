"use server";

// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkTransactionStatus, DuitkuApiError } from "@/lib/payments/duitku-client";
import { mapDuitkuStatusCheckResult } from "@/lib/payments/duitku-status-mapping";
import { applyDuitkuStatusUpdate } from "@/lib/payments/apply-duitku-status";

export type PaymentActionResult = { success: true } | { success: false; error: string };

/**
 * Dipanggil dari admin order detail — reconciliation fallback kalau callback
 * pernah terlewat. Pakai createClient() (sesi admin, RLS is_admin()) untuk
 * BACA order_number, tapi tulis lewat applyDuitkuStatusUpdate (admin client),
 * pola sama recheckPaymentStatusAction Midtrans sebelumnya.
 *
 * ⚠️ checkTransactionStatus() memanggil endpoint transactionStatus Duitku,
 * yang statusCode-nya (00/01/02) BEDA ARTI dari callback resultCode
 * (00/01) — WAJIB pakai mapDuitkuStatusCheckResult, BUKAN mapDuitkuCallbackResult.
 */
export async function recheckPaymentStatusAction(orderId: string): Promise<PaymentActionResult> {
  const supabase = await createClient();
  const { data: order, error } = await supabase.from("orders").select("id, order_number").eq("id", orderId).maybeSingle();
  if (error || !order) return { success: false, error: "Order tidak ditemukan." };

  try {
    const status = await checkTransactionStatus(order.order_number);
    await applyDuitkuStatusUpdate({
      orderId: order.id,
      reference: status.reference,
      paymentStatus: mapDuitkuStatusCheckResult(status.statusCode),
      sourceCode: status.statusCode,
      rawCallback: status,
    });
  } catch (err) {
    if (err instanceof DuitkuApiError && err.status === 404) {
      return { success: false, error: "Belum ada transaksi pembayaran untuk order ini di Duitku." };
    }
    return { success: false, error: "Gagal mengecek status pembayaran, coba lagi." };
  }

  revalidatePath(`/admin/order/${orderId}`);
  return { success: true };
}
