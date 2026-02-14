import { defineConfig } from "vitest/config";
import { resolve } from "node:path"; // Use Node's resolve (drop custom path.resolve)

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/testing/setup.ts"], // Verify this file exists
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
