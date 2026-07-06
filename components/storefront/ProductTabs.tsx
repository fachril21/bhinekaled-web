"use client";

import { useState, type ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type ProductTabsProps = {
  tabs: Tab[];
};

// Tabs Deskripsi/Spesifikasi/Kompatibilitas sesuai docs/screen/Detail Produk.png.
// `content` boleh berupa elemen yang di-render Server Component induk (RSC
// slot pattern) — komponen ini hanya mengatur tab mana yang aktif.
export function ProductTabs({ tabs }: ProductTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <div>
      <div role="tablist" aria-label="Detail produk" className="flex gap-6 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab.id}
            onClick={() => setActiveId(tab.id)}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              tab.id === activeTab.id
                ? "border-brand-red text-brand-red"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-6">
        {activeTab.content}
      </div>
    </div>
  );
}
