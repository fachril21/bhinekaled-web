import Link from "next/link";

type EmptyStateProps = {
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ message, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
      <p className="text-sm text-neutral-600">{message}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="text-sm font-semibold text-brand-red hover:underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
