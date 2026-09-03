// Epic 10 follow-up: seluruh ikon aplikasi memakai Solar (Iconify), gaya Linear.
//
// solar.json  = peta semantik (key aplikasi -> nama ikon Solar). SATU tempat
//               untuk melihat/ubah ikon.
// solar-bundle.json = data ikon offline hasil scripts/generate-icon-bundle.mjs
//               (jalankan ulang setiap kali solar.json berubah).

import nameMap from "./solar.json";
import bundle from "./solar-bundle.json";

export type SolarKey = keyof typeof nameMap;

export type SolarIconData = {
  body: string;
  width: number;
  height: number;
};

export const SOLAR = nameMap as Record<SolarKey, string>;
const SOLAR_BUNDLE = bundle as Record<string, SolarIconData>;

/** Data ikon offline untuk key semantik. Throw kalau bundle basi (dijaga oleh icon.test.ts). */
export function getSolarIcon(key: SolarKey): SolarIconData {
  const data = SOLAR_BUNDLE[SOLAR[key]];
  if (!data) {
    throw new Error(
      `Ikon "${key}" (${SOLAR[key]}) tidak ada di solar-bundle.json — jalankan: node scripts/generate-icon-bundle.mjs`,
    );
  }
  return data;
}
