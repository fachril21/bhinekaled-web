// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 5.6.
//
// ⚠️ Server-only — pakai createAdminClient() (service role), sama pola
// Keputusan E: RLS publik pada `orders` hanya izinkan INSERT, jadi update
// payment_status lewat webhook/rekonsiliasi harus lewat service role +
// guard di application layer (signature verification untuk webhook,
// is_admin() session untuk rekonsiliasi manual).

import { createAdminClient } from "@/lib/supabase/admin";
import { mapMidtransStatus, type MidtransFraudStatus, type MidtransTransactionStatus } from "./status-mapping";
import { notifyAdminOrderPaid } from "@/lib/notifications/admin-order-notifier";

export type ApplyStatusParams = {
  orderId: string; // orders.id
  transactionId: string;
  transactionStatus: MidtransTransactionStatus;
  fraudStatus: MidtransFraudStatus | null;
  paymentType: string;
  rawNotification: unknown; // body MENTAH (bukan hasil parse Zod) — lihat webhook route
};

/**
 * Idempoten: kalau transactionId+transactionStatus PERSIS sama dengan yang
 * terakhir tersimpan, tidak melakukan apapun (AC US-13.3 poin 4, edge case #3).
 * Dipakai DUA tempat — webhook & aksi "Cek Ulang Status Pembayaran" admin
 * (US-13.4) — supaya logic mapping+auto-advance HANYA ada di satu tempat
 * (Keputusan A/H, plan bagian 2).
 */
export async function applyMidtransStatusUpdate(params: ApplyStatusParams): Promise<{ applied: boolean }> {
  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, total, status, payment_status, midtrans_transaction_id, midtrans_transaction_status, paid_at"
    )
    .eq("id", params.orderId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!order) return { applied: false };

  if (
    order.midtrans_transaction_id === params.transactionId &&
    order.midtrans_transaction_status === params.transactionStatus
  ) {
    return { applied: false }; // duplikat notifikasi — no-op (idempotency)
  }

  const mappedPaymentStatus = mapMidtransStatus(params.transactionStatus, params.fraudStatus);
  const isNewlyPaid = mappedPaymentStatus === "paid" && order.payment_status !== "paid";

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: mappedPaymentStatus,
      midtrans_transaction_id: params.transactionId,
      midtrans_transaction_status: params.transactionStatus,
      midtrans_fraud_status: params.fraudStatus,
      midtrans_payment_type: params.paymentType,
      midtrans_raw_notification: params.rawNotification as never,
      midtrans_last_notification_at: new Date().toISOString(),
      paid_at: isNewlyPaid ? new Date().toISOString() : order.paid_at,
      // Keputusan H — auto-advance HANYA sekali, HANYA dari status awal ini,
      // tidak pernah menimpa kalau admin sudah memajukan status manual duluan.
      ...(isNewlyPaid && order.status === "menunggu_konfirmasi" ? { status: "diproses" as const } : {}),
    })
    .eq("id", order.id);
  if (updateError) throw updateError;

  if (isNewlyPaid) {
    notifyAdminOrderPaid({ orderNumber: order.order_number, customerName: order.customer_name, total: order.total }).catch(
      () => {
        // non-blocking — kegagalan notifikasi tidak boleh mempengaruhi hasil webhook
      }
    );
  }

  return { applied: true };
}
