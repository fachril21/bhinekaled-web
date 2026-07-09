import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { escapeIlikePattern } from "@/lib/queries/products";
import type { OrderStatus, PaymentStatus } from "@/types/database.types";

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

// Epic 7: Admin Kelola Order — lihat docs/plan/epic-7-admin-kelola-order.md.
// Fungsi di bawah ini SELALU pakai createClient() (sesi admin, RLS is_admin())
// dan HANYA dipanggil dari route yang sudah lolos getAdminSession() di
// app/admin/(protected)/layout.tsx — JANGAN ditiru jadi createAdminClient()
// seperti getOrderByNumberForGuest di atas (Temuan #6 plan tsb, konteksnya beda).

export const ADMIN_ORDER_PAGE_SIZE = 20;

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
};

export type AdminOrderListResult = {
  orders: AdminOrderListItem[];
  totalCount: number;
  page: number;
  totalPages: number;
};

/**
 * Search HANYA mencocokkan order_number (bukan customer_name) — mencocokkan
 * >1 kolom butuh `.or()` PostgREST yang rawan rusak kalau customer_name
 * mengandung koma/kurung (Temuan #3 plan tsb). Pagination (bukan fetch-all
 * seperti getAdminProductList) karena volume order terus bertambah tiap hari
 * (Temuan #4 plan tsb).
 */
export async function getAdminOrderList(params: {
  status?: OrderStatus | "semua";
  search?: string;
  page?: number;
}): Promise<AdminOrderListResult> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * ADMIN_ORDER_PAGE_SIZE;
  const to = from + ADMIN_ORDER_PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, status, total, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status && params.status !== "semua") {
    query = query.eq("status", params.status);
  }
  if (params.search) {
    query = query.ilike("order_number", `%${escapeIlikePattern(params.search)}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const totalCount = count ?? 0;
  return {
    orders: (data ?? []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      status: row.status,
      total: row.total,
      createdAt: row.created_at,
    })),
    totalCount,
    page,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_ORDER_PAGE_SIZE)),
  };
}

export type AdminOrderDetailItem = {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  priceSnapshot: number;
  qty: number;
  subtotal: number;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderDetailItem[];
};

/** Fetch by id (orders.id UUID, bukan order_number) — dipakai halaman detail admin. */
export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, shipping_address, notes, subtotal, shipping_cost, total, status, payment_method, payment_status, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return null;

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("id, product_id, variant_id, product_name_snapshot, variant_name_snapshot, price_snapshot, qty, subtotal")
    .eq("order_id", id)
    .order("created_at", { ascending: true });
  if (itemsError) throw itemsError;

  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address,
    notes: order.notes,
    subtotal: order.subtotal,
    shippingCost: order.shipping_cost,
    total: order.total,
    status: order.status,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: (itemRows ?? []).map((row) => ({
      id: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      productName: row.product_name_snapshot,
      variantName: row.variant_name_snapshot,
      priceSnapshot: row.price_snapshot,
      qty: row.qty,
      subtotal: row.subtotal,
    })),
  };
}
