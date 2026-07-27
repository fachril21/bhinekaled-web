import { createClient } from "@/lib/supabase/server";
import { escapeIlikePattern } from "@/lib/queries/products";
import type { Json, ProductStatus } from "@/types/database.types";

// Query admin — beda dari lib/queries/products.ts (Epic 1, publik, hanya
// status = 'active'): di sini admin melihat SEMUA status, mengandalkan RLS
// is_admin() sebagai lapisan proteksi (bukan filter aplikasi). Lihat
// docs/plan/epic-5-admin-kelola-produk-kategori.md Temuan #9 & bagian 3.3.

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  basePrice: number;
  stock: number;
  categoryName: string | null;
  imageUrl: string | null;
  variantCount: number;
  updatedAt: string;
};

type RelatedCategory = { name: string } | null;

type AdminListRow = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  base_price: number;
  stock: number;
  updated_at: string;
  categories: RelatedCategory;
  product_images: { url: string; sort_order: number }[] | null;
  product_variants: { id: string }[] | null;
};

const ADMIN_LIST_SELECT = `
  id,
  name,
  slug,
  status,
  base_price,
  stock,
  updated_at,
  categories ( name ),
  product_images ( url, sort_order ),
  product_variants ( id )
`;

function mapAdminListRow(row: AdminListRow): AdminProductListItem {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    basePrice: row.base_price,
    stock: row.stock,
    categoryName: row.categories?.name ?? null,
    imageUrl: images[0]?.url ?? null,
    variantCount: row.product_variants?.length ?? 0,
    updatedAt: row.updated_at,
  };
}

export async function getAdminProductList(params: {
  status?: ProductStatus | "semua";
  search?: string;
}): Promise<AdminProductListItem[]> {
  const supabase = await createClient();

  let query = supabase.from("products").select(ADMIN_LIST_SELECT).order("updated_at", { ascending: false });

  if (params.status && params.status !== "semua") {
    query = query.eq("status", params.status);
  }
  if (params.search) {
    query = query.ilike("name", `%${escapeIlikePattern(params.search)}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as AdminListRow[]).map(mapAdminListRow);
}

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  basePrice: number;
  stock: number;
  weightGram: number;
  status: ProductStatus;
  vehicleCompatibility: string[];
  specifications: { key: string; value: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
  images: { id: string; url: string; altText: string | null; sortOrder: number }[];
  variants: {
    id: string;
    name: string;
    sku: string | null;
    priceOverride: number | null;
    stock: number;
    weightOverride: number | null;
  }[];
};

type AdminDetailRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  stock: number;
  weight_gram: number;
  status: ProductStatus;
  vehicle_compatibility: Json;
  specifications: Json;
  meta_title: string | null;
  meta_description: string | null;
  product_images: { id: string; url: string; alt_text: string | null; sort_order: number }[] | null;
  product_variants:
    | {
        id: string;
        name: string;
        sku: string | null;
        price_override: number | null;
        stock: number;
        weight_override: number | null;
      }[]
    | null;
};

/** Fetch by id (bukan slug+status seperti getProductBySlug publik) — dipakai halaman edit admin. */
export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      category_id,
      base_price,
      stock,
      weight_gram,
      status,
      vehicle_compatibility,
      specifications,
      meta_title,
      meta_description,
      product_images ( id, url, alt_text, sort_order ),
      product_variants ( id, name, sku, price_override, stock, weight_override )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as AdminDetailRow;

  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ id: img.id, url: img.url, altText: img.alt_text, sortOrder: img.sort_order }));

  const variants = (row.product_variants ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    priceOverride: v.price_override,
    stock: v.stock,
    weightOverride: v.weight_override,
  }));

  const specificationsObject =
    row.specifications && typeof row.specifications === "object" && !Array.isArray(row.specifications)
      ? (row.specifications as Record<string, Json>)
      : {};
  const specifications = Object.entries(specificationsObject).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
  }));

  const vehicleCompatibility = Array.isArray(row.vehicle_compatibility)
    ? row.vehicle_compatibility.filter((v): v is string => typeof v === "string")
    : [];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.category_id,
    basePrice: row.base_price,
    stock: row.stock,
    weightGram: row.weight_gram,
    status: row.status,
    vehicleCompatibility,
    specifications,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    images,
    variants,
  };
}
