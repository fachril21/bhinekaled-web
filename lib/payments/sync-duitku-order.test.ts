// Epic 14 follow-up: auto-confirm pembayaran tanpa bergantung 100% ke webhook
// Duitku. Saat customer di-redirect balik dari Duitku ke /checkout/sukses,
// halaman itu memanggil syncDuitkuOrderStatus() untuk menarik status
// terkini langsung dari Duitku (transactionStatus API) lalu menerapkannya
// lewat applyDuitkuStatusUpdate (idempoten, auto-advance, kirim email).

import { describe, it, expect, vi, beforeEach } from "vitest";

const checkTransactionStatus = vi.fn();
const DuitkuApiError = class extends Error {
  status: number;
  constructor(status: number) {
    super(`Duitku API error (${status})`);
    this.status = status;
  }
};
vi.mock("@/lib/payments/duitku-client", () => ({ checkTransactionStatus, DuitkuApiError }));

const applyDuitkuStatusUpdate = vi.fn().mockResolvedValue({ applied: true });
vi.mock("@/lib/payments/apply-duitku-status", () => ({ applyDuitkuStatusUpdate }));

type OrderRow = { id: string; payment_status: string } | null;
function buildSupabaseMock(order: OrderRow) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: order, error: null });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { from, select, eq, maybeSingle };
}
let supabaseMock: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => supabaseMock }));

beforeEach(() => {
  checkTransactionStatus.mockReset();
  applyDuitkuStatusUpdate.mockClear();
  supabaseMock = buildSupabaseMock({ id: "order-1", payment_status: "pending" });
});

const ORDER_NUMBER = "ORD-20260910-000001";

describe("syncDuitkuOrderStatus", () => {
  it("applies a 'paid' status pulled from Duitku for a still-pending order", async () => {
    checkTransactionStatus.mockResolvedValue({
      merchantOrderId: ORDER_NUMBER,
      reference: "DUITKU-REF-9",
      amount: "150000",
      statusCode: "00",
      statusMessage: "SUCCESS",
    });
    const { syncDuitkuOrderStatus } = await import("./sync-duitku-order");

    await syncDuitkuOrderStatus(ORDER_NUMBER);

    expect(checkTransactionStatus).toHaveBeenCalledWith(ORDER_NUMBER);
    expect(applyDuitkuStatusUpdate).toHaveBeenCalledWith({
      orderId: "order-1",
      reference: "DUITKU-REF-9",
      paymentStatus: "paid",
      sourceCode: "00",
      rawCallback: expect.objectContaining({ statusCode: "00" }),
    });
  });

  it("maps Duitku status-check 01 -> pending and 02 -> cancelled", async () => {
    checkTransactionStatus.mockResolvedValue({ merchantOrderId: ORDER_NUMBER, reference: "r", amount: "1", statusCode: "02", statusMessage: "CANCELED" });
    const { syncDuitkuOrderStatus } = await import("./sync-duitku-order");
    await syncDuitkuOrderStatus(ORDER_NUMBER);
    expect(applyDuitkuStatusUpdate).toHaveBeenCalledWith(expect.objectContaining({ paymentStatus: "cancelled" }));
  });

  it("does nothing when the order is not found", async () => {
    supabaseMock = buildSupabaseMock(null);
    const { syncDuitkuOrderStatus } = await import("./sync-duitku-order");
    await syncDuitkuOrderStatus(ORDER_NUMBER);
    expect(checkTransactionStatus).not.toHaveBeenCalled();
    expect(applyDuitkuStatusUpdate).not.toHaveBeenCalled();
  });

  it("skips the Duitku call when the order is already in a final paid state", async () => {
    supabaseMock = buildSupabaseMock({ id: "order-1", payment_status: "paid" });
    const { syncDuitkuOrderStatus } = await import("./sync-duitku-order");
    await syncDuitkuOrderStatus(ORDER_NUMBER);
    expect(checkTransactionStatus).not.toHaveBeenCalled();
  });

  it("swallows a 404 from Duitku (no transaction yet — customer has not paid)", async () => {
    checkTransactionStatus.mockRejectedValue(new DuitkuApiError(404));
    const { syncDuitkuOrderStatus } = await import("./sync-duitku-order");
    await expect(syncDuitkuOrderStatus(ORDER_NUMBER)).resolves.toBeUndefined();
    expect(applyDuitkuStatusUpdate).not.toHaveBeenCalled();
  });

  it("swallows any other Duitku/DB error so the confirmation page still renders", async () => {
    checkTransactionStatus.mockRejectedValue(new Error("network"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { syncDuitkuOrderStatus } = await import("./sync-duitku-order");
    await expect(syncDuitkuOrderStatus(ORDER_NUMBER)).resolves.toBeUndefined();
  });
});
