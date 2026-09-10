// Epic 14: Email Transaksional Order (SMTP / nodemailer).
//
// ⚠️ Server-only — dipanggil dari Route Handler / Server Action / helper
// server (lib/email/send-order-emails.ts). TIDAK PERNAH dari Client Component.
//
// Fase 1: kirim sinkron sederhana, TANPA queue/retry. Kegagalan dilempar ke
// pemanggil, yang memutuskan apakah menelan error (checkout / callback tidak
// boleh gagal hanya karena email gagal).

import nodemailer, { type Transporter } from "nodemailer";
import { mailFrom, mailHost, mailPass, mailPort, mailSecure, mailUser } from "./config";

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: mailHost(),
    port: mailPort(),
    secure: mailSecure(),
    auth: { user: mailUser(), pass: mailPass() },
    // Jangan biarkan koneksi SMTP menggantung request checkout/callback.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

export async function sendMail(input: SendMailInput): Promise<void> {
  await getTransporter().sendMail({
    from: mailFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
