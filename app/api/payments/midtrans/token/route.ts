// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 7.1.
//
// Dipicu tombol "Bayar Sekarang" (PayNowButton.tsx) di halaman konfirmasi
// order yang sudah ada (Keputusan C — order SUDAH dibuat lebih dulu oleh
// app/api/checkout/route.ts, endpoint ini tidak pernah membuat order baru).

import { NextRequest, NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/origin-guard";
import { readGuestSessionId } from "@/lib/guest-session";
import { midtransTokenRequestSchema } from "@/lib/validations";
import { getOrderByNumberForGuest } from "@/lib/queries/orders";
import { createSnapTransaction, MidtransApiError } from "@/lib/payments/midtrans-client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const guestSessionId = await readGuestSessionId();
  if (!guestSessionId) {
    return NextResponse.json({ error: "Sesi Anda tidak ditemukan." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const parsed = midtransTokenRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const order = await getOrderByNumberForGuest(parsed.data.orderNumber, guestSessionId);
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }

  if (order.status === "dibatalkan") {
    return NextResponse.json({ error: "Order sudah dibatalkan, tidak bisa dibayar." }, { status: 400 });
  }
  if (order.paymentStatus === "paid" || order.paymentStatus === "refunded" || order.paymentStatus === "partially_refunded") {
    return NextResponse.json({ error: "Order ini sudah lunas." }, { status: 409 });
  }

  let snapTransaction;
  try {
    snapTransaction = await createSnapTransaction({
      orderNumber: order.orderNumber,
      grossAmount: order.total,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail ?? undefined,
      finishUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sukses/${order.orderNumber}`,
    });
  } catch (err) {
    const status = err instanceof MidtransApiError ? err.status : "unknown";
    console.error(`[midtrans-token] Gagal membuat Snap transaction untuk ${order.orderNumber}: status=${status}`);
    return NextResponse.json({ error: "Gagal memulai pembayaran, coba lagi sebentar lagi." }, { status: 502 });
  }

  // Tandai customer resmi memulai upaya bayar — hanya kalau masih 'n/a',
  // supaya tidak menimpa state yang sudah lebih maju (mis. sudah 'paid' dari
  // webhook yang datang duluan karena race, walau sudah dicek di atas).
  if (order.paymentStatus === "n/a") {
    const supabase = createAdminClient();
    await supabase.from("orders").update({ payment_status: "pending" }).eq("order_number", order.orderNumber).eq("payment_status", "n/a");
  }

  return NextResponse.json({ redirectUrl: snapTransaction.redirectUrl }, { status: 200 });
}
