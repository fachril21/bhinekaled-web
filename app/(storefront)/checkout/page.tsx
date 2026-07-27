import { readGuestSessionId } from "@/lib/guest-session";
import { getCartItems } from "@/lib/queries/cart";
import { getCheckoutFeePreview } from "@/lib/queries/fees";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { EmptyState } from "@/components/storefront/EmptyState";
import type { CalculatedFee } from "@/lib/fees";

const EMPTY_CART_MESSAGE = "Keranjang Anda masih kosong.";
const NO_AVAILABLE_ITEMS_MESSAGE =
  "Tidak ada produk yang bisa di-checkout — kembali ke keranjang untuk memeriksa.";
const ERROR_MESSAGE = "Gagal memuat keranjang, coba muat ulang halaman.";

export default async function CheckoutPage() {
  const guestSessionId = await readGuestSessionId();

  if (!guestSessionId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState message={EMPTY_CART_MESSAGE} actionHref="/produk" actionLabel="Mulai belanja" />
      </main>
    );
  }

  const result = await fetchAvailableCartItems(guestSessionId);

  if (result.status === "error") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState message={ERROR_MESSAGE} />
      </main>
    );
  }

  const { items, subtotal } = result;
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState message={NO_AVAILABLE_ITEMS_MESSAGE} actionHref="/cart" actionLabel="Kembali ke Keranjang" />
      </main>
    );
  }

  const fees = await fetchFeePreview(subtotal);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <CheckoutForm items={items} subtotal={subtotal} fees={fees} />
    </main>
  );
}

async function fetchAvailableCartItems(guestSessionId: string) {
  try {
    const cart = await getCartItems(guestSessionId);
    const items = cart.items.filter((item) => item.productIsAvailable);
    const subtotal = items.reduce((sum, item) => sum + item.lineSubtotal, 0);
    return { status: "ok" as const, items, subtotal };
  } catch {
    return { status: "error" as const };
  }
}

/** Kegagalan di sini TIDAK PERNAH memblokir halaman checkout — lihat plan Temuan #2. */
async function fetchFeePreview(subtotal: number): Promise<CalculatedFee[]> {
  try {
    return await getCheckoutFeePreview(subtotal);
  } catch {
    return [];
  }
}
