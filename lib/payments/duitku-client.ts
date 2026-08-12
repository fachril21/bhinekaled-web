// Epic 13: Duitku Payment Integration (POP) — replaces Midtrans Snap.
//
// ⚠️ Server-only — panggil Duitku POP createInvoice & transactionStatus API.
// TIDAK PERNAH diimpor dari Client Component. Hanya dipanggil dari
// app/api/payments/duitku/invoice/route.ts & lib/actions/payments.ts.

import { duitkuApiKey, duitkuCreateInvoiceUrl, duitkuMerchantCode, duitkuTransactionStatusUrl } from "./duitku-config";
import { buildPopRequestSignature, buildStatusCheckSignature } from "./duitku-signature";
import type { DuitkuStatusCheckCode } from "./duitku-status-mapping";

export class DuitkuApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Duitku API error (${status})`);
    this.status = status;
    this.body = body;
  }
}

export type CreateInvoiceParams = {
  orderNumber: string;
  grossAmount: number;
  productDetails: string;
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  callbackUrl: string;
  returnUrl: string;
};

export type DuitkuInvoice = { reference: string; paymentUrl: string };

/**
 * BENTUK PERSIS payload `POST /api/merchant/createInvoice` mengikuti
 * dokumentasi Duitku POP resmi (docs.duitku.com/pop/id) — WAJIB dicek ulang
 * begitu DUITKU_API_KEY sandbox tersedia, pola sama seperti catatan
 * createSnapTransaction Midtrans sebelumnya.
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<DuitkuInvoice> {
  const merchantCode = duitkuMerchantCode();
  const apiKey = duitkuApiKey();
  const timestamp = String(Date.now());

  const res = await fetch(duitkuCreateInvoiceUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-duitku-timestamp": timestamp,
      "x-duitku-signature": buildPopRequestSignature({ merchantCode, timestamp, apiKey }),
      "x-duitku-merchantcode": merchantCode,
    },
    body: JSON.stringify({
      paymentAmount: Math.round(params.grossAmount),
      merchantOrderId: params.orderNumber,
      productDetails: params.productDetails,
      email: params.customerEmail,
      customerVaName: params.customerName,
      ...(params.customerPhone ? { phoneNumber: params.customerPhone } : {}),
      callbackUrl: params.callbackUrl,
      returnUrl: params.returnUrl,
    }),
  });

  const body: unknown = await res.json().catch(() => null);
  const parsedBody = body as { reference?: unknown; paymentUrl?: unknown; statusCode?: unknown } | null;
  if (
    res.status !== 200 ||
    parsedBody?.statusCode !== "00" ||
    typeof parsedBody?.reference !== "string" ||
    typeof parsedBody?.paymentUrl !== "string"
  ) {
    throw new DuitkuApiError(res.status, body);
  }
  return { reference: parsedBody.reference, paymentUrl: parsedBody.paymentUrl };
}

export type DuitkuStatusResponse = {
  merchantOrderId: string;
  reference: string;
  amount: string;
  statusCode: DuitkuStatusCheckCode;
  statusMessage: string;
};

/** Dipanggil dari aksi rekonsiliasi manual admin, bukan alur webhook. */
export async function checkTransactionStatus(orderNumber: string): Promise<DuitkuStatusResponse> {
  const merchantCode = duitkuMerchantCode();
  const apiKey = duitkuApiKey();

  const res = await fetch(duitkuTransactionStatusUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantCode,
      merchantOrderId: orderNumber,
      signature: buildStatusCheckSignature({ merchantCode, merchantOrderId: orderNumber, apiKey }),
    }),
  });

  const body: unknown = await res.json().catch(() => null);
  const parsedBody = body as
    | { merchantOrderId?: unknown; reference?: unknown; amount?: unknown; statusCode?: unknown; statusMessage?: unknown }
    | null;
  if (
    res.status !== 200 ||
    typeof parsedBody?.merchantOrderId !== "string" ||
    typeof parsedBody?.reference !== "string" ||
    typeof parsedBody?.statusCode !== "string"
  ) {
    throw new DuitkuApiError(res.status, body);
  }
  return {
    merchantOrderId: parsedBody.merchantOrderId,
    reference: parsedBody.reference,
    amount: String(parsedBody.amount),
    statusCode: parsedBody.statusCode as DuitkuStatusCheckCode,
    statusMessage: String(parsedBody.statusMessage),
  };
}
