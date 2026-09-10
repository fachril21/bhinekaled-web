// Epic 14: Email Transaksional Order (SMTP / nodemailer).
//
// ⚠️ Server-only. Dua entry point, dipanggil fire-and-forget (best-effort):
//   - sendAwaitingPaymentEmail  → dari app/api/checkout/route.ts setelah order dibuat
//   - sendPaymentConfirmedEmail → dari lib/payments/apply-duitku-status.ts saat isNewlyPaid
//
// Keduanya SENGAJA tidak pernah throw: checkout & callback Duitku tidak boleh
// gagal hanya karena email gagal terkirim (pola sama notifyAdminNewOrder).

import { formatDate } from "@/lib/format";
import { getOrderInvoiceById, type OrderInvoiceData } from "@/lib/queries/orders";
import { renderOrderInvoiceEmail, type OrderInvoiceEmailData } from "./templates/order-invoice-email";
import { sendMail } from "./mailer";

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function trackingUrlFor(orderId: string): string {
  return `${appBaseUrl()}/lacak/${orderId}`;
}

function toTemplateData(invoice: OrderInvoiceData): Omit<OrderInvoiceEmailData, "paymentUrl" | "paidAtLabel"> {
  return {
    orderNumber: invoice.orderNumber,
    customerName: invoice.customerName,
    items: invoice.items,
    shippingLabel: invoice.shippingLabel,
    shippingCost: invoice.shippingCost,
    fees: invoice.fees,
    total: invoice.total,
    trackingUrl: trackingUrlFor(invoice.orderId),
  };
}

export async function sendAwaitingPaymentEmail(params: {
  orderId: string;
  paymentUrl: string | null;
}): Promise<void> {
  try {
    const invoice = await getOrderInvoiceById(params.orderId);
    if (!invoice) {
      console.error(`[order-email] order ${params.orderId} tidak ditemukan, email "menunggu pembayaran" dilewati.`);
      return;
    }
    const rendered = renderOrderInvoiceEmail("pending", {
      ...toTemplateData(invoice),
      paymentUrl: params.paymentUrl,
    });
    await sendMail({ to: invoice.customerEmail, subject: rendered.subject, html: rendered.html, text: rendered.text });
  } catch (error) {
    console.error(`[order-email] gagal mengirim email "menunggu pembayaran" untuk order ${params.orderId}:`, error);
  }
}

export async function sendPaymentConfirmedEmail(params: { orderId: string }): Promise<void> {
  try {
    const invoice = await getOrderInvoiceById(params.orderId);
    if (!invoice) {
      console.error(`[order-email] order ${params.orderId} tidak ditemukan, email "pembayaran diterima" dilewati.`);
      return;
    }
    const rendered = renderOrderInvoiceEmail("paid", {
      ...toTemplateData(invoice),
      paidAtLabel: invoice.paidAt ? formatDate(invoice.paidAt) : null,
    });
    await sendMail({ to: invoice.customerEmail, subject: rendered.subject, html: rendered.html, text: rendered.text });
  } catch (error) {
    console.error(`[order-email] gagal mengirim email "pembayaran diterima" untuk order ${params.orderId}:`, error);
  }
}
