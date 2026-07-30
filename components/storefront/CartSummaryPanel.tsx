import Link from "next/link";
import { Price } from "@/components/ui/Price";

type CartSummaryPanelProps = {
  subtotal: number;
  hasAvailableItems: boolean;
};

export function CartSummaryPanel({ subtotal, hasAvailableItems }: CartSummaryPanelProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span>Subtotal</span>
        <Price amount={subtotal} className="text-base font-bold text-neutral-900" />
      </div>
      <p className="mt-1 text-xs text-neutral-500">Ongkos kirim dihitung di halaman checkout.</p>

      {hasAvailableItems ? (
        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-full bg-brand-red px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-red-hover"
        >
          Lanjut ke Checkout
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 w-full cursor-not-allowed rounded-full bg-neutral-300 px-4 py-2.5 text-center text-sm font-semibold text-white"
        >
          Lanjut ke Checkout
        </button>
      )}
    </div>
  );
}
