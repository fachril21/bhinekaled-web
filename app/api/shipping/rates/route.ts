// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 8.2.
//
// Weight TIDAK dikirim dari client — selalu dihitung ulang dari cart guest
// session server-side, konsisten Keputusan A meski ini baru preview (bukan
// cuma final checkout) supaya tidak ada 2 jalur beda untuk hitung berat yang
// sama.

import { NextRequest, NextResponse } from "next/server";
import { readGuestSessionId } from "@/lib/guest-session";
import { shippingRateRequestSchema } from "@/lib/validations";
import { getCartItems } from "@/lib/queries/cart";
import { calculateCartWeightGram } from "@/lib/shipping/weight";
import { getShippingRates } from "@/lib/queries/shipping-rates";
import { getShippingOriginId } from "@/lib/checkout-config";

export async function POST(request: NextRequest) {
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

  const parsed = shippingRateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Tujuan tidak valid." },
      { status: 400 }
    );
  }

  let cart;
  try {
    cart = await getCartItems(guestSessionId);
  } catch {
    return NextResponse.json({ error: "Gagal memuat keranjang, coba lagi." }, { status: 500 });
  }

  const available = cart.items.filter((item) => item.productIsAvailable);
  if (available.length === 0) {
    return NextResponse.json({ error: "Keranjang Anda kosong." }, { status: 400 });
  }

  const cartWeightGram = calculateCartWeightGram(
    available.map((item) => ({ weightGram: item.weightGram, qty: item.qty }))
  );

  try {
    const result = await getShippingRates({
      originId: getShippingOriginId(),
      destinationId: parsed.data.destinationId,
      cartWeightGram,
    });
    return NextResponse.json(result, { status: 200 });
  } catch {
    // US-12.3 — RajaOngkir gagal & tidak ada cache valid: tolak jelas + retry
    // di client (ShippingSelector), bukan fallback diam-diam (Keputusan D).
    return NextResponse.json({ error: "Gagal memuat ongkir, coba lagi." }, { status: 502 });
  }
}
