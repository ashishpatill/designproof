import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/web/src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@designproof/schema": path.resolve(__dirname, "packages/schema/src"),
      "@designproof/core": path.resolve(__dirname, "packages/core/src"),
      "@designproof/redesign": path.resolve(__dirname, "packages/redesign/src"),
      "@designproof/taste": path.resolve(__dirname, "packages/taste/src"),
      "@designproof/design-skills": path.resolve(__dirname, "packages/design-skills/src"),
      "@designproof/design-skills/training-data-sink": path.resolve(
        __dirname,
        "packages/design-skills/src/training-data-sink.ts",
      ),
    },
  },
});
