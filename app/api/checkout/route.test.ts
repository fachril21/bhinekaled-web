// Epic 14: Email Transaksional Order — wiring di alur checkout.
//
// Fokus test ini: pre-generate invoice Duitku + trigger email "Menunggu
// Pembayaran". Jalur validasi/harga/stok checkout inti sudah dijamin lewat
// modul-modul pendukungnya (fees, stock-guard, shipping-rates).

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { CartItemDetail } from "@/lib/queries/cart";

const readGuestSessionId = vi.fn();
vi.mock("@/lib/guest-session", () => ({ readGuestSessionId }));

vi.mock("@/lib/http/origin-guard", () => ({ isSameOriginRequest: () => true }));

const getCartItems = vi.fn();
vi.mock("@/lib/queries/cart", () => ({ getCartItems }));

const getShippingRates = vi.fn();
vi.mock("@/lib/queries/shipping-rates", () => ({ getShippingRates }));

vi.mock("@/lib/queries/shipping-destinations", () => ({
  getDestinationLabel: vi.fn().mockResolvedValue("Kota Magetan"),
}));

const decrementStockForCheckout = vi.fn().mockResolvedValue({ success: true });
const restoreStockForCheckout = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/checkout/stock-guard", () => ({ decrementStockForCheckout, restoreStockForCheckout }));

vi.mock("@/lib/notifications/admin-order-notifier", () => ({
  notifyAdminNewOrder: vi.fn().mockResolvedValue(undefined),
}));

const createInvoice = vi.fn();
vi.mock("@/lib/payments/duitku-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/payments/duitku-client")>("@/lib/payments/duitku-client");
  return { ...actual, createInvoice };
});

const sendAwaitingPaymentEmail = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email/send-order-emails", () => ({ sendAwaitingPaymentEmail }));

const ordersUpdateEq = vi.fn().mockResolvedValue({ error: null });
const ordersUpdate = vi.fn().mockReturnValue({ eq: ordersUpdateEq });
const ordersInsertSingle = vi.fn().mockResolvedValue({ data: { id: "order-uuid-1", order_number: "ORD-20260910-000001" }, error: null });

function buildSupabaseMock() {
  const from = vi.fn((table: string) => {
    if (table === "additional_fees") {
      return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
    }
    if (table === "orders") {
      return {
        insert: () => ({ select: () => ({ single: ordersInsertSingle }) }),
        update: ordersUpdate,
      };
    }
    if (table === "order_items") {
      return { insert: () => Promise.resolve({ error: null }) };
    }
    if (table === "order_fees") {
      return { insert: () => Promise.resolve({ error: null }) };
    }
    if (table === "cart_items") {
      return { delete: () => ({ eq: () => Promise.resolve({ error: null }) }) };
    }
    throw new Error(`unexpected table ${table}`);
  });
  return { from };
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => buildSupabaseMock() }));

const cartItem: CartItemDetail = {
  id: "ci-1",
  productId: "prod-1",
  productSlug: "lampu-led-h4",
  productName: "Lampu LED H4",
  productIsAvailable: true,
  variantId: null,
  variantName: null,
  imageUrl: null,
  imageAlt: null,
  unitPrice: 75000,
  availableStock: 10,
  qty: 2,
  lineSubtotal: 150000,
  weightGram: 200,
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = "https://bhinekaled.id";
  readGuestSessionId.mockResolvedValue("guest-1");
  getCartItems.mockResolvedValue({ items: [cartItem], subtotal: 150000, itemCount: 2 });
  getShippingRates.mockResolvedValue({
    options: [
      { courierCode: "jne", serviceCode: "REG", courierName: "JNE", serviceName: "REG", cost: 20000 },
    ],
  });
  createInvoice.mockResolvedValue({ reference: "DUITKU-REF-1", paymentUrl: "https://sandbox.duitku.com/pay/XYZ" });
  ordersInsertSingle.mockResolvedValue({ data: { id: "order-uuid-1", order_number: "ORD-20260910-000001" }, error: null });
});

function buildRequest(): NextRequest {
  return new NextRequest("https://bhinekaled.id/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://bhinekaled.id" },
    body: JSON.stringify({
      customer_name: "Budi Santoso",
      customer_phone: "08123456789",
      customer_email: "budi@example.com",
      shipping_address: "Jl. Contoh No. 123, Magetan",
      shipping: { destinationId: "63181", courierCode: "jne", serviceCode: "REG" },
    }),
  });
}

describe("POST /api/checkout — email + Duitku invoice wiring", () => {
  it("pre-generates the Duitku invoice, marks the order pending, and emails the awaiting-payment invoice", async () => {
    const { POST } = await import("./route");
    const res = await POST(buildRequest());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ orderNumber: "ORD-20260910-000001" });

    expect(createInvoice).toHaveBeenCalledTimes(1);
    const invoiceArg = createInvoice.mock.calls[0][0];
    expect(invoiceArg).toMatchObject({ orderNumber: "ORD-20260910-000001", customerEmail: "budi@example.com" });

    expect(ordersUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ payment_status: "pending", duitku_reference: "DUITKU-REF-1" }),
    );

    expect(sendAwaitingPaymentEmail).toHaveBeenCalledWith({
      orderId: "order-uuid-1",
      paymentUrl: "https://sandbox.duitku.com/pay/XYZ",
    });
  });

  it("still completes checkout and emails (without a pay link) when Duitku invoice creation fails", async () => {
    createInvoice.mockRejectedValue(new Error("Duitku 502"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("./route");
    const res = await POST(buildRequest());

    expect(res.status).toBe(200);
    expect(sendAwaitingPaymentEmail).toHaveBeenCalledWith({ orderId: "order-uuid-1", paymentUrl: null });
  });

  it("awaits the email send (a slow mail server delays the response but does not break it)", async () => {
    let resolved = false;
    sendAwaitingPaymentEmail.mockImplementation(
      () => new Promise<void>((r) => setTimeout(() => { resolved = true; r(); }, 10)),
    );
    const { POST } = await import("./route");
    const res = await POST(buildRequest());

    expect(resolved).toBe(true);
    expect(res.status).toBe(200);
  });
});
