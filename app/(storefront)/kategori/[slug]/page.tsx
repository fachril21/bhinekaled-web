import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ProductFilterBar } from "@/components/storefront/ProductFilterBar";
import { ProductPagination } from "@/components/storefront/ProductPagination";
import { getProductList, PRODUCT_PAGE_SIZE } from "@/lib/queries/products";
import { getCategoryBySlug, getCategoriesWithActiveProductCount } from "@/lib/queries/categories";
import { parseProductListParams, type RawSearchParams } from "@/lib/url-params";
import type { ProductListResult, ProductListParams } from "@/lib/queries/products";
import type { CategorySummary } from "@/lib/queries/categories";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return {};

  return {
    title: `${category.name} — Bhinekaled`,
    description: `Jelajahi produk kategori ${category.name} di Bhinekaled — aksesoris lighting kendaraan berkualitas.`,
    alternates: { canonical: `/kategori/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const rawParams = await searchParams;
  const listParams = parseProductListParams(rawParams, { categorySlug: category.slug });

  const [productsResult, categoriesResult] = await Promise.all([
    fetchProductList(listParams),
    fetchCategories(),
  ]);

  const hasActiveFilter = Boolean(
    listParams.minPrice !== undefined || listParams.maxPrice !== undefined || listParams.search
  );

  const emptyMessage = productsResult.failed
    ? "Gagal memuat produk, coba muat ulang halaman."
    : hasActiveFilter
      ? "Tidak ada produk yang cocok dengan filter Anda di kategori ini."
      : "Belum ada produk di kategori ini.";

  const basePath = `/kategori/${category.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb categoryName={category.name} />
      <h1 className="text-3xl font-bold text-neutral-900">{category.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">{productsResult.data.totalCount} produk ditemukan</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <ProductFilterBar
          categories={categoriesResult.data}
          activeCategorySlug={category.slug}
          maxPrice={listParams.maxPrice}
          sort={listParams.sort ?? "terbaru"}
          basePath={basePath}
          showCategoryFilter={false}
        />

        <div>
          <ProductGrid
            products={productsResult.data.products}
            emptyMessage={emptyMessage}
            emptyActionHref={hasActiveFilter ? basePath : undefined}
            emptyActionLabel={hasActiveFilter ? "Reset filter" : undefined}
          />
          <ProductPagination
            currentPage={productsResult.data.page}
            totalPages={productsResult.data.totalPages}
            basePath={basePath}
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

function Breadcrumb({ categoryName }: { categoryName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
      <Link href="/" className="hover:text-brand-red">
        Beranda
      </Link>
      <span className="mx-2">/</span>
      <Link href="/produk" className="hover:text-brand-red">
        Katalog Produk
      </Link>
      <span className="mx-2">/</span>
      <span className="text-neutral-900">{categoryName}</span>
    </nav>
  );
}
