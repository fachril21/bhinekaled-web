"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureGuestSessionId } from "@/lib/guest-session";

export type WishlistActionResult =
  | { success: true; isWishlisted: boolean }
  | { success: false; error: string };

const GENERIC_ERROR = "Gagal memproses, coba lagi.";

const productIdSchema = z.string().uuid();

/**
 * Toggle: SELECT dulu baris existing, lalu delete/insert sesuai hasilnya.
 * Tidak pakai upsert supaya bisa benar-benar menghapus saat diklik kedua
 * kalinya (upsert hanya cocok untuk insert idempotent, bukan toggle) —
 * lihat docs/plan/epic-2-cart-wishlist.md Temuan #6.
 */
export async function toggleWishlistItem(productId: string): Promise<WishlistActionResult> {
  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return { success: false, error: "Data tidak valid." };

  try {
    const guestSessionId = await ensureGuestSessionId();
    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("guest_session_id", guestSessionId)
      .eq("product_id", parsed.data)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      const { error: deleteError } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", existing.id);
      if (deleteError) throw deleteError;
      revalidatePath("/wishlist");
      return { success: true, isWishlisted: false };
    }

    // Produk boleh apa saja (termasuk yang sedang tidak aktif) — wishlist
    // adalah catatan minat, bukan aksi transaksional seperti cart.
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", parsed.data)
      .maybeSingle();
    if (productError) throw productError;
    if (!product) return { success: false, error: "Produk tidak ditemukan." };

    const { error: insertError } = await supabase.from("wishlist_items").insert({
      guest_session_id: guestSessionId,
      product_id: parsed.data,
    });
    if (insertError) throw insertError;

    revalidatePath("/wishlist");
    return { success: true, isWishlisted: true };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}

const wishlistItemIdSchema = z.string().uuid();

export async function removeWishlistItem(wishlistItemId: string): Promise<WishlistActionResult> {
  const parsed = wishlistItemIdSchema.safeParse(wishlistItemId);
  if (!parsed.success) return { success: false, error: "Data tidak valid." };

  try {
    const guestSessionId = await ensureGuestSessionId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", parsed.data)
      .eq("guest_session_id", guestSessionId);
    if (error) throw error;

    revalidatePath("/wishlist");
    return { success: true, isWishlisted: false };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}

// Wrapper `(...fixedArgs, prevState, formData)` untuk `.bind()` + form action
// di client — sama rasional dengan lib/actions/cart.ts.

export async function toggleWishlistItemForm(productId: string): Promise<WishlistActionResult> {
  return toggleWishlistItem(productId);
}

export async function removeWishlistItemForm(wishlistItemId: string): Promise<WishlistActionResult> {
  return removeWishlistItem(wishlistItemId);
}
