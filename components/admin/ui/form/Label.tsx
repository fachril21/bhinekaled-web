// Vendored from TailAdmin (components/form/Label.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// tailwind-merge dropped (kept dependency count at zero) in favor of plain className concat.

import type { ReactNode } from "react";

type LabelProps = {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export function Label({ htmlFor, children, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block text-sm font-medium text-gray-700 ${className ?? ""}`}>
      {children}
    </label>
  );
}
