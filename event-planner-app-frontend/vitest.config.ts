import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setup.ts"],
    // Node's fetch rejects relative URLs, so the app's "/api" fallback can't be used here.
    env: { VITE_API_URL: "http://localhost/api" },
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
});
