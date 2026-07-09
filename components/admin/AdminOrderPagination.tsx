// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.3.
//
// Logic identik ProductPagination (Epic 1, components/storefront/), tapi
// DIDUPLIKASI (bukan reuse langsung) — lihat plan bagian 9 kenapa: (1)
// menghindari menyentuh file Epic 1 di luar scope epic ini, (2) nama
// "ProductPagination" membingungkan kalau dipakai lintas-domain untuk order.
// Server-safe (tidak "use client"/useSearchParams()) — query string sudah
// dibangun oleh Server Component pemanggil dan dikirim lewat prop `query`.

import Link from "next/link";
import type { ReactNode } from "react";

type AdminOrderPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query: Record<string, string | undefined>;
};

export function AdminOrderPagination({ currentPage, totalPages, basePath, query }: AdminOrderPaginationProps) {
  if (totalPages <= 1) return null;

  function hrefForPage(page: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  const clampedCurrent = Math.min(Math.max(1, currentPage), totalPages);
  const prevDisabled = clampedCurrent <= 1;
  const nextDisabled = clampedCurrent >= totalPages;

  return (
    <nav aria-label="Navigasi halaman" className="mt-6 flex items-center justify-center gap-2 text-sm">
      <PaginationLink href={hrefForPage(clampedCurrent - 1)} disabled={prevDisabled}>
        Sebelumnya
      </PaginationLink>
      <span className="px-3 text-neutral-600">
        Halaman {currentPage} dari {totalPages}
      </span>
      <PaginationLink href={hrefForPage(clampedCurrent + 1)} disabled={nextDisabled}>
        Berikutnya
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-300 px-3 py-1.5 hover:border-brand-red hover:text-brand-red"
    >
      {children}
    </Link>
  );
}
