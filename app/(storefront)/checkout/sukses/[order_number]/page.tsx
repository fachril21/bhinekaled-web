import { notFound } from "next/navigation";
import { readGuestSessionId } from "@/lib/guest-session";
import { getOrderByNumberForGuest } from "@/lib/queries/orders";
import { OrderConfirmationCard } from "@/components/storefront/OrderConfirmationCard";

type OrderConfirmationPageProps = {
  params: Promise<{ order_number: string }>;
};

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { order_number: orderNumber } = await params;
  const guestSessionId = await readGuestSessionId();

  const order = await getOrderByNumberForGuest(orderNumber, guestSessionId).catch(() => null);
  if (!order) {
    notFound();
  }

  return <OrderConfirmationCard order={order} />;
}
