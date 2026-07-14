import { Price } from "@/components/ui/Price";
import type { CartItemDetail } from "@/lib/queries/cart";
import type { CalculatedFee } from "@/lib/fees";

type CheckoutOrderReviewProps = {
  items: CartItemDetail[];
  subtotal: number;
  shippingCost: number;
  fees: CalculatedFee[];
};

export function CheckoutOrderReview({ items, subtotal, shippingCost, fees }: CheckoutOrderReviewProps) {
  const feesTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const total = subtotal + shippingCost + feesTotal;

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900">Ringkasan Pesanan</h2>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{item.productName}</p>
              {item.variantName && <p className="text-xs text-neutral-500">{item.variantName}</p>}
              <p className="text-xs text-neutral-500">
                {item.qty} x <Price amount={item.unitPrice} />
              </p>
            </div>
            <Price amount={item.lineSubtotal} className="shrink-0 font-semibold text-neutral-900" />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-neutral-200 pt-4 text-sm">
        <div className="flex items-center justify-between text-neutral-600">
          <span>Subtotal</span>
          <Price amount={subtotal} />
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <span>Ongkos Kirim</span>
          <Price amount={shippingCost} />
        </div>
        {fees.map((fee) => (
          <div key={fee.feeId} className="flex items-center justify-between text-neutral-600">
            <span>{fee.label}</span>
            <Price amount={fee.amount} />
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between text-base font-bold text-neutral-900">
          <span>Total</span>
          <Price amount={total} />
        </div>
      </div>
    </div>
  );
}
