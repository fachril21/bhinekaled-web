// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// Duitku's callback and transactionStatus endpoints use the SAME "00/01/02"
// looking codes but with DIFFERENT meanings per endpoint — this is the
// easiest place to introduce a bug, hence separate mapping functions and
// separate exhaustive tests for each.

import { describe, it, expect } from "vitest";
import { mapDuitkuCallbackResult, mapDuitkuStatusCheckResult } from "./duitku-status-mapping";

describe("mapDuitkuCallbackResult", () => {
  it("maps '00' (Success) to paid", () => {
    expect(mapDuitkuCallbackResult("00")).toBe("paid");
  });

  it("maps '01' (Failed) to failed", () => {
    expect(mapDuitkuCallbackResult("01")).toBe("failed");
  });
});

describe("mapDuitkuStatusCheckResult", () => {
  it("maps '00' (Success) to paid", () => {
    expect(mapDuitkuStatusCheckResult("00")).toBe("paid");
  });

  it("maps '01' (Pending) to pending", () => {
    expect(mapDuitkuStatusCheckResult("01")).toBe("pending");
  });

  it("maps '02' (Canceled) to cancelled", () => {
    expect(mapDuitkuStatusCheckResult("02")).toBe("cancelled");
  });

  it("does not confuse status-check '01' (Pending) with callback '01' (Failed)", () => {
    // Regression guard for the exact bug class these docs warn about:
    // callback code '01' means Failed, but status-check code '01' means Pending.
    expect(mapDuitkuStatusCheckResult("01")).not.toBe(mapDuitkuCallbackResult("01"));
  });
});
