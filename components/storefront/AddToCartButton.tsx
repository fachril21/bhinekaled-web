"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addCartItemForm, type CartActionResult } from "@/lib/actions/cart";

type AddToCartButtonProps = {
  productId: string;
  variantId: string | null;
  quantity?: number;
  disabled?: boolean;
};

const initialState: CartActionResult | null = null;

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  disabled = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const boundAction = addCartItemForm.bind(null, productId, variantId, quantity);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={disabled || isPending}
          className="w-full rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {disabled ? "Stok Habis" : isPending ? "Menambahkan..." : "+ Keranjang"}
        </button>
      </form>
      {state && (
        <p
          role="status"
          className={`mt-1 text-center text-xs ${state.success ? "text-green-600" : "text-red-600"}`}
        >
          {state.success ? "Ditambahkan ke keranjang" : state.error}
        </p>
      )}
    </div>
  );
}
