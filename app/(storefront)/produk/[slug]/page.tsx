import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductVariantSelector } from "@/components/storefront/ProductVariantSelector";
import {
  ProductSpecifications,
  getSpecificationEntries,
} from "@/components/storefront/ProductSpecifications";
import {
  VehicleCompatibilityTags,
  getVehicleCompatibilityLabels,
} from "@/components/storefront/VehicleCompatibilityTags";
import { ProductTabs } from "@/components/storefront/ProductTabs";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { readGuestSessionId } from "@/lib/guest-session";
import { getWishlistedProductIds } from "@/lib/queries/wishlist";

// ISR 60 detik — halaman ini tidak baca searchParams, jadi bisa di-ISR
// (lihat docs/plan/epic-1-landing-katalog-produk.md bagian 9).
export const revalidate = 60;

const RELATED_PRODUCT_LIMIT = 4;
const DEFAULT_DESCRIPTION = "Aksesoris lighting kendaraan berkualitas dari Bhinekaled.";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return {};

  const description = product.metaDescription || product.description?.slice(0, 155) || DEFAULT_DESCRIPTION;
  const primaryImage = product.images[0]?.url;
  const title = product.metaTitle || `${product.name} — Bhinekaled`;

  return {
    title,
    description,
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: primaryImage
      ? { title, description, images: [{ url: primaryImage }] }
      : { title, description },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [relatedProducts, wishlistedProductIds] = await Promise.all([
    fetchRelatedProducts(product.categoryId, product.id),
    fetchWishlistedProductIds(),
  ]);
  const specEntries = getSpecificationEntries(product.specifications);
  const vehicleTags = getVehicleCompatibilityLabels(product.vehicleCompatibility);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/produk"
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-red"
      >
        ← Kembali ke katalog
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.categoryName && (
            <Link
              href={product.categorySlug ? `/kategori/${product.categorySlug}` : "/produk"}
              className="text-xs font-semibold uppercase tracking-wide text-brand-red hover:underline"
            >
              {product.categoryName}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">{product.name}</h1>

          <div className="mt-4">
            <ProductVariantSelector
              productId={product.id}
              variants={product.variants}
              basePrice={product.basePrice}
              baseStock={product.stock}
              isWishlisted={wishlistedProductIds.has(product.id)}
            />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ProductTabs
          tabs={[
            {
              id: "deskripsi",
              label: "Deskripsi",
              content: (
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                  {product.description?.trim() || DEFAULT_DESCRIPTION}
                </p>
              ),
            },
            {
              id: "spesifikasi",
              label: "Spesifikasi",
              content:
                specEntries.length > 0 ? (
                  <ProductSpecifications specifications={product.specifications} />
                ) : (
                  <p className="text-sm text-neutral-500">Spesifikasi belum tersedia untuk produk ini.</p>
                ),
            },
            {
              id: "kompatibilitas",
              label: "Kompatibilitas",
              content:
                vehicleTags.length > 0 ? (
                  <VehicleCompatibilityTags tags={product.vehicleCompatibility} />
                ) : (
                  <p className="text-sm text-neutral-500">
                    Info kompatibilitas kendaraan belum tersedia untuk produk ini.
                  </p>
                ),
            },
          ]}
        />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">Produk Sejenis</h2>
          <ProductGrid products={relatedProducts} wishlistedProductIds={wishlistedProductIds} />
        </div>
      )}
    </div>
  );
}

async function fetchRelatedProducts(categoryId: string | null, excludeProductId: string) {
  try {
    return await getRelatedProducts(categoryId, excludeProductId, RELATED_PRODUCT_LIMIT);
  } catch {
    return [];
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
