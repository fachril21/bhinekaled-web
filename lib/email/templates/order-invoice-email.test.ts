// Epic 14: Email Transaksional Order (SMTP / nodemailer).

import { describe, it, expect } from "vitest";
import { formatRupiah } from "@/lib/format";
import { renderOrderInvoiceEmail, type OrderInvoiceEmailData } from "./order-invoice-email";

const rp = (n: number) => formatRupiah(n);

const baseData: OrderInvoiceEmailData = {
  orderNumber: "ORD-20260910-000042",
  customerName: "Budi Santoso",
  items: [
    { name: "Lampu LED H4 6000K", qty: 2, unitPrice: 75000, lineTotal: 150000 },
    { name: "Relay Set H4", qty: 1, unitPrice: 35000, lineTotal: 35000 },
  ],
  shippingLabel: "JNE - REG",
  shippingCost: 20000,
  fees: [{ label: "Biaya Admin", amount: 2500 }],
  total: 207500,
  trackingUrl: "https://bhinekaled.id/lacak/11111111-1111-1111-1111-111111111111",
};

describe("renderOrderInvoiceEmail — pending (Menunggu Pembayaran)", () => {
  const result = renderOrderInvoiceEmail("pending", {
    ...baseData,
    paymentUrl: "https://sandbox.duitku.com/pay/ABC123",
  });

  it("uses the Bahasa Indonesia awaiting-payment subject with the order number", () => {
    expect(result.subject).toBe("Invoice Pesanan #ORD-20260910-000042 — Menunggu Pembayaran");
  });

  it("renders the order number, every item name, and the grand total in the HTML", () => {
    expect(result.html).toContain("ORD-20260910-000042");
    expect(result.html).toContain("Lampu LED H4 6000K");
    expect(result.html).toContain("Relay Set H4");
    expect(result.html).toContain(rp(207500));
  });

  it("renders shipping cost and each active fee", () => {
    expect(result.html).toContain("JNE - REG");
    expect(result.html).toContain(rp(20000));
    expect(result.html).toContain("Biaya Admin");
    expect(result.html).toContain(rp(2500));
  });

  it("includes a 'Bayar Sekarang' button pointing at the Duitku payment URL", () => {
    expect(result.html).toContain("https://sandbox.duitku.com/pay/ABC123");
    expect(result.html).toContain("Bayar Sekarang");
  });

  it("uses the pending amber accent color, not brand red, for the icon badge", () => {
    expect(result.html).toContain("#b45309");
    expect(result.html).toContain("#fef3c7");
  });

  it("still includes the order tracking link and a 'Lacak Pesanan' action", () => {
    expect(result.html).toContain(baseData.trackingUrl);
    expect(result.html).toContain("Lacak Pesanan");
  });

  it("falls back to a note instead of a broken button when no payment URL is available", () => {
    const noUrl = renderOrderInvoiceEmail("pending", { ...baseData, paymentUrl: null });
    expect(noUrl.html).not.toContain("Bayar Sekarang");
    expect(noUrl.html).not.toContain("href=\"null\"");
    expect(noUrl.html).not.toContain("undefined");
    expect(noUrl.html).toContain("hubungi admin");
  });

  it("produces a plain-text alternative carrying the order number and total", () => {
    expect(result.text).toContain("ORD-20260910-000042");
    expect(result.text).toContain(rp(207500));
    expect(result.text).toContain("https://sandbox.duitku.com/pay/ABC123");
  });
});

describe("renderOrderInvoiceEmail — paid (Pembayaran Diterima)", () => {
  const result = renderOrderInvoiceEmail("paid", {
    ...baseData,
    paidAtLabel: "10 September 2026",
  });

  it("uses the Bahasa Indonesia payment-received subject with the order number", () => {
    expect(result.subject).toBe("Invoice Pesanan #ORD-20260910-000042 — Pembayaran Diterima");
  });

  it("renders the same itemized invoice breakdown", () => {
    expect(result.html).toContain("Lampu LED H4 6000K");
    expect(result.html).toContain("Relay Set H4");
    expect(result.html).toContain("Biaya Admin");
    expect(result.html).toContain(rp(207500));
  });

  it("uses the paid green accent color for the checkmark badge", () => {
    expect(result.html).toContain("#15803d");
    expect(result.html).toContain("#dcfce7");
  });

  it("does NOT contain a payment button or any Duitku payment URL", () => {
    expect(result.html).not.toContain("Bayar Sekarang");
    expect(result.html).not.toContain("duitku.com/pay");
  });

  it("includes the tracking link and confirms when payment was received", () => {
    expect(result.html).toContain(baseData.trackingUrl);
    expect(result.html).toContain("Lacak Pesanan");
    expect(result.html).toContain("10 September 2026");
  });
});

describe("renderOrderInvoiceEmail — HTML safety", () => {
  it("escapes HTML in item names and customer name", () => {
    const result = renderOrderInvoiceEmail("paid", {
      ...baseData,
      customerName: "<b>Budi</b>",
      items: [{ name: "<script>alert(1)</script>", qty: 1, unitPrice: 1000, lineTotal: 1000 }],
    });
    expect(result.html).not.toContain("<script>alert(1)</script>");
    expect(result.html).toContain("&lt;script&gt;");
    expect(result.html).not.toContain("<b>Budi</b>");
  });

  it("only emits table-based layout, never flexbox or grid", () => {
    const result = renderOrderInvoiceEmail("pending", { ...baseData, paymentUrl: "https://x.test/pay" });
    expect(result.html).not.toMatch(/display:\s*flex/i);
    expect(result.html).not.toMatch(/display:\s*grid/i);
    expect(result.html).toContain("<table");
  });
});
