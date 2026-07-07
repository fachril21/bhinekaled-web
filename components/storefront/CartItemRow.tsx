"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { CartQuantityStepper } from "@/components/storefront/CartQuantityStepper";
import { isUnoptimizedImage } from "@/lib/image";
import { removeCartItemForm, type CartActionResult } from "@/lib/actions/cart";
import type { CartItemDetail } from "@/lib/queries/cart";

type CartItemRowProps = {
  item: CartItemDetail;
};

const initialState: CartActionResult | null = null;

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const boundRemove = removeCartItemForm.bind(null, item.id);
  const [state, formAction, isPending] = useActionState(boundRemove, initialState);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex gap-4 border-b border-neutral-200 py-4 last:border-b-0">
      <Link href={`/produk/${item.productSlug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt || item.productName}
            fill
            sizes="80px"
            className="object-cover"
            unoptimized={isUnoptimizedImage(item.imageUrl)}
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link href={`/produk/${item.productSlug}`} className="text-sm font-semibold text-neutral-900 hover:text-brand-red">
          {item.productName}
        </Link>
        {item.variantName && <span className="text-xs text-neutral-500">{item.variantName}</span>}

        {!item.productIsAvailable ? (
          <span className="mt-1 inline-block w-max rounded-full bg-neutral-900/80 px-2 py-0.5 text-xs font-semibold text-white">
            Produk tidak lagi tersedia
          </span>
        ) : (
          <Price amount={item.unitPrice} className="text-sm font-bold text-brand-red" />
        )}

        <div className="mt-2 flex items-center gap-4">
          {item.productIsAvailable ? (
            <CartQuantityStepper cartItemId={item.id} qty={item.qty} availableStock={item.availableStock} />
          ) : (
            <span className="text-sm text-neutral-400">Qty: {item.qty}</span>
          )}

          <form action={formAction}>
            <button
              type="submit"
              disabled={isPending}
              className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-brand-red hover:underline disabled:opacity-40"
            >
              Hapus
            </button>
          </form>
        </div>
        {state && !state.success && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </div>

      {item.productIsAvailable && (
        <div className="text-right text-sm font-bold text-neutral-900">
          <Price amount={item.lineSubtotal} />
        </div>
      )}
    </div>
  );
}
