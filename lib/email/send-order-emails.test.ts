// Epic 14: Email Transaksional Order (SMTP / nodemailer).

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { OrderInvoiceData } from "@/lib/queries/orders";

const getOrderInvoiceById = vi.fn();
vi.mock("@/lib/queries/orders", () => ({ getOrderInvoiceById }));

const sendMail = vi.fn();
vi.mock("./mailer", () => ({ sendMail }));

const ORDER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const invoice: OrderInvoiceData = {
  orderId: ORDER_ID,
  orderNumber: "ORD-20260910-000042",
  customerName: "Budi",
  customerEmail: "budi@example.com",
  items: [{ name: "Lampu LED H4 - 6000K", qty: 2, unitPrice: 75000, lineTotal: 150000 }],
  fees: [{ label: "Biaya Admin", amount: 2500 }],
  shippingLabel: "JNE - REG",
  shippingCost: 20000,
  total: 172500,
  paidAt: "2026-09-10T03:00:00.000Z",
};

beforeEach(() => {
  vi.restoreAllMocks();
  getOrderInvoiceById.mockReset().mockResolvedValue(invoice);
  sendMail.mockReset().mockResolvedValue(undefined);
  process.env.NEXT_PUBLIC_APP_URL = "https://bhinekaled.id";
});

describe("sendAwaitingPaymentEmail", () => {
  it("sends the pending invoice to the order's customer email", async () => {
    const { sendAwaitingPaymentEmail } = await import("./send-order-emails");
    await sendAwaitingPaymentEmail({ orderId: ORDER_ID, paymentUrl: "https://sandbox.duitku.com/pay/ABC" });

    expect(getOrderInvoiceById).toHaveBeenCalledWith(ORDER_ID);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const arg = sendMail.mock.calls[0][0];
    expect(arg.to).toBe("budi@example.com");
    expect(arg.subject).toBe("Invoice Pesanan #ORD-20260910-000042 — Menunggu Pembayaran");
    expect(arg.html).toContain("https://sandbox.duitku.com/pay/ABC");
    expect(arg.html).toContain(`https://bhinekaled.id/lacak/${ORDER_ID}`);
  });

  it("still sends (with a fallback note) when no payment URL is available", async () => {
    const { sendAwaitingPaymentEmail } = await import("./send-order-emails");
    await sendAwaitingPaymentEmail({ orderId: ORDER_ID, paymentUrl: null });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const arg = sendMail.mock.calls[0][0];
    expect(arg.html).not.toContain("Bayar Sekarang");
    expect(arg.html).toContain(`https://bhinekaled.id/lacak/${ORDER_ID}`);
  });

  it("builds the tracking URL without a double slash when APP_URL has a trailing slash", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://bhinekaled.id/";
    const { sendAwaitingPaymentEmail } = await import("./send-order-emails");
    await sendAwaitingPaymentEmail({ orderId: ORDER_ID, paymentUrl: null });

    const arg = sendMail.mock.calls[0][0];
    expect(arg.html).toContain(`https://bhinekaled.id/lacak/${ORDER_ID}`);
    expect(arg.html).not.toContain("id//lacak");
  });

  it("does not send and does not throw when the order cannot be found", async () => {
    getOrderInvoiceById.mockResolvedValue(null);
    const { sendAwaitingPaymentEmail } = await import("./send-order-emails");
    await expect(sendAwaitingPaymentEmail({ orderId: ORDER_ID, paymentUrl: null })).resolves.toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("swallows transport errors so a failed email never breaks the caller", async () => {
    sendMail.mockRejectedValue(new Error("SMTP down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendAwaitingPaymentEmail } = await import("./send-order-emails");
    await expect(sendAwaitingPaymentEmail({ orderId: ORDER_ID, paymentUrl: null })).resolves.toBeUndefined();
  });
});

describe("sendPaymentConfirmedEmail", () => {
  it("sends the paid invoice with no payment URL and a paid-at confirmation", async () => {
    const { sendPaymentConfirmedEmail } = await import("./send-order-emails");
    await sendPaymentConfirmedEmail({ orderId: ORDER_ID });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const arg = sendMail.mock.calls[0][0];
    expect(arg.to).toBe("budi@example.com");
    expect(arg.subject).toBe("Invoice Pesanan #ORD-20260910-000042 — Pembayaran Diterima");
    expect(arg.html).not.toContain("Bayar Sekarang");
    expect(arg.html).not.toContain("duitku.com/pay");
    expect(arg.html).toContain("10 September 2026");
    expect(arg.html).toContain(`https://bhinekaled.id/lacak/${ORDER_ID}`);
  });

  it("does not throw when the order is missing", async () => {
    getOrderInvoiceById.mockResolvedValue(null);
    const { sendPaymentConfirmedEmail } = await import("./send-order-emails");
    await expect(sendPaymentConfirmedEmail({ orderId: ORDER_ID })).resolves.toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
  });
});
