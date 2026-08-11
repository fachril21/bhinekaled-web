// Vendored from TailAdmin (components/ui/button/Button.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped; brand-* colors resolve to the project's #E6212A scale (app/globals.css).

import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-3 text-sm",
};

const variantClasses = {
  primary: "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  outline: "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
  danger: "bg-white text-error-600 ring-1 ring-inset ring-error-300 hover:bg-error-50",
};

export function Button({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
}
