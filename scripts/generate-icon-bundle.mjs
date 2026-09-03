// Epic 10 follow-up: ganti semua ikon inline SVG ke Solar (Iconify).
//
// Meng-ekstrak HANYA ikon Solar yang dipakai aplikasi (lib/icons/solar.json)
// ke bundle offline kecil, supaya <Icon> merender tanpa fetch runtime ke
// Iconify API dan bundle tidak membawa ~1200 ikon Solar yang tidak dipakai.
//
// Jalankan ulang setiap kali lib/icons/solar.json berubah:
//   node scripts/generate-icon-bundle.mjs
//
// Test components/ui/icon.test.ts akan gagal kalau bundle ini basi.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getIconData } from "@iconify/utils";
import solarIconSet from "@iconify-json/solar/icons.json" with { type: "json" };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nameMap = JSON.parse(readFileSync(join(root, "lib/icons/solar.json"), "utf8"));

const PREFIX = "solar:";
const bundle = {};
const missing = [];

for (const fullName of new Set(Object.values(nameMap))) {
  if (!fullName.startsWith(PREFIX)) {
    missing.push(`${fullName} (bukan ikon Solar)`);
    continue;
  }
  const iconName = fullName.slice(PREFIX.length);
  const data = getIconData(solarIconSet, iconName);
  if (!data) {
    missing.push(fullName);
    continue;
  }
  bundle[fullName] = {
    body: data.body,
    width: data.width ?? solarIconSet.width ?? 24,
    height: data.height ?? solarIconSet.height ?? 24,
  };
}

if (missing.length > 0) {
  console.error("Ikon Solar tidak ditemukan:\n  " + missing.join("\n  "));
  process.exit(1);
}

const sorted = Object.fromEntries(Object.keys(bundle).sort().map((k) => [k, bundle[k]]));
const out = join(root, "lib/icons/solar-bundle.json");
writeFileSync(out, JSON.stringify(sorted, null, 2) + "\n");
console.log(`Wrote ${Object.keys(bundle).length} icons -> lib/icons/solar-bundle.json`);
