// Epic 14: Email Transaksional Order (SMTP / nodemailer).
//
// Fungsi MURNI — tidak menyentuh Supabase / env / nodemailer. Menghasilkan
// {subject, html, text} untuk dua varian email invoice:
//   - "pending" (Menunggu Pembayaran)  → dikirim setelah checkout
//   - "paid"    (Pembayaran Diterima)  → dikirim setelah callback Duitku lunas
//
// HTML sengaja table-based + inline style penuh (tanpa flex/grid) demi
// kompatibilitas email client lama (Outlook dkk). Semua string dinamis
// (nama produk, nama customer, label biaya) di-escape.

import { formatRupiah } from "@/lib/format";

export type OrderInvoiceEmailItem = {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderInvoiceEmailFee = {
  label: string;
  amount: number;
};

export type OrderInvoiceEmailData = {
  orderNumber: string;
  customerName: string;
  items: OrderInvoiceEmailItem[];
  shippingLabel: string | null;
  shippingCost: number;
  fees: OrderInvoiceEmailFee[];
  total: number;
  trackingUrl: string;
  /** hanya varian "pending" — null kalau invoice Duitku gagal dibuat saat checkout */
  paymentUrl?: string | null;
  /** hanya varian "paid" — tanggal pembayaran diterima (sudah diformat) */
  paidAtLabel?: string | null;
};

export type OrderInvoiceEmailVariant = "pending" | "paid";

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

const COLORS = {
  pageBg: "#f5f5f4",
  cardBg: "#ffffff",
  ink: "#1a1a1a",
  muted: "#737373",
  border: "#e7e5e4",
  brandRed: "#e6212a",
} as const;

type VariantTheme = {
  subjectSuffix: string;
  heading: string;
  subtext: string;
  iconText: string;
  iconFill: string;
  infoBoxBg: string;
  iconGlyph: string;
};

const HEADING_FONT = "'Poppins','Helvetica Neue',Helvetica,Arial,sans-serif";
const BODY_FONT = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

const WHATSAPP_SUPPORT = "0812-3456-7890"; // TODO Epic 10: ambil dari store_profile.contact_phone

function themeFor(variant: OrderInvoiceEmailVariant): VariantTheme {
  if (variant === "paid") {
    return {
      subjectSuffix: "Pembayaran Diterima",
      heading: "Pembayaran Diterima!",
      subtext: "Terima kasih. Pembayaran pesananmu sudah kami terima dan pesanan segera diproses.",
      iconText: "#15803d",
      iconFill: "#dcfce7",
      infoBoxBg: "#f0fdf4",
      iconGlyph: "&#10003;",
    };
  }
  return {
    subjectSuffix: "Menunggu Pembayaran",
    heading: "Menunggu Pembayaranmu",
    subtext: "Pesananmu sudah kami terima. Selesaikan pembayaran agar pesanan bisa langsung kami proses.",
    iconText: "#b45309",
    iconFill: "#fef3c7",
    infoBoxBg: "#fffbeb",
    iconGlyph: "&#9202;",
  };
}

function stepsFor(variant: OrderInvoiceEmailVariant, hasPaymentUrl: boolean): string[] {
  if (variant === "paid") {
    return [
      "Pesanan disiapkan &amp; diproses oleh admin BHINEKALED.",
      "Pesanan dikirim via kurir pilihanmu, nomor resi menyusul.",
      "Pantau status pesanan kapan saja lewat halaman lacak pesanan di bawah.",
    ];
  }
  const firstStep = hasPaymentUrl
    ? "Klik tombol <strong>Bayar Sekarang</strong> di atas untuk membuka halaman pembayaran."
    : "Buka halaman <strong>Lacak Pesanan</strong> di bawah untuk melanjutkan pembayaran.";
  return [
    firstStep,
    "Pilih metode pembayaran, lalu selesaikan sebelum batas waktu berakhir.",
    "Pembayaran terverifikasi otomatis &mdash; kamu akan menerima email konfirmasi.",
  ];
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function summaryRow(label: string, value: string, opts: { strong?: boolean } = {}): string {
  const weight = opts.strong ? "700" : "400";
  const color = opts.strong ? COLORS.ink : COLORS.muted;
  const size = opts.strong ? "15px" : "13px";
  return `<tr>
    <td style="padding:4px 0;font-family:${BODY_FONT};font-size:${size};font-weight:${weight};color:${color};">${label}</td>
    <td align="right" style="padding:4px 0;font-family:${BODY_FONT};font-size:${size};font-weight:${weight};color:${color};white-space:nowrap;">${value}</td>
  </tr>`;
}

function itemRows(items: OrderInvoiceEmailItem[]): string {
  return items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};font-family:${BODY_FONT};font-size:13px;color:${COLORS.ink};">
          ${escapeHtml(item.name)}<br />
          <span style="color:${COLORS.muted};font-size:12px;">${item.qty} &times; ${formatRupiah(item.unitPrice)}</span>
        </td>
        <td align="right" valign="top" style="padding:8px 0;border-bottom:1px solid ${COLORS.border};font-family:${BODY_FONT};font-size:13px;font-weight:600;color:${COLORS.ink};white-space:nowrap;">
          ${formatRupiah(item.lineTotal)}
        </td>
      </tr>`,
    )
    .join("");
}

function stepList(steps: string[]): string {
  return steps
    .map(
      (step, index) => `<tr>
        <td valign="top" width="28" style="padding:6px 10px 6px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" width="22" height="22" style="width:22px;height:22px;background:${COLORS.ink};border-radius:11px;font-family:${BODY_FONT};font-size:12px;font-weight:700;color:#ffffff;">${index + 1}</td>
          </tr></table>
        </td>
        <td valign="top" style="padding:6px 0;font-family:${BODY_FONT};font-size:13px;line-height:1.5;color:${COLORS.muted};">${step}</td>
      </tr>`,
    )
    .join("");
}

function pillButton(label: string, url: string, filled: boolean): string {
  const bg = filled ? COLORS.brandRed : COLORS.cardBg;
  const color = filled ? "#ffffff" : COLORS.ink;
  const border = filled ? COLORS.brandRed : COLORS.ink;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
    <td align="center" style="border-radius:9999px;background:${bg};border:2px solid ${border};">
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:11px 26px;font-family:${HEADING_FONT};font-size:14px;font-weight:700;color:${color};text-decoration:none;border-radius:9999px;">${label}</a>
    </td>
  </tr></table>`;
}

function buildHtml(variant: OrderInvoiceEmailVariant, data: OrderInvoiceEmailData, theme: VariantTheme): string {
  const shippingLabel = data.shippingLabel ? `Ongkos Kirim (${escapeHtml(data.shippingLabel)})` : "Ongkos Kirim";

  const feeRows = data.fees.map((fee) => summaryRow(escapeHtml(fee.label), formatRupiah(fee.amount))).join("");

  let callToAction: string;
  if (variant === "pending") {
    if (data.paymentUrl) {
      callToAction = `
        ${summaryRow("Jumlah tagihan", formatRupiah(data.total), { strong: true })}
        <tr><td colspan="2" style="padding:16px 0 4px;">${pillButton("Bayar Sekarang", data.paymentUrl, true)}</td></tr>`;
    } else {
      callToAction = `<tr><td colspan="2" style="padding:12px 0 0;font-family:${BODY_FONT};font-size:13px;line-height:1.5;color:${theme.iconText};">
        Link pembayaran belum tersedia. Buka halaman lacak pesanan di bawah untuk mencoba lagi, atau hubungi admin lewat WhatsApp ${WHATSAPP_SUPPORT}.
      </td></tr>`;
    }
  } else {
    const paidLine = data.paidAtLabel
      ? `Pembayaran lunas diterima pada ${escapeHtml(data.paidAtLabel)}.`
      : "Pembayaran lunas sudah diterima.";
    callToAction = `<tr><td colspan="2" style="padding:12px 0 0;font-family:${BODY_FONT};font-size:13px;line-height:1.5;color:${theme.iconText};font-weight:600;">${paidLine}</td></tr>`;
  }

  const secondaryButton = pillButton("Lacak Pesanan", data.trackingUrl, false);

  return `<!doctype html>
<html lang="id">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Invoice Pesanan ${escapeHtml(data.orderNumber)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.pageBg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.pageBg};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="width:520px;max-width:100%;background:${COLORS.cardBg};border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.09);">
    <tr><td style="padding:36px 32px 28px;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;"><tr>
        <td align="center" width="56" height="56" style="width:56px;height:56px;background:${theme.iconFill};border-radius:14px;font-size:26px;line-height:56px;color:${theme.iconText};">${theme.iconGlyph}</td>
      </tr></table>

      <h1 style="margin:0 0 6px;text-align:center;font-family:${HEADING_FONT};font-size:22px;font-weight:800;color:${COLORS.ink};">${theme.heading}</h1>
      <p style="margin:0 0 22px;text-align:center;font-family:${BODY_FONT};font-size:14px;line-height:1.55;color:${COLORS.muted};">${theme.subtext}</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${theme.infoBoxBg};border:1px solid ${COLORS.border};border-radius:10px;">
        <tr><td style="padding:18px 18px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${summaryRow("Nomor Pesanan", `<span style="color:${COLORS.brandRed};font-weight:700;">${escapeHtml(data.orderNumber)}</span>`)}
            ${summaryRow("Atas nama", escapeHtml(data.customerName))}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
            ${itemRows(data.items)}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
            ${summaryRow(`Subtotal`, formatRupiah(data.items.reduce((sum, i) => sum + i.lineTotal, 0)))}
            ${summaryRow(shippingLabel, formatRupiah(data.shippingCost))}
            ${feeRows}
            ${summaryRow("Total", formatRupiah(data.total), { strong: true })}
            ${callToAction}
          </table>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;"><tr><td style="border-top:1px solid ${COLORS.border};font-size:0;line-height:0;">&nbsp;</td></tr></table>

      <p style="margin:14px 0 8px;font-family:${HEADING_FONT};font-size:13px;font-weight:700;color:${COLORS.ink};">Langkah selanjutnya</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${stepList(stepsFor(variant, Boolean(data.paymentUrl)))}</table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tr><td align="center">${secondaryButton}</td></tr></table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px auto 0;"><tr>
        <td align="center" style="padding:6px 14px;background:${COLORS.pageBg};border-radius:9999px;font-family:${HEADING_FONT};font-size:11px;font-weight:700;letter-spacing:0.5px;color:${COLORS.ink};">
          BHINEKALED &nbsp;&bull;&nbsp; WhatsApp ${WHATSAPP_SUPPORT}
        </td>
      </tr></table>

    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function buildText(variant: OrderInvoiceEmailVariant, data: OrderInvoiceEmailData, theme: VariantTheme): string {
  const lines: string[] = [];
  lines.push(theme.heading);
  lines.push("");
  lines.push(`Nomor Pesanan: ${data.orderNumber}`);
  lines.push(`Atas nama: ${data.customerName}`);
  lines.push("");
  for (const item of data.items) {
    lines.push(`- ${item.name} (${item.qty} x ${formatRupiah(item.unitPrice)}) = ${formatRupiah(item.lineTotal)}`);
  }
  lines.push("");
  lines.push(`Ongkos Kirim${data.shippingLabel ? ` (${data.shippingLabel})` : ""}: ${formatRupiah(data.shippingCost)}`);
  for (const fee of data.fees) {
    lines.push(`${fee.label}: ${formatRupiah(fee.amount)}`);
  }
  lines.push(`Total: ${formatRupiah(data.total)}`);
  lines.push("");
  if (variant === "pending") {
    if (data.paymentUrl) {
      lines.push(`Bayar sekarang: ${data.paymentUrl}`);
    } else {
      lines.push(`Link pembayaran belum tersedia. Buka halaman lacak pesanan atau hubungi admin (WhatsApp ${WHATSAPP_SUPPORT}).`);
    }
  } else {
    lines.push(data.paidAtLabel ? `Pembayaran lunas diterima pada ${data.paidAtLabel}.` : "Pembayaran lunas sudah diterima.");
  }
  lines.push(`Lacak pesanan: ${data.trackingUrl}`);
  lines.push("");
  lines.push(`BHINEKALED - WhatsApp ${WHATSAPP_SUPPORT}`);
  return lines.join("\n");
}

export function renderOrderInvoiceEmail(
  variant: OrderInvoiceEmailVariant,
  data: OrderInvoiceEmailData,
): RenderedEmail {
  const theme = themeFor(variant);
  return {
    subject: `Invoice Pesanan #${data.orderNumber} — ${theme.subjectSuffix}`,
    html: buildHtml(variant, data, theme),
    text: buildText(variant, data, theme),
  };
}
