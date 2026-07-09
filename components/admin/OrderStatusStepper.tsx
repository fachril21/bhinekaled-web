// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.4 & Temuan #1.
//
// "Histori status" di sini adalah tampilan PROGRES (bukan log lengkap
// per-transisi) — docs/schema.sql tidak punya tabel riwayat status, hanya
// kolom status (nilai tunggal) + updated_at (waktu perubahan terakhir).
// Trade-off ini ditampilkan jujur ke admin: step yang sudah dilewati (bukan
// step pertama/terkini) tidak punya timestamp sendiri, karena data itu
// memang tidak tersimpan di database.

import { formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types/database.types";

type OrderStatusStepperProps = {
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { status: "diproses", label: "Diproses" },
  { status: "dikirim", label: "Dikirim" },
  { status: "selesai", label: "Selesai" },
];

export function OrderStatusStepper({ status, createdAt, updatedAt }: OrderStatusStepperProps) {
  if (status === "dibatalkan") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Order dibatalkan pada {formatDate(updatedAt)}.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="flex flex-wrap items-start gap-x-2 gap-y-4">
      {STEPS.map((step, index) => {
        const isReached = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.status} className="flex min-w-[7rem] flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div className={`h-0.5 flex-1 ${index === 0 ? "invisible" : isReached ? "bg-brand-red" : "bg-neutral-200"}`} />
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isReached ? "bg-brand-red text-white" : "bg-neutral-200 text-neutral-500"
                }`}
              >
                {index + 1}
              </span>
              <div
                className={`h-0.5 flex-1 ${index === STEPS.length - 1 ? "invisible" : isReached && index < currentIndex ? "bg-brand-red" : "bg-neutral-200"}`}
              />
            </div>
            <span className={`mt-2 text-xs font-medium ${isReached ? "text-neutral-900" : "text-neutral-400"}`}>
              {step.label}
            </span>
            {index === 0 && (
              <span className="mt-1 text-[11px] text-neutral-500">Order dibuat {formatDate(createdAt)}</span>
            )}
            {isCurrent && index > 0 && (
              <span className="mt-1 text-[11px] text-neutral-500">Update terakhir {formatDate(updatedAt)}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
