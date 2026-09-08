// Fase 1: situs masih testing — robots.txt harus blokir semua crawler
// sampai ALLOW_SEARCH_INDEXING=true.

import { afterEach, describe, expect, it } from "vitest";

import robots from "./robots";

const ORIGINAL = process.env.ALLOW_SEARCH_INDEXING;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.ALLOW_SEARCH_INDEXING;
  else process.env.ALLOW_SEARCH_INDEXING = ORIGINAL;
});

describe("robots", () => {
  it("blokir semua path untuk semua user-agent saat indexing belum diizinkan", () => {
    delete process.env.ALLOW_SEARCH_INDEXING;

    const result = robots();

    expect(result.rules).toEqual([{ userAgent: "*", disallow: "/" }]);
  });

  it("tidak membocorkan sitemap saat indexing diblokir", () => {
    process.env.ALLOW_SEARCH_INDEXING = "false";

    expect(robots().sitemap).toBeUndefined();
  });

  it("mengizinkan crawl (kecuali /admin & /api) + sitemap saat ALLOW_SEARCH_INDEXING=true", () => {
    process.env.ALLOW_SEARCH_INDEXING = "true";

    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    expect(rules[0]).toMatchObject({ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] });
    expect(result.sitemap).toContain("/sitemap.xml");
  });
});
