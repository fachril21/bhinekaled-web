// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// applyDuitkuStatusUpdate menerima `paymentStatus` yang SUDAH di-mapping oleh
// pemanggil (bukan raw resultCode/statusCode) karena dua sumber Duitku pakai
// vocabulary kode yang berbeda: callback resultCode (00/01) vs
// transactionStatus API statusCode (00/01/02) — lihat duitku-status-mapping.ts.

import { describe, it, expect, vi, beforeEach } from "vitest";

const notifyAdminOrderPaid = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/notifications/admin-order-notifier", () => ({ notifyAdminOrderPaid }));

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  duitku_reference: string | null;
  duitku_result_code: string | null;
  paid_at: string | null;
};

function buildSupabaseMock(order: OrderRow | null) {
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn().mockReturnValue({ eq: updateEq });
  const maybeSingle = vi.fn().mockResolvedValue({ data: order, error: null });
  const selectEq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq: selectEq });
  const from = vi.fn().mockReturnValue({ select, update });
  return { from, select, selectEq, maybeSingle, update, updateEq };
}

let supabaseMock: ReturnType<typeof buildSupabaseMock>;

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => supabaseMock,
}));

beforeEach(() => {
  notifyAdminOrderPaid.mockClear();
});

const baseOrder: OrderRow = {
  id: "order-1",
  order_number: "ORD-20260812-000001",
  customer_name: "John Doe",
  total: 150000,
  status: "menunggu_konfirmasi",
  payment_status: "pending",
  duitku_reference: null,
  duitku_result_code: null,
  paid_at: null,
};

describe("applyDuitkuStatusUpdate", () => {
  it("returns applied:false when the order does not exist", async () => {
    supabaseMock = buildSupabaseMock(null);
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    const result = await applyDuitkuStatusUpdate({
      orderId: "missing",
      reference: "DXXXX",
      paymentStatus: "paid",
      sourceCode: "00",
      paymentCode: "VC",
      rawCallback: {},
    });

    expect(result).toEqual({ applied: false });
    expect(supabaseMock.update).not.toHaveBeenCalled();
  });

  it("is idempotent: a duplicate callback with the same reference+sourceCode is a no-op", async () => {
    supabaseMock = buildSupabaseMock({ ...baseOrder, duitku_reference: "DXXXX", duitku_result_code: "00", payment_status: "paid" });
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    const result = await applyDuitkuStatusUpdate({
      orderId: "order-1",
      reference: "DXXXX",
      paymentStatus: "paid",
      sourceCode: "00",
      paymentCode: "VC",
      rawCallback: {},
    });

    expect(result).toEqual({ applied: false });
    expect(supabaseMock.update).not.toHaveBeenCalled();
  });

  it("marks the order paid and auto-advances status when paymentStatus is 'paid'", async () => {
    supabaseMock = buildSupabaseMock({ ...baseOrder });
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    const result = await applyDuitkuStatusUpdate({
      orderId: "order-1",
      reference: "DXXXX",
      paymentStatus: "paid",
      sourceCode: "00",
      paymentCode: "VC",
      rawCallback: { foo: "bar" },
    });

    expect(result).toEqual({ applied: true });
    expect(supabaseMock.update).toHaveBeenCalledTimes(1);
    const updatePayload = supabaseMock.update.mock.calls[0][0];
    expect(updatePayload.payment_status).toBe("paid");
    expect(updatePayload.status).toBe("diproses");
    expect(updatePayload.duitku_reference).toBe("DXXXX");
    expect(updatePayload.duitku_result_code).toBe("00");
    expect(updatePayload.duitku_payment_code).toBe("VC");
    expect(updatePayload.duitku_raw_callback).toEqual({ foo: "bar" });
    expect(updatePayload.paid_at).toEqual(expect.any(String));
  });

  it("notifies admin exactly once when payment newly becomes paid", async () => {
    supabaseMock = buildSupabaseMock({ ...baseOrder });
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    await applyDuitkuStatusUpdate({ orderId: "order-1", reference: "DXXXX", paymentStatus: "paid", sourceCode: "00", paymentCode: "VC", rawCallback: {} });

    expect(notifyAdminOrderPaid).toHaveBeenCalledTimes(1);
    expect(notifyAdminOrderPaid).toHaveBeenCalledWith({
      orderNumber: "ORD-20260812-000001",
      customerName: "John Doe",
      total: 150000,
    });
  });

  it("does not notify admin or auto-advance status when paymentStatus is 'failed'", async () => {
    supabaseMock = buildSupabaseMock({ ...baseOrder });
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    const result = await applyDuitkuStatusUpdate({
      orderId: "order-1",
      reference: "DXXXX",
      paymentStatus: "failed",
      sourceCode: "01",
      paymentCode: "VC",
      rawCallback: {},
    });

    expect(result).toEqual({ applied: true });
    const updatePayload = supabaseMock.update.mock.calls[0][0];
    expect(updatePayload.payment_status).toBe("failed");
    expect(updatePayload.status).toBeUndefined();
    expect(notifyAdminOrderPaid).not.toHaveBeenCalled();
  });

  it("does not overwrite order status when admin already advanced it manually", async () => {
    supabaseMock = buildSupabaseMock({ ...baseOrder, status: "dikirim" });
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    await applyDuitkuStatusUpdate({ orderId: "order-1", reference: "DXXXX", paymentStatus: "paid", sourceCode: "00", paymentCode: "VC", rawCallback: {} });

    const updatePayload = supabaseMock.update.mock.calls[0][0];
    expect(updatePayload.status).toBeUndefined();
  });

  it("throws when the select query errors", async () => {
    supabaseMock = buildSupabaseMock(null);
    supabaseMock.maybeSingle.mockResolvedValue({ data: null, error: new Error("db down") });
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    await expect(
      applyDuitkuStatusUpdate({ orderId: "order-1", reference: "DXXXX", paymentStatus: "paid", sourceCode: "00", paymentCode: "VC", rawCallback: {} })
    ).rejects.toThrow("db down");
  });

  it("supports the manual-recheck path from the status-check endpoint, which has no paymentCode and a 'cancelled' state unavailable to callbacks", async () => {
    supabaseMock = buildSupabaseMock({ ...baseOrder });
    const { applyDuitkuStatusUpdate } = await import("./apply-duitku-status");

    const result = await applyDuitkuStatusUpdate({
      orderId: "order-1",
      reference: "DXXXX",
      paymentStatus: "cancelled",
      sourceCode: "02", // transactionStatus API's "02" = Canceled — not a valid callback resultCode
      rawCallback: { statusCode: "02", statusMessage: "Canceled" },
    });

    expect(result).toEqual({ applied: true });
    const updatePayload = supabaseMock.update.mock.calls[0][0];
    expect(updatePayload.payment_status).toBe("cancelled");
    expect(updatePayload.duitku_payment_code).toBeUndefined();
  });
});
