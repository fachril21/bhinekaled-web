// Epic 14: Email Transaksional Order — query by orders.id (UUID) untuk email
// invoice & halaman lacak pesanan publik.

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

type OrderRow = Record<string, unknown> | null;
type ItemRow = Record<string, unknown>;
type FeeRow = Record<string, unknown>;

function buildAdminMock(order: OrderRow, items: ItemRow[], fees: FeeRow[]) {
  const orderMaybeSingle = vi.fn().mockResolvedValue({ data: order, error: null });
  const orderEq = vi.fn().mockReturnValue({ maybeSingle: orderMaybeSingle });
  const orderSelect = vi.fn().mockReturnValue({ eq: orderEq });

  const itemsOrder = vi.fn().mockResolvedValue({ data: items, error: null });
  const itemsEq = vi.fn().mockReturnValue({ order: itemsOrder });
  const itemsSelect = vi.fn().mockReturnValue({ eq: itemsEq });

  const feesOrder = vi.fn().mockResolvedValue({ data: fees, error: null });
  const feesEq = vi.fn().mockReturnValue({ order: feesOrder });
  const feesSelect = vi.fn().mockReturnValue({ eq: feesEq });

  const from = vi.fn((table: string) => {
    if (table === "orders") return { select: orderSelect };
    if (table === "order_items") return { select: itemsSelect };
    if (table === "order_fees") return { select: feesSelect };
    throw new Error(`unexpected table ${table}`);
  });

  return { from, orderSelect, orderEq };
}

let adminMock: ReturnType<typeof buildAdminMock>;
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => adminMock }));

beforeEach(() => {
  adminMock = buildAdminMock(null, [], []);
});

const ORDER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("getOrderInvoiceById", () => {
  it("returns null when no order matches the id", async () => {
    const { getOrderInvoiceById } = await import("./orders");
    expect(await getOrderInvoiceById(ORDER_ID)).toBeNull();
  });

  it("scopes the lookup to the exact UUID", async () => {
    adminMock = buildAdminMock(
      { id: ORDER_ID, order_number: "ORD-1", customer_name: "A", customer_email: "a@x.com", subtotal: 1000, shipping_cost: 0, shipping_courier_service: null, total: 1000, paid_at: null },
      [],
      [],
    );
    const { getOrderInvoiceById } = await import("./orders");
    await getOrderInvoiceById(ORDER_ID);
    expect(adminMock.orderEq).toHaveBeenCalledWith("id", ORDER_ID);
  });

  it("maps order + items + fees into the invoice shape used by the email templates", async () => {
    adminMock = buildAdminMock(
      {
        id: ORDER_ID,
        order_number: "ORD-20260910-000042",
        customer_name: "Budi",
        customer_email: "budi@example.com",
        subtotal: 185000,
        shipping_cost: 20000,
        shipping_courier_service: "JNE - REG",
        total: 207500,
        paid_at: "2026-09-10T03:00:00.000Z",
      },
      [
        { product_name_snapshot: "Lampu LED H4", variant_name_snapshot: "6000K", price_snapshot: 75000, qty: 2, subtotal: 150000 },
        { product_name_snapshot: "Relay Set", variant_name_snapshot: null, price_snapshot: 35000, qty: 1, subtotal: 35000 },
      ],
      [{ label_snapshot: "Biaya Admin", fee_type_snapshot: "flat", amount: 2500 }],
    );
    const { getOrderInvoiceById } = await import("./orders");

    const invoice = await getOrderInvoiceById(ORDER_ID);

    expect(invoice).toEqual({
      orderId: ORDER_ID,
      orderNumber: "ORD-20260910-000042",
      customerName: "Budi",
      customerEmail: "budi@example.com",
      shippingLabel: "JNE - REG",
      shippingCost: 20000,
      total: 207500,
      paidAt: "2026-09-10T03:00:00.000Z",
      items: [
        { name: "Lampu LED H4 - 6000K", qty: 2, unitPrice: 75000, lineTotal: 150000 },
        { name: "Relay Set", qty: 1, unitPrice: 35000, lineTotal: 35000 },
      ],
      fees: [{ label: "Biaya Admin", amount: 2500 }],
    });
  });
});

describe("getOrderTrackingById", () => {
  it("returns null when the order is not found", async () => {
    const { getOrderTrackingById } = await import("./orders");
    expect(await getOrderTrackingById(ORDER_ID)).toBeNull();
  });

  it("returns only public-safe tracking fields, scoped to the exact UUID", async () => {
    adminMock = buildAdminMock(
      {
        order_number: "ORD-20260910-000042",
        status: "diproses",
        payment_status: "paid",
        total: 207500,
        created_at: "2026-09-10T02:00:00.000Z",
      },
      [
        { product_name_snapshot: "Lampu LED H4", variant_name_snapshot: "6000K", qty: 2 },
      ],
      [],
    );
    const { getOrderTrackingById } = await import("./orders");

    const tracking = await getOrderTrackingById(ORDER_ID);

    expect(adminMock.orderEq).toHaveBeenCalledWith("id", ORDER_ID);
    expect(tracking).toEqual({
      orderNumber: "ORD-20260910-000042",
      status: "diproses",
      paymentStatus: "paid",
      total: 207500,
      createdAt: "2026-09-10T02:00:00.000Z",
      items: [{ name: "Lampu LED H4 - 6000K", qty: 2 }],
    });
  });
});
