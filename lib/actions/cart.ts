"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureGuestSessionId } from "@/lib/guest-session";

// Batas atas sanity check, bukan requirement bisnis — mencegah payload
// iseng qty besar. Lihat docs/plan/epic-2-cart-wishlist.md bagian 3.6.
const MAX_QTY = 99;

export type CartActionResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = "Gagal memproses, coba lagi.";

const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  qty: z.number().int().min(1).max(MAX_QTY),
});

/**
 * Tidak pakai .upsert() — unique(guest_session_id, product_id, variant_id)
 * tidak mendeteksi duplikat untuk variant_id NULL (Postgres menganggap NULL
 * selalu berbeda dari NULL lain). Read-modify-write eksplisit di sini
 * supaya qty produk tanpa varian benar-benar terakumulasi di baris yang
 * sama. Lihat docs/plan/epic-2-cart-wishlist.md Temuan #3.
 */
export async function addCartItem(input: {
  productId: string;
  variantId: string | null;
  qty: number;
}): Promise<CartActionResult> {
  const parsed = addCartItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Data tidak valid." };
  const { productId, variantId, qty } = parsed.data;

  try {
    const guestSessionId = await ensureGuestSessionId();
    const supabase = await createClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, status, stock")
      .eq("id", productId)
      .maybeSingle();
    if (productError) throw productError;
    if (!product || product.status !== "active") {
      return { success: false, error: "Produk tidak tersedia." };
    }

    let availableStock = product.stock;
    if (variantId) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("id, product_id, stock")
        .eq("id", variantId)
        .maybeSingle();
      if (variantError) throw variantError;
      if (!variant || variant.product_id !== productId) {
        return { success: false, error: "Varian tidak tersedia." };
      }
      availableStock = variant.stock;
    }

    if (availableStock <= 0) {
      return { success: false, error: "Stok habis." };
    }

    let existingQuery = supabase
      .from("cart_items")
      .select("id, qty")
      .eq("guest_session_id", guestSessionId)
      .eq("product_id", productId);
    existingQuery = variantId
      ? existingQuery.eq("variant_id", variantId)
      : existingQuery.is("variant_id", null);

    const { data: existing, error: existingError } = await existingQuery.maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      const nextQty = Math.min(existing.qty + qty, availableStock);
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ qty: nextQty })
        .eq("id", existing.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        guest_session_id: guestSessionId,
        product_id: productId,
        variant_id: variantId,
        qty: Math.min(qty, availableStock),
      });
      if (insertError) throw insertError;
    }

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}

const updateCartItemQtySchema = z.object({
  cartItemId: z.string().uuid(),
  qty: z.number().int(),
});

export async function updateCartItemQty(input: {
  cartItemId: string;
  qty: number;
}): Promise<CartActionResult> {
  const parsed = updateCartItemQtySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Data tidak valid." };
  const { cartItemId, qty } = parsed.data;

  // qty 0/negatif diperlakukan sebagai hapus — lebih intuitif daripada error
  // (lihat docs/plan/epic-2-cart-wishlist.md edge case #13).
  if (qty <= 0) {
    return removeCartItem(cartItemId);
  }

  try {
    const guestSessionId = await ensureGuestSessionId();
    const supabase = await createClient();

    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select("id, product_id, variant_id")
      .eq("id", cartItemId)
      .eq("guest_session_id", guestSessionId)
      .maybeSingle();
    if (itemError) throw itemError;
    if (!item) return { success: true }; // idempotent no-op — lihat edge case #12

    let availableStock: number;
    if (item.variant_id) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variant_id)
        .maybeSingle();
      if (variantError) throw variantError;
      availableStock = variant?.stock ?? 0;
    } else {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .maybeSingle();
      if (productError) throw productError;
      availableStock = product?.stock ?? 0;
    }

    if (availableStock <= 0) {
      return removeCartItem(cartItemId);
    }

    const finalQty = Math.min(qty, availableStock);
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ qty: finalQty })
      .eq("id", cartItemId)
      .eq("guest_session_id", guestSessionId);
    if (updateError) throw updateError;

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}

const removeCartItemSchema = z.string().uuid();

export async function removeCartItem(cartItemId: string): Promise<CartActionResult> {
  const parsed = removeCartItemSchema.safeParse(cartItemId);
  if (!parsed.success) return { success: false, error: "Data tidak valid." };

  try {
    const guestSessionId = await ensureGuestSessionId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", parsed.data)
      .eq("guest_session_id", guestSessionId);
    if (error) throw error;

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}

// Wrapper `(...fixedArgs, prevState, formData)` supaya bisa di-`.bind()` lalu
// dipakai langsung sebagai `<form action={...}>` + `useActionState` di client
// component — bound Server Action tetap serializable, jadi form tetap
// berfungsi tanpa JavaScript (lihat docs/plan/epic-2-cart-wishlist.md bagian
// 6.1 & edge case #19).

export async function addCartItemForm(
  productId: string,
  variantId: string | null,
  qty: number
): Promise<CartActionResult> {
  return addCartItem({ productId, variantId, qty });
}

/**
 * Dipakai CartQuantityStepper: satu form dengan 2 tombol submit (−/+), qty
 * tujuan dikirim lewat `name="qty" value={...}` di tombol yang diklik
 * (perilaku native HTML — tombol submit yang aktif otomatis ikut ke
 * FormData) supaya cukup 1 useActionState untuk kedua tombol sekaligus.
 */
export async function updateCartItemQtyForm(
  cartItemId: string,
  _prevState: CartActionResult | null,
  formData: FormData
): Promise<CartActionResult> {
  const qty = Number(formData.get("qty"));
  return updateCartItemQty({ cartItemId, qty });
}

export async function removeCartItemForm(cartItemId: string): Promise<CartActionResult> {
  return removeCartItem(cartItemId);
}
