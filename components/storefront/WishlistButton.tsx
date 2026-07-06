"use client";

import { useState } from "react";

// TODO Epic 2: sambungkan ke wishlist_items (guest_session_id). Placeholder
// UI-only di Epic 1 — tidak ada state persist, hanya notice sesaat.
export function WishlistButton() {
  const [showNotice, setShowNotice] = useState(false);

  function handleClick() {
    setShowNotice(true);
    window.setTimeout(() => setShowNotice(false), 2000);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Simpan ke wishlist"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-500 shadow-sm hover:text-brand-red"
      >
        <HeartIcon />
      </button>
      {showNotice && (
        <p
          role="status"
          className="absolute right-0 top-full mt-1 w-max rounded bg-neutral-900 px-2 py-1 text-xs text-white"
        >
          Segera hadir
        </p>
      )}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        d="M12 21s-7.5-4.6-10-9.3C0.4 8.2 2 4 6 4c2 0 3.5 1 4 2.2C10.5 5 12 4 14 4c4 0 5.6 4.2 4 7.7C19.5 16.4 12 21 12 21Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
