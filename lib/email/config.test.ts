// Epic 14: Email Transaksional Order (SMTP / nodemailer).

import { describe, it, expect, beforeEach, afterEach } from "vitest";

const MAIL_ENV_KEYS = ["MAIL_HOST", "MAIL_PORT", "MAIL_SECURE", "MAIL_USER", "MAIL_PASS", "MAIL_FROM"] as const;

const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of MAIL_ENV_KEYS) {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  }
  process.env.MAIL_HOST = "sierra.id.rapidplex.com";
  process.env.MAIL_PORT = "465";
  process.env.MAIL_SECURE = "true";
  process.env.MAIL_USER = "info@bhinekaled.id";
  process.env.MAIL_PASS = "s3cr3t";
  process.env.MAIL_FROM = "BHINEKALED <info@bhinekaled.id>";
});

afterEach(() => {
  for (const key of MAIL_ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe("email config", () => {
  it("reads host, user, pass, and from from env", async () => {
    const { mailHost, mailUser, mailPass, mailFrom } = await import("./config");
    expect(mailHost()).toBe("sierra.id.rapidplex.com");
    expect(mailUser()).toBe("info@bhinekaled.id");
    expect(mailPass()).toBe("s3cr3t");
    expect(mailFrom()).toBe("BHINEKALED <info@bhinekaled.id>");
  });

  it("parses MAIL_PORT as an integer", async () => {
    const { mailPort } = await import("./config");
    expect(mailPort()).toBe(465);
  });

  it("defaults port to 465 when MAIL_PORT is unset", async () => {
    delete process.env.MAIL_PORT;
    const { mailPort } = await import("./config");
    expect(mailPort()).toBe(465);
  });

  it("throws on a non-numeric MAIL_PORT", async () => {
    process.env.MAIL_PORT = "abc";
    const { mailPort } = await import("./config");
    expect(() => mailPort()).toThrow(/MAIL_PORT/);
  });

  it("treats MAIL_SECURE as true by default and false only for 'false'", async () => {
    const { mailSecure } = await import("./config");
    expect(mailSecure()).toBe(true);

    process.env.MAIL_SECURE = "false";
    expect(mailSecure()).toBe(false);

    delete process.env.MAIL_SECURE;
    expect(mailSecure()).toBe(true);
  });

  it("falls back to a 'BHINEKALED <user>' from address when MAIL_FROM is unset", async () => {
    delete process.env.MAIL_FROM;
    const { mailFrom } = await import("./config");
    expect(mailFrom()).toBe("BHINEKALED <info@bhinekaled.id>");
  });

  it("throws a clear error when MAIL_HOST is missing", async () => {
    delete process.env.MAIL_HOST;
    const { mailHost } = await import("./config");
    expect(() => mailHost()).toThrow(/MAIL_HOST belum diisi/);
  });

  it("throws a clear error when MAIL_PASS is missing", async () => {
    delete process.env.MAIL_PASS;
    const { mailPass } = await import("./config");
    expect(() => mailPass()).toThrow(/MAIL_PASS belum diisi/);
  });

  it("throws a clear error when MAIL_USER is missing", async () => {
    delete process.env.MAIL_USER;
    const { mailUser } = await import("./config");
    expect(() => mailUser()).toThrow(/MAIL_USER belum diisi/);
  });
});
