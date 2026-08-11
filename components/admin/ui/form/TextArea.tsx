// Vendored from TailAdmin (components/form/input/TextArea.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped. Uncontrolled-friendly (name/defaultValue/onChange all optional).

import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
  hint?: string;
};

export function TextArea({ className = "", error = false, hint, rows = 4, ...rest }: TextAreaProps) {
  const stateClasses = error
    ? "border-error-500 text-error-800 focus:ring-3 focus:ring-error-500/10"
    : "border-gray-300 text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10";

  return (
    <div className="relative">
      <textarea
        {...rest}
        rows={rows}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden ${stateClasses} ${className}`}
      />
      {hint && <p className={`mt-1.5 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>{hint}</p>}
    </div>
  );
}
