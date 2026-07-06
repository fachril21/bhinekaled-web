"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export function ProductPagination({ currentPage, totalPages, basePath }: ProductPaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  }

  const clampedCurrent = Math.min(Math.max(1, currentPage), totalPages);
  const prevDisabled = clampedCurrent <= 1;
  const nextDisabled = clampedCurrent >= totalPages;

  return (
    <nav aria-label="Navigasi halaman" className="mt-8 flex items-center justify-center gap-2 text-sm">
      <PaginationLink href={hrefForPage(clampedCurrent - 1)} disabled={prevDisabled}>
        Sebelumnya
      </PaginationLink>
      <span className="px-3 text-neutral-600">
        Halaman {clampedCurrent} dari {totalPages}
      </span>
      <PaginationLink href={hrefForPage(clampedCurrent + 1)} disabled={nextDisabled}>
        Berikutnya
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
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
