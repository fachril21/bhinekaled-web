// Parsing & validasi searchParams untuk halaman listing produk
// (app/(storefront)/produk & app/(storefront)/kategori/[slug]).
//
// Dipusatkan di sini supaya kedua halaman tidak duplikasi logic validasi
// (lihat docs/plan/epic-1-landing-katalog-produk.md bagian 7 & 8.3 untuk
// daftar edge case yang ditangani).

import { PRODUCT_PAGE_SIZE, type ProductListParams, type ProductSortOption } from "@/lib/queries/products";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS: readonly ProductSortOption[] = ["terbaru", "termurah", "termahal"];
const SEARCH_MAX_LENGTH = 100;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isSafeInteger(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

function parseSort(value: string | undefined): ProductSortOption {
  if (value && (SORT_OPTIONS as string[]).includes(value)) {
    return value as ProductSortOption;
  }
  return "terbaru";
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

function parseSearch(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, SEARCH_MAX_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Parse searchParams mentah jadi ProductListParams yang sudah divalidasi.
 * `categorySlug` sengaja dipisah dari sini (di-set manual oleh caller di
 * halaman kategori) karena di /produk datang dari query param `kategori`,
 * sementara di /kategori/[slug] datang dari route param.
 */
export function parseProductListParams(
  raw: RawSearchParams,
  overrides?: { categorySlug?: string }
): ProductListParams {
  const min = parsePositiveInt(firstValue(raw.min));
  const max = parsePositiveInt(firstValue(raw.max));

  let minPrice = min;
  let maxPrice = max;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    categorySlug: overrides?.categorySlug ?? firstValue(raw.kategori),
    minPrice,
    maxPrice,
    sort: parseSort(firstValue(raw.sort)),
    search: parseSearch(firstValue(raw.q)),
    page: parsePage(firstValue(raw.page)),
  };
}

export { PRODUCT_PAGE_SIZE };
