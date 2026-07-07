import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/database.types";

export type OrderConfirmationItem = {
  productName: string;
  variantName: string | null;
  priceSnapshot: number;
  qty: number;
  subtotal: number;
};

export type OrderConfirmation = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderConfirmationItem[];
};

/**
 * RLS publik TIDAK mengizinkan SELECT sama sekali di `orders`/`order_items`
 * (hanya admin) — lihat docs/plan/epic-3-checkout-flow.md Temuan #2. Baca
 * lewat admin client adalah satu-satunya cara, TAPI hasil query hanya
 * dikembalikan kalau guest_session_id di baris order cocok dengan
 * guestSessionId pemanggil. order_number sequential (mudah ditebak), jadi
 * tanpa guard ini siapapun bisa membaca data order (nama, no. HP, alamat)
 * customer lain lewat URL halaman konfirmasi.
 *
 * Return null baik untuk "order tidak ada" maupun "bukan milik Anda" —
 * sengaja tidak dibedakan supaya pesan error tidak membocorkan keberadaan
 * order orang lain.
 */
export async function getOrderByNumberForGuest(
  orderNumber: string,
  guestSessionId: string | null
): Promise<OrderConfirmation | null> {
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, guest_session_id, customer_name, customer_phone, shipping_address, notes, subtotal, shipping_cost, total, status, created_at"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order || !guestSessionId || order.guest_session_id !== guestSessionId) {
    return null;
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name_snapshot, variant_name_snapshot, price_snapshot, qty, subtotal")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });
  if (itemsError) throw itemsError;

  const items: OrderConfirmationItem[] = (itemRows ?? []).map((row) => ({
    productName: row.product_name_snapshot,
    variantName: row.variant_name_snapshot,
    priceSnapshot: row.price_snapshot,
    qty: row.qty,
    subtotal: row.subtotal,
  }));

  return {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address,
    notes: order.notes,
    subtotal: order.subtotal,
    shippingCost: order.shipping_cost,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
    items,
  };
}
