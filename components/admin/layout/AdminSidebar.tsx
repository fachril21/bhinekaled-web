"use client";

// Adapted from TailAdmin (layout/AppSidebar.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3 & §4.
// Simplified to a flat nav list (no collapsible groups) since the admin only has 6 top-level
// routes, and wired to the project's real logo + existing route structure. Dark-mode stripped.

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import {
  CategoryIcon,
  DashboardIcon,
  FeeIcon,
  OrderIcon,
  ProductIcon,
  ShippingIcon,
  StoreIcon,
} from "@/components/admin/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/produk", label: "Produk", icon: ProductIcon },
  { href: "/admin/kategori", label: "Kategori", icon: CategoryIcon },
  { href: "/admin/order", label: "Order", icon: OrderIcon },
  { href: "/admin/biaya", label: "Biaya Lainnya", icon: FeeIcon },
  { href: "/admin/pengiriman", label: "Pengiriman", icon: ShippingIcon },
  { href: "/admin/pengaturan-toko", label: "Pengaturan Toko", icon: StoreIcon },
];

export function AdminSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const showLabels = isExpanded || isHovered || isMobileOpen;

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 pt-16 transition-all duration-300 ease-in-out lg:pt-0 ${
        isExpanded || isMobileOpen ? "w-[270px]" : isHovered ? "w-[270px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-8 ${showLabels ? "justify-start" : "justify-center"}`}>
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/bhinekaled-logo.webp" alt="Bhinekaled" width={showLabels ? 140 : 32} height={32} priority />
        </Link>
      </div>

      <nav className="flex flex-col overflow-y-auto no-scrollbar">
        <h2 className={`mb-4 text-xs uppercase text-gray-400 ${showLabels ? "text-left" : "text-center"}`}>
          {showLabels ? "Menu" : "•••"}
        </h2>
        <ul className="flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`menu-item group ${active ? "menu-item-active" : "menu-item-inactive"} ${
                    showLabels ? "" : "lg:justify-center"
                  }`}
                >
                  <span className={active ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                    <Icon />
                  </span>
                  {showLabels && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
