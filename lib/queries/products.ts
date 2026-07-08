import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export type ProductSortOption = "terbaru" | "termurah" | "termahal";

export const PRODUCT_PAGE_SIZE = 24;
const NEW_PRODUCT_WINDOW_DAYS = 14;

export type ProductListParams = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortOption;
  search?: string;
  page?: number;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  isNew: boolean;
  inStock: boolean;
  hasVariants: boolean;
  createdAt: string;
};

export type ProductListResult = {
  products: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string | null;
  priceOverride: number | null;
  stock: number;
  attributes: Json;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  stock: number;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  vehicleCompatibility: Json;
  specifications: Json;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

type RelatedCategory = { name: string; slug: string } | null;

type ListRow = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  stock: number;
  created_at: string;
  categories: RelatedCategory;
  product_images: { url: string; alt_text: string | null; sort_order: number }[] | null;
  product_variants: { stock: number }[] | null;
};

const LIST_SELECT = `
  id,
  name,
  slug,
  base_price,
  stock,
  created_at,
  categories ( name, slug ),
  product_images ( url, alt_text, sort_order ),
  product_variants ( stock )
`;

function isProductNew(createdAt: string): boolean {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs >= 0 && ageMs < NEW_PRODUCT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

/** Escape wildcard ILIKE (`%`, `_`) supaya input customer tidak berlaku sebagai wildcard SQL. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function mapListRow(row: ListRow): ProductListItem {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const primaryImage = images[0];
  const variants = row.product_variants ?? [];
  const hasVariants = variants.length > 0;
  const inStock = hasVariants ? variants.some((v) => v.stock > 0) : row.stock > 0;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    basePrice: row.base_price,
    categoryName: row.categories?.name ?? null,
    categorySlug: row.categories?.slug ?? null,
    imageUrl: primaryImage?.url ?? null,
    imageAlt: primaryImage?.alt_text ?? null,
    isNew: isProductNew(row.created_at),
    inStock,
    hasVariants,
    createdAt: row.created_at,
  };
}

/** Produk terbaru untuk homepage — lihat AC Epic 1 "produk terbaru dari data Supabase". */
export async function getNewestProducts(limit: number): Promise<ProductListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as ListRow[]).map(mapListRow);
}

/**
 * Listing produk dengan filter kategori/harga, sort, search, dan pagination.
 * Semua parameter divalidasi di lib/url-params.ts sebelum sampai ke sini,
 * tapi fungsi ini tetap defensif (clamp page, dsb) — lihat
 * docs/plan/epic-1-landing-katalog-produk.md bagian 8.3 untuk daftar edge case.
 */
export async function getProductList(params: ProductListParams): Promise<ProductListResult> {
  const supabase = await createClient();
  const pageSize = PRODUCT_PAGE_SIZE;
  const page = Math.max(1, Math.floor(params.page ?? 1));

  let categoryId: string | undefined;
  if (params.categorySlug) {
    const { data: categoryRow, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categorySlug)
      .maybeSingle();

    if (categoryError) throw categoryError;

    if (!categoryRow) {
      // Slug kategori tidak match apapun — hasil kosong, bukan error (AC 8.2 #11/#27).
      return { products: [], totalCount: 0, page, pageSize, totalPages: 1 };
    }
    categoryId = categoryRow.id;
  }

  let query = supabase
    .from("products")
    .select(LIST_SELECT, { count: "exact" })
    .eq("status", "active");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (params.minPrice !== undefined) {
    query = query.gte("base_price", params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte("base_price", params.maxPrice);
  }
  if (params.search) {
    const pattern = `%${escapeIlikePattern(params.search)}%`;
    query = query.ilike("name", pattern);
  }

  switch (params.sort) {
    case "termurah":
      query = query.order("base_price", { ascending: true });
      break;
    case "termahal":
      query = query.order("base_price", { ascending: false });
      break;
    case "terbaru":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    products: ((data ?? []) as unknown as ListRow[]).map(mapListRow),
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      category_id,
      name,
      slug,
      description,
      base_price,
      stock,
      vehicle_compatibility,
      specifications,
      meta_title,
      meta_description,
      created_at,
      updated_at,
      categories ( name, slug ),
      product_images ( id, url, alt_text, sort_order ),
      product_variants ( id, name, sku, price_override, stock, attributes )
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    category_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    base_price: number;
    stock: number;
    vehicle_compatibility: Json;
    specifications: Json;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    updated_at: string;
    categories: RelatedCategory;
    product_images: { id: string; url: string; alt_text: string | null; sort_order: number }[] | null;
    product_variants: {
      id: string;
      name: string;
      sku: string | null;
      price_override: number | null;
      stock: number;
      attributes: Json;
    }[] | null;
  };

  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ id: img.id, url: img.url, altText: img.alt_text, sortOrder: img.sort_order }));

  const variants = (row.product_variants ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    priceOverride: v.price_override,
    stock: v.stock,
    attributes: v.attributes,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    basePrice: row.base_price,
    stock: row.stock,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    categorySlug: row.categories?.slug ?? null,
    vehicleCompatibility: row.vehicle_compatibility,
    specifications: row.specifications,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images,
    variants,
  };
}

/** Produk sejenis (kategori sama) untuk section "Produk Sejenis" di halaman detail. */
export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit: number
): Promise<ProductListItem[]> {
  if (!categoryId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as ListRow[]).map(mapListRow);
}
