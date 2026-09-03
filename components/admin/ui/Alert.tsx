// Vendored from TailAdmin (components/ui/alert/Alert.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped; glyph per variant via Solar (Iconify).

import { Icon } from "@/components/ui/Icon";
import type { SolarKey } from "@/lib/icons";

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertProps = {
  variant: AlertVariant;
  title: string;
  message: string;
};

const variantClasses: Record<AlertVariant, { container: string; icon: string; glyph: SolarKey }> = {
  success: { container: "border-success-500 bg-success-50", icon: "text-success-500", glyph: "checkCircle" },
  error: { container: "border-error-500 bg-error-50", icon: "text-error-500", glyph: "dangerTriangle" },
  warning: { container: "border-warning-500 bg-warning-50", icon: "text-warning-500", glyph: "dangerTriangle" },
  info: { container: "border-blue-light-500 bg-blue-light-500/5", icon: "text-blue-light-500", glyph: "infoCircle" },
};

export function Alert({ variant, title, message }: AlertProps) {
  return (
    <div className={`rounded-xl border p-4 ${variantClasses[variant].container}`} role="alert">
      <div className="flex items-start gap-3">
        <Icon
          name={variantClasses[variant].glyph}
          size={22}
          className={`-mt-0.5 shrink-0 ${variantClasses[variant].icon}`}
        />
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    </div>
  );
}
