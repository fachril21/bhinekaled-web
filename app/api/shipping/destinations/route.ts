// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 8.1.
//
// Tidak butuh guest session — pencarian wilayah bukan data sensitif, sama
// untuk semua orang (Keputusan E soal cache di-share).

import { NextRequest, NextResponse } from "next/server";
import { shippingDestinationSearchSchema } from "@/lib/validations";
import { findDestinations } from "@/lib/queries/shipping-destinations";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const parsed = shippingDestinationSearchSchema.safeParse({ q });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Pencarian tidak valid." },
      { status: 400 }
    );
  }

  try {
    const results = await findDestinations(parsed.data.q);
    return NextResponse.json({ results }, { status: 200 });
  } catch {
    // Edge case #6 — kegagalan RajaOngkir saat search TIDAK 500, biar UI
    // tampilkan "tidak ditemukan" bukan error teknis.
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
