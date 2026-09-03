"use client";

// Wrapper tunggal untuk semua ikon aplikasi (Solar / Iconify, gaya Linear).
// Pakai entry "/offline" supaya tidak ada fetch runtime ke Iconify API —
// data ikon di-bundle lokal lewat lib/icons (solar-bundle.json).

import { Icon as IconifyIcon } from "@iconify/react/offline";
import { getSolarIcon, type SolarKey } from "@/lib/icons";

type IconProps = {
  name: SolarKey;
  /** px, default 20. Ikon Solar Linear didesain pada grid 24. */
  size?: number;
  className?: string;
  /** Kalau diisi, ikon jadi role="img" dengan label ini; kalau tidak, aria-hidden. */
  title?: string;
};

export function Icon({ name, size = 20, className, title }: IconProps) {
  return (
    <IconifyIcon
      icon={getSolarIcon(name)}
      width={size}
      height={size}
      className={className}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    />
  );
}
