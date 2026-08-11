// Vendored from TailAdmin (components/form/Select.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped. Rewritten as a plain uncontrolled <select> (name/defaultValue/onChange)
// instead of TailAdmin's internal-state version, so it works inside the project's FormData-based
// Server Action forms without a parent needing to track selected value itself.

import type { SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: Option[];
  placeholder?: string;
};

export function Select({ options, placeholder, className = "", ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 ${className}`}
    >
      {placeholder && (
        <option value="" disabled={rest.required} className="text-gray-400">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
