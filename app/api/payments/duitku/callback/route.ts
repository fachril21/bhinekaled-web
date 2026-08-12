// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// Callback dipanggil server-to-server oleh Duitku (bukan browser) — TIDAK
// PERNAH pasang isSameOriginRequest di sini, signature adalah SATU-SATUNYA
// gate keaslian request ini. Body dikirim x-www-form-urlencoded (bukan JSON,
// beda dari createInvoice) — lihat lib/validations.ts duitkuCallbackSchema.
//
// Node runtime (BUKAN edge) — verifyDuitkuCallbackSignature pakai node:crypto.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { duitkuCallbackSchema } from "@/lib/validations";
import { duitkuApiKey, duitkuMerchantCode } from "@/lib/payments/duitku-config";
import { verifyDuitkuCallbackSignature, isDuitkuAmountMatching } from "@/lib/payments/duitku-signature";
import { mapDuitkuCallbackResult } from "@/lib/payments/duitku-status-mapping";
import { applyDuitkuStatusUpdate } from "@/lib/payments/apply-duitku-status";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const rawBody: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") rawBody[key] = value;
  }

  const parsed = duitkuCallbackSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.merchantCode !== duitkuMerchantCode()) {
    console.warn(`[duitku-callback] merchantCode tidak cocok untuk order_id=${data.merchantOrderId}.`);
    return NextResponse.json({ error: "Merchant tidak valid." }, { status: 401 });
  }

  const signatureValid = verifyDuitkuCallbackSignature({
    merchantCode: data.merchantCode,
    amount: data.amount,
    merchantOrderId: data.merchantOrderId,
    signature: data.signature,
    apiKey: duitkuApiKey(),
  });
  if (!signatureValid) {
    console.warn(`[duitku-callback] Signature tidak valid untuk order_id=${data.merchantOrderId}.`);
    return NextResponse.json({ error: "Signature tidak valid." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total")
    .eq("order_number", data.merchantOrderId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }

  if (!isDuitkuAmountMatching(order.total, data.amount)) {
    console.warn(
      `[duitku-callback] amount tidak cocok untuk order_id=${data.merchantOrderId}: diharapkan=${order.total}, diterima=${data.amount}.`
    );
    await supabase
      .from("orders")
      .update({
        payment_status: "review",
        duitku_raw_callback: rawBody,
        duitku_last_callback_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    // Balas 200 tetap — masalahnya bukan di sisi delivery Duitku, tidak
    // perlu retry, investigasi manual (pola sama Midtrans sebelumnya).
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  await applyDuitkuStatusUpdate({
    orderId: order.id,
    reference: data.reference,
    paymentStatus: mapDuitkuCallbackResult(data.resultCode),
    sourceCode: data.resultCode,
    paymentCode: data.paymentCode,
    rawCallback: rawBody,
  });

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
