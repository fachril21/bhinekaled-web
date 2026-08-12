// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { OrderConfirmation } from "@/lib/queries/orders";

const readGuestSessionId = vi.fn();
vi.mock("@/lib/guest-session", () => ({ readGuestSessionId }));

const getOrderByNumberForGuest = vi.fn();
vi.mock("@/lib/queries/orders", () => ({ getOrderByNumberForGuest }));

const createInvoice = vi.fn();
vi.mock("@/lib/payments/duitku-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/payments/duitku-client")>("@/lib/payments/duitku-client");
  return { ...actual, createInvoice };
});

const updateEq2 = vi.fn().mockReturnValue(Promise.resolve({ error: null }));
const updateEq1 = vi.fn().mockReturnValue({ eq: updateEq2 });
const update = vi.fn().mockReturnValue({ eq: updateEq1 });
const from = vi.fn().mockReturnValue({ update });
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from }) }));

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
  readGuestSessionId.mockReset();
  getOrderByNumberForGuest.mockReset();
  createInvoice.mockReset();
  update.mockClear();
  updateEq1.mockClear();
  updateEq2.mockClear();
});

const baseOrder: OrderConfirmation = {
  orderNumber: "ORD-1",
  customerName: "John Doe",
  customerPhone: "08123456789",
  shippingAddress: "Jl. Contoh",
  notes: null,
  subtotal: 140000,
  shippingCost: 10000,
  total: 150000,
  status: "menunggu_konfirmasi",
  createdAt: new Date().toISOString(),
  items: [],
  fees: [],
  shippingCourierService: null,
  paymentStatus: "n/a",
  customerEmail: "john@example.com",
  duitkuResultCode: null,
};

function buildRequest(body: unknown): NextRequest {
  return new NextRequest("https://example.com/api/payments/duitku/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://example.com" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/payments/duitku/invoice", () => {
  it("rejects with 403 on a cross-origin request", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      new NextRequest("https://example.com/api/payments/duitku/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
        body: JSON.stringify({ orderNumber: "ORD-1" }),
      })
    );
    expect(res.status).toBe(403);
  });

  it("rejects with 401 when there is no guest session", async () => {
    readGuestSessionId.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(buildRequest({ orderNumber: "ORD-1" }));
    expect(res.status).toBe(401);
  });

  it("rejects with 400 for an invalid body", async () => {
    readGuestSessionId.mockResolvedValue("guest-1");
    const { POST } = await import("./route");
    const res = await POST(buildRequest({}));
    expect(res.status).toBe(400);
  });

  it("rejects with 404 when the order is not found for this guest", async () => {
    readGuestSessionId.mockResolvedValue("guest-1");
    getOrderByNumberForGuest.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(buildRequest({ orderNumber: "ORD-1" }));
    expect(res.status).toBe(404);
  });

  it("rejects with 400 when the order is already cancelled", async () => {
    readGuestSessionId.mockResolvedValue("guest-1");
    getOrderByNumberForGuest.mockResolvedValue({ ...baseOrder, status: "dibatalkan" });
    const { POST } = await import("./route");
    const res = await POST(buildRequest({ orderNumber: "ORD-1" }));
    expect(res.status).toBe(400);
    expect(createInvoice).not.toHaveBeenCalled();
  });

  it("rejects with 409 when the order is already paid", async () => {
    readGuestSessionId.mockResolvedValue("guest-1");
    getOrderByNumberForGuest.mockResolvedValue({ ...baseOrder, paymentStatus: "paid" });
    const { POST } = await import("./route");
    const res = await POST(buildRequest({ orderNumber: "ORD-1" }));
    expect(res.status).toBe(409);
    expect(createInvoice).not.toHaveBeenCalled();
  });

  it("creates an invoice and returns the paymentUrl as redirectUrl, marking payment_status pending", async () => {
    readGuestSessionId.mockResolvedValue("guest-1");
    getOrderByNumberForGuest.mockResolvedValue({ ...baseOrder });
    createInvoice.mockResolvedValue({ reference: "DXXXXREF", paymentUrl: "https://app-sandbox.duitku.com/redirect_checkout?reference=DXXXXREF" });

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ orderNumber: "ORD-1" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ redirectUrl: "https://app-sandbox.duitku.com/redirect_checkout?reference=DXXXXREF" });
    expect(createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        orderNumber: "ORD-1",
        grossAmount: 150000,
        customerEmail: "john@example.com",
        callbackUrl: "https://example.com/api/payments/duitku/callback",
        returnUrl: "https://example.com/checkout/sukses/ORD-1",
      })
    );
    expect(update).toHaveBeenCalledWith({ payment_status: "pending" });
  });

  it("does not touch payment_status when it was already 'pending'", async () => {
    readGuestSessionId.mockResolvedValue("guest-1");
    getOrderByNumberForGuest.mockResolvedValue({ ...baseOrder, paymentStatus: "pending" });
    createInvoice.mockResolvedValue({ reference: "ref", paymentUrl: "https://x" });

    const { POST } = await import("./route");
    await POST(buildRequest({ orderNumber: "ORD-1" }));

    expect(update).not.toHaveBeenCalled();
  });

  it("returns 502 when Duitku's API call fails", async () => {
    readGuestSessionId.mockResolvedValue("guest-1");
    getOrderByNumberForGuest.mockResolvedValue({ ...baseOrder });
    const { DuitkuApiError } = await import("@/lib/payments/duitku-client");
    createInvoice.mockRejectedValue(new DuitkuApiError(401, { Message: "Wrong signature" }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ orderNumber: "ORD-1" }));
    expect(res.status).toBe(502);
  });
});
