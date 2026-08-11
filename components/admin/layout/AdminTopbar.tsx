"use client";

// Adapted from TailAdmin (layout/AppHeader.tsx + components/header/UserDropdown.tsx) —
// docs/design/ADMIN_UI_REDESIGN.md §3 & §4. Search bar and notification dropdown dropped
// (no search/notification feature exists in this admin); dark-mode stripped.

import { useState } from "react";
import { useSidebar } from "./SidebarContext";
import { Dropdown, DropdownItem } from "@/components/admin/ui/Dropdown";
import { LogoutIcon, MenuToggleIcon, UserIcon } from "@/components/admin/icons";
import { logoutAction } from "@/lib/actions/auth";
import type { AdminSession } from "@/lib/auth/admin-session";

type AdminTopbarProps = {
  admin: AdminSession;
};

export function AdminTopbar({ admin }: AdminTopbarProps) {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleToggle() {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  }

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white">
      <div className="flex w-full items-center justify-between px-4 py-3 lg:px-6">
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Buka/tutup sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <MenuToggleIcon />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="dropdown-toggle flex items-center gap-3 text-gray-700"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <UserIcon />
            </span>
            <span className="hidden text-theme-sm font-medium sm:block">{admin.fullName ?? admin.email}</span>
          </button>

          <Dropdown
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            className="flex w-64 flex-col p-3"
          >
            <div className="border-b border-gray-200 pb-3">
              <span className="block text-theme-sm font-medium text-gray-700">{admin.fullName ?? "Admin"}</span>
              <span className="mt-0.5 block text-theme-xs text-gray-500">{admin.email}</span>
            </div>
            <form action={logoutAction} className="pt-3">
              <DropdownItem tag="submit" className="text-error-600 hover:bg-error-50">
                <LogoutIcon />
                Keluar
              </DropdownItem>
            </form>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
