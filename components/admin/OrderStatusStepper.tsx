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
      <div className="rounded-2xl border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-700">
        Order dibatalkan pada {formatDate(updatedAt)}.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="flex flex-wrap items-start gap-x-2 gap-y-4 rounded-2xl border border-gray-200 bg-white p-5">
      {STEPS.map((step, index) => {
        const isReached = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.status} className="flex min-w-[7rem] flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div className={`h-0.5 flex-1 ${index === 0 ? "invisible" : isReached ? "bg-brand-500" : "bg-gray-200"}`} />
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isReached ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </span>
              <div
                className={`h-0.5 flex-1 ${index === STEPS.length - 1 ? "invisible" : isReached && index < currentIndex ? "bg-brand-500" : "bg-gray-200"}`}
              />
            </div>
            <span className={`mt-2 text-xs font-medium ${isReached ? "text-gray-800" : "text-gray-400"}`}>
              {step.label}
            </span>
            {index === 0 && (
              <span className="mt-1 text-theme-xs text-gray-500">Order dibuat {formatDate(createdAt)}</span>
            )}
            {isCurrent && index > 0 && (
              <span className="mt-1 text-theme-xs text-gray-500">Update terakhir {formatDate(updatedAt)}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
