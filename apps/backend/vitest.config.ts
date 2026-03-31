import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@waht/shared": path.resolve(
        __dirname,
        "../../packages/shared/dist/index.js",
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/routes/**"],
      thresholds: {
        lines: 60,
        functions: 60,
      },
    },
  },
});
