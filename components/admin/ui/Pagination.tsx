// Vendored from TailAdmin (components/tables/Pagination.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Adapted to also accept an href builder, so pages that paginate via URL search params
// (e.g. AdminOrderPagination) can render real <Link> pages instead of onClick handlers.

import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
} & (
  | { onPageChange: (page: number) => void; hrefForPage?: never }
  | { hrefForPage: (page: number) => string; onPageChange?: never }
);

export function Pagination({ currentPage, totalPages, onPageChange, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pagesAroundCurrent = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + Math.max(currentPage - 1, 1),
  );

  const navButtonClass =
    "flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50";
  const pageButtonClass = (active: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium hover:bg-brand-50 hover:text-brand-600 ${
      active ? "bg-brand-500 text-white hover:bg-brand-500 hover:text-white" : "text-gray-700"
    }`;

  if (hrefForPage) {
    return (
      <div className="flex items-center gap-2.5">
        <Link
          href={hrefForPage(Math.max(currentPage - 1, 1))}
          aria-disabled={currentPage === 1}
          className={`${navButtonClass} ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Sebelumnya
        </Link>
        <div className="flex items-center gap-2">
          {currentPage > 3 && <span className="px-2">...</span>}
          {pagesAroundCurrent.map((page) => (
            <Link key={page} href={hrefForPage(page)} className={pageButtonClass(currentPage === page)}>
              {page}
            </Link>
          ))}
          {currentPage < totalPages - 2 && <span className="px-2">...</span>}
        </div>
        <Link
          href={hrefForPage(Math.min(currentPage + 1, totalPages))}
          aria-disabled={currentPage === totalPages}
          className={`${navButtonClass} ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Selanjutnya
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navButtonClass}
      >
        Sebelumnya
      </button>
      <div className="flex items-center gap-2">
        {currentPage > 3 && <span className="px-2">...</span>}
        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={pageButtonClass(currentPage === page)}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navButtonClass}
      >
        Selanjutnya
      </button>
    </div>
  );
}
