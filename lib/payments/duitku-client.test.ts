// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildPopRequestSignature, buildStatusCheckSignature } from "./duitku-signature";

const MERCHANT_CODE = "D1234";
const API_KEY = "test-api-key-123";

beforeEach(() => {
  process.env.DUITKU_MERCHANT_CODE = MERCHANT_CODE;
  process.env.DUITKU_API_KEY = API_KEY;
  process.env.DUITKU_IS_PRODUCTION = "false";
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-12T00:00:00.000Z"));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("createInvoice", () => {
  it("posts to the sandbox createInvoice endpoint with a correctly signed header and JSON body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        merchantCode: MERCHANT_CODE,
        reference: "DXXXXS875LXXXX32IJZ7",
        paymentUrl: "https://app-sandbox.duitku.com/redirect_checkout?reference=DXXXXS875LXXXX32IJZ7",
        statusCode: "00",
        statusMessage: "SUCCESS",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { createInvoice } = await import("./duitku-client");

    const result = await createInvoice({
      orderNumber: "ORD-20260812-000001",
      grossAmount: 150000,
      productDetails: "Pembayaran untuk BHINEKALED",
      customerName: "John Doe",
      customerPhone: "08123456789",
      customerEmail: "john@example.com",
      callbackUrl: "https://example.com/api/payments/duitku/callback",
      returnUrl: "https://example.com/checkout/sukses/ORD-20260812-000001",
    });

    expect(result).toEqual({
      reference: "DXXXXS875LXXXX32IJZ7",
      paymentUrl: "https://app-sandbox.duitku.com/redirect_checkout?reference=DXXXXS875LXXXX32IJZ7",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api-sandbox.duitku.com/api/merchant/createInvoice");
    expect(init.method).toBe("POST");

    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["x-duitku-merchantcode"]).toBe(MERCHANT_CODE);
    const timestamp = headers["x-duitku-timestamp"];
    expect(timestamp).toBe(String(Date.now()));
    expect(headers["x-duitku-signature"]).toBe(
      buildPopRequestSignature({ merchantCode: MERCHANT_CODE, timestamp, apiKey: API_KEY })
    );

    const body = JSON.parse(init.body as string);
    expect(body.merchantOrderId).toBe("ORD-20260812-000001");
    expect(body.paymentAmount).toBe(150000);
    expect(body.email).toBe("john@example.com");
    expect(body.callbackUrl).toBe("https://example.com/api/payments/duitku/callback");
    expect(body.returnUrl).toBe("https://example.com/checkout/sukses/ORD-20260812-000001");
  });

  it("rounds a fractional gross amount before sending", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ reference: "ref", paymentUrl: "https://x", statusCode: "00", statusMessage: "SUCCESS" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { createInvoice } = await import("./duitku-client");

    await createInvoice({
      orderNumber: "ORD-1",
      grossAmount: 150000.4,
      productDetails: "Test",
      customerName: "John",
      customerEmail: "john@example.com",
      callbackUrl: "https://example.com/callback",
      returnUrl: "https://example.com/return",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.paymentAmount).toBe(150000);
  });

  it("throws DuitkuApiError when statusCode is not '00'", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ statusCode: "01", statusMessage: "Amount is different please try again later." }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { createInvoice, DuitkuApiError } = await import("./duitku-client");

    await expect(
      createInvoice({
        orderNumber: "ORD-1",
        grossAmount: 10000,
        productDetails: "Test",
        customerName: "John",
        customerEmail: "john@example.com",
        callbackUrl: "https://example.com/callback",
        returnUrl: "https://example.com/return",
      })
    ).rejects.toBeInstanceOf(DuitkuApiError);
  });

  it("throws DuitkuApiError when the HTTP status is not 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 401,
      json: async () => ({ Message: "Wrong signature" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { createInvoice, DuitkuApiError } = await import("./duitku-client");

    let caught: unknown;
    try {
      await createInvoice({
        orderNumber: "ORD-1",
        grossAmount: 10000,
        productDetails: "Test",
        customerName: "John",
        customerEmail: "john@example.com",
        callbackUrl: "https://example.com/callback",
        returnUrl: "https://example.com/return",
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(DuitkuApiError);
    expect((caught as InstanceType<typeof DuitkuApiError>).status).toBe(401);
  });
});

describe("checkTransactionStatus", () => {
  it("posts a correctly signed request and returns the parsed status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        merchantOrderId: "ORD-20260812-000001",
        reference: "DXXXXS875LXXXX32IJZ7",
        amount: "150000",
        fee: "0.00",
        statusCode: "00",
        statusMessage: "SUCCESS",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { checkTransactionStatus } = await import("./duitku-client");

    const result = await checkTransactionStatus("ORD-20260812-000001");

    expect(result).toEqual({
      merchantOrderId: "ORD-20260812-000001",
      reference: "DXXXXS875LXXXX32IJZ7",
      amount: "150000",
      statusCode: "00",
      statusMessage: "SUCCESS",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sandbox.duitku.com/webapi/api/merchant/transactionStatus");
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      merchantCode: MERCHANT_CODE,
      merchantOrderId: "ORD-20260812-000001",
      signature: buildStatusCheckSignature({ merchantCode: MERCHANT_CODE, merchantOrderId: "ORD-20260812-000001", apiKey: API_KEY }),
    });
  });

  it("throws DuitkuApiError when the HTTP status is not 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 404,
      json: async () => ({ Message: "Not Found" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { checkTransactionStatus, DuitkuApiError } = await import("./duitku-client");

    await expect(checkTransactionStatus("ORD-unknown")).rejects.toBeInstanceOf(DuitkuApiError);
  });
});
