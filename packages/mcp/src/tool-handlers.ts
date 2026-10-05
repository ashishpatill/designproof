/**
 * MCP tool handlers that record into the shared training-data sink
 * (`@designproof/design-skills/training-data-sink` — same writer Studio `/api/*` uses).
 *
 * Kind map (do not collapse):
 * - designproof_design_from_features → "design" → raw/design/
 * - designproof_diagnose → "diagnose" → raw/episodes/
 * - designproof_redesign → "redesign" → raw/redesign/
 * - designproof_proof_verify → "proof" → raw/proof/
 *
 * MCP does not clone or install the sibling dp-design-data repo (Frontend owns that).
 * Writes reuse the shared sink, including optional harness debounce when the sibling CLI is already installed.
 * Missing sibling ⇒ same honest no-op as the web helper.
 */
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  captureUrl,
  diagnoseCapture,
  verifyProofPatch,
  revertProofPatch,
} from "@designproof/core";
import {
  DesignBrief,
  designFromFeaturesAuthored,
  type DesignBrief as DesignBriefType,
} from "@designproof/design-skills";
import {
  recordTrainingEvent,
  writeTrainingEvent,
} from "@designproof/design-skills/training-data-sink";
import { OfflineRedesignGenerator } from "@designproof/redesign";
import {
  DesignProofReport,
  type Finding,
  type TasteVerdict,
} from "@designproof/schema";
import { classifyWithTaste, parseDirection } from "@designproof/taste";

export type DesignFromFeaturesInput = {
  productName: string;
  tagline?: string;
  audience?: string;
  businessGoal?: "leads" | "demos" | "trust" | "sales" | "activation";
  siteKind?: "saas-marketing" | "dashboard-webapp" | "corporate-story" | "docs-educational";
  lockSiteKind?: boolean;
  features: Array<{
    id?: string;
    name: string;
    description?: string;
    priority?: "p0" | "p1" | "p2";
  }>;
  taste?: DesignBriefType["taste"];
  includePreviewHtml?: boolean;
};

function scoreOf(verdicts: TasteVerdict[], findings: Finding[]) {
  return {
    total: findings.length,
    generic: verdicts.filter((v) => v.verdict === "generic").length,
    drift: verdicts.filter((v) => v.verdict === "drift").length,
    intentional: verdicts.filter((v) => v.verdict === "intentional").length,
    uncertain: verdicts.filter((v) => v.verdict === "uncertain").length,
  };
}

export function rememberReport(
  report: DesignProofReport,
  reportById: Map<string, DesignProofReport>,
): DesignProofReport {
  const withId = DesignProofReport.parse({ ...report, id: report.id ?? randomUUID() });
  reportById.set(withId.id!, withId);
  return withId;
}

/** designproof_design_from_features — same raw/design dump as POST /api/design. */
export async function handleDesignFromFeatures(
  input: DesignFromFeaturesInput,
  opts: { awaitSink?: boolean } = {},
): Promise<{ spec: unknown; previewHtml?: string }> {
  const brief = DesignBrief.parse({
    productName: input.productName,
    tagline: input.tagline ?? "",
    audience: input.audience ?? "B2B buyers",
    businessGoal: input.businessGoal ?? "demos",
    siteKind: input.siteKind ?? "saas-marketing",
    lockSiteKind: input.lockSiteKind ?? true,
    features: input.features.map((f, i) => ({
      id: f.id ?? `f-${i}`,
      name: f.name,
      description: f.description ?? "",
      priority: f.priority ?? "p1",
    })),
    taste: input.taste,
  });
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const result = await designFromFeaturesAuthored(brief, { apiKey });

  const briefFromSpec = (result.spec as { brief?: Record<string, unknown> } | undefined)?.brief;
  const payload = {
    brief: briefFromSpec ?? brief,
    spec: result.spec,
    previewHtml: result.previewHtml,
    showcaseKey: null,
    siteKind: brief.siteKind,
    productName: brief.productName,
  };
  const meta = {
    via: "mcp.designproof_design_from_features",
    siteKind: brief.siteKind,
    productName: brief.productName,
  };

  if (opts.awaitSink) {
    await writeTrainingEvent("design", payload, meta);
  } else {
    recordTrainingEvent("design", payload, meta);
  }

  if (input.includePreviewHtml === false) {
    return { spec: result.spec };
  }
  return result;
}

/** designproof_diagnose */
export async function handleDiagnose(
  args: { url?: string; reportPath?: string },
  reportById: Map<string, DesignProofReport>,
  opts: { awaitSink?: boolean } = {},
): Promise<DesignProofReport> {
  let report: DesignProofReport;
  let live = false;
  let requestedUrl = "";

  if (args.reportPath) {
    const raw = await readFile(args.reportPath, "utf8");
    report = rememberReport(DesignProofReport.parse(JSON.parse(raw)), reportById);
  } else if (args.url) {
    const capture = await captureUrl(args.url);
    const base = diagnoseCapture(capture);
    const verdicts = await classifyWithTaste(base.findings, base.fingerprint, {
      apiKey: process.env.GEMINI_API_KEY,
    });
    report = rememberReport(
      DesignProofReport.parse({ ...base, verdicts, score: scoreOf(verdicts, base.findings) }),
      reportById,
    );
    live = true;
    requestedUrl = args.url;
  } else {
    const artifact = process.env.DP_REPORT_ARTIFACT ?? "fixtures/reports/dp-report.json";
    const raw = await readFile(artifact, "utf8");
    report = rememberReport(DesignProofReport.parse(JSON.parse(raw)), reportById);
  }

  const diagnoseMeta = {
    via: "mcp.designproof_diagnose",
    live,
    requestedUrl: requestedUrl || report.capture?.url || "",
    capturedUrl: report.capture?.url || "",
  };
  if (opts.awaitSink) {
    await writeTrainingEvent("diagnose", { report }, diagnoseMeta);
  } else {
    recordTrainingEvent("diagnose", { report }, diagnoseMeta);
  }
  return report;
}

/** designproof_redesign */
export async function handleRedesign(
  args: { direction: string; findingId?: string; reportId?: string },
  ctx: {
    reportById: Map<string, DesignProofReport>;
    lastReport?: DesignProofReport;
    remember: (r: DesignProofReport) => DesignProofReport;
  },
  opts: { awaitSink?: boolean } = {},
): Promise<Awaited<ReturnType<OfflineRedesignGenerator["propose"]>>> {
  let report =
    (args.reportId ? ctx.reportById.get(args.reportId) : undefined) ?? ctx.lastReport;
  if (!report) {
    const artifact = process.env.DP_REPORT_ARTIFACT ?? "fixtures/reports/dp-report.json";
    report = ctx.remember(DesignProofReport.parse(JSON.parse(await readFile(artifact, "utf8"))));
  }
  const directionText = args.direction;
  const direction = parseDirection(directionText);
  const generator = new OfflineRedesignGenerator();
  const proposal = await generator.propose(report, direction, args.findingId);

  const redesignMeta = { via: "mcp.designproof_redesign" };
  const redesignPayload = {
    directionText,
    findingId: args.findingId ?? null,
    direction,
    directionPlan: null,
    dna: null,
    proposal,
    patchSource: "offline",
    reportUrl: report.capture?.url ?? "",
  };
  if (opts.awaitSink) {
    await writeTrainingEvent("redesign", redesignPayload, redesignMeta);
  } else {
    recordTrainingEvent("redesign", redesignPayload, redesignMeta);
  }
  return proposal;
}

/** designproof_proof_verify */
export async function handleProofVerify(args: {
  url: string;
  patch: string;
  projectRoot?: string;
  waitMs?: number;
  revertOnFail?: boolean;
}): Promise<Awaited<ReturnType<typeof verifyProofPatch>>> {
  const projectRoot = args.projectRoot ?? process.cwd();
  const result = await verifyProofPatch({
    url: args.url,
    patch: args.patch,
    projectRoot,
    waitMs: args.waitMs,
    revertOnFail: args.revertOnFail,
  });
  recordTrainingEvent(
    "proof",
    {
      mode: "patch",
      status: result.status,
      proof: result.proof,
      beforeReport: result.beforeReport,
      afterReport: result.afterReport,
      patch: args.patch,
      reverted: result.reverted,
    },
    { via: "mcp.designproof_proof_verify", url: args.url, projectRoot },
  );
  return result;
}

/** designproof_proof_revert — no training write (revert only). */
export async function handleProofRevert(args: {
  projectRoot?: string;
  patch?: string;
}): Promise<{ reverted: boolean; instruction: string }> {
  const reverted = await revertProofPatch(args.projectRoot ?? process.cwd(), args.patch);
  return {
    reverted,
    instruction: reverted
      ? "Proof patch reverted. Recapture the URL if you need a fresh baseline."
      : "No proof patch marker found to revert.",
  };
}
