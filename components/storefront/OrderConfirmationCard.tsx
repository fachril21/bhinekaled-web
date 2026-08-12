import { Price } from "@/components/ui/Price";
import { formatDate } from "@/lib/format";
import { PayNowButton } from "@/components/storefront/PayNowButton";
import type { OrderConfirmation } from "@/lib/queries/orders";

const STATUS_LABEL: Record<OrderConfirmation["status"], string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

type OrderConfirmationCardProps = {
  order: OrderConfirmation;
};

export function OrderConfirmationCard({ order }: OrderConfirmationCardProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Pesanan Berhasil Dibuat</h1>
        <p className="text-sm text-neutral-600">
          Simpan nomor order ini. Admin akan menghubungi Anda melalui WhatsApp/telepon untuk
          konfirmasi &amp; instruksi pembayaran.
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 py-6">
        <span className="text-xs text-neutral-500">Nomor Order</span>
        <span className="text-xl font-bold tracking-wide text-brand-red">{order.orderNumber}</span>
        <span className="mt-2 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
          {STATUS_LABEL[order.status]}
        </span>
        <span className="mt-1 text-xs text-neutral-500">{formatDate(order.createdAt)}</span>
      </div>

      <PaymentSection paymentStatus={order.paymentStatus} orderStatus={order.status} orderNumber={order.orderNumber} />

      <div className="rounded-xl border border-neutral-200 p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Ringkasan Pesanan</h2>
        <ul className="flex flex-col gap-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{item.productName}</p>
                {item.variantName && <p className="text-xs text-neutral-500">{item.variantName}</p>}
                <p className="text-xs text-neutral-500">
                  {item.qty} x <Price amount={item.priceSnapshot} />
                </p>
              </div>
              <Price amount={item.subtotal} className="shrink-0 font-semibold text-neutral-900" />
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex items-center justify-between text-neutral-600">
            <span>Subtotal</span>
            <Price amount={order.subtotal} />
          </div>
          <div className="flex items-center justify-between text-neutral-600">
            <span>Ongkos Kirim{order.shippingCourierService && ` (${order.shippingCourierService})`}</span>
            <Price amount={order.shippingCost} />
          </div>
          {order.fees.map((fee, index) => (
            <div key={index} className="flex items-center justify-between text-neutral-600">
              <span>{fee.label}</span>
              <Price amount={fee.amount} />
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between text-base font-bold text-neutral-900">
            <span>Total</span>
            <Price amount={order.total} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 p-5 text-sm">
        <h2 className="mb-2 font-semibold text-neutral-900">Data Pengiriman</h2>
        <p className="text-neutral-700">{order.customerName}</p>
        <p className="text-neutral-700">{order.customerPhone}</p>
        <p className="text-neutral-700">{order.shippingAddress}</p>
        {order.notes && <p className="mt-2 text-neutral-500">Catatan: {order.notes}</p>}
      </div>
    </div>
  );
}

type PaymentSectionProps = {
  paymentStatus: OrderConfirmation["paymentStatus"];
  orderStatus: OrderConfirmation["status"];
  orderNumber: string;
};

/** Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap. */
function PaymentSection({ paymentStatus, orderStatus, orderNumber }: PaymentSectionProps) {
  if (paymentStatus === "paid") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
        ✓ Sudah Dibayar
      </div>
    );
  }

  if (paymentStatus === "review") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
        Pembayaran sedang diverifikasi, admin akan menghubungi Anda.
      </div>
    );
  }

  if (paymentStatus === "refunded" || paymentStatus === "partially_refunded") {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-sm text-indigo-700">
        {paymentStatus === "refunded" ? "Pembayaran sudah direfund." : "Pembayaran direfund sebagian."}
      </div>
    );
  }

  // n/a, pending, failed, expired, cancelled — bisa coba/ulang bayar,
  // KECUALI order fulfillment-nya sendiri sudah dibatalkan admin.
  if (orderStatus === "dibatalkan") return null;

  return <PayNowButton orderNumber={orderNumber} />;
}
