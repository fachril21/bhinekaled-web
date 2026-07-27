"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productFormSchema, type ProductFormValues } from "@/lib/validations";
import { isUniqueViolation } from "@/lib/db-errors";
import { deleteProductImageFiles } from "@/lib/storage/delete-product-images";

export type ProductActionResult =
  | { success: true; productId: string }
  | {
      success: false;
      error: string;
      productId?: string;
      fieldErrors?: Partial<Record<"name" | "slug", string>>;
    };

export type ProductDeleteActionResult = { success: true } | { success: false; error: string };

/**
 * Dipanggil langsung sebagai fungsi async dari ProductForm (bukan
 * <form action> + FormData — payload nested tidak cocok untuk FormData).
 * Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md Temuan #8 & 3.9.
 *
 * Bukan transaksi atomik lintas tabel (products/product_images/
 * product_variants) — kalau langkah setelah upsert `products` gagal,
 * `productId` tetap dikembalikan supaya submit ulang berikutnya bersifat
 * update (idempotent), bukan insert baru. Lihat Temuan #4.
 */
export async function saveProductAction(input: ProductFormValues): Promise<ProductActionResult> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Data tidak valid, cek kembali form." };
  const v = parsed.data;

  const supabase = await createClient();

  const productRow = {
    name: v.name,
    slug: v.slug,
    description: v.description ?? null,
    category_id: v.categoryId,
    base_price: v.basePrice,
    stock: v.stock,
    weight_gram: v.weightGram,
    status: v.status,
    vehicle_compatibility: v.vehicleCompatibility,
    specifications: Object.fromEntries(v.specifications.map((s) => [s.key, s.value])),
    meta_title: v.metaTitle ?? null,
    meta_description: v.metaDescription ?? null,
  };

  let productId = v.id;
  try {
    if (productId) {
      const { error } = await supabase.from("products").update(productRow).eq("id", productId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("products").insert(productRow).select("id").single();
      if (error) throw error;
      productId = data.id;
    }
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: "Slug sudah dipakai, ganti nama atau slug secara manual.",
        fieldErrors: { slug: "Slug sudah dipakai." },
      };
    }
    return { success: false, error: "Gagal menyimpan produk, coba lagi." };
  }

  try {
    if (v.deletedImages.length > 0) {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .in(
          "id",
          v.deletedImages.map((i) => i.id)
        );
      if (error) throw error;
      await deleteProductImageFiles(v.deletedImages.map((i) => i.url)); // best-effort
    }

    if (v.deletedVariantIds.length > 0) {
      const { error } = await supabase.from("product_variants").delete().in("id", v.deletedVariantIds);
      if (error) throw error;
    }

    for (const image of v.images) {
      if (image.id) {
        const { error } = await supabase
          .from("product_images")
          .update({ alt_text: image.altText ?? null, sort_order: image.sortOrder })
          .eq("id", image.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_images").insert({
          product_id: productId,
          url: image.url,
          alt_text: image.altText ?? null,
          sort_order: image.sortOrder,
        });
        if (error) throw error;
      }
    }

    for (const variant of v.variants) {
      const row = {
        product_id: productId,
        name: variant.name,
        sku: variant.sku ?? null,
        price_override: variant.priceOverride,
        stock: variant.stock,
        weight_override: variant.weightOverride,
      };
      if (variant.id) {
        const { error } = await supabase.from("product_variants").update(row).eq("id", variant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_variants").insert(row);
        if (error) throw error;
      }
    }
  } catch {
    return {
      success: false,
      error: "Produk tersimpan, tapi sebagian gambar/varian gagal disimpan. Coba submit ulang.",
      productId,
    };
  }

  // AC "perubahan status langsung berefek ke visibilitas" — revalidasi luas
  // (bukan path spesifik) karena kategori/produk yang terdampak bisa
  // berubah-ubah (produk pindah kategori, dst). Lihat bagian 9.
  revalidatePath("/", "layout");
  revalidatePath("/admin/produk");

  return { success: true, productId };
}

/**
 * `products.on delete cascade` menghapus product_images/product_variants
 * DAN cart_items terkait (customer kehilangan item itu dari keranjang)
 * — order_items aman (`on delete set null` + snapshot). Konfirmasi +
 * peringatan konsekuensi ditampilkan di UI sebelum action ini dipanggil.
 * Lihat Temuan #5.
 */
export async function deleteProductAction(id: string): Promise<ProductDeleteActionResult> {
  const supabase = await createClient();

  const { data: images } = await supabase.from("product_images").select("url").eq("product_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: "Gagal menghapus produk." };

  if (images && images.length > 0) {
    await deleteProductImageFiles(images.map((i) => i.url)); // best-effort, setelah DB delete sukses
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/produk");
  return { success: true };
}
