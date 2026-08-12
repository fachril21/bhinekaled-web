// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
// Test vectors below were computed independently with node:crypto
// (HMAC_SHA256, hex digest) so this test does not just check the
// implementation against itself.

import { describe, it, expect } from "vitest";
import {
  buildPopRequestSignature,
  buildStatusCheckSignature,
  verifyDuitkuCallbackSignature,
  isDuitkuAmountMatching,
} from "./duitku-signature";

const MERCHANT_CODE = "D1234";
const API_KEY = "test-api-key-123";

describe("buildPopRequestSignature", () => {
  it("computes HMAC_SHA256(merchantCode + timestamp, apiKey) as lowercase hex", () => {
    const signature = buildPopRequestSignature({
      merchantCode: MERCHANT_CODE,
      timestamp: "1700000000000",
      apiKey: API_KEY,
    });
    expect(signature).toBe("1880f0ce93376632283acba69b750498b07cc9616e1b74920b8de445998ad5c2");
  });

  it("produces a different signature for a different timestamp", () => {
    const a = buildPopRequestSignature({ merchantCode: MERCHANT_CODE, timestamp: "1700000000000", apiKey: API_KEY });
    const b = buildPopRequestSignature({ merchantCode: MERCHANT_CODE, timestamp: "1700000000001", apiKey: API_KEY });
    expect(a).not.toBe(b);
  });
});

describe("buildStatusCheckSignature", () => {
  it("computes HMAC_SHA256(merchantCode + merchantOrderId, apiKey) as lowercase hex", () => {
    const signature = buildStatusCheckSignature({
      merchantCode: MERCHANT_CODE,
      merchantOrderId: "ORD-20260812-000001",
      apiKey: API_KEY,
    });
    expect(signature).toBe("303eb931235455e8af3ee873e3912351c7537122ef431775226413887ae5ad97");
  });
});

describe("verifyDuitkuCallbackSignature", () => {
  const validParams = {
    merchantCode: MERCHANT_CODE,
    amount: "150000",
    merchantOrderId: "ORD-20260812-000001",
    apiKey: API_KEY,
  };
  const validSignature = "b0a4797cda909f0140e84582b0b89d7abd5a330fe63cbd98fa3df2edd1a729bf";

  it("returns true for a signature matching HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)", () => {
    expect(verifyDuitkuCallbackSignature({ ...validParams, signature: validSignature })).toBe(true);
  });

  it("returns false when the signature does not match", () => {
    expect(
      verifyDuitkuCallbackSignature({
        ...validParams,
        signature: "0000000000000000000000000000000000000000000000000000000000000000",
      })
    ).toBe(false);
  });

  it("returns false when the amount differs from what was signed", () => {
    expect(
      verifyDuitkuCallbackSignature({ ...validParams, amount: "999999", signature: validSignature })
    ).toBe(false);
  });

  it("returns false when signature is not valid hex", () => {
    expect(verifyDuitkuCallbackSignature({ ...validParams, signature: "not-hex-!!" })).toBe(false);
  });

  it("returns false when signature has the wrong length", () => {
    expect(verifyDuitkuCallbackSignature({ ...validParams, signature: "ab12" })).toBe(false);
  });
});

describe("isDuitkuAmountMatching", () => {
  it("returns true when the callback amount equals the order total", () => {
    expect(isDuitkuAmountMatching(150000, "150000")).toBe(true);
  });

  it("returns false when the callback amount differs from the order total", () => {
    expect(isDuitkuAmountMatching(150000, "99000")).toBe(false);
  });

  it("returns false when the callback amount is not a number", () => {
    expect(isDuitkuAmountMatching(150000, "not-a-number")).toBe(false);
  });

  it("tolerates sub-rupiah rounding differences", () => {
    expect(isDuitkuAmountMatching(150000, "150000.4")).toBe(true);
  });
});
