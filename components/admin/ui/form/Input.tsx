// Vendored from TailAdmin (components/form/input/InputField.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped. Kept as an uncontrolled-friendly input (name/defaultValue/onChange
// all optional) so it drops into the project's existing Server Action + FormData forms untouched.

import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  success?: boolean;
  error?: boolean;
  hint?: string;
};

export function Input({ className = "", success = false, error = false, hint, ...rest }: InputProps) {
  let stateClasses =
    "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10";
  if (rest.disabled) {
    stateClasses = "text-gray-500 border-gray-300 cursor-not-allowed bg-gray-50";
  } else if (error) {
    stateClasses = "text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10";
  } else if (success) {
    stateClasses = "text-success-500 border-success-400 focus:ring-3 focus:ring-success-500/10";
  }

  return (
    <div className="relative">
      <input
        {...rest}
        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden ${stateClasses} ${className}`}
      />
      {hint && (
        <p className={`mt-1.5 text-xs ${error ? "text-error-500" : success ? "text-success-500" : "text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
