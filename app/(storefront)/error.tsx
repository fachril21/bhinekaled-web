"use client";

import { useEffect } from "react";

// Jaring pengaman terakhir kalau ada error yang tidak tertangkap try/catch di
// level page (mis. Supabase gagal diakses) — lihat docs/plan #8.4 no.28/29.
export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-xl font-bold text-neutral-900">Terjadi kesalahan</h1>
      <p className="text-sm text-neutral-600">
        Gagal memuat halaman ini. Silakan coba lagi beberapa saat lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
