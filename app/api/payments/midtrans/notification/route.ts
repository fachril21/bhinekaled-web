// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 7.2.
//
// Webhook dipanggil server-to-server oleh Midtrans (bukan browser) — TIDAK
// PERNAH pasang isSameOriginRequest di sini (Keputusan F, plan bagian 2),
// signature_key adalah SATU-SATUNYA gate keaslian request ini.
//
// Node runtime (BUKAN edge) — verifyMidtransSignature pakai node:crypto.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { midtransNotificationSchema } from "@/lib/validations";
import { midtransServerKey } from "@/lib/payments/midtrans-config";
import { verifyMidtransSignature, isGrossAmountMatching } from "@/lib/payments/signature";
import { applyMidtransStatusUpdate } from "@/lib/payments/apply-status";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MidtransFraudStatus, MidtransTransactionStatus } from "@/lib/payments/status-mapping";

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const parsed = midtransNotificationSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }
  const data = parsed.data;

  const signatureValid = verifyMidtransSignature({
    orderId: data.order_id,
    statusCode: data.status_code,
    grossAmount: data.gross_amount,
    signatureKey: data.signature_key,
    serverKey: midtransServerKey(),
  });
  if (!signatureValid) {
    console.warn(`[midtrans-notification] Signature tidak valid untuk order_id=${data.order_id}.`);
    return NextResponse.json({ error: "Signature tidak valid." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total")
    .eq("order_number", data.order_id)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }

  if (!isGrossAmountMatching(order.total, data.gross_amount)) {
    console.warn(
      `[midtrans-notification] gross_amount tidak cocok untuk order_id=${data.order_id}: diharapkan=${order.total}, diterima=${data.gross_amount}.`
    );
    await supabase
      .from("orders")
      .update({
        payment_status: "review",
        midtrans_raw_notification: rawBody as never,
        midtrans_last_notification_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    // Balas 200 tetap — masalahnya bukan di sisi delivery Midtrans, tidak
    // perlu retry, investigasi manual (edge case #2, plan bagian 10).
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  await applyMidtransStatusUpdate({
    orderId: order.id,
    transactionId: data.transaction_id,
    transactionStatus: data.transaction_status as MidtransTransactionStatus,
    fraudStatus: (data.fraud_status as MidtransFraudStatus | undefined) ?? null,
    paymentType: data.payment_type,
    rawNotification: rawBody,
  });

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
