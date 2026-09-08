const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
function getEnv(key) {
  const line = envContent.split("\n").find((l) => l.startsWith(key + "="));
  if (!line) return undefined;
  return line.slice(key.length + 1).trim();
}

const merchantCode = getEnv("DUITKU_MERCHANT_CODE");
const apiKey = getEnv("DUITKU_API_KEY");
const isProduction = getEnv("DUITKU_IS_PRODUCTION") === "true";
const appUrl = getEnv("NEXT_PUBLIC_APP_URL");

console.log("merchantCode prefix:", merchantCode ? merchantCode.slice(0, 2) + "***" : "MISSING");
console.log("apiKey length:", apiKey ? apiKey.length : "MISSING");
console.log("isProduction:", isProduction);
console.log("NEXT_PUBLIC_APP_URL:", appUrl);

const url = isProduction
  ? "https://api-prod.duitku.com/api/merchant/createInvoice"
  : "https://api-sandbox.duitku.com/api/merchant/createInvoice";

const timestamp = String(Date.now());
const signature = crypto.createHmac("sha256", apiKey).update(merchantCode + timestamp).digest("hex");

const body = {
  paymentAmount: 10000,
  merchantOrderId: "TEST-" + Date.now(),
  productDetails: "Diagnostic test transaction",
  email: "test@example.com",
  customerVaName: "Test Customer",
  callbackUrl: `${appUrl}/api/payments/duitku/callback`,
  returnUrl: `${appUrl}/checkout/sukses/TEST`,
};

async function main() {
  console.log("\n--- Request ---");
  console.log("URL:", url);
  console.log("Body:", JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-duitku-timestamp": timestamp,
      "x-duitku-signature": signature,
      "x-duitku-merchantcode": merchantCode,
    },
    body: JSON.stringify(body),
  });

  console.log("\n--- Response ---");
  console.log("HTTP status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}

main().catch((err) => {
  console.error("Request failed:", err.message);
  process.exit(1);
});
