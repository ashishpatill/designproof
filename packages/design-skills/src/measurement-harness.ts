/**
 * Phase 0 baseline harness — measure generated previews instead of describing them.
 *
 * The engine already renders deterministic HTML for every template and already has a budget
 * checker (`checkPreviewBudgets`). What was missing was a record: which previews exist on this
 * tip, how large they are, how many scripts they carry, and whether any budget failed. This
 * module is the pure part of that record; `scripts/design-research/measure-previews.ts` adds the
 * IO (git tip, `pnpm test` summary, one reduced-motion screenshot).
 *
 * Nothing here launches a browser, calls a model, or reaches the network. The INP helper in the
 * plan is deliberately skipped for Phase 0 — see `inpHelper` in the baseline record.
 */
import { createHash } from "node:crypto";
import { designFromFeatures } from "./orchestrate";
import { checkPreviewBudgets, PERFORMANCE_BUDGETS, type BudgetFinding } from "./staged";
import { listTemplates, type DesignTemplate, type TemplateKey } from "./templates";
import type { SiteKind } from "./types";

export const BASELINE_SCHEMA_VERSION = 1;

export interface PreviewMeasurement {
  /** Template key — stable across runs, unlike the product name inside the brief. */
  key: TemplateKey | string;
  label: string;
  siteKind: SiteKind;
  theme?: string;
  bytes: number;
  scriptCount: number;
  viewportMeta: boolean;
  /** `http://` assets found in the preview, excluding the SVG namespace. */
  httpAssets: string[];
  budgetPassed: boolean;
  failedFindingIds: string[];
  findings: BudgetFinding[];
  htmlSha256: string;
}

export interface PreviewFailureRow {
  key: string;
  reason: string;
  bytes: number;
  scriptCount: number;
}

export interface PnpmTestSummary {
  passed: number;
  files: number;
  total: number;
  note: string;
}

export interface DossierPlate {
  desktop: string;
  mobile: string;
  source: string;
}

export interface ReducedMotionScreenshot {
  skipped: boolean;
  reason?: string;
  template?: string;
  viewport?: string;
  reducedMotion?: true;
  sha256?: string;
  bytes?: number;
  capturedAt?: string;
  /** Binaries stay local (research/shots is gitignored); the hash is the shipped proof. */
  artifact?: null;
  note?: string;
}

export interface BaselineRecord {
  schemaVersion: number;
  phase: "phase-0-baseline";
  tipSha: string;
  measuredAt: string;
  node: string;
  pnpmTest: PnpmTestSummary;
  dossierPlate: DossierPlate;
  budgets: typeof PERFORMANCE_BUDGETS;
  previews: PreviewMeasurement[];
  failures: PreviewFailureRow[];
  reducedMotionScreenshot: ReducedMotionScreenshot;
  cutIfShort: true;
  inpHelper: "skipped";
}

const HTTP_ASSET = /(?:src|href)\s*=\s*["'](http:\/\/[^"']+)["']/gi;

/**
 * The budget checker only reports "an insecure asset exists". A baseline needs to point at the
 * asset, so the same pattern is extracted here. `www.w3.org` is the SVG XML namespace, not a fetch.
 */
export function extractHttpAssets(html: string): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(HTTP_ASSET)) {
    const url = match[1];
    if (url && !/^http:\/\/www\.w3\.org/i.test(url)) found.add(url);
  }
  return [...found];
}

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function measurePreviewHtml(input: {
  key: string;
  label: string;
  siteKind: SiteKind;
  theme?: string;
  html: string;
}): PreviewMeasurement {
  const report = checkPreviewBudgets(input.html);
  return {
    key: input.key,
    label: input.label,
    siteKind: input.siteKind,
    ...(input.theme ? { theme: input.theme } : {}),
    bytes: new TextEncoder().encode(input.html).length,
    scriptCount: (input.html.match(/<script\b/gi) ?? []).length,
    viewportMeta: /<meta[^>]*name=["']viewport["']/i.test(input.html),
    httpAssets: extractHttpAssets(input.html),
    budgetPassed: report.passed,
    failedFindingIds: report.findings.filter((f) => !f.ok).map((f) => f.id),
    findings: report.findings,
    htmlSha256: sha256(input.html),
  };
}

/** Render and measure one catalog template the same way the showcase does. */
export function measureTemplate(template: DesignTemplate): PreviewMeasurement {
  const { spec, previewHtml } = designFromFeatures(
    template.brief,
    template.theme ? { theme: template.theme } : {},
  );
  return measurePreviewHtml({
    key: template.key,
    label: template.label,
    siteKind: spec.brief.siteKind,
    theme: template.theme ?? spec.brief.theme,
    html: previewHtml,
  });
}

/** Measure every offering in the catalog. Deterministic and cheap — no browser involved. */
export function measureTemplates(templates: DesignTemplate[] = listTemplates()): PreviewMeasurement[] {
  return templates.map(measureTemplate);
}

/**
 * Failure rows are intentionally limited to the two hard gates the plan names — transfer size
 * over 2048 KB and more than three script tags. Other budget findings still show up per preview
 * in `failedFindingIds`; they are not promoted into the failure table.
 */
export function failureRows(previews: PreviewMeasurement[]): PreviewFailureRow[] {
  const rows: PreviewFailureRow[] = [];
  for (const preview of previews) {
    const overBytes = preview.bytes > PERFORMANCE_BUDGETS.initialTransferKb * 1024;
    const overScripts = preview.scriptCount > 3;
    if (!overBytes && !overScripts) continue;
    const reasons: string[] = [];
    if (overBytes) {
      reasons.push(
        `transfer-bytes: ${preview.bytes} bytes > ${PERFORMANCE_BUDGETS.initialTransferKb}KB`,
      );
    }
    if (overScripts) reasons.push(`script-tags: ${preview.scriptCount} > 3`);
    rows.push({
      key: preview.key,
      reason: reasons.join("; "),
      bytes: preview.bytes,
      scriptCount: preview.scriptCount,
    });
  }
  return rows;
}

/**
 * Vitest prints `Test Files  68 passed (68)` and `Tests  654 passed (654)`. Parse the summary
 * rather than trust a hand-copied number: the plan is explicit that no historic count may be
 * reused after this baseline lands.
 */
export function parseVitestSummary(output: string): {
  passed: number;
  failed: number;
  files: number;
  total: number;
} | null {
  const clean = output.replace(/\u001b\[[0-9;]*m/g, "");
  const testsLine = clean.match(/^\s*Tests\s+(.+)$/m)?.[1];
  const filesLine = clean.match(/^\s*Test Files\s+(.+)$/m)?.[1];
  if (!testsLine || !filesLine) return null;
  const count = (line: string, label: string): number => {
    const match = line.match(new RegExp(`(\\d+)\\s+${label}`));
    return match?.[1] ? Number(match[1]) : 0;
  };
  const total = Number(testsLine.match(/\((\d+)\)\s*$/)?.[1] ?? count(testsLine, "passed"));
  return {
    passed: count(testsLine, "passed"),
    failed: count(testsLine, "failed"),
    files: count(filesLine, "passed"),
    total,
  };
}

/** ISO 8601 with an explicit offset, formatted in the given zone (Asia/Calcutta by default). */
export function isoInTimeZone(
  date: Date = new Date(),
  timeZone = "Asia/Calcutta",
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const offsetRaw = get("timeZoneName");
  const offset = offsetRaw === "GMT" ? "+00:00" : offsetRaw.replace("GMT", "");
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}${offset}`;
}

export function buildBaseline(input: {
  tipSha: string;
  measuredAt: string;
  node: string;
  pnpmTest: PnpmTestSummary;
  previews: PreviewMeasurement[];
  reducedMotionScreenshot: ReducedMotionScreenshot;
  dossierPlate?: DossierPlate;
}): BaselineRecord {
  return {
    schemaVersion: BASELINE_SCHEMA_VERSION,
    phase: "phase-0-baseline",
    tipSha: input.tipSha,
    measuredAt: input.measuredAt,
    node: input.node,
    pnpmTest: input.pnpmTest,
    dossierPlate: input.dossierPlate ?? {
      desktop: "748/800",
      mobile: "798/844",
      source: "plan-recorded measured pass",
    },
    budgets: PERFORMANCE_BUDGETS,
    previews: input.previews,
    failures: failureRows(input.previews),
    reducedMotionScreenshot: input.reducedMotionScreenshot,
    cutIfShort: true,
    inpHelper: "skipped",
  };
}
