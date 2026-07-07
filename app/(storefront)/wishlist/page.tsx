import { readGuestSessionId } from "@/lib/guest-session";
import { getWishlistItems } from "@/lib/queries/wishlist";
import { WishlistItemCard } from "@/components/storefront/WishlistItemCard";
import { EmptyState } from "@/components/storefront/EmptyState";

const EMPTY_WISHLIST_MESSAGE = "Wishlist Anda masih kosong.";
const ERROR_MESSAGE = "Gagal memuat wishlist, coba muat ulang halaman.";

export default async function WishlistPage() {
  const guestSessionId = await readGuestSessionId();

  if (!guestSessionId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Wishlist</h1>
        <EmptyState message={EMPTY_WISHLIST_MESSAGE} actionHref="/produk" actionLabel="Mulai belanja" />
      </main>
    );
  }

  const result = await fetchWishlistItems(guestSessionId);

  if (result.status === "error") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Wishlist</h1>
        <EmptyState message={ERROR_MESSAGE} />
      </main>
    );
  }

  if (result.items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Wishlist</h1>
        <EmptyState message={EMPTY_WISHLIST_MESSAGE} actionHref="/produk" actionLabel="Mulai belanja" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Wishlist</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {result.items.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}

async function fetchWishlistItems(guestSessionId: string) {
  try {
    const items = await getWishlistItems(guestSessionId);
    return { status: "ok" as const, items };
  } catch {
    return { status: "error" as const, items: [] };
  }
}
