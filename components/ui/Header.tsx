import Link from "next/link";
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
        <Link
          href="/"
          className="shrink-0 rounded-md bg-brand-red px-3 py-1.5 text-base font-extrabold tracking-tight text-white sm:text-lg"
        >
          BHINEKALED
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
          <Link href="/wishlist" aria-label="Wishlist" className="relative hover:text-brand-red">
            <HeartIcon />
            {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
          </Link>
          <Link href="/cart" aria-label="Keranjang belanja" className="relative hover:text-brand-red">
            <CartIcon />
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

function HeartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
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

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path
        d="M2 3h2l2.6 12.2A2 2 0 0 0 8.5 17h8.9a2 2 0 0 0 1.9-1.4L21 7H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
