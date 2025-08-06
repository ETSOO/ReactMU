import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    server: {
      deps: {
        inline: [/@mui\/x-data-grid.*/]
      }
    },
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.ts",
    include: ["__tests__/**/*.ts(x)?"]
  }
});
