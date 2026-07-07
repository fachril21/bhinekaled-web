"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { isUnoptimizedImage } from "@/lib/image";
import { removeWishlistItemForm, type WishlistActionResult } from "@/lib/actions/wishlist";
import type { WishlistItemDetail } from "@/lib/queries/wishlist";

type WishlistItemCardProps = {
  item: WishlistItemDetail;
};

const initialState: WishlistActionResult | null = null;

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const router = useRouter();
  const boundRemove = removeWishlistItemForm.bind(null, item.id);
  const [state, formAction, isPending] = useActionState(boundRemove, initialState);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <Link href={`/produk/${item.productSlug}`} className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt || item.productName}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            unoptimized={isUnoptimizedImage(item.imageUrl)}
          />
        ) : null}
        {!item.productIsAvailable && (
          <span className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-xs font-semibold text-white">
            Tidak tersedia
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/produk/${item.productSlug}`} className="line-clamp-2 text-sm font-semibold text-neutral-900">
          {item.productName}
        </Link>
        <Price amount={item.basePrice} className="text-base font-bold text-brand-red" />
      </div>

      <div className="px-3 pb-3">
        <form action={formAction}>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-brand-red hover:text-brand-red disabled:opacity-40"
          >
            Hapus dari Wishlist
          </button>
        </form>
        {state && !state.success && <p className="mt-1 text-center text-xs text-red-600">{state.error}</p>}
      </div>
    </div>
  );
}
