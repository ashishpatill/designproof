/**
 * Phase 0 harness gate: `pnpm test` must measure the same previews the baseline ships.
 *
 * These tests do not launch a browser. They exercise the pure measurement path that
 * `scripts/design-research/measure-previews.ts` writes to `research/measurements/baseline-*.json`,
 * so a renderer or budget change cannot silently invalidate the committed baseline.
 */
import { describe, expect, it } from "vitest";
import {
  BASELINE_SCHEMA_VERSION,
  buildBaseline,
  extractHttpAssets,
  failureRows,
  isoInTimeZone,
  measurePreviewHtml,
  measureTemplates,
  parseVitestSummary,
} from "../measurement-harness";
import { PERFORMANCE_BUDGETS } from "../staged";
import { listTemplates } from "../templates";

const sample = (html: string) =>
  measurePreviewHtml({
    key: "sample",
    label: "Sample",
    siteKind: "saas-marketing",
    html,
  });

describe("baseline measurement harness", () => {
  it("measures every catalog offering, at least the five Phase 0 requires", () => {
    const templates = listTemplates();
    const previews = measureTemplates(templates);

    expect(previews.length).toBe(templates.length);
    expect(previews.length).toBeGreaterThanOrEqual(5);
    for (const preview of previews) {
      expect(preview.key).toBeTruthy();
      expect(preview.bytes).toBeGreaterThan(0);
      expect(preview.scriptCount).toBeGreaterThanOrEqual(0);
      expect(preview.viewportMeta, preview.key).toBe(true);
      expect(preview.htmlSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(preview.budgetPassed, `${preview.key}: ${preview.failedFindingIds.join(",")}`).toBe(true);
      expect(preview.failedFindingIds).toEqual([]);
    }
  });

  it("records byte and script failures as failure rows", () => {
    const oversized = sample(
      `<html><head><meta name="viewport" content="width=device-width">` +
        `${"<script></script>".repeat(4)}</head><body>${"a".repeat(
          PERFORMANCE_BUDGETS.initialTransferKb * 1024 + 1,
        )}</body></html>`,
    );
    expect(oversized.budgetPassed).toBe(false);
    expect(oversized.failedFindingIds).toContain("transfer-bytes");
    expect(oversized.failedFindingIds).toContain("script-tags");

    const rows = failureRows([oversized]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.reason).toContain("transfer-bytes");
    expect(rows[0]?.reason).toContain("script-tags");
  });

  it("keeps a clean preview out of the failure table", () => {
    const clean = sample(
      '<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body>hi</body></html>',
    );
    expect(clean.failedFindingIds).toEqual([]);
    expect(failureRows([clean])).toEqual([]);
  });

  it("extracts insecure assets but ignores the SVG namespace", () => {
    expect(
      extractHttpAssets(`<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>`),
    ).toEqual([]);
    expect(
      extractHttpAssets(`<link href="http://cdn.example/font.woff2"><img src="http://cdn.example/a.png">`),
    ).toEqual(["http://cdn.example/font.woff2", "http://cdn.example/a.png"]);
  });

  it("parses the vitest summary instead of trusting a historic count", () => {
    const output = [
      " Test Files  68 passed (68)",
      "      Tests  654 passed (654)",
      "   Duration  6.65s",
    ].join("\n");
    expect(parseVitestSummary(output)).toEqual({ passed: 654, failed: 0, files: 68, total: 654 });
    expect(parseVitestSummary("no summary here")).toBeNull();
  });

  it("builds a Phase 0 record with the locked cut-if-short fields", () => {
    const previews = measureTemplates();
    const record = buildBaseline({
      tipSha: "1828ccb86fb7fbdf8a1ce62c1250a6d88eb21741",
      measuredAt: "2026-10-25T15:47:31+05:30",
      node: "v22.0.0",
      pnpmTest: {
        passed: 654,
        files: 68,
        total: 654,
        note: "measured on this head",
      },
      previews,
      reducedMotionScreenshot: {
        skipped: true,
        reason: "unit test does not launch Playwright",
        note: "hash is captured by the script",
      },
    });

    expect(record.schemaVersion).toBe(BASELINE_SCHEMA_VERSION);
    expect(record.phase).toBe("phase-0-baseline");
    expect(record.tipSha).toBe("1828ccb86fb7fbdf8a1ce62c1250a6d88eb21741");
    expect(record.dossierPlate).toEqual({
      desktop: "748/800",
      mobile: "798/844",
      source: "plan-recorded measured pass",
    });
    expect(record.failures).toEqual([]);
    expect(record.cutIfShort).toBe(true);
    expect(record.inpHelper).toBe("skipped");
  });

  it("formats the measured timestamp with an explicit IST offset", () => {
    const iso = isoInTimeZone(new Date("2026-10-25T10:17:31.000Z"), "Asia/Calcutta");
    expect(iso).toBe("2026-10-25T15:47:31+05:30");
  });
});
