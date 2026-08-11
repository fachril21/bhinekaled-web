// Vendored from TailAdmin (components/form/input/Checkbox.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped.

import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ className = "", disabled, ...rest }: CheckboxProps) {
  return (
    <input
      {...rest}
      type="checkbox"
      disabled={disabled}
      className={`h-5 w-5 rounded border-gray-300 text-brand-500 accent-brand-500 focus:ring-3 focus:ring-brand-500/20 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    />
  );
}
