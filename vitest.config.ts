import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    // server/__tests__ runs via `npm run test:server` using node:test, not vitest.
    exclude: ["node_modules", "e2e", "server/**"],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
