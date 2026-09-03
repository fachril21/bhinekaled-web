"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { toggleWishlistItemForm, type WishlistActionResult } from "@/lib/actions/wishlist";

type WishlistButtonProps = {
  productId: string;
  initialIsWishlisted: boolean;
};

const initialState: WishlistActionResult | null = null;

// State akhir SELALU diambil dari response server (bukan optimistic lokal)
// — lihat docs/plan/epic-2-cart-wishlist.md Temuan #6 & keputusan bagian 9.
export function WishlistButton({ productId, initialIsWishlisted }: WishlistButtonProps) {
  const router = useRouter();
  const boundAction = toggleWishlistItemForm.bind(null, productId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const isWishlisted = state?.success ? state.isWishlisted : initialIsWishlisted;
  const errorMessage = state && !state.success ? state.error : null;

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="relative">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          aria-label={isWishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
          aria-pressed={isWishlisted}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white/90 shadow-sm transition ${
            isWishlisted ? "text-brand-red" : "text-neutral-500 hover:text-brand-red"
          }`}
        >
          <Icon name={isWishlisted ? "heartFilled" : "heart"} size={18} />
        </button>
      </form>
      {errorMessage && (
        <p
          role="status"
          className="absolute right-0 top-full mt-1 w-max rounded bg-neutral-900 px-2 py-1 text-xs text-white"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
