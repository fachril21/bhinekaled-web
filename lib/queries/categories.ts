import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

export type CategorySummary = Category & {
  activeProductCount: number;
};

/**
 * Kategori top-level (parent_id null) yang punya minimal 1 produk aktif,
 * dipakai untuk section "Kategori Unggulan" di homepage.
 *
 * ASUMSI (lihat docs/plan/epic-1-landing-katalog-produk.md #3): schema tidak
 * punya kolom "is_featured", jadi "unggulan" didefinisikan sebagai kategori
 * top-level yang punya produk aktif, urut nama, dibatasi `limit`.
 */
export async function getTopLevelCategoriesWithActiveProducts(
  limit: number
): Promise<CategorySummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, products!inner(id, status)")
    .is("parent_id", null)
    .eq("products.status", "active")
    .order("name", { ascending: true });

  if (error) throw error;

  const withCounts = (data ?? []).map((row) => {
    const products = (row as unknown as { products: { id: string }[] }).products ?? [];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parent_id,
      activeProductCount: products.length,
    };
  });

  return withCounts.slice(0, limit);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    parentId: data.parent_id,
  };
}

/**
 * Semua kategori (termasuk sub-kategori) beserta jumlah produk aktifnya,
 * dipakai untuk sidebar filter di /produk (lihat docs/screen/List All Product.png).
 * Kategori tanpa produk aktif tetap muncul dengan count 0 (bukan disembunyikan)
 * supaya sidebar tidak "meloncat" saat admin baru menambah kategori kosong.
 */
export async function getCategoriesWithActiveProductCount(): Promise<CategorySummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, products(id, status)")
    .eq("products.status", "active")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const products = (row as unknown as { products: { id: string }[] | null }).products ?? [];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parent_id,
      activeProductCount: products.length,
    };
  });
}

/** Semua kategori, dipakai untuk dropdown/sidebar filter di listing produk. */
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
  }));
}
