export type AdminOrderNotificationPayload = {
  orderNumber: string;
  customerName: string;
  total: number;
};

/**
 * STUB untuk Epic 3 — hanya log server-side, TIDAK mengirim WA/email
 * sungguhan. Channel notifikasi sungguhan adalah pekerjaan Epic 9, menunggu
 * keputusan PO soal channel & biaya (lihat docs/EPICS.md Epic 9 AC #1 dan
 * docs/plan/epic-3-checkout-flow.md Temuan #6). Dipanggil non-blocking
 * (fire-and-forget, dibungkus try/catch di pemanggil) sehingga kegagalan di
 * sini TIDAK PERNAH membuat order gagal tersimpan.
 */
export async function notifyAdminNewOrder(payload: AdminOrderNotificationPayload): Promise<void> {
  console.info(
    `[admin-notify] Order baru ${payload.orderNumber} dari ${payload.customerName}, total ${payload.total} — TODO Epic 9: kirim ke channel WA/email sungguhan.`
  );
}

/**
 * Epic 13: Midtrans Payment Integration — stub sama pola notifyAdminNewOrder
 * di atas, dipanggil non-blocking dari lib/payments/apply-status.ts begitu
 * payment_status pertama kali jadi 'paid'. Channel WA/email sungguhan tetap
 * menunggu Epic 9 (belum ada keputusan channel dari PO), bukan scope epic ini.
 */
export async function notifyAdminOrderPaid(payload: AdminOrderNotificationPayload): Promise<void> {
  console.info(
    `[admin-notify] Order ${payload.orderNumber} dari ${payload.customerName} telah DIBAYAR (${payload.total}) — TODO Epic 9: kirim ke channel WA/email sungguhan.`
  );
}
