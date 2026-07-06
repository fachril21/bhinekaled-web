// Epic 3: Checkout Flow (Tanpa Payment Gateway)
//
// Route ini yang jadi satu-satunya jalur untuk membuat order baru.
// Sengaja server-side (bukan insert langsung dari client) supaya harga &
// stok bisa divalidasi ulang di server — customer tidak bisa memanipulasi
// harga dari browser.
//
// Alur yang perlu diimplementasikan (lihat docs/EPICS.md Epic 3 & Epic 9):
// 1. Terima payload: guest_session_id, data pengiriman, daftar item cart
// 2. Ambil ulang harga & stok tiap produk/varian dari database (JANGAN percaya
//    harga yang dikirim dari client)
// 3. Hitung subtotal + shipping_cost (flat rate placeholder — lihat PRD)
// 4. Insert ke tabel `orders` (status default 'menunggu_konfirmasi') +
//    `order_items` (pakai Supabase client dari lib/supabase/server.ts)
// 5. Kosongkan cart_items untuk guest_session_id tersebut
// 6. Trigger notifikasi ke admin (Epic 9) — non-blocking, jangan sampai
//    kegagalan notifikasi bikin order gagal tersimpan
// 7. Return order_number ke client untuk redirect ke halaman konfirmasi

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: implementasi sesuai acceptance criteria Epic 3 di docs/EPICS.md
  return NextResponse.json(
    { message: "Belum diimplementasikan — lihat docs/EPICS.md Epic 3" },
    { status: 501 }
  );
}
