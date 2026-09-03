import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ProductSearchInput } from "@/components/storefront/ProductSearchInput";
import type { CategorySummary } from "@/lib/queries/categories";

type HeaderProps = {
  categories: CategorySummary[];
  cartCount?: number;
  wishlistCount?: number;
};

export function Header({ categories, cartCount = 0, wishlistCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/bhinekaled-logo.webp"
            alt="BHINEKALED"
            width={1600}
            height={448}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <div className="order-3 w-full sm:order-none sm:max-w-xs sm:flex-1">
          <ProductSearchInput />
        </div>

        <nav className="ml-auto flex items-center gap-4 text-sm font-medium text-neutral-700">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="hidden hover:text-brand-red md:inline"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative -m-2 flex h-11 w-11 items-center justify-center hover:text-brand-red"
          >
            <Icon name="heart" />
            {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
          </Link>
          <Link
            href="/cart"
            aria-label="Keranjang belanja"
            className="relative -m-2 flex h-11 w-11 items-center justify-center hover:text-brand-red"
          >
            <Icon name="cart" />
            {cartCount > 0 && <CountBadge count={cartCount} />}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
