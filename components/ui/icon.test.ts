// Menjaga lib/icons/solar-bundle.json tetap sinkron dengan lib/icons/solar.json.
// Kalau test ini gagal: jalankan `node scripts/generate-icon-bundle.mjs`.

import { describe, it, expect } from "vitest";
import nameMap from "@/lib/icons/solar.json";
import bundle from "@/lib/icons/solar-bundle.json";
import { SOLAR, getSolarIcon, type SolarKey } from "@/lib/icons";

const keys = Object.keys(nameMap) as SolarKey[];

describe("solar icon bundle", () => {
  it("covers every icon referenced in solar.json", () => {
    const missing = keys.filter((key) => !(SOLAR[key] in (bundle as Record<string, unknown>)));
    expect(missing).toEqual([]);
  });

  it("has no stale entries that solar.json no longer references", () => {
    const referenced = new Set(Object.values(SOLAR));
    const stale = Object.keys(bundle).filter((name) => !referenced.has(name));
    expect(stale).toEqual([]);
  });

  it("every referenced icon uses the solar: prefix", () => {
    const nonSolar = keys.filter((key) => !SOLAR[key].startsWith("solar:"));
    expect(nonSolar).toEqual([]);
  });

  it.each(keys)("resolves valid icon data for %s", (key) => {
    const data = getSolarIcon(key);
    expect(typeof data.body).toBe("string");
    expect(data.body.length).toBeGreaterThan(0);
    expect(data.width).toBeGreaterThan(0);
    expect(data.height).toBeGreaterThan(0);
  });
});
