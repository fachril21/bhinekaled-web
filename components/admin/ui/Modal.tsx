"use client";

// Vendored from TailAdmin (components/ui/modal/index.tsx) — docs/design/ADMIN_UI_REDESIGN.md §3.
// Dark-mode variants stripped.

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
  showCloseButton?: boolean;
};

export function Modal({ isOpen, onClose, children, className, showCloseButton = true }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[8px]" onClick={onClose} />
      <div
        ref={modalRef}
        className={`relative w-full rounded-3xl bg-white ${className ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6"
          >
            <Icon name="close" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
