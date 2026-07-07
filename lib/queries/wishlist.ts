import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type WishlistItemDetail = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productIsAvailable: boolean;
  basePrice: number;
  imageUrl: string | null;
  imageAlt: string | null;
  inStock: boolean;
};

type WishlistRow = {
  id: string;
  product_id: string;
  products: {
    name: string;
    slug: string;
    status: string;
    base_price: number;
    stock: number;
  } | null;
};

/**
 * Query wishlist_items TIDAK memfilter status produk (wishlist = catatan
 * minat, bukan validasi transaksi) — lihat
 * docs/plan/epic-2-cart-wishlist.md Temuan #9 & #16.
 */
export async function getWishlistItems(guestSessionId: string): Promise<WishlistItemDetail[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, product_id, products ( name, slug, status, base_price, stock )")
    .eq("guest_session_id", guestSessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  const rows = ((data ?? []) as unknown as WishlistRow[]).filter((row) => row.products !== null);

  const productIds = rows.map((row) => row.product_id);
  const imageByProduct = await getPrimaryImagesByProductIds(productIds);

  return rows.map((row) => {
    const product = row.products!;
    const image = imageByProduct.get(row.product_id);

    return {
      id: row.id,
      productId: row.product_id,
      productSlug: product.slug,
      productName: product.name,
      productIsAvailable: product.status === "active",
      basePrice: product.base_price,
      imageUrl: image?.url ?? null,
      imageAlt: image?.altText ?? null,
      inStock: product.stock > 0,
    };
  });
}

/** Versi ringan untuk badge header — cukup hitung baris, tidak perlu join. */
export async function getWishlistItemCount(guestSessionId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("wishlist_items")
    .select("id", { count: "exact", head: true })
    .eq("guest_session_id", guestSessionId);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Set product_id yang sudah di-wishlist guest ini — dipakai halaman
 * listing/detail produk untuk menentukan state awal tiap WishlistButton
 * (1 query ringan per page render, bukan N query per produk).
 */
export async function getWishlistedProductIds(guestSessionId: string): Promise<Set<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("guest_session_id", guestSessionId);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.product_id));
}

async function getPrimaryImagesByProductIds(
  productIds: string[]
): Promise<Map<string, { url: string; altText: string | null }>> {
  const map = new Map<string, { url: string; altText: string | null }>();
  if (productIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, url, alt_text, sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  for (const row of data ?? []) {
    if (!map.has(row.product_id)) {
      map.set(row.product_id, { url: row.url, altText: row.alt_text });
    }
  }
  return map;
}
