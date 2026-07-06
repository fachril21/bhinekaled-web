import Link from "next/link";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { getNewestProducts } from "@/lib/queries/products";
import { getTopLevelCategoriesWithActiveProducts } from "@/lib/queries/categories";
import type { ProductListItem } from "@/lib/queries/products";
import type { CategorySummary } from "@/lib/queries/categories";

// Homepage tidak baca searchParams/cookies, jadi aman di-ISR (lihat
// docs/plan/epic-1-landing-katalog-produk.md bagian 9).
export const revalidate = 60;

const FEATURED_CATEGORY_LIMIT = 6;
const NEWEST_PRODUCT_LIMIT = 8;

const TRUST_POINTS = ["Garansi Resmi", "Plug & Play", "Pengiriman Nationwide", "Kualitas Teruji"];

export default async function HomePage() {
  const [categoriesResult, productsResult] = await Promise.all([
    fetchFeaturedCategories(),
    fetchNewestProducts(),
  ]);

  return (
    <>
      <Hero />
      <TrustBar />

      {categoriesResult.failed && (
        <p className="mx-auto max-w-6xl px-4 pt-8 text-sm text-neutral-500">
          Gagal memuat kategori, coba muat ulang halaman.
        </p>
      )}
      {!categoriesResult.failed && categoriesResult.data.length > 0 && (
        <FeaturedCategoriesSection categories={categoriesResult.data} />
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="border-l-4 border-brand-red pl-3 text-2xl font-bold text-neutral-900">
            Produk Terbaru
          </h2>
          <Link href="/produk" className="text-sm font-semibold text-brand-red hover:underline">
            Semua produk →
          </Link>
        </div>
        <ProductGrid
          products={productsResult.data}
          emptyMessage={
            productsResult.failed
              ? "Gagal memuat produk, coba muat ulang halaman."
              : "Belum ada produk. Admin belum menambahkan produk apapun."
          }
        />
      </section>
    </>
  );
}

async function fetchFeaturedCategories(): Promise<{ data: CategorySummary[]; failed: boolean }> {
  try {
    return { data: await getTopLevelCategoriesWithActiveProducts(FEATURED_CATEGORY_LIMIT), failed: false };
  } catch {
    return { data: [], failed: true };
  }
}

async function fetchNewestProducts(): Promise<{ data: ProductListItem[]; failed: boolean }> {
  try {
    return { data: await getNewestProducts(NEWEST_PRODUCT_LIMIT), failed: false };
  } catch {
    return { data: [], failed: true };
  }
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 h-105 w-105 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(230,33,42,0.35)_0%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-red">
          <span className="h-px w-6 bg-brand-red" /> Spesialis LED Kendaraan
        </p>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          Terang. <span className="text-brand-red">Tahan.</span> Terpercaya.
        </h1>
        <p className="mt-4 max-w-xl text-base text-neutral-300">
          Lampu LED &amp; aksesoris pencahayaan kendaraan berkualitas tinggi untuk kebutuhan
          harian Anda.
        </p>
        <Link
          href="/produk"
          className="mt-8 inline-block rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Belanja Sekarang →
        </Link>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="bg-brand-red">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 text-xs font-semibold text-white sm:text-sm">
        {TRUST_POINTS.map((point) => (
          <span key={point} className="flex items-center gap-1.5">
            <CheckIcon /> {point}
          </span>
        ))}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturedCategoriesSection({ categories }: { categories: CategorySummary[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Kategori Produk</h2>
        <Link href="/produk" className="text-sm font-semibold text-brand-red hover:underline">
          Lihat semua →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/kategori/${category.slug}`}
            className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 px-4 py-6 text-center transition hover:border-brand-red hover:shadow-sm"
          >
            <span className="font-semibold text-neutral-900">{category.name}</span>
            <span className="text-xs text-neutral-500">{category.activeProductCount} produk</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
