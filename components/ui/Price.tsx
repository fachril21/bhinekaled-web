import { formatRupiah } from "@/lib/format";

type PriceProps = {
  amount: number;
  className?: string;
};

export function Price({ amount, className }: PriceProps) {
  return <span className={className}>{formatRupiah(amount)}</span>;
}
