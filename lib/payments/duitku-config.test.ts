// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.

import { describe, it, expect, beforeEach, afterEach } from "vitest";

const ENV_KEYS = ["DUITKU_MERCHANT_CODE", "DUITKU_API_KEY", "DUITKU_IS_PRODUCTION"] as const;
const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) originalEnv[key] = process.env[key];
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe("isDuitkuProduction", () => {
  it("returns false when DUITKU_IS_PRODUCTION is unset", async () => {
    delete process.env.DUITKU_IS_PRODUCTION;
    const { isDuitkuProduction } = await import("./duitku-config");
    expect(isDuitkuProduction()).toBe(false);
  });

  it("returns true only when DUITKU_IS_PRODUCTION is exactly 'true'", async () => {
    process.env.DUITKU_IS_PRODUCTION = "true";
    const { isDuitkuProduction } = await import("./duitku-config");
    expect(isDuitkuProduction()).toBe(true);
  });

  it("returns false for any other value", async () => {
    process.env.DUITKU_IS_PRODUCTION = "yes";
    const { isDuitkuProduction } = await import("./duitku-config");
    expect(isDuitkuProduction()).toBe(false);
  });
});

describe("duitkuMerchantCode / duitkuApiKey", () => {
  it("throws when DUITKU_MERCHANT_CODE is missing", async () => {
    delete process.env.DUITKU_MERCHANT_CODE;
    const { duitkuMerchantCode } = await import("./duitku-config");
    expect(() => duitkuMerchantCode()).toThrow();
  });

  it("throws when DUITKU_API_KEY is missing", async () => {
    delete process.env.DUITKU_API_KEY;
    const { duitkuApiKey } = await import("./duitku-config");
    expect(() => duitkuApiKey()).toThrow();
  });

  it("returns the configured values when present", async () => {
    process.env.DUITKU_MERCHANT_CODE = "D1234";
    process.env.DUITKU_API_KEY = "secret-key";
    const { duitkuMerchantCode, duitkuApiKey } = await import("./duitku-config");
    expect(duitkuMerchantCode()).toBe("D1234");
    expect(duitkuApiKey()).toBe("secret-key");
  });
});

describe("duitkuCreateInvoiceUrl", () => {
  it("returns the sandbox URL when not production", async () => {
    delete process.env.DUITKU_IS_PRODUCTION;
    const { duitkuCreateInvoiceUrl } = await import("./duitku-config");
    expect(duitkuCreateInvoiceUrl()).toBe("https://api-sandbox.duitku.com/api/merchant/createInvoice");
  });

  it("returns the production URL when DUITKU_IS_PRODUCTION=true", async () => {
    process.env.DUITKU_IS_PRODUCTION = "true";
    const { duitkuCreateInvoiceUrl } = await import("./duitku-config");
    expect(duitkuCreateInvoiceUrl()).toBe("https://api-prod.duitku.com/api/merchant/createInvoice");
  });
});

describe("duitkuTransactionStatusUrl", () => {
  it("returns the sandbox URL when not production", async () => {
    delete process.env.DUITKU_IS_PRODUCTION;
    const { duitkuTransactionStatusUrl } = await import("./duitku-config");
    expect(duitkuTransactionStatusUrl()).toBe("https://sandbox.duitku.com/webapi/api/merchant/transactionStatus");
  });

  it("returns the production URL when DUITKU_IS_PRODUCTION=true", async () => {
    process.env.DUITKU_IS_PRODUCTION = "true";
    const { duitkuTransactionStatusUrl } = await import("./duitku-config");
    expect(duitkuTransactionStatusUrl()).toBe("https://passport.duitku.com/webapi/api/merchant/transactionStatus");
  });
});
