// Vendored from TailAdmin (components/ui/table/index.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.

import type { ReactNode } from "react";

type WithChildrenClassName = { children: ReactNode; className?: string };

export function Table({ children, className }: WithChildrenClassName) {
  return <table className={`min-w-full ${className ?? ""}`}>{children}</table>;
}

export function TableHeader({ children, className }: WithChildrenClassName) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className }: WithChildrenClassName) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className }: WithChildrenClassName) {
  return <tr className={className}>{children}</tr>;
}

type TableCellProps = WithChildrenClassName & { isHeader?: boolean };

export function TableCell({ children, isHeader = false, className }: TableCellProps) {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={className}>{children}</CellTag>;
}
