/**
 * Phase 0 — baseline measurement harness.
 *
 * Generates a preview for every offering in the catalog, runs `checkPreviewBudgets` on each,
 * records the size/script/viewport/asset facts, captures one reduced-motion screenshot hash, and
 * writes `research/measurements/baseline-YYYY-MM-DD.json`.
 *
 * The harness is deliberately boring: same deterministic renderer the showcase uses, same budget
 * checker `pnpm test` already gates on, no model, no network, no INP probe. The plan's Playwright
 * INP helper is cut for Phase 0 (`inpHelper: "skipped"` in the record).
 *
 * Usage:
 *   pnpm measure:previews
 *   pnpm measure:previews -- --skip-tests --no-screenshot   # fast local re-run
 *   pnpm measure:previews -- --out research/measurements/baseline-2026-10-25.json
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import {
  buildBaseline,
  isoInTimeZone,
  measureTemplates,
  parseVitestSummary,
  type PnpmTestSummary,
  type ReducedMotionScreenshot,
} from "../../packages/design-skills/src/measurement-harness";
import { designFromFeatures, listTemplates } from "../../packages/design-skills/src/index";

function repoRoot(from = process.cwd()): string {
  let dir = from;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return from;
}

const root = repoRoot();

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : "";
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function gitTip(): string {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  const sha = result.stdout?.trim();
  if (result.status !== 0 || !sha) {
    throw new Error(`git rev-parse HEAD failed: ${result.stderr?.trim() ?? "unknown error"}`);
  }
  return sha;
}

/**
 * Run the suite on the head being measured. The plan forbids copying 430/56 or 474 into a later
 * exit check, so this reads the counts from vitest's own summary and says so in `note`.
 */
function runPnpmTest(): { summary: PnpmTestSummary; failed: boolean } {
  process.stderr.write("measure:previews · running pnpm test (this is the baseline count)…\n");
  const result = spawnSync("pnpm", ["test"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const parsed = parseVitestSummary(output);
  if (!parsed) {
    return {
      summary: {
        passed: 0,
        files: 0,
        total: 0,
        note: "pnpm test ran but the vitest summary could not be parsed; treat this row as unmeasured.",
      },
      failed: true,
    };
  }
  const note = [
    `Measured on this head (${gitTip()}): ${parsed.passed} passed` +
      `${parsed.failed ? `, ${parsed.failed} failed` : ""} / ${parsed.files} files.`,
    "Historic master 430 passed / 56 files (REVAMP-AUDIT) and branch f669c64 474 (PR #105) were",
    "reported before #105 merged; neither number is reused here.",
  ].join(" ");
  return { summary: { passed: parsed.passed, files: parsed.files, total: parsed.total, note }, failed: parsed.failed > 0 || result.status !== 0 };
}

/**
 * One reduced-motion screenshot, measured but not shipped: `research/shots/` is gitignored, and a
 * binary is not an anonymised measurement. The record keeps the hash, byte count, viewport, and
 * the exact command that reproduces it.
 */
async function captureReducedMotion(templateKey: string): Promise<ReducedMotionScreenshot> {
  const template = listTemplates().find((t) => t.key === templateKey) ?? listTemplates()[0];
  if (!template) return { skipped: true, reason: "no template available to capture" };
  const { previewHtml } = designFromFeatures(template.brief, template.theme ? { theme: template.theme } : {});
  const capturedAt = isoInTimeZone();
  try {
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      await page.setContent(previewHtml, { waitUntil: "load", timeout: 30_000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const png = await page.screenshot({ animations: "disabled" });
      const localDir = resolve(root, "research/shots");
      mkdirSync(localDir, { recursive: true });
      writeFileSync(resolve(localDir, `phase0-reduced-motion-${template.key}.png`), png);
      return {
        skipped: false,
        template: template.key,
        viewport: "1440x900",
        reducedMotion: true,
        sha256: createHash("sha256").update(png).digest("hex"),
        bytes: png.byteLength,
        capturedAt,
        artifact: null,
        note:
          `PNG hash of the first fold with reducedMotion=reduce, animations disabled. The image ` +
          `stays local at research/shots/phase0-reduced-motion-${template.key}.png (gitignored); ` +
          `regenerate with pnpm measure:previews. Hashes are renderer-dependent.`,
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    return {
      skipped: true,
      template: template.key,
      viewport: "1440x900",
      capturedAt,
      reason: error instanceof Error ? error.message : String(error),
      note: "Cut-if-short path: screenshot capture failed without blocking the HTML baseline.",
    };
  }
}

function istDate(timestamp: string): string {
  return timestamp.slice(0, 10);
}

async function main(): Promise<void> {
  const measuredAt = isoInTimeZone();
  const tipSha = gitTip();
  const previews = measureTemplates();

  const pnpmTest: PnpmTestSummary = hasFlag("skip-tests")
    ? {
        passed: 0,
        files: 0,
        total: 0,
        note: "pnpm test skipped (--skip-tests). This row is not a measurement and must not be reused.",
      }
    : { passed: 0, files: 0, total: 0, note: "" };
  let testsFailed = false;
  if (!hasFlag("skip-tests")) {
    const run = runPnpmTest();
    Object.assign(pnpmTest, run.summary);
    testsFailed = run.failed;
  }

  const reducedMotionScreenshot = hasFlag("no-screenshot")
    ? {
        skipped: true,
        reason: "skipped by --no-screenshot",
        note: "Cut-if-short path: HTML baseline is complete without the screenshot hash.",
      }
    : await captureReducedMotion("dossier");

  const record = buildBaseline({
    tipSha,
    measuredAt,
    node: process.version,
    pnpmTest,
    previews,
    reducedMotionScreenshot,
  });

  const outPath = resolve(
    root,
    arg("out") || `research/measurements/baseline-${istDate(measuredAt)}.json`,
  );
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`);

  const failedPreviews = previews.filter((p) => !p.budgetPassed);
  console.log(`\nPhase 0 baseline · ${tipSha.slice(0, 7)} · ${measuredAt}`);
  console.log(`wrote ${outPath.replace(`${root}/`, "")}`);
  console.log(`previews ${previews.length} · budget failures ${failedPreviews.length}`);
  for (const preview of previews) {
    const state = preview.budgetPassed ? "pass" : `FAIL ${preview.failedFindingIds.join(",")}`;
    console.log(
      `  ${preview.key.padEnd(12)} ${String(preview.bytes).padStart(7)}B  ` +
        `${preview.scriptCount} script  viewport=${preview.viewportMeta ? "yes" : "no"}  ` +
        `httpAssets=${preview.httpAssets.length}  ${state}`,
    );
  }
  if (reducedMotionScreenshot.skipped) {
    console.log(`screenshot skipped: ${reducedMotionScreenshot.reason}`);
  } else {
    console.log(
      `screenshot ${reducedMotionScreenshot.template} ${reducedMotionScreenshot.viewport} ` +
        `sha256=${reducedMotionScreenshot.sha256?.slice(0, 12)}…`,
    );
  }

  if (testsFailed || failedPreviews.length > 0) {
    console.error("\nBaseline recorded with failures — fix the suite/budgets before treating it as green.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
