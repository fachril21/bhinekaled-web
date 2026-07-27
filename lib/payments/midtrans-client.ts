// Epic 13: Midtrans Payment Integration (Snap Redirect)
// Lihat docs/plan/epic-13-midtrans-payment-integration.md bagian 5.5.
//
// ⚠️ Server-only — panggil Midtrans Snap/Status API pakai MIDTRANS_SERVER_KEY.
// TIDAK PERNAH diimpor dari Client Component. Hanya dipanggil dari
// app/api/payments/midtrans/token/route.ts & lib/actions/payments.ts.

import { midtransServerKey, midtransSnapTransactionUrl, midtransStatusUrl } from "./midtrans-config";

export class MidtransApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Midtrans API error (${status})`);
    this.status = status;
    this.body = body;
  }
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${midtransServerKey()}:`).toString("base64")}`;
}

export type CreateSnapTransactionParams = {
  orderNumber: string;
  grossAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  finishUrl: string;
};

export type SnapTransaction = { token: string; redirectUrl: string };

/**
 * BENTUK PERSIS payload `POST /snap/v1/transactions` (terutama object
 * `callbacks`) BELUM PERNAH diverifikasi manual di project ini — field di
 * bawah adalah bentuk dari dokumentasi Snap resmi, TAPI WAJIB dicek ulang
 * begitu MIDTRANS_SERVER_KEY sandbox tersedia (lihat plan bagian 12 #2),
 * pola sama seperti Keputusan C Epic 12 untuk RajaOngkir.
 */
export async function createSnapTransaction(params: CreateSnapTransactionParams): Promise<SnapTransaction> {
  const res = await fetch(midtransSnapTransactionUrl(), {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderNumber,
        gross_amount: Math.round(params.grossAmount),
      },
      customer_details: {
        first_name: params.customerName,
        phone: params.customerPhone,
        ...(params.customerEmail ? { email: params.customerEmail } : {}),
      },
      callbacks: { finish: params.finishUrl },
    }),
  });

  const body: unknown = await res.json().catch(() => null);
  const parsedBody = body as { token?: unknown; redirect_url?: unknown } | null;
  if (res.status !== 201 || typeof parsedBody?.token !== "string" || typeof parsedBody?.redirect_url !== "string") {
    throw new MidtransApiError(res.status, body);
  }
  return { token: parsedBody.token, redirectUrl: parsedBody.redirect_url };
}

export type MidtransStatusResponse = {
  transactionId: string;
  transactionStatus: string;
  fraudStatus: string | null;
  paymentType: string;
  grossAmount: string;
};

/** US-13.4 — dipanggil dari aksi rekonsiliasi manual admin, bukan alur webhook. */
export async function getTransactionStatus(orderNumber: string): Promise<MidtransStatusResponse> {
  const res = await fetch(midtransStatusUrl(orderNumber), {
    method: "GET",
    headers: { Authorization: authHeader(), Accept: "application/json" },
  });
  const body: unknown = await res.json().catch(() => null);
  const parsedBody = body as
    | {
        transaction_id?: unknown;
        transaction_status?: unknown;
        fraud_status?: unknown;
        payment_type?: unknown;
        gross_amount?: unknown;
      }
    | null;
  if (res.status !== 200 || typeof parsedBody?.transaction_id !== "string") {
    throw new MidtransApiError(res.status, body);
  }
  return {
    transactionId: parsedBody.transaction_id,
    transactionStatus: String(parsedBody.transaction_status),
    fraudStatus: typeof parsedBody.fraud_status === "string" ? parsedBody.fraud_status : null,
    paymentType: String(parsedBody.payment_type),
    grossAmount: String(parsedBody.gross_amount),
  };
}
