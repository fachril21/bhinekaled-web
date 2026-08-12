// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// Dipicu tombol "Bayar Sekarang" (PayNowButton.tsx) di halaman konfirmasi
// order yang sudah ada (order SUDAH dibuat lebih dulu oleh
// app/api/checkout/route.ts, endpoint ini tidak pernah membuat order baru).

import { NextRequest, NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/origin-guard";
import { readGuestSessionId } from "@/lib/guest-session";
import { duitkuInvoiceRequestSchema } from "@/lib/validations";
import { getOrderByNumberForGuest } from "@/lib/queries/orders";
import { createInvoice, DuitkuApiError } from "@/lib/payments/duitku-client";
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

  const parsed = duitkuInvoiceRequestSchema.safeParse(body);
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

  let invoice;
  try {
    invoice = await createInvoice({
      orderNumber: order.orderNumber,
      grossAmount: order.total,
      productDetails: `Pembayaran BHINEKALED - ${order.orderNumber}`,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/duitku/callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sukses/${order.orderNumber}`,
    });
  } catch (err) {
    const status = err instanceof DuitkuApiError ? err.status : "unknown";
    console.error(`[duitku-invoice] Gagal membuat invoice untuk ${order.orderNumber}: status=${status}`);
    return NextResponse.json({ error: "Gagal memulai pembayaran, coba lagi sebentar lagi." }, { status: 502 });
  }

  // Tandai customer resmi memulai upaya bayar — hanya kalau masih 'n/a',
  // supaya tidak menimpa state yang sudah lebih maju (mis. sudah 'paid' dari
  // callback yang datang duluan karena race, walau sudah dicek di atas).
  if (order.paymentStatus === "n/a") {
    const supabase = createAdminClient();
    await supabase.from("orders").update({ payment_status: "pending" }).eq("order_number", order.orderNumber).eq("payment_status", "n/a");
  }

  return NextResponse.json({ redirectUrl: invoice.paymentUrl }, { status: 200 });
}
