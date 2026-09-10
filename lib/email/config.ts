// Epic 14: Email Transaksional Order (SMTP / nodemailer).
//
// ⚠️ Server-only — MAIL_* tidak pernah punya prefix NEXT_PUBLIC_ dan TIDAK
// PERNAH diimpor dari Client Component. Pola sama persis
// lib/payments/duitku-config.ts: reader function yang membaca process.env
// saat dipanggil (bukan saat module load) dan throw dengan pesan jelas kalau
// nilai wajib belum diisi.

const DEFAULT_MAIL_PORT = 465;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi.`);
  return value;
}

export function mailHost(): string {
  return required("MAIL_HOST");
}

export function mailUser(): string {
  return required("MAIL_USER");
}

export function mailPass(): string {
  return required("MAIL_PASS");
}

export function mailPort(): number {
  const raw = process.env.MAIL_PORT;
  if (!raw) return DEFAULT_MAIL_PORT;
  const port = Number.parseInt(raw, 10);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`MAIL_PORT tidak valid: "${raw}".`);
  }
  return port;
}

// Default aman: SMTP implicit TLS di port 465. Hanya "false" eksplisit yang
// mematikannya (mis. STARTTLS di port 587).
export function mailSecure(): boolean {
  return process.env.MAIL_SECURE !== "false";
}

export function mailFrom(): string {
  return process.env.MAIL_FROM || `BHINEKALED <${mailUser()}>`;
}
