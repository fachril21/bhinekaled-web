import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import type { ProductListItem } from "@/lib/queries/products";

type ProductCardProps = {
  product: ProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-md">
      <Link href={`/produk/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt || product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder />
          )}

          {product.isNew && (
            <span className="absolute left-2 top-2 rounded-full bg-brand-ink px-2 py-0.5 text-xs font-semibold text-white">
              BARU
            </span>
          )}
          {!product.inStock && (
            <span className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-xs font-semibold text-white">
              Stok Habis
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {product.categoryName && (
            <span className="text-xs text-neutral-500">{product.categoryName}</span>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">{product.name}</h3>
          <Price amount={product.basePrice} className="mt-auto text-base font-bold text-brand-red" />
        </div>
      </Link>

      <div className="absolute right-2 top-2 z-10">
        <WishlistButton />
      </div>

      <div className="px-3 pb-3">
        <AddToCartButton disabled={!product.inStock} />
      </div>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-neutral-300">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span className="sr-only">Gambar belum tersedia</span>
    </div>
  );
}
