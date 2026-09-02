// Epic 10: Admin Pengaturan Toko (Store Profile) — query publik untuk footer & halaman legal.

import { describe, it, expect, vi, beforeEach } from "vitest";

function buildSupabaseMock(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { from, select, eq, maybeSingle };
}

let supabaseMock: ReturnType<typeof buildSupabaseMock>;
let createClientImpl: () => unknown;

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => createClientImpl(),
}));

beforeEach(() => {
  supabaseMock = buildSupabaseMock({ data: null, error: null });
  createClientImpl = () => supabaseMock;
});

const FULL_ROW = {
  store_name: "Toko Bhinekaled",
  store_city: "Magetan",
  contact_phone: "+62 812-3456-7890",
  contact_address: "Jl. Contoh No. 123",
  contact_email: "halo@bhinekaled.example",
};

describe("getStoreProfile", () => {
  it("maps a filled row from snake_case to the camelCase StoreProfile shape", async () => {
    supabaseMock = buildSupabaseMock({ data: FULL_ROW, error: null });
    const { getStoreProfile } = await import("./store-profile");

    const profile = await getStoreProfile();

    expect(profile).toEqual({
      storeName: "Toko Bhinekaled",
      storeCity: "Magetan",
      contactPhone: "+62 812-3456-7890",
      contactAddress: "Jl. Contoh No. 123",
      contactEmail: "halo@bhinekaled.example",
    });
  });

  it("normalizes empty and whitespace-only column values to null", async () => {
    supabaseMock = buildSupabaseMock({
      data: { ...FULL_ROW, store_city: "", contact_phone: "   ", contact_email: "" },
      error: null,
    });
    const { getStoreProfile } = await import("./store-profile");

    const profile = await getStoreProfile();

    expect(profile.storeCity).toBeNull();
    expect(profile.contactPhone).toBeNull();
    expect(profile.contactEmail).toBeNull();
    expect(profile.storeName).toBe("Toko Bhinekaled");
  });

  it("returns an all-null profile when the singleton row does not exist yet", async () => {
    supabaseMock = buildSupabaseMock({ data: null, error: null });
    const { getStoreProfile, EMPTY_STORE_PROFILE } = await import("./store-profile");

    expect(await getStoreProfile()).toEqual(EMPTY_STORE_PROFILE);
  });

  it("returns an all-null profile (does not throw) when the query errors — e.g. table missing before migration", async () => {
    supabaseMock = buildSupabaseMock({ data: null, error: { message: 'relation "store_profile" does not exist' } });
    const { getStoreProfile, EMPTY_STORE_PROFILE } = await import("./store-profile");

    expect(await getStoreProfile()).toEqual(EMPTY_STORE_PROFILE);
  });

  it("returns an all-null profile (does not throw) when creating the Supabase client throws", async () => {
    createClientImpl = () => {
      throw new Error("cookies() unavailable");
    };
    const { getStoreProfile, EMPTY_STORE_PROFILE } = await import("./store-profile");

    expect(await getStoreProfile()).toEqual(EMPTY_STORE_PROFILE);
  });
});

describe("hasAnyContactInfo", () => {
  it("is true when at least one contact field is present", async () => {
    const { hasAnyContactInfo, EMPTY_STORE_PROFILE } = await import("./store-profile");
    expect(hasAnyContactInfo({ ...EMPTY_STORE_PROFILE, contactEmail: "a@b.co" })).toBe(true);
  });

  it("is false when phone, address and email are all null (store name alone does not count)", async () => {
    const { hasAnyContactInfo, EMPTY_STORE_PROFILE } = await import("./store-profile");
    expect(hasAnyContactInfo({ ...EMPTY_STORE_PROFILE, storeName: "Toko" })).toBe(false);
  });
});
