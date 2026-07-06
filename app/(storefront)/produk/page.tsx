import Link from "next/link";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ProductFilterBar } from "@/components/storefront/ProductFilterBar";
import { ProductPagination } from "@/components/storefront/ProductPagination";
import { getProductList, PRODUCT_PAGE_SIZE } from "@/lib/queries/products";
import { getCategoriesWithActiveProductCount } from "@/lib/queries/categories";
import { parseProductListParams, type RawSearchParams } from "@/lib/url-params";
import type { ProductListResult, ProductListParams } from "@/lib/queries/products";
import type { CategorySummary } from "@/lib/queries/categories";

export const metadata: Metadata = {
  title: "Katalog Produk — Bhinekaled",
  description:
    "Jelajahi seluruh katalog aksesoris lighting kendaraan Bhinekaled — lampu motor, lampu mobil, DRL & Angel Eyes, fog lamp, dan aksesoris LED lainnya.",
  alternates: { canonical: "/produk" },
};

type ProdukPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function ProdukPage({ searchParams }: ProdukPageProps) {
  const rawParams = await searchParams;
  const params = parseProductListParams(rawParams);

  const [productsResult, categoriesResult] = await Promise.all([
    fetchProductList(params),
    fetchCategories(),
  ]);

  const hasActiveFilter = Boolean(
    params.categorySlug || params.minPrice !== undefined || params.maxPrice !== undefined || params.search
  );

  const emptyMessage = productsResult.failed
    ? "Gagal memuat produk, coba muat ulang halaman."
    : hasActiveFilter
      ? "Tidak ada produk yang cocok dengan filter/pencarian Anda."
      : "Belum ada produk tersedia.";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-neutral-900">Semua Produk</h1>
      <p className="mt-1 text-sm text-neutral-500">{productsResult.data.totalCount} produk ditemukan</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <ProductFilterBar
          categories={categoriesResult.data}
          activeCategorySlug={params.categorySlug}
          maxPrice={params.maxPrice}
          sort={params.sort ?? "terbaru"}
          basePath="/produk"
        />

        <div>
          <ProductGrid
            products={productsResult.data.products}
            emptyMessage={emptyMessage}
            emptyActionHref={hasActiveFilter ? "/produk" : undefined}
            emptyActionLabel={hasActiveFilter ? "Reset filter" : undefined}
          />
          <ProductPagination
            currentPage={productsResult.data.page}
            totalPages={productsResult.data.totalPages}
            basePath="/produk"
          />
        </div>
      </div>
    </div>
  );
}

async function fetchProductList(
  params: ProductListParams
): Promise<{ data: ProductListResult; failed: boolean }> {
  try {
    return { data: await getProductList(params), failed: false };
  } catch {
    return {
      data: { products: [], totalCount: 0, page: 1, pageSize: PRODUCT_PAGE_SIZE, totalPages: 1 },
      failed: true,
    };
  }
}

async function fetchCategories(): Promise<{ data: CategorySummary[]; failed: boolean }> {
  try {
    return { data: await getCategoriesWithActiveProductCount(), failed: false };
  } catch {
    return { data: [], failed: true };
  }
}

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
      <Link href="/" className="hover:text-brand-red">
        Beranda
      </Link>
      <span className="mx-2">/</span>
      <span className="text-neutral-900">Katalog Produk</span>
    </nav>
  );
}
