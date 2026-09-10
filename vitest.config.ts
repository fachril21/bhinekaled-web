import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      include: [
        "lib/payments/**",
        "app/api/payments/**",
        "lib/actions/payments.ts",
        // Epic 14: Email Transaksional Order. Catatan: app/api/checkout/route.ts
        // sengaja tidak masuk gate coverage - alur checkout inti (Epic 3/11/12)
        // belum punya test suite sendiri; wiring email/invoice epic ini dijamin
        // lewat app/api/checkout/route.test.ts secara perilaku.
        "lib/email/**",
        "lib/orders/tracking-display.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
