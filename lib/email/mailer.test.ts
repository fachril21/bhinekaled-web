// Epic 14: Email Transaksional Order (SMTP / nodemailer).

import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMailMock = vi.fn();
let lastTransportOptions: Record<string, unknown> | undefined;
const createTransportMock = vi.fn((options: Record<string, unknown>) => {
  lastTransportOptions = options;
  return { sendMail: sendMailMock };
});

vi.mock("nodemailer", () => ({
  default: { createTransport: createTransportMock },
  createTransport: createTransportMock,
}));

beforeEach(() => {
  vi.resetModules();
  sendMailMock.mockReset();
  sendMailMock.mockResolvedValue({ messageId: "<test-id>" });
  createTransportMock.mockClear();
  lastTransportOptions = undefined;
  process.env.MAIL_HOST = "sierra.id.rapidplex.com";
  process.env.MAIL_PORT = "465";
  process.env.MAIL_SECURE = "true";
  process.env.MAIL_USER = "info@bhinekaled.id";
  process.env.MAIL_PASS = "s3cr3t";
  process.env.MAIL_FROM = "BHINEKALED <info@bhinekaled.id>";
});

describe("sendMail", () => {
  it("creates the transport from SMTP env config", async () => {
    const { sendMail } = await import("./mailer");
    await sendMail({ to: "a@b.com", subject: "Hi", html: "<p>Hi</p>", text: "Hi" });

    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(lastTransportOptions).toMatchObject({
      host: "sierra.id.rapidplex.com",
      port: 465,
      secure: true,
      auth: { user: "info@bhinekaled.id", pass: "s3cr3t" },
    });
  });

  it("sends with the configured from address and the given recipient/subject/bodies", async () => {
    const { sendMail } = await import("./mailer");
    await sendMail({ to: "customer@example.com", subject: "Invoice", html: "<b>x</b>", text: "x" });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: "BHINEKALED <info@bhinekaled.id>",
      to: "customer@example.com",
      subject: "Invoice",
      html: "<b>x</b>",
      text: "x",
    });
  });

  it("reuses a single transport instance across multiple sends", async () => {
    const { sendMail } = await import("./mailer");
    await sendMail({ to: "a@b.com", subject: "1", html: "1", text: "1" });
    await sendMail({ to: "c@d.com", subject: "2", html: "2", text: "2" });

    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledTimes(2);
  });

  it("propagates transport errors to the caller", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP 535 auth failed"));
    const { sendMail } = await import("./mailer");
    await expect(sendMail({ to: "a@b.com", subject: "x", html: "x", text: "x" })).rejects.toThrow(
      "SMTP 535 auth failed",
    );
  });

  it("throws when required SMTP config is missing", async () => {
    delete process.env.MAIL_HOST;
    const { sendMail } = await import("./mailer");
    await expect(sendMail({ to: "a@b.com", subject: "x", html: "x", text: "x" })).rejects.toThrow(
      /MAIL_HOST belum diisi/,
    );
  });
});
