#!/usr/bin/env tsx
/**
 * Compare two DesignProofReport JSON files (or a live preview vs a committed baseline)
 * using the same compareProofReports verdict as /api/proof/verify mode=compare.
 *
 * Env:
 *   DP_BEFORE_REPORT  path to before DesignProofReport JSON (default: fixtures/reports/dp-report.json)
 *   DP_AFTER_REPORT   path to after DesignProofReport JSON (optional if DP_PREVIEW_URL set)
 *   DP_PREVIEW_URL    if set and DP_AFTER_REPORT unset, diagnose this URL as "after"
 *   DP_PROOF_URL      URL label recorded in proof (defaults to preview or before capture url)
 *   DP_FAIL_ON        comma list of statuses that fail the job (default: failed)
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { captureUrl, compareProofReports, diagnoseCapture, loadDesignDoc, shouldApplyDesignDoc } from "@designproof/core";
import { DesignProofReport } from "@designproof/schema";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

function resolveRepoPath(p: string): string {
  if (isAbsolute(p)) return p;
  const fromCwd = resolve(process.cwd(), p);
  if (existsSync(fromCwd)) return fromCwd;
  return join(repoRoot, p);
}

async function loadReport(path: string): Promise<DesignProofReport> {
  return DesignProofReport.parse(JSON.parse(readFileSync(resolveRepoPath(path), "utf8")));
}

async function main(): Promise<void> {
  const beforePath = process.env.DP_BEFORE_REPORT ?? "fixtures/reports/dp-report.json";
  const afterPath = process.env.DP_AFTER_REPORT;
  const previewUrl = process.env.DP_PREVIEW_URL ?? process.env.PREVIEW_URL ?? "";
  const failOn = new Set(
    (process.env.DP_FAIL_ON ?? "failed")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const compareSelf = process.env.DP_COMPARE_SELF === "1" || process.env.DP_COMPARE_SELF === "true";

  let beforeReport: DesignProofReport;
  let afterReport: DesignProofReport;

  if (compareSelf && previewUrl) {
    // Live smoke: diagnose the preview once and compare the report to itself.
    // Avoid scoring the generic-app fixture against an unrelated Design Proof web preview.
    const capture = await captureUrl(previewUrl);
    const designDoc = shouldApplyDesignDoc(previewUrl) ? await loadDesignDoc() : undefined;
    const live = diagnoseCapture(capture, undefined, designDoc);
    beforeReport = live;
    afterReport = live;
  } else {
    beforeReport = await loadReport(beforePath);
    if (afterPath) {
      afterReport = await loadReport(afterPath);
    } else if (previewUrl) {
      const capture = await captureUrl(previewUrl);
      const designDoc = shouldApplyDesignDoc(previewUrl) ? await loadDesignDoc() : undefined;
      afterReport = diagnoseCapture(capture, undefined, designDoc);
    } else {
      console.error("Set DP_AFTER_REPORT or DP_PREVIEW_URL for the after report.");
      process.exit(1);
    }
  }

  const url = process.env.DP_PROOF_URL || previewUrl || afterReport.capture.url || beforeReport.capture.url;
  const { status, proof } = compareProofReports(beforeReport, afterReport, url);

  const outPath = resolveRepoPath(process.env.DP_PROOF_REPORT_PATH ?? "dp-proof-compare.json");
  writeFileSync(outPath, JSON.stringify({ status, proof, beforeScore: proof.beforeScore, afterScore: proof.afterScore }, null, 2));

  const lines = [
    "## Design Proof — report compare",
    "",
    `**Status:** \`${status}\``,
    `**URL:** ${url}`,
    `**Score:** ${proof.beforeScore.toFixed(1)} → ${proof.afterScore.toFixed(1)} (Δ ${proof.scoreDelta.toFixed(1)})`,
    `**Findings:** ${proof.findingsBefore} → ${proof.findingsAfter}`,
    `**Focus coverage:** ${proof.focusBefore.toFixed(2)} → ${proof.focusAfter.toFixed(2)}`,
    `**Screenshot changed:** ${proof.screenshotsDiffer ? "yes" : "no"}`,
    `**Structure regressed:** ${proof.structureRegressed ? "yes" : "no"}`,
    "",
  ];
  const markdown = lines.join("\n");
  console.log(markdown);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }

  if (failOn.has(status)) {
    console.error(`Proof compare status "${status}" is in DP_FAIL_ON (${[...failOn].join(", ")}).`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
