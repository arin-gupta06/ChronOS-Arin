import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test",
  use: {
    trace: "on-first-retry",
  },
});
