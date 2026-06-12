import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-transition-group/TransitionGroupContext":
        "react-transition-group/esm/TransitionGroupContext.js"
    }
  },
  test: {
    server: {
      deps: {
        inline: [
          /@mui\/x-data-grid.*/,
          /@mui\/material.*/,
          /react-transition-group.*/
        ]
      }
    },
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.ts",
    include: ["__tests__/**/*.ts(x)?"]
  }
});
