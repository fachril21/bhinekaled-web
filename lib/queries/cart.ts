import { createAdminClient } from "@/lib/supabase/admin";

export type CartItemDetail = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productIsAvailable: boolean;
  variantId: string | null;
  variantName: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  unitPrice: number;
  availableStock: number;
  qty: number;
  lineSubtotal: number;
  weightGram: number; // Epic 12 — dipakai kalkulasi ongkir
};

export type CartSummary = {
  items: CartItemDetail[];
  subtotal: number;
  itemCount: number;
};

type CartRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  qty: number;
  products: {
    name: string;
    slug: string;
    status: string;
    base_price: number;
    stock: number;
    weight_gram: number;
  } | null;
  product_variants: {
    name: string;
    price_override: number | null;
    stock: number;
    weight_override: number | null;
  } | null;
};

const CART_SELECT = `
  id,
  product_id,
  variant_id,
  qty,
  products ( name, slug, status, base_price, stock, weight_gram ),
  product_variants ( name, price_override, stock, weight_override )
`;

/**
 * Ambil 1 gambar utama per produk lewat satu query batch (bukan N+1).
 * Diorder sort_order asc secara global — untuk tiap product_id, kemunculan
 * pertama yang di-scan sudah pasti gambar dengan sort_order terkecil milik
 * produk itu, terlepas dari interleaving dengan produk lain.
 */
async function getPrimaryImagesByProductIds(
  productIds: string[]
): Promise<Map<string, { url: string; altText: string | null }>> {
  const map = new Map<string, { url: string; altText: string | null }>();
  if (productIds.length === 0) return map;

  const supabase = createAdminClient();
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

/**
 * Query cart_items TIDAK memfilter status produk — item dengan produk yang
 * sudah tidak 'active' tetap dikembalikan (productIsAvailable: false) supaya
 * UI bisa menampilkannya dengan badge "tidak tersedia" alih-alih menghilang
 * diam-diam. Lihat docs/plan/epic-2-cart-wishlist.md Temuan #9.
 */
export async function getCartItems(guestSessionId: string): Promise<CartSummary> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("guest_session_id", guestSessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  const rows = ((data ?? []) as unknown as CartRow[]).filter((row) => row.products !== null);

  const productIds = [...new Set(rows.map((row) => row.product_id))];
  const imageByProduct = await getPrimaryImagesByProductIds(productIds);

  const items: CartItemDetail[] = rows.map((row) => {
    const product = row.products!;
    const variant = row.product_variants;
    const productIsAvailable = product.status === "active";
    const unitPrice = variant ? variant.price_override ?? product.base_price : product.base_price;
    const availableStock = variant ? variant.stock : product.stock;
    const weightGram = variant ? variant.weight_override ?? product.weight_gram : product.weight_gram;
    const image = imageByProduct.get(row.product_id);
    const lineSubtotal = productIsAvailable ? unitPrice * row.qty : 0;

    return {
      id: row.id,
      productId: row.product_id,
      productSlug: product.slug,
      productName: product.name,
      productIsAvailable,
      variantId: row.variant_id,
      variantName: variant?.name ?? null,
      imageUrl: image?.url ?? null,
      imageAlt: image?.altText ?? null,
      unitPrice,
      availableStock,
      qty: row.qty,
      lineSubtotal,
      weightGram,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + (item.productIsAvailable ? item.qty : 0), 0);

  return { items, subtotal, itemCount };
}

/** Versi ringan untuk badge header — hanya qty produk yang masih aktif. */
export async function getCartItemCount(guestSessionId: string): Promise<number> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select("qty, products!inner(status)")
    .eq("guest_session_id", guestSessionId)
    .eq("products.status", "active");

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + row.qty, 0);
}
