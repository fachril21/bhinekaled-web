// Vendored from TailAdmin (components/ui/alert/Alert.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped; icon markup simplified to a single check/warning glyph per variant.

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertProps = {
  variant: AlertVariant;
  title: string;
  message: string;
};

const variantClasses: Record<AlertVariant, { container: string; icon: string }> = {
  success: { container: "border-success-500 bg-success-50", icon: "text-success-500" },
  error: { container: "border-error-500 bg-error-50", icon: "text-error-500" },
  warning: { container: "border-warning-500 bg-warning-50", icon: "text-warning-500" },
  info: { container: "border-blue-light-500 bg-blue-light-500/5", icon: "text-blue-light-500" },
};

export function Alert({ variant, title, message }: AlertProps) {
  return (
    <div className={`rounded-xl border p-4 ${variantClasses[variant].container}`} role="alert">
      <div className="flex items-start gap-3">
        <svg
          className={`-mt-0.5 shrink-0 fill-current ${variantClasses[variant].icon}`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.70186 12.0001C3.70186 7.41711 7.41711 3.70186 12.0001 3.70186C16.5831 3.70186 20.2984 7.41711 20.2984 12.0001C20.2984 16.5831 16.5831 20.2984 12.0001 20.2984C7.41711 20.2984 3.70186 16.5831 3.70186 12.0001ZM12.0001 1.90186C6.423 1.90186 1.90186 6.423 1.90186 12.0001C1.90186 17.5772 6.423 22.0984 12.0001 22.0984C17.5772 22.0984 22.0984 17.5772 22.0984 12.0001C22.0984 6.423 17.5772 1.90186 12.0001 1.90186ZM11.9998 6.62898C12.414 6.62898 12.7498 6.96476 12.7498 7.37898V13.0555C12.7498 13.4697 12.414 13.8055 11.9998 13.8055C11.5856 13.8055 11.2498 13.4697 11.2498 13.0555V7.37898C11.2498 6.96476 11.5856 6.62898 11.9998 6.62898ZM13.0008 16.4753C13.0008 15.923 12.5531 15.4753 12.0008 15.4753H11.9998C11.4475 15.4753 10.9998 15.923 10.9998 16.4753C10.9998 17.0276 11.4475 17.4753 11.9998 17.4753H12.0008C12.5531 17.4753 13.0008 17.0276 13.0008 16.4753Z"
          />
        </svg>
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    </div>
  );
}
