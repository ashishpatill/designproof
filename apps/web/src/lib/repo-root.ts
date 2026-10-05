import { existsSync } from "node:fs";
import path from "node:path";

/** Monorepo root (directory containing pnpm-workspace.yaml). */
export function repoRoot(): string {
  if (process.env.DP_REPO_ROOT) {
    return path.resolve(process.env.DP_REPO_ROOT);
  }

  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  // Next.js dev/prod usually runs with cwd = apps/web.
  return path.resolve(process.cwd(), "../..");
}

export function isRepoSetupEnabled(): boolean {
  return process.env.DP_DISABLE_REPO_SETUP !== "1";
}
