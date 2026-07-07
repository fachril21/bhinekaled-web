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
