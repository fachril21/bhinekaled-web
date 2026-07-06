"use client";

import { useMemo, useState } from "react";
import { Price } from "@/components/ui/Price";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import type { ProductVariant } from "@/lib/queries/products";

type ProductVariantSelectorProps = {
  variants: ProductVariant[];
  basePrice: number;
  baseStock: number;
};

// Logika harga/stok mengikuti komentar docs/schema.sql: products.stock hanya
// dipakai kalau produk TIDAK punya varian. Lihat docs/plan bagian 6.
export function ProductVariantSelector({ variants, basePrice, baseStock }: ProductVariantSelectorProps) {
  const hasVariants = variants.length > 0;

  const defaultVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find((v) => v.stock > 0) ?? variants[0];
  }, [variants, hasVariants]);

  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = hasVariants
    ? variants.find((v) => v.id === selectedVariantId) ?? defaultVariant
    : null;

  const displayedPrice = hasVariants ? selectedVariant?.priceOverride ?? basePrice : basePrice;
  const displayedStock = hasVariants ? selectedVariant?.stock ?? 0 : baseStock;
  const isOutOfStock = displayedStock <= 0;

  function handleSelectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    setQuantity(1);
  }

  function adjustQuantity(delta: number) {
    setQuantity((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (next > displayedStock) return displayedStock || 1;
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-neutral-100 px-4 py-3">
        <Price amount={displayedPrice} className="text-2xl font-extrabold text-brand-red sm:text-3xl" />
        <p className="mt-1 text-sm text-neutral-600">
          {isOutOfStock ? (
            <span className="font-semibold text-neutral-500">Stok Habis</span>
          ) : (
            <>Stok: {displayedStock}</>
          )}
        </p>
      </div>

      {hasVariants && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">Pilih Varian:</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = variant.id === selectedVariant?.id;
              const isDisabled = variant.stock <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectVariant(variant.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "border-brand-red text-brand-red"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
                  } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900">Jumlah:</h3>
        <div className="inline-flex items-center rounded-full border border-neutral-300">
          <button
            type="button"
            onClick={() => adjustQuantity(-1)}
            disabled={isOutOfStock || quantity <= 1}
            aria-label="Kurangi jumlah"
            className="px-3 py-1.5 text-neutral-600 disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => adjustQuantity(1)}
            disabled={isOutOfStock || quantity >= displayedStock}
            aria-label="Tambah jumlah"
            className="px-3 py-1.5 text-neutral-600 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <AddToCartButton disabled={isOutOfStock} />
        </div>
        <WishlistButton />
      </div>
    </div>
  );
}
