"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
          <HeartIcon filled={isWishlisted} />
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        d="M12 21s-7.5-4.6-10-9.3C0.4 8.2 2 4 6 4c2 0 3.5 1 4 2.2C10.5 5 12 4 14 4c4 0 5.6 4.2 4 7.7C19.5 16.4 12 21 12 21Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
