// Epic 14: Halaman lacak pesanan publik (/lacak/[id]).

import { describe, it, expect } from "vitest";
import { isValidOrderId, orderStatusLabel, paymentStatusLabel } from "./tracking-display";

describe("isValidOrderId", () => {
  it("accepts a well-formed UUID", () => {
    expect(isValidOrderId("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")).toBe(true);
  });

  it("rejects malformed / non-UUID input", () => {
    expect(isValidOrderId("ORD-20260910-000001")).toBe(false);
    expect(isValidOrderId("")).toBe(false);
    expect(isValidOrderId("123")).toBe(false);
    expect(isValidOrderId("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' or 1=1")).toBe(false);
  });
});

describe("orderStatusLabel", () => {
  it("maps schema statuses to the customer-facing Bahasa Indonesia labels", () => {
    expect(orderStatusLabel("menunggu_konfirmasi")).toBe("Baru");
    expect(orderStatusLabel("diproses")).toBe("Diproses");
    expect(orderStatusLabel("dikirim")).toBe("Dikirim");
    expect(orderStatusLabel("selesai")).toBe("Selesai");
    expect(orderStatusLabel("dibatalkan")).toBe("Dibatalkan");
  });
});

describe("paymentStatusLabel", () => {
  it("maps every schema payment_status to a Bahasa Indonesia label", () => {
    expect(paymentStatusLabel("n/a")).toBe("Belum Dibayar");
    expect(paymentStatusLabel("unpaid")).toBe("Belum Dibayar");
    expect(paymentStatusLabel("pending")).toBe("Menunggu Pembayaran");
    expect(paymentStatusLabel("paid")).toBe("Lunas");
    expect(paymentStatusLabel("failed")).toBe("Gagal");
    expect(paymentStatusLabel("cancelled")).toBe("Dibatalkan");
    expect(paymentStatusLabel("expired")).toBe("Kedaluwarsa");
    expect(paymentStatusLabel("review")).toBe("Sedang Diverifikasi");
    expect(paymentStatusLabel("refunded")).toBe("Dana Dikembalikan");
    expect(paymentStatusLabel("partially_refunded")).toBe("Dana Dikembalikan Sebagian");
  });
});
