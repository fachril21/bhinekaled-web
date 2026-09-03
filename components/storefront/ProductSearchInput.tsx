"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";

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
      <Icon name="search" size={16} className="shrink-0 text-neutral-400" />
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
