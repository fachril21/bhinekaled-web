// Epic 14 follow-up: auto-confirm pembayaran saat customer kembali dari Duitku.
//
// ⚠️ Server-only. Webhook Duitku (app/api/payments/duitku/callback) tetap
// jalur utama, TAPI webhook butuh NEXT_PUBLIC_APP_URL yang publik & bisa
// dijangkau Duitku. Fungsi ini jaring pengaman: dipanggil dari halaman
// /checkout/sukses/[order_number] (returnUrl Duitku) supaya order langsung
// ke-update begitu customer di-redirect balik setelah bayar — tanpa nunggu
// webhook, tanpa konfirmasi manual admin.
//
// Idempoten & aman: kalau order sudah 'paid' tidak menghubungi Duitku sama
// sekali; applyDuitkuStatusUpdate sendiri idempoten + hanya auto-advance
// sekali. Best-effort — TIDAK PERNAH throw (halaman sukses harus tetap render).

import { createAdminClient } from "@/lib/supabase/admin";
import { checkTransactionStatus, DuitkuApiError } from "@/lib/payments/duitku-client";
import { mapDuitkuStatusCheckResult } from "@/lib/payments/duitku-status-mapping";
import { applyDuitkuStatusUpdate } from "@/lib/payments/apply-duitku-status";
import type { PaymentStatus } from "@/types/database.types";

// Status yang sudah "selesai" dari sisi uang masuk — tidak perlu tanya Duitku lagi.
const FINAL_PAYMENT_STATUSES: PaymentStatus[] = ["paid", "refunded", "partially_refunded"];

export async function syncDuitkuOrderStatus(orderNumber: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (error) throw error;
    if (!order) return;
    if (FINAL_PAYMENT_STATUSES.includes(order.payment_status)) return;

    const status = await checkTransactionStatus(orderNumber);
    await applyDuitkuStatusUpdate({
      orderId: order.id,
      reference: status.reference,
      paymentStatus: mapDuitkuStatusCheckResult(status.statusCode),
      sourceCode: status.statusCode,
      rawCallback: status,
    });
  } catch (err) {
    // 404 = Duitku belum punya transaksi untuk order ini (customer belum
    // benar-benar bayar / baru mulai) — normal, bukan error.
    if (err instanceof DuitkuApiError && err.status === 404) return;
    console.error(`[sync-duitku] gagal sinkron status order ${orderNumber}:`, err);
  }
}
