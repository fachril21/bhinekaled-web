// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";

const MERCHANT_CODE = "D1234";
const API_KEY = "test-api-key-123";

beforeEach(() => {
  process.env.DUITKU_MERCHANT_CODE = MERCHANT_CODE;
  process.env.DUITKU_API_KEY = API_KEY;
  process.env.DUITKU_IS_PRODUCTION = "false";
  applyDuitkuStatusUpdate.mockClear();
  applyDuitkuStatusUpdate.mockResolvedValue({ applied: true });
});

const applyDuitkuStatusUpdate = vi.fn();
vi.mock("@/lib/payments/apply-duitku-status", () => ({ applyDuitkuStatusUpdate }));

type OrderRow = { id: string; total: number };
let orderRow: OrderRow | null;
const updateEq = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn().mockReturnValue({ eq: updateEq });
const maybeSingle = vi.fn(() => Promise.resolve({ data: orderRow, error: null }));
const selectEq = vi.fn().mockReturnValue({ maybeSingle });
const select = vi.fn().mockReturnValue({ eq: selectEq });
const from = vi.fn().mockReturnValue({ select, update });
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from }) }));

function callbackSignature(amount: string, merchantOrderId: string): string {
  return createHmac("sha256", API_KEY).update(MERCHANT_CODE + amount + merchantOrderId).digest("hex");
}

function buildRequest(fields: Record<string, string>): NextRequest {
  const body = new URLSearchParams(fields);
  return new NextRequest("https://example.com/api/payments/duitku/callback", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

describe("POST /api/payments/duitku/callback", () => {
  it("rejects with 401 when merchantCode does not match configured merchant", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        merchantCode: "WRONG",
        amount: "150000",
        merchantOrderId: "ORD-1",
        paymentCode: "VC",
        resultCode: "00",
        reference: "ref",
        signature: "irrelevant",
      })
    );
    expect(res.status).toBe(401);
    expect(applyDuitkuStatusUpdate).not.toHaveBeenCalled();
  });

  it("rejects with 401 when the signature is invalid", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        merchantCode: MERCHANT_CODE,
        amount: "150000",
        merchantOrderId: "ORD-1",
        paymentCode: "VC",
        resultCode: "00",
        reference: "ref",
        signature: "0".repeat(64),
      })
    );
    expect(res.status).toBe(401);
    expect(applyDuitkuStatusUpdate).not.toHaveBeenCalled();
  });

  it("rejects with 400 when a required field is missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        merchantCode: MERCHANT_CODE,
        amount: "150000",
        // merchantOrderId missing
        paymentCode: "VC",
        resultCode: "00",
        reference: "ref",
        signature: callbackSignature("150000", "ORD-1"),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when the order does not exist", async () => {
    orderRow = null;
    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        merchantCode: MERCHANT_CODE,
        amount: "150000",
        merchantOrderId: "ORD-missing",
        paymentCode: "VC",
        resultCode: "00",
        reference: "ref",
        signature: callbackSignature("150000", "ORD-missing"),
      })
    );
    expect(res.status).toBe(404);
  });

  it("marks the order for review (not applyDuitkuStatusUpdate) when the amount does not match", async () => {
    orderRow = { id: "order-1", total: 150000 };
    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        merchantCode: MERCHANT_CODE,
        amount: "99000", // mismatched, but signature is validly computed for this amount
        merchantOrderId: "ORD-1",
        paymentCode: "VC",
        resultCode: "00",
        reference: "ref",
        signature: callbackSignature("99000", "ORD-1"),
      })
    );
    expect(res.status).toBe(200);
    expect(applyDuitkuStatusUpdate).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ payment_status: "review" }));
  });

  it("applies the status update on a validly signed, amount-matching callback", async () => {
    orderRow = { id: "order-1", total: 150000 };
    const { POST } = await import("./route");
    const res = await POST(
      buildRequest({
        merchantCode: MERCHANT_CODE,
        amount: "150000",
        merchantOrderId: "ORD-1",
        paymentCode: "VC",
        resultCode: "00",
        reference: "DXXXXREF",
        signature: callbackSignature("150000", "ORD-1"),
      })
    );
    expect(res.status).toBe(200);
    expect(applyDuitkuStatusUpdate).toHaveBeenCalledWith({
      orderId: "order-1",
      reference: "DXXXXREF",
      paymentStatus: "paid",
      sourceCode: "00",
      paymentCode: "VC",
      rawCallback: {
        merchantCode: MERCHANT_CODE,
        amount: "150000",
        merchantOrderId: "ORD-1",
        paymentCode: "VC",
        resultCode: "00",
        reference: "DXXXXREF",
        signature: callbackSignature("150000", "ORD-1"),
      },
    });
  });
});
