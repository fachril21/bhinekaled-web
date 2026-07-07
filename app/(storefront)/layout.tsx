import type { ReactNode } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { getTopLevelCategoriesWithActiveProducts } from "@/lib/queries/categories";
import type { CategorySummary } from "@/lib/queries/categories";
import { readGuestSessionId } from "@/lib/guest-session";
import { getCartItemCount } from "@/lib/queries/cart";
import { getWishlistItemCount } from "@/lib/queries/wishlist";

const NAV_CATEGORY_LIMIT = 5;

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  let categories: CategorySummary[] = [];
  try {
    categories = await getTopLevelCategoriesWithActiveProducts(NAV_CATEGORY_LIMIT);
  } catch {
    // Supabase belum terkoneksi / gagal — nav tetap render tanpa link kategori
    // dinamis daripada menjatuhkan seluruh layout (lihat docs/plan #8.4 no.28).
    categories = [];
  }

  // Badge jumlah cart/wishlist — enhancement di luar AC eksplisit Epic 2,
  // disetujui user. Read-only (tidak membuat cookie baru saat render), lihat
  // docs/plan/epic-2-cart-wishlist.md bagian 6.6.
  const { cartCount, wishlistCount } = await fetchHeaderCounts();

  return (
    <>
      <Header categories={categories} cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </>
  );
}

async function fetchHeaderCounts(): Promise<{ cartCount: number; wishlistCount: number }> {
  const guestSessionId = await readGuestSessionId();
  if (!guestSessionId) return { cartCount: 0, wishlistCount: 0 };

  try {
    const [cartCount, wishlistCount] = await Promise.all([
      getCartItemCount(guestSessionId),
      getWishlistItemCount(guestSessionId),
    ]);
    return { cartCount, wishlistCount };
  } catch {
    return { cartCount: 0, wishlistCount: 0 };
  }
}
