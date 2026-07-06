"use client";

import { useState } from "react";

type AddToCartButtonProps = {
  disabled?: boolean;
};

// TODO Epic 2: sambungkan ke cart_items (insert berdasarkan guest_session_id).
// Di Epic 1 tombol ini murni placeholder UI — tidak menulis apapun ke
// Supabase, hanya menampilkan notice singkat saat diklik supaya tidak
// terlihat seperti tombol mati/rusak (lihat docs/plan bagian 6).
export function AddToCartButton({ disabled = false }: AddToCartButtonProps) {
  const [showNotice, setShowNotice] = useState(false);

  function handleClick() {
    setShowNotice(true);
    window.setTimeout(() => setShowNotice(false), 2000);
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className="w-full rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {disabled ? "Stok Habis" : "+ Keranjang"}
      </button>
      {showNotice && (
        <p role="status" className="mt-1 text-center text-xs text-neutral-500">
          Fitur keranjang segera hadir.
        </p>
      )}
    </div>
  );
}
