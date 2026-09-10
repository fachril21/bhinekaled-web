import { notFound } from "next/navigation";
import { readGuestSessionId } from "@/lib/guest-session";
import { getOrderByNumberForGuest } from "@/lib/queries/orders";
import { syncDuitkuOrderStatus } from "@/lib/payments/sync-duitku-order";
import { OrderConfirmationCard } from "@/components/storefront/OrderConfirmationCard";

type OrderConfirmationPageProps = {
  params: Promise<{ order_number: string }>;
};

// Duitku me-redirect customer ke sini setelah bayar (returnUrl). Selalu render
// fresh supaya status pembayaran yang barusan disinkron langsung kelihatan.
export const dynamic = "force-dynamic";

// payment_status yang masih mungkin berubah jadi 'paid' — untuk status ini kita
// tarik status terkini dari Duitku dulu sebelum render (jaring pengaman kalau
// webhook Duitku belum/tidak sampai).
const NON_FINAL_PAYMENT_STATUSES = new Set(["n/a", "unpaid", "pending"]);

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { order_number: orderNumber } = await params;
  const guestSessionId = await readGuestSessionId();

  let order = await getOrderByNumberForGuest(orderNumber, guestSessionId).catch(() => null);
  if (!order) {
    notFound();
  }

  if (NON_FINAL_PAYMENT_STATUSES.has(order.paymentStatus)) {
    await syncDuitkuOrderStatus(orderNumber);
    order = (await getOrderByNumberForGuest(orderNumber, guestSessionId).catch(() => null)) ?? order;
  }

  return <OrderConfirmationCard order={order} />;
}
