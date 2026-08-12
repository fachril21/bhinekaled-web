// Epic 3: Checkout Flow (Tanpa Payment Gateway)
//
// Route ini yang jadi satu-satunya jalur untuk membuat order baru. Sengaja
// Route Handler (bukan Server Action) — lihat docs/ARCHITECTURE.md &
// docs/plan/epic-3-checkout-flow.md Temuan #8.
//
// Body request HANYA berisi data pengiriman (nama, no. HP, alamat, catatan,
// pilihan kurir) — TIDAK PERNAH harga/subtotal/total/ongkir. Semua angka
// uang dihitung ulang 100% di server dari data Supabase, supaya tidak ada
// celah manipulasi harga dari client (Temuan #4a — dikonfirmasi eksplisit
// sebagai syarat keamanan oleh user). Epic 12: ongkir juga direvalidasi
// otoritatif di server dari hasil RajaOngkir, bukan dipercaya dari client
// (Keputusan A).
//
// Pakai admin client (service role) untuk seluruh mutasi di handler ini:
// RLS publik pada products/product_variants hanya mengizinkan SELECT produk
// aktif (bukan UPDATE stok), dan RLS pada orders/order_items hanya
// mengizinkan INSERT publik (tidak ada policy DELETE untuk compensating
// rollback). Proteksi endpoint ini sepenuhnya ada di application layer di
// bawah (origin check, Zod, revalidasi harga/stok server-side), bukan RLS.

import { NextRequest, NextResponse } from "next/server";
import { readGuestSessionId } from "@/lib/guest-session";
import { checkoutFormSchema } from "@/lib/validations";
import { getCartItems } from "@/lib/queries/cart";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  decrementStockForCheckout,
  restoreStockForCheckout,
  type StockGuardTarget,
} from "@/lib/checkout/stock-guard";
import { notifyAdminNewOrder } from "@/lib/notifications/admin-order-notifier";
import { calculateFees, sumFees, type CalculatedFee } from "@/lib/fees";
import { getShippingOriginId } from "@/lib/checkout-config";
import { calculateCartWeightGram } from "@/lib/shipping/weight";
import { getShippingRates } from "@/lib/queries/shipping-rates";
import { getDestinationLabel } from "@/lib/queries/shipping-destinations";
import { isSameOriginRequest } from "@/lib/http/origin-guard";
import type { FeeType } from "@/types/database.types";

const GENERIC_SAVE_ERROR = "Gagal membuat pesanan, coba lagi.";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const guestSessionId = await readGuestSessionId();
  if (!guestSessionId) {
    return NextResponse.json({ error: "Keranjang Anda kosong." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const parsed = checkoutFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Data pengiriman belum lengkap/valid.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  const { customer_name, customer_phone, customer_email, shipping_address, notes, shipping } = parsed.data;

  let cart;
  try {
    cart = await getCartItems(guestSessionId);
  } catch {
    return NextResponse.json({ error: "Gagal memuat keranjang, coba lagi." }, { status: 500 });
  }

  const available = cart.items.filter((item) => item.productIsAvailable);
  if (available.length === 0) {
    return NextResponse.json({ error: "Tidak ada produk yang bisa di-checkout." }, { status: 400 });
  }

  // Pre-check cepat (belum menulis apapun) — fast path untuk kasus umum
  // tanpa perubahan konkuren. Pemeriksaan otoritatif tetap
  // decrementStockForCheckout di bawah (aman dari race condition).
  const insufficient = available.filter((item) => item.qty > item.availableStock);
  if (insufficient.length > 0) {
    return NextResponse.json(
      { error: `Stok tidak mencukupi untuk: ${insufficient.map((item) => item.productName).join(", ")}` },
      { status: 400 }
    );
  }

  const subtotal = available.reduce((sum, item) => sum + item.lineSubtotal, 0);

  // Epic 12 (Keputusan A) — nilai ongkir TIDAK PERNAH dipercaya dari client,
  // dihitung ulang otoritatif di server dari cart guest session saat ini,
  // lalu dicocokkan dengan pilihan courierCode+serviceCode yang dikirim.
  const cartWeightGram = calculateCartWeightGram(
    available.map((item) => ({ weightGram: item.weightGram, qty: item.qty }))
  );

  let shippingCost: number;
  let shippingCourierService: string;
  try {
    const rateResult = await getShippingRates({
      originId: getShippingOriginId(),
      destinationId: shipping.destinationId,
      cartWeightGram,
    });
    const matched = rateResult.options.find(
      (opt) => opt.courierCode === shipping.courierCode && opt.serviceCode === shipping.serviceCode
    );
    if (!matched) {
      return NextResponse.json(
        { error: "Opsi pengiriman yang dipilih sudah tidak berlaku, silakan pilih ulang." },
        { status: 400 }
      );
    }
    shippingCost = matched.cost; // OTORITATIF — bukan dari client
    shippingCourierService = `${matched.courierName} - ${matched.serviceName}`;
  } catch {
    // Keputusan D — TIDAK fallback ke flat rate diam-diam, tolak dengan jelas.
    return NextResponse.json(
      { error: "Gagal memvalidasi ongkir, coba lagi sebentar lagi." },
      { status: 502 }
    );
  }

  const destinationLabel = await getDestinationLabel(shipping.destinationId).catch(() => null);

  const supabase = createAdminClient();

  // Epic 11: kegagalan fetch biaya lainnya TIDAK PERNAH membatalkan checkout
  // — treat sebagai "tidak ada biaya aktif" (lihat plan Temuan #2).
  let calculatedFees: CalculatedFee[] = [];
  try {
    const { data: feeRows, error: feesError } = await supabase
      .from("additional_fees")
      .select("id, label, fee_type, amount")
      .eq("is_active", true);
    if (feesError) throw feesError;
    calculatedFees = calculateFees(
      (feeRows ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        feeType: row.fee_type as FeeType,
        amount: row.amount,
      })),
      subtotal
    );
  } catch {
    calculatedFees = [];
  }

  const total = subtotal + shippingCost + sumFees(calculatedFees);

  const stockTargets: StockGuardTarget[] = available.map((item) => ({
    table: item.variantId ? "product_variants" : "products",
    id: item.variantId ?? item.productId,
    qty: item.qty,
    productName: item.productName,
  }));

  const stockResult = await decrementStockForCheckout(supabase, stockTargets);
  if (!stockResult.success) {
    return NextResponse.json(
      {
        error: `Stok tidak mencukupi untuk: ${stockResult.failures.map((f) => f.productName).join(", ")}`,
      },
      { status: 400 }
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      guest_session_id: guestSessionId,
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      notes: notes || null,
      subtotal,
      shipping_cost: shippingCost,
      total,
      shipping_courier_code: shipping.courierCode,
      shipping_courier_service: shippingCourierService,
      shipping_destination_label: destinationLabel,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    await restoreStockForCheckout(supabase, stockTargets);
    return NextResponse.json({ error: GENERIC_SAVE_ERROR }, { status: 500 });
  }

  const orderItemsPayload = available.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    product_name_snapshot: item.productName,
    variant_name_snapshot: item.variantName,
    price_snapshot: item.unitPrice,
    qty: item.qty,
    subtotal: item.lineSubtotal,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    await restoreStockForCheckout(supabase, stockTargets);
    return NextResponse.json({ error: GENERIC_SAVE_ERROR }, { status: 500 });
  }

  if (calculatedFees.length > 0) {
    const orderFeesPayload = calculatedFees.map((fee) => ({
      order_id: order.id,
      fee_id: fee.feeId,
      label_snapshot: fee.label,
      fee_type_snapshot: fee.feeType,
      rate_snapshot: fee.rate,
      amount: fee.amount,
    }));

    const { error: feesInsertError } = await supabase.from("order_fees").insert(orderFeesPayload);
    if (feesInsertError) {
      await supabase.from("orders").delete().eq("id", order.id); // cascade hapus order_items juga
      await restoreStockForCheckout(supabase, stockTargets);
      return NextResponse.json({ error: GENERIC_SAVE_ERROR }, { status: 500 });
    }
  }

  await supabase.from("cart_items").delete().eq("guest_session_id", guestSessionId);

  notifyAdminNewOrder({ orderNumber: order.order_number, customerName: customer_name, total }).catch(
    () => {
      // non-blocking — kegagalan notifikasi tidak boleh mempengaruhi response checkout
    }
  );

  return NextResponse.json({ orderNumber: order.order_number }, { status: 200 });
}
