// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// ⚠️ Server-only — pakai createAdminClient() (service role), sama pola
// lib/payments/apply-status.ts sebelumnya: RLS publik pada `orders` hanya
// izinkan INSERT, jadi update payment_status lewat callback/rekonsiliasi
// harus lewat service role + guard di application layer (signature
// verification untuk callback, is_admin() session untuk rekonsiliasi manual).
//
// `paymentStatus` WAJIB sudah di-mapping oleh pemanggil (bukan raw kode
// Duitku) — callback resultCode (00/01) dan transactionStatus API statusCode
// (00/01/02) pakai vocabulary BEDA (lihat duitku-status-mapping.ts), jadi
// fungsi ini sengaja tidak melakukan mapping sendiri supaya bisa dipakai
// oleh kedua sumber tanpa salah artikan kode.

import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentStatus } from "@/types/database.types";
import { notifyAdminOrderPaid } from "@/lib/notifications/admin-order-notifier";

export type ApplyDuitkuStatusParams = {
  orderId: string; // orders.id
  reference: string; // Duitku reference
  paymentStatus: PaymentStatus; // sudah di-mapping pemanggil (mapDuitkuCallbackResult / mapDuitkuStatusCheckResult)
  sourceCode: string; // kode mentah Duitku (resultCode ATAU statusCode) — disimpan untuk idempotency & audit
  paymentCode?: string; // kode metode pembayaran, mis. "VC" — hanya tersedia dari callback, tidak dari transactionStatus API
  rawCallback: unknown; // body/response MENTAH (bukan hasil parse Zod) — lihat callback route
};

/**
 * Idempoten: kalau reference+sourceCode PERSIS sama dengan yang terakhir
 * tersimpan, tidak melakukan apapun. Dipakai DUA tempat — callback &
 * aksi "Cek Ulang Status Pembayaran" admin — supaya logic auto-advance
 * HANYA ada di satu tempat (pola sama applyMidtransStatusUpdate sebelumnya).
 */
export async function applyDuitkuStatusUpdate(params: ApplyDuitkuStatusParams): Promise<{ applied: boolean }> {
  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, status, payment_status, duitku_reference, duitku_result_code, paid_at")
    .eq("id", params.orderId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!order) return { applied: false };

  if (order.duitku_reference === params.reference && order.duitku_result_code === params.sourceCode) {
    return { applied: false }; // duplikat notifikasi — no-op (idempotency)
  }

  const isNewlyPaid = params.paymentStatus === "paid" && order.payment_status !== "paid";

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: params.paymentStatus,
      duitku_reference: params.reference,
      duitku_result_code: params.sourceCode,
      ...(params.paymentCode ? { duitku_payment_code: params.paymentCode } : {}),
      duitku_raw_callback: params.rawCallback as never,
      duitku_last_callback_at: new Date().toISOString(),
      paid_at: isNewlyPaid ? new Date().toISOString() : order.paid_at,
      // auto-advance HANYA sekali, HANYA dari status awal ini, tidak pernah
      // menimpa kalau admin sudah memajukan status manual duluan.
      ...(isNewlyPaid && order.status === "menunggu_konfirmasi" ? { status: "diproses" as const } : {}),
    })
    .eq("id", order.id);
  if (updateError) throw updateError;

  if (isNewlyPaid) {
    notifyAdminOrderPaid({ orderNumber: order.order_number, customerName: order.customer_name, total: order.total }).catch(() => {
      // non-blocking — kegagalan notifikasi tidak boleh mempengaruhi hasil callback
    });
  }

  return { applied: true };
}
