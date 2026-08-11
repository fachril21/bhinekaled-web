"use client";

// Vendored from TailAdmin (components/ui/dropdown/Dropdown.tsx + DropdownItem.tsx) —
// docs/design/ADMIN_UI_REDESIGN.md §3. Dark-mode variants stripped, merged into one file
// since this project only uses the dropdown for the topbar user menu.

import { useEffect, useRef } from "react";
import type { ReactNode, MouseEvent } from "react";
import Link from "next/link";

type DropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Dropdown({ isOpen, onClose, children, className = "" }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 z-40 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg ${className}`}
    >
      {children}
    </div>
  );
}

type DropdownItemProps = {
  tag?: "a" | "button" | "submit";
  href?: string;
  onItemClick?: () => void;
  className?: string;
  children: ReactNode;
};

const defaultItemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-theme-sm font-medium text-gray-700 hover:bg-gray-100";

export function DropdownItem({ tag = "button", href, onItemClick, className = "", children }: DropdownItemProps) {
  const combined = `${defaultItemClass} ${className}`;

  function handleClick() {
    onItemClick?.();
  }

  if (tag === "a" && href) {
    return (
      <Link href={href} className={combined} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  if (tag === "submit") {
    return (
      <button type="submit" onClick={handleClick} className={combined}>
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        handleClick();
      }}
      className={combined}
    >
      {children}
    </button>
  );
}
