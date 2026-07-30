"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemQtyForm, type CartActionResult } from "@/lib/actions/cart";

type CartQuantityStepperProps = {
  cartItemId: string;
  qty: number;
  availableStock: number;
};

const initialState: CartActionResult | null = null;

export function CartQuantityStepper({ cartItemId, qty, availableStock }: CartQuantityStepperProps) {
  const router = useRouter();
  const boundAction = updateCartItemQtyForm.bind(null, cartItemId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div>
      <form action={formAction} className="inline-flex items-center rounded-full border border-neutral-300">
        <button
          type="submit"
          name="qty"
          value={qty - 1}
          disabled={isPending}
          aria-label={qty <= 1 ? "Hapus item" : "Kurangi jumlah"}
          className="flex min-h-11 min-w-11 items-center justify-center px-3 text-neutral-600 disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-sm font-semibold">{qty}</span>
        <button
          type="submit"
          name="qty"
          value={qty + 1}
          disabled={isPending || qty >= availableStock}
          aria-label="Tambah jumlah"
          className="flex min-h-11 min-w-11 items-center justify-center px-3 text-neutral-600 disabled:opacity-40"
        >
          +
        </button>
      </form>
      {state && !state.success && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
