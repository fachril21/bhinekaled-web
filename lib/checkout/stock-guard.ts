import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Epic 3: Checkout Flow — decrement stok saat order dibuat (dikonfirmasi
// user: tidak ada proses konfirmasi manual admin di fase 1, jadi order
// masuk adalah satu-satunya titik wajar untuk reservasi stok).
//
// Supabase-js tidak punya operasi atomic increment/decrement bawaan, dan
// docs/plan/epic-3-checkout-flow.md Temuan #3 sudah memutuskan untuk TIDAK
// menambah Postgres function/RPC baru. Jadi decrement/restore di sini pakai
// optimistic concurrency (compare-and-swap) murni di application layer:
// baca stok saat ini, lalu update dengan WHERE yang menyertakan nilai yang
// barusan dibaca (bukan cuma `gte`) — kalau ada request lain yang mengubah
// stok tepat di antara baca & tulis, update ini terdeteksi gagal (0 baris)
// alih-alih diam-diam menimpa perubahan orang lain. Lihat plan bagian 3.3a.

const MAX_CAS_ATTEMPTS = 3;

export type StockGuardTarget = {
  table: "products" | "product_variants";
  id: string;
  qty: number;
  productName: string;
};

export type StockGuardFailure = { productName: string };

export type StockGuardResult =
  | { success: true }
  | { success: false; failures: StockGuardFailure[] };

async function readStock(
  supabase: SupabaseClient<Database>,
  table: "products" | "product_variants",
  id: string
): Promise<number | null> {
  const { data, error } = await supabase.from(table).select("stock").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.stock ?? null;
}

/**
 * CAS satu arah (delta positif = decrement, delta negatif = restore/increment).
 * Return true kalau berhasil, false kalau stok saat ini tidak cukup untuk
 * decrement (tidak ada gunanya retry) atau retry habis karena terus-menerus
 * ditimpa request lain.
 */
async function applyStockDelta(
  supabase: SupabaseClient<Database>,
  target: StockGuardTarget,
  delta: number
): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt++) {
    const currentStock = await readStock(supabase, target.table, target.id);
    if (currentStock === null) return false;

    const nextStock = currentStock - delta;
    if (nextStock < 0) return false; // decrement tidak cukup — tidak ada gunanya retry

    const { data, error } = await supabase
      .from(target.table)
      .update({ stock: nextStock })
      .eq("id", target.id)
      .eq("stock", currentStock) // CAS guard: gagal kalau stok berubah sejak baris di atas dibaca
      .select("id");
    if (error) throw error;

    if (data && data.length > 0) return true; // sukses
    // else: stok berubah konkuren sejak dibaca — retry dari awal loop
  }
  return false;
}

/**
 * Decrement stok tiap target secara berurutan. Kalau ada target yang gagal,
 * SEMUA target sebelumnya yang sudah berhasil di-decrement di batch ini
 * langsung di-restore sebelum function ini return, supaya tidak ada efek
 * samping parsial yang bocor ke caller.
 */
export async function decrementStockForCheckout(
  supabase: SupabaseClient<Database>,
  targets: StockGuardTarget[]
): Promise<StockGuardResult> {
  const applied: StockGuardTarget[] = [];

  for (const target of targets) {
    const ok = await applyStockDelta(supabase, target, target.qty);
    if (!ok) {
      if (applied.length > 0) {
        await restoreStockForCheckout(supabase, applied);
      }
      return { success: false, failures: [{ productName: target.productName }] };
    }
    applied.push(target);
  }

  return { success: true };
}

/** Restore (increment balik) — dipakai kalau langkah setelah decrement gagal. */
export async function restoreStockForCheckout(
  supabase: SupabaseClient<Database>,
  targets: StockGuardTarget[]
): Promise<void> {
  for (const target of targets) {
    await applyStockDelta(supabase, target, -target.qty);
  }
}
