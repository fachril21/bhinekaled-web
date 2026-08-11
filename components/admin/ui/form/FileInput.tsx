// Vendored from TailAdmin (components/form/input/FileInput.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped.

import type { InputHTMLAttributes } from "react";

type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function FileInput({ className = "", ...rest }: FileInputProps) {
  return (
    <input
      {...rest}
      type="file"
      className={`focus:border-brand-300 focus:outline-hidden h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-500 shadow-theme-xs file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 ${className}`}
    />
  );
}
