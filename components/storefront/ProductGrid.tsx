import type { ProductListItem } from "@/lib/queries/products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState } from "@/components/storefront/EmptyState";

type ProductGridProps = {
  products: ProductListItem[];
  emptyMessage?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
};

export function ProductGrid({
  products,
  emptyMessage = "Belum ada produk tersedia.",
  emptyActionHref,
  emptyActionLabel,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState message={emptyMessage} actionHref={emptyActionHref} actionLabel={emptyActionLabel} />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
