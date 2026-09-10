import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderTrackingById } from "@/lib/queries/orders";
import { isValidOrderId, orderStatusLabel, paymentStatusLabel } from "@/lib/orders/tracking-display";
import { formatDate, formatRupiah } from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/types/database.types";

export const metadata: Metadata = { title: "Lacak Pesanan" };

// Status selalu diambil fresh — customer memantau progres pesanan.
export const dynamic = "force-dynamic";

type TrackingPageProps = {
  params: Promise<{ id: string }>;
};

const PROGRESS_STEPS: OrderStatus[] = ["menunggu_konfirmasi", "diproses", "dikirim", "selesai"];

const PAYMENT_BADGE_TONE: Record<PaymentStatus, string> = {
  "n/a": "border-amber-200 bg-amber-50 text-amber-700",
  unpaid: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-green-200 bg-green-50 text-green-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-neutral-200 bg-neutral-100 text-neutral-600",
  expired: "border-neutral-200 bg-neutral-100 text-neutral-600",
  review: "border-amber-200 bg-amber-50 text-amber-700",
  refunded: "border-indigo-200 bg-indigo-50 text-indigo-700",
  partially_refunded: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { id } = await params;
  if (!isValidOrderId(id)) {
    notFound();
  }

  const order = await getOrderTrackingById(id).catch(() => null);
  if (!order) {
    notFound();
  }

  const isCancelled = order.status === "dibatalkan";
  const currentStepIndex = PROGRESS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Lacak Pesanan
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">{order.orderNumber}</h1>
        <p className="text-sm text-neutral-500">Dibuat {formatDate(order.createdAt)}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
          {orderStatusLabel(order.status)}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${PAYMENT_BADGE_TONE[order.paymentStatus]}`}
        >
          {paymentStatusLabel(order.paymentStatus)}
        </span>
      </div>

      {isCancelled ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600">
          Pesanan ini dibatalkan. Hubungi admin lewat WhatsApp jika ini tidak sesuai.
        </div>
      ) : (
        <ol className="flex flex-col gap-0 rounded-xl border border-neutral-200 p-5">
          {PROGRESS_STEPS.map((step, index) => {
            const reached = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <li key={step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      reached
                        ? "border-brand-red bg-brand-red text-white"
                        : "border-neutral-300 bg-white text-neutral-400"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {index < PROGRESS_STEPS.length - 1 && (
                    <span
                      className={`my-1 h-8 w-px ${index < currentStepIndex ? "bg-brand-red" : "bg-neutral-200"}`}
                    />
                  )}
                </div>
                <span
                  className={`pt-0.5 text-sm ${
                    isCurrent ? "font-semibold text-neutral-900" : reached ? "text-neutral-700" : "text-neutral-400"
                  }`}
                >
                  {orderStatusLabel(step)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="rounded-xl border border-neutral-200 p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Ringkasan Pesanan</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center justify-between gap-3 text-sm text-neutral-700">
              <span>{item.name}</span>
              <span className="shrink-0 text-neutral-500">x{item.qty}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 text-base font-bold text-neutral-900">
          <span>Total</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
      </div>

      <div className="text-center">
        <Link href="/produk" className="text-sm font-semibold text-brand-red hover:text-brand-red-hover">
          Lanjut Belanja
        </Link>
      </div>
    </div>
  );
}
