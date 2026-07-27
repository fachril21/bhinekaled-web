"use server";

// Epic 13: Midtrans Payment Integration (Snap Redirect) — US-13.4
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 5.9.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTransactionStatus, MidtransApiError } from "@/lib/payments/midtrans-client";
import { applyMidtransStatusUpdate } from "@/lib/payments/apply-status";
import type { MidtransFraudStatus, MidtransTransactionStatus } from "@/lib/payments/status-mapping";

export type PaymentActionResult = { success: true } | { success: false; error: string };

/**
 * Dipanggil dari admin order detail — reconciliation fallback kalau webhook
 * pernah terlewat (US-13.4). Pakai createClient() (sesi admin, RLS
 * is_admin()) untuk BACA order_number, tapi tulis lewat
 * applyMidtransStatusUpdate (admin client) — konsisten Keputusan E.
 */
export async function recheckPaymentStatusAction(orderId: string): Promise<PaymentActionResult> {
  const supabase = await createClient();
  const { data: order, error } = await supabase.from("orders").select("id, order_number").eq("id", orderId).maybeSingle();
  if (error || !order) return { success: false, error: "Order tidak ditemukan." };

  try {
    const status = await getTransactionStatus(order.order_number);
    await applyMidtransStatusUpdate({
      orderId: order.id,
      transactionId: status.transactionId,
      transactionStatus: status.transactionStatus as MidtransTransactionStatus,
      fraudStatus: (status.fraudStatus as MidtransFraudStatus | null) ?? null,
      paymentType: status.paymentType,
      rawNotification: status,
    });
  } catch (err) {
    if (err instanceof MidtransApiError && err.status === 404) {
      return { success: false, error: "Belum ada transaksi pembayaran untuk order ini di Midtrans." };
    }
    return { success: false, error: "Gagal mengecek status pembayaran, coba lagi." };
  }

  revalidatePath(`/admin/order/${orderId}`);
  return { success: true };
}
