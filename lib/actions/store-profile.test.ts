// Epic 10: Admin Pengaturan Toko (Store Profile) — server action upsert singleton row.

import { describe, it, expect, vi, beforeEach } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }));

function buildSupabaseMock(upsertResult: { error: unknown }) {
  const upsert = vi.fn().mockResolvedValue(upsertResult);
  const from = vi.fn().mockReturnValue({ upsert });
  return { from, upsert };
}

let supabaseMock: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({ createClient: () => supabaseMock }));

beforeEach(() => {
  revalidatePath.mockClear();
  supabaseMock = buildSupabaseMock({ error: null });
});

const VALID_INPUT = {
  storeName: "Toko Bhinekaled",
  storeCity: "Magetan",
  contactPhone: "+62 812-3456-7890",
  contactAddress: "Jl. Contoh No. 123",
  contactEmail: "halo@bhinekaled.example",
};

describe("saveStoreProfileAction", () => {
  it("rejects invalid input and does not touch the database", async () => {
    const { saveStoreProfileAction } = await import("./store-profile");

    const result = await saveStoreProfileAction({ ...VALID_INPUT, contactEmail: "bogus" });

    expect(result.success).toBe(false);
    expect(supabaseMock.upsert).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("upserts the singleton row (id=1) with a snake_case payload and onConflict id", async () => {
    const { saveStoreProfileAction } = await import("./store-profile");

    const result = await saveStoreProfileAction(VALID_INPUT);

    expect(result).toEqual({ success: true });
    expect(supabaseMock.from).toHaveBeenCalledWith("store_profile");
    expect(supabaseMock.upsert).toHaveBeenCalledTimes(1);
    const [payload, options] = supabaseMock.upsert.mock.calls[0];
    expect(payload).toEqual({
      id: 1,
      store_name: "Toko Bhinekaled",
      store_city: "Magetan",
      contact_phone: "+62 812-3456-7890",
      contact_address: "Jl. Contoh No. 123",
      contact_email: "halo@bhinekaled.example",
    });
    expect(options).toEqual({ onConflict: "id" });
  });

  it("revalidates the admin page and the storefront layout so the footer refreshes", async () => {
    const { saveStoreProfileAction } = await import("./store-profile");

    await saveStoreProfileAction(VALID_INPUT);

    expect(revalidatePath).toHaveBeenCalledWith("/admin/pengaturan-toko");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("returns a friendly error and does not revalidate when the upsert fails", async () => {
    supabaseMock = buildSupabaseMock({ error: { message: "db down" } });
    const { saveStoreProfileAction } = await import("./store-profile");

    const result = await saveStoreProfileAction(VALID_INPUT);

    expect(result.success).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
