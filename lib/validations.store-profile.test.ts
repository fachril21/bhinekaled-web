// Epic 10: Admin Pengaturan Toko (Store Profile) — schema validasi form.

import { describe, it, expect } from "vitest";
import { storeProfileFormSchema } from "@/lib/validations";

const FULL_VALID = {
  storeName: "Toko Bhinekaled",
  storeCity: "Magetan",
  contactPhone: "+62 812-3456-7890",
  contactAddress: "Jl. Contoh No. 123, Magetan, Jawa Timur 63311",
  contactEmail: "halo@bhinekaled.example",
};

describe("storeProfileFormSchema", () => {
  it("accepts a fully filled, valid profile", () => {
    const parsed = storeProfileFormSchema.safeParse(FULL_VALID);
    expect(parsed.success).toBe(true);
  });

  it("accepts an all-empty profile (admin may fill fields gradually)", () => {
    const parsed = storeProfileFormSchema.safeParse({
      storeName: "",
      storeCity: "",
      contactPhone: "",
      contactAddress: "",
      contactEmail: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        storeName: "",
        storeCity: "",
        contactPhone: "",
        contactAddress: "",
        contactEmail: "",
      });
    }
  });

  it("trims surrounding whitespace on every field", () => {
    const parsed = storeProfileFormSchema.safeParse({
      ...FULL_VALID,
      storeName: "  Toko Bhinekaled  ",
      contactEmail: "  halo@bhinekaled.example  ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.storeName).toBe("Toko Bhinekaled");
      expect(parsed.data.contactEmail).toBe("halo@bhinekaled.example");
    }
  });

  it("rejects a non-empty contactEmail that is not a valid email", () => {
    const parsed = storeProfileFormSchema.safeParse({ ...FULL_VALID, contactEmail: "not-an-email" });
    expect(parsed.success).toBe(false);
  });

  it("accepts an empty contactEmail", () => {
    const parsed = storeProfileFormSchema.safeParse({ ...FULL_VALID, contactEmail: "" });
    expect(parsed.success).toBe(true);
  });

  it("rejects a contactPhone containing letters", () => {
    const parsed = storeProfileFormSchema.safeParse({ ...FULL_VALID, contactPhone: "hubungi kami" });
    expect(parsed.success).toBe(false);
  });

  it("accepts a contactPhone with digits, spaces and + - ( ) only", () => {
    const parsed = storeProfileFormSchema.safeParse({ ...FULL_VALID, contactPhone: "(0351) 555-1234" });
    expect(parsed.success).toBe(true);
  });
});
