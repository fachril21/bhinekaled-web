import Link from "next/link";
import type { ReactNode } from "react";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { getNewestProducts } from "@/lib/queries/products";
import { getTopLevelCategoriesWithActiveProducts } from "@/lib/queries/categories";
import { readGuestSessionId } from "@/lib/guest-session";
import { getWishlistedProductIds } from "@/lib/queries/wishlist";
import type { ProductListItem } from "@/lib/queries/products";
import type { CategorySummary } from "@/lib/queries/categories";

// Homepage membaca cookies (guest session untuk wishlist state), jadi
// route ini selalu dynamic per request — tidak ada `revalidate` yang bisa
// diterapkan di sini (sudah dicatat sebagai temuan serupa di Epic 1
// bagian 12 untuk cookies() di lib/supabase/server.ts).
const FEATURED_CATEGORY_LIMIT = 6;
const NEWEST_PRODUCT_LIMIT = 8;

export default async function HomePage() {
  const [categoriesResult, productsResult, wishlistedProductIds] = await Promise.all([
    fetchFeaturedCategories(),
    fetchNewestProducts(),
    fetchWishlistedProductIds(),
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
          <div>
            <span aria-hidden="true" className="mb-2 block h-1 w-10 rounded-full bg-brand-red" />
            <h2 className="text-2xl font-bold text-neutral-900">Produk Terbaru</h2>
          </div>
          <Link href="/produk" className="text-sm font-semibold text-brand-red hover:underline">
            Semua produk →
          </Link>
        </div>
        <ProductGrid
          products={productsResult.data}
          wishlistedProductIds={wishlistedProductIds}
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

async function fetchWishlistedProductIds(): Promise<Set<string>> {
  const guestSessionId = await readGuestSessionId();
  if (!guestSessionId) return new Set();

  try {
    return await getWishlistedProductIds(guestSessionId);
  } catch {
    return new Set();
  }
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-red">
      <SunburstDecoration />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          Terang. Tahan. Terpercaya.
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/85">
          Lampu LED &amp; aksesoris pencahayaan kendaraan berkualitas tinggi untuk kebutuhan
          harian Anda — spesialis lighting kendaraan.
        </p>
        <Link
          href="/produk"
          className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-red shadow-lg transition hover:bg-neutral-100"
        >
          Belanja Sekarang →
        </Link>
      </div>
    </section>
  );
}

function SunburstDecoration() {
  const rayCount = 16;
  const rays = Array.from({ length: rayCount }, (_, i) => (i * 360) / rayCount);
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] opacity-[0.14] sm:-right-20 sm:-top-20"
      viewBox="0 0 200 200"
    >
      {rays.map((angle) => (
        <line
          key={angle}
          x1="100"
          y1="100"
          x2="100"
          y2="4"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
    </svg>
  );
}

function TrustBar() {
  const TRUST_ITEMS: { label: string; icon: ReactNode }[] = [
    { label: "Garansi Resmi", icon: <ShieldIcon /> },
    { label: "Plug & Play", icon: <PlugIcon /> },
    { label: "Pengiriman Nationwide", icon: <TruckIcon /> },
    { label: "Kualitas Teruji", icon: <BadgeCheckIcon /> },
  ];

  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-8 sm:grid-cols-4 sm:gap-4">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 p-4 text-center shadow-sm transition hover:shadow-lg sm:flex-row sm:text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
              {item.icon}
            </span>
            <span className="text-xs font-semibold text-neutral-900 sm:text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3 4 6v6c0 4.4 3.2 8.2 8 9 4.8-.8 8-4.6 8-9V6l-8-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="7" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="17" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <path d="M3 6h11v9H3z" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v2h-7z" strokeLinejoin="round" />
    </svg>
  );
}

function BadgeCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="10" r="7" strokeLinejoin="round" />
      <path d="m9 10 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m8 16-1.5 6L12 19l5.5 3L16 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturedCategoriesSection({ categories }: { categories: CategorySummary[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span aria-hidden="true" className="mb-2 block h-1 w-10 rounded-full bg-brand-red" />
          <h2 className="text-2xl font-bold text-neutral-900">Kategori Produk</h2>
        </div>
        <Link href="/produk" className="text-sm font-semibold text-brand-red hover:underline">
          Lihat semua →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/kategori/${category.slug}`}
            className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white px-4 py-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-red hover:shadow-lg"
          >
            <span className="font-semibold text-neutral-900">{category.name}</span>
            <span className="text-xs text-neutral-500">{category.activeProductCount} produk</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
