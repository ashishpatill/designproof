import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

// Monorepo env lives at designproof/.env — load it before Next reads server env.
const dpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadEnvConfig(dpRoot);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@designproof/schema", "@designproof/taste", "@designproof/redesign", "@designproof/core", "@designproof/design-skills"],
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
  experimental: {
    // Playwright must stay external so Next does not try to bundle browser binaries.
    serverComponentsExternalPackages: ["playwright", "playwright-core"],
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        "playwright",
        "playwright-core",
      ];
    }
    return config;
  },
};

export default nextConfig;
