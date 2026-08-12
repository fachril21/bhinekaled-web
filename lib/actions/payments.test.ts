// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.

import { describe, it, expect, vi, beforeEach } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const checkTransactionStatus = vi.fn();
vi.mock("@/lib/payments/duitku-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/payments/duitku-client")>("@/lib/payments/duitku-client");
  return { ...actual, checkTransactionStatus };
});

const applyDuitkuStatusUpdate = vi.fn();
vi.mock("@/lib/payments/apply-duitku-status", () => ({ applyDuitkuStatusUpdate }));

type OrderRow = { id: string; order_number: string } | null;
let orderRow: OrderRow;
let orderQueryError: unknown = null;
const maybeSingle = vi.fn(() => Promise.resolve({ data: orderRow, error: orderQueryError }));
const eq = vi.fn().mockReturnValue({ maybeSingle });
const select = vi.fn().mockReturnValue({ eq });
const from = vi.fn().mockReturnValue({ select });
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from }) }));

beforeEach(() => {
  revalidatePath.mockClear();
  checkTransactionStatus.mockReset();
  applyDuitkuStatusUpdate.mockReset();
  applyDuitkuStatusUpdate.mockResolvedValue({ applied: true });
  orderRow = { id: "order-1", order_number: "ORD-1" };
  orderQueryError = null;
});

describe("recheckPaymentStatusAction", () => {
  it("returns an error when the order is not found", async () => {
    orderRow = null;
    const { recheckPaymentStatusAction } = await import("./payments");

    const result = await recheckPaymentStatusAction("missing");

    expect(result).toEqual({ success: false, error: "Order tidak ditemukan." });
    expect(checkTransactionStatus).not.toHaveBeenCalled();
  });

  it("calls checkTransactionStatus and applies the mapped status-check result", async () => {
    checkTransactionStatus.mockResolvedValue({
      merchantOrderId: "ORD-1",
      reference: "DXXXXREF",
      amount: "150000",
      statusCode: "00",
      statusMessage: "SUCCESS",
    });
    const { recheckPaymentStatusAction } = await import("./payments");

    const result = await recheckPaymentStatusAction("order-1");

    expect(checkTransactionStatus).toHaveBeenCalledWith("ORD-1");
    expect(applyDuitkuStatusUpdate).toHaveBeenCalledWith({
      orderId: "order-1",
      reference: "DXXXXREF",
      paymentStatus: "paid",
      sourceCode: "00",
      rawCallback: {
        merchantOrderId: "ORD-1",
        reference: "DXXXXREF",
        amount: "150000",
        statusCode: "00",
        statusMessage: "SUCCESS",
      },
    });
    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/order/order-1");
  });

  it("maps a 'Pending' status-check result correctly (statusCode '01' means Pending here, unlike callback's Failed)", async () => {
    checkTransactionStatus.mockResolvedValue({
      merchantOrderId: "ORD-1",
      reference: "DXXXXREF",
      amount: "150000",
      statusCode: "01",
      statusMessage: "PENDING",
    });
    const { recheckPaymentStatusAction } = await import("./payments");

    await recheckPaymentStatusAction("order-1");

    expect(applyDuitkuStatusUpdate).toHaveBeenCalledWith(expect.objectContaining({ paymentStatus: "pending", sourceCode: "01" }));
  });

  it("returns a specific message when Duitku has no transaction for this order (404)", async () => {
    const { DuitkuApiError } = await import("@/lib/payments/duitku-client");
    checkTransactionStatus.mockRejectedValue(new DuitkuApiError(404, { Message: "Not Found" }));
    const { recheckPaymentStatusAction } = await import("./payments");

    const result = await recheckPaymentStatusAction("order-1");

    expect(result).toEqual({ success: false, error: "Belum ada transaksi pembayaran untuk order ini di Duitku." });
    expect(applyDuitkuStatusUpdate).not.toHaveBeenCalled();
  });

  it("returns a generic error for any other failure", async () => {
    checkTransactionStatus.mockRejectedValue(new Error("network down"));
    const { recheckPaymentStatusAction } = await import("./payments");

    const result = await recheckPaymentStatusAction("order-1");

    expect(result).toEqual({ success: false, error: "Gagal mengecek status pembayaran, coba lagi." });
  });
});
