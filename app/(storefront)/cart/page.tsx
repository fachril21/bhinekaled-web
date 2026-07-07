import { readGuestSessionId } from "@/lib/guest-session";
import { getCartItems } from "@/lib/queries/cart";
import { CartItemRow } from "@/components/storefront/CartItemRow";
import { CartSummaryPanel } from "@/components/storefront/CartSummaryPanel";
import { EmptyState } from "@/components/storefront/EmptyState";

const EMPTY_CART_MESSAGE = "Keranjang belanja Anda masih kosong.";
const ERROR_MESSAGE = "Gagal memuat keranjang, coba muat ulang halaman.";

export default async function CartPage() {
  const guestSessionId = await readGuestSessionId();

  if (!guestSessionId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Keranjang Belanja</h1>
        <EmptyState message={EMPTY_CART_MESSAGE} actionHref="/produk" actionLabel="Mulai belanja" />
      </main>
    );
  }

  const result = await fetchCartSummary(guestSessionId);

  if (result.status === "error") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Keranjang Belanja</h1>
        <EmptyState message={ERROR_MESSAGE} />
      </main>
    );
  }

  if (result.summary.items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Keranjang Belanja</h1>
        <EmptyState message={EMPTY_CART_MESSAGE} actionHref="/produk" actionLabel="Mulai belanja" />
      </main>
    );
  }

  const { summary } = result;
  const hasAvailableItems = summary.items.some((item) => item.productIsAvailable);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Keranjang Belanja</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {summary.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
        <div>
          <CartSummaryPanel subtotal={summary.subtotal} hasAvailableItems={hasAvailableItems} />
        </div>
      </div>
    </main>
  );
}

async function fetchCartSummary(guestSessionId: string) {
  try {
    const summary = await getCartItems(guestSessionId);
    return { status: "ok" as const, summary };
  } catch {
    return { status: "error" as const };
  }
}
