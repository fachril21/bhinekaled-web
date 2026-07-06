"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ProductSearchInputProps = {
  initialValue?: string;
};

export function ProductSearchInput({ initialValue = "" }: ProductSearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    const query = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
    router.push(`/produk${query}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 focus-within:border-brand-red"
    >
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Cari produk LED..."
        aria-label="Cari produk"
        className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
      />
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="shrink-0 text-neutral-400"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}
