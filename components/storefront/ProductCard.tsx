import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { isUnoptimizedImage } from "@/lib/image";
import type { ProductListItem } from "@/lib/queries/products";

type ProductCardProps = {
  product: ProductListItem;
  isWishlisted: boolean;
  priority?: boolean;
};

export function ProductCard({ product, isWishlisted, priority = false }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/produk/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt || product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
              priority={priority}
              unoptimized={isUnoptimizedImage(product.imageUrl)}
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
            <span className="absolute left-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-xs font-semibold text-white">
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
        <WishlistButton productId={product.id} initialIsWishlisted={isWishlisted} />
      </div>

      <div className="px-3 pb-3">
        {product.hasVariants ? (
          <Link
            href={`/produk/${product.slug}`}
            className="block w-full rounded-full border border-brand-red px-4 py-2 text-center text-sm font-semibold text-brand-red transition hover:bg-brand-red hover:text-white"
          >
            Pilih Varian
          </Link>
        ) : (
          <AddToCartButton productId={product.id} variantId={null} disabled={!product.inStock} />
        )}
      </div>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-neutral-300">
      <Icon name="gallery" size={40} />
      <span className="sr-only">Gambar belum tersedia</span>
    </div>
  );
}
