import { createClient } from "@/lib/supabase/server";

export type AdminCategoryListItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  childCategoryCount: number;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

/**
 * Dipakai halaman kategori admin — perlu productCount/childCategoryCount
 * untuk dialog konfirmasi hapus (docs/plan/epic-5-admin-kelola-produk-kategori.md
 * Temuan #6). Dihitung di aplikasi lewat 2 query terpisah (bukan agregasi
 * SQL bertingkat) supaya tetap mudah dibaca untuk jumlah kategori yang
 * realistis di toko ini (puluhan, bukan ribuan).
 */
export async function getAdminCategoryList(): Promise<AdminCategoryListItem[]> {
  const supabase = await createClient();

  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name, slug, parent_id").order("name", { ascending: true }),
      supabase.from("products").select("category_id"),
    ]);

  if (categoriesError) throw categoriesError;
  if (productsError) throw productsError;

  const rows = (categories ?? []) as CategoryRow[];
  const nameById = new Map(rows.map((c) => [c.id, c.name]));

  const productCountByCategory = new Map<string, number>();
  for (const product of products ?? []) {
    if (!product.category_id) continue;
    productCountByCategory.set(product.category_id, (productCountByCategory.get(product.category_id) ?? 0) + 1);
  }

  const childCountByParent = new Map<string, number>();
  for (const category of rows) {
    if (!category.parent_id) continue;
    childCountByParent.set(category.parent_id, (childCountByParent.get(category.parent_id) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    parentName: row.parent_id ? (nameById.get(row.parent_id) ?? null) : null,
    productCount: productCountByCategory.get(row.id) ?? 0,
    childCategoryCount: childCountByParent.get(row.id) ?? 0,
  }));
}
