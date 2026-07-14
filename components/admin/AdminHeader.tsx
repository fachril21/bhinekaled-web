// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 6.2.

import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import type { AdminSession } from "@/lib/auth/admin-session";

type AdminHeaderProps = {
  admin: AdminSession;
};

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/order", label: "Order" },
  { href: "/admin/biaya", label: "Biaya Lainnya" },
];

export function AdminHeader({ admin }: AdminHeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold text-brand-red">
            Bhinekaled — Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-neutral-700">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-red">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span>{admin.fullName ?? admin.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="font-medium text-brand-red hover:underline">
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
