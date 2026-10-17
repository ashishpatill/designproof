import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDesignDoc, parseDesignTokens, type DesignDocSpec } from "./detectors/design-system-drift";

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Only apply Tell's root DESIGN.md when diagnosing Tell's own surfaces. */
export function shouldApplyDesignDoc(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    if ((host === "localhost" || host === "127.0.0.1") && port === "3000") return true;
    if (host === "tell-five.vercel.app") return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Best-effort read of design tokens for local scans: prefers a machine-readable
 * `design-tokens.json` (repo root or cwd-relative) and falls back to DESIGN.md
 * parsing when no tokens file exists.
 */
export async function loadDesignDoc(repoRoot = defaultRepoRoot): Promise<DesignDocSpec | undefined> {
  const tokenCandidates = [
    path.join(repoRoot, "design-tokens.json"),
    path.join(process.cwd(), "design-tokens.json"),
    path.join(process.cwd(), "..", "design-tokens.json"),
    path.join(process.cwd(), "..", "..", "design-tokens.json"),
  ];
  for (const candidate of [...new Set(tokenCandidates)]) {
    try {
      const spec = parseDesignTokens(await readFile(candidate, "utf8"), "design-tokens.json");
      if (spec.fonts.length > 0 || spec.colors.length > 0) return spec;
    } catch {
      /* try next candidate */
    }
  }

  const docCandidates = [
    path.join(repoRoot, "DESIGN.md"),
    path.join(process.cwd(), "DESIGN.md"),
    path.join(process.cwd(), "..", "DESIGN.md"),
    path.join(process.cwd(), "..", "..", "DESIGN.md"),
  ];
  for (const candidate of [...new Set(docCandidates)]) {
    try {
      return parseDesignDoc(await readFile(candidate, "utf8"));
    } catch {
      /* try next candidate */
    }
  }

  return undefined;
}
