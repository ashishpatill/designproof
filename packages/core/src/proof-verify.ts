import { spawn } from "node:child_process";
import { createServer, type Server } from "node:http";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ProofMatrixResult,
  type CritiqueScreenshot,
  type ProofCritique,
  type ScenarioMatrix,
  type TellDetector,
  type TellReport,
} from "@tell/schema";
import { MAX_CRITIQUE_ROUNDS, planCritiqueRounds } from "@tell/taste";
import { captureUrl } from "./capture/capture-url";
import { diagnoseCapture } from "./diagnose";
import { PROOF_GATE_BANS } from "./detectors/tells-registry";

export type ProofVerifyResult = {
  status: "passed" | "review" | "failed";
  beforeReport: TellReport;
  afterReport: TellReport;
  proof: {
    beforeScore: number;
    afterScore: number;
    scoreDelta: number;
    findingsBefore: number;
    findingsAfter: number;
    focusBefore: number;
    focusAfter: number;
    focusRegressed: boolean;
    screenshotsDiffer: boolean;
    structureRegressed: boolean;
    headingsBefore: number;
    headingsAfter: number;
    buttonsBefore: number;
    buttonsAfter: number;
    /** Gate-enforced tells (see the dated tells registry) in each capture. */
    bannedTellsBefore: string[];
    bannedTellsAfter: string[];
    /** Detector ids present after but not before — the tells this patch introduced. */
    newTells: string[];
    url: string;
    capturedAt: string;
  };
  /** Bounded screenshot critique: max rounds, rounds planned/used, cited screenshot paths. */
  critique: ProofCritique;
  reverted: boolean;
  error?: string;
  /** "patch" = live URL + git apply; "preview" = generated HTML on a disposable local server. */
  mode?: "patch" | "preview";
  /** Localhost URL used for the preview capture (preview mode only). */
  previewUrl?: string;
};

export type ProofVerifyOptions = {
  /**
   * Where before/after PNGs are written so critique notes can cite paths.
   * Defaults to a per-project directory under the OS temp dir — proof never
   * writes into the checkout and never creates a `.git` directory.
   */
  screenshotDir?: string;
  /** Defaults to MAX_CRITIQUE_ROUNDS (3). */
  maxCritiqueRounds?: number;
};

function bannedTells(report: TellReport): string[] {
  return report.findings
    .filter((finding) => PROOF_GATE_BANS.has(finding.detector as TellDetector))
    .map((finding) => finding.id);
}

async function persistScreenshots(
  dir: string,
  before: TellReport,
  after: TellReport,
): Promise<CritiqueScreenshot[]> {
  const shots: CritiqueScreenshot[] = [];
  const mkdir = await fs.mkdir(dir, { recursive: true }).then(() => true).catch(() => false);
  if (!mkdir) return shots;

  const write = async (
    phase: "before" | "after",
    viewport: string,
    label: string,
    base64: string,
    capturedAt: string,
  ) => {
    if (!base64) return;
    const file = path.join(dir, `${phase}-${viewport}.png`);
    const ok = await fs.writeFile(file, Buffer.from(base64, "base64")).then(() => true).catch(() => false);
    if (ok) shots.push({ label, viewport, phase, path: file, capturedAt });
  };

  await write("before", "primary", "before/primary", before.capture.screenshotBase64, before.capture.capturedAt);
  await write("after", "primary", "after/primary", after.capture.screenshotBase64, after.capture.capturedAt);
  for (const entry of after.capture.viewportMatrix) {
    await write("after", entry.preset, `after/${entry.preset}`, entry.screenshotBase64, after.capture.capturedAt);
  }
  return shots;
}

export async function buildProofCritique(input: {
  before: TellReport;
  after: TellReport;
  screenshotDir?: string;
  maxRounds?: number;
  status: ProofVerifyResult["status"];
}): Promise<ProofCritique> {
  const screenshots = input.screenshotDir
    ? await persistScreenshots(input.screenshotDir, input.before, input.after)
    : [];
  const critique = planCritiqueRounds({
    findings: input.after.findings,
    screenshots,
    maxRounds: input.maxRounds,
    source: screenshots.length > 0 ? "screenshots" : "report-only",
  });
  if (input.status === "failed") {
    return {
      ...critique,
      nextAction: `Gate failed. ${critique.nextAction}`,
    };
  }
  return critique;
}

function scoreOf(report: TellReport): number {
  return report.measures?.score ?? Math.min(100, report.score.generic * 12 + report.score.drift * 7);
}

function gitApply(args: string[], cwd: string, patch: string): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("git", ["apply", ...args], { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("close", (code) => resolve({ ok: code === 0, stderr: stderr.trim() }));
    child.stdin.end(patch);
  });
}

export async function verifyProofPatch(input: {
  url: string;
  patch: string;
  projectRoot: string;
  waitMs?: number;
  revertOnFail?: boolean;
} & ProofVerifyOptions): Promise<ProofVerifyResult> {
  const projectRoot = path.resolve(input.projectRoot);
  const waitMs = input.waitMs ?? 1800;
  const revertOnFail = input.revertOnFail ?? true;
  const screenshotDir =
    input.screenshotDir ??
    path.join(tmpdir(), "tell-critique", createHash("sha1").update(projectRoot).digest("hex").slice(0, 8));
  const maxCritiqueRounds = input.maxCritiqueRounds ?? MAX_CRITIQUE_ROUNDS;
  const patchMarker = path.join(projectRoot, ".git", "tell-proof-mcp.patch");

  const beforeCapture = await captureUrl(input.url);
  const beforeReport = diagnoseCapture(beforeCapture);

  const check = await gitApply(["--check", "--whitespace=nowarn"], projectRoot, input.patch);
  if (!check.ok) {
    return {
      status: "failed",
      beforeReport,
      afterReport: beforeReport,
      proof: buildProof(beforeReport, beforeReport, input.url),
      critique: await buildProofCritique({
        before: beforeReport,
        after: beforeReport,
        screenshotDir,
        maxRounds: maxCritiqueRounds,
        status: "failed",
      }),
      reverted: false,
      error: check.stderr || "Patch did not apply cleanly.",
    };
  }

  const applied = await gitApply(["--whitespace=nowarn"], projectRoot, input.patch);
  if (!applied.ok) {
    return {
      status: "failed",
      beforeReport,
      afterReport: beforeReport,
      proof: buildProof(beforeReport, beforeReport, input.url),
      critique: await buildProofCritique({
        before: beforeReport,
        after: beforeReport,
        screenshotDir,
        maxRounds: maxCritiqueRounds,
        status: "failed",
      }),
      reverted: false,
      error: applied.stderr || "Patch could not be applied.",
    };
  }

  await fs.writeFile(patchMarker, input.patch, "utf8").catch(() => {});

  try {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    const afterCapture = await captureUrl(input.url);
    const afterReport = diagnoseCapture(afterCapture);
    const proof = buildProof(beforeReport, afterReport, input.url);
    const status = verdictFromProof(proof);
    const critique = await buildProofCritique({
      before: beforeReport,
      after: afterReport,
      screenshotDir,
      maxRounds: maxCritiqueRounds,
      status,
    });

    if (status === "failed" && revertOnFail) {
      await gitApply(["-R", "--whitespace=nowarn"], projectRoot, input.patch);
      await fs.rm(patchMarker, { force: true });
      return { status, beforeReport, afterReport, proof, critique, reverted: true };
    }

    return { status, beforeReport, afterReport, proof, critique, reverted: false };
  } catch (error) {
    await gitApply(["-R", "--whitespace=nowarn"], projectRoot, input.patch).catch(() => {});
    await fs.rm(patchMarker, { force: true });
    throw error;
  }
}

export async function revertProofPatch(projectRoot: string, patch?: string): Promise<boolean> {
  const root = path.resolve(projectRoot);
  const marker = path.join(root, ".git", "tell-proof-mcp.patch");
  const patchText = patch ?? await fs.readFile(marker, "utf8").catch(() => "");
  if (!patchText) return false;
  const reverted = await gitApply(["-R", "--whitespace=nowarn"], root, patchText);
  await fs.rm(marker, { force: true });
  return reverted.ok;
}

/**
 * Serve generated preview HTML on an ephemeral 127.0.0.1 listener, capture +
 * diagnose once, and return a proof verdict. No git patch, no second generate
 * path — agents pass the HTML from tell_design_from_features (or any specimen).
 *
 * Without a before baseline, scoreDelta is 0 so the honest ceiling is "review"
 * unless a gate ban ships (then "failed"). Callers may tighten further (budgets).
 */
export async function verifyProofPreview(input: {
  previewHtml: string;
} & ProofVerifyOptions): Promise<ProofVerifyResult> {
  const html = input.previewHtml?.trim() ?? "";
  if (!html) {
    throw new Error("previewHtml is required for preview-mode tell_proof_verify.");
  }

  const screenshotDir =
    input.screenshotDir ??
    path.join(tmpdir(), "tell-critique", createHash("sha1").update(html.slice(0, 512)).digest("hex").slice(0, 8));
  const maxCritiqueRounds = input.maxCritiqueRounds ?? MAX_CRITIQUE_ROUNDS;

  const { url, close } = await listenPreviewHtml(html);
  try {
    const afterCapture = await captureUrl(url);
    const afterReport = diagnoseCapture(afterCapture);
    // No before baseline for a generated preview: compare the capture to itself.
    // scoreDelta stays 0 → verdictFromProof yields "review" unless banned tells fail.
    const proof = buildProof(afterReport, afterReport, url);
    const status = verdictFromProof(proof);
    const critique = await buildProofCritique({
      before: afterReport,
      after: afterReport,
      screenshotDir,
      maxRounds: maxCritiqueRounds,
      status,
    });
    return {
      status,
      beforeReport: afterReport,
      afterReport,
      proof,
      critique,
      reverted: false,
      mode: "preview",
      previewUrl: url,
    };
  } finally {
    await close();
  }
}

/** Ephemeral localhost server for one HTML document (repo pattern: shots.ts / record-template-motion). */
export async function listenPreviewHtml(previewHtml: string): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = createServer((req, res) => {
    // Any path serves the same document — captureUrl hits the root.
    if ((req.method ?? "GET") !== "GET" && (req.method ?? "GET") !== "HEAD") {
      res.writeHead(405).end();
      return;
    }
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    });
    if ((req.method ?? "GET") === "HEAD") {
      res.end();
      return;
    }
    res.end(previewHtml);
  });

  const port = await new Promise<number>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("preview server failed to bind"));
        return;
      }
      resolve(addr.port);
    });
  });

  return {
    url: `http://127.0.0.1:${port}/`,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
        // Force-close hung keep-alives so tests do not hang.
        setTimeout(() => resolve(), 500).unref?.();
      }),
  };
}


export function compareProofReports(
  before: TellReport,
  after: TellReport,
  url: string,
  opts: ProofVerifyOptions = {},
) {
  const proof = buildProof(before, after, url);
  const status = verdictFromProof(proof);
  const critique = planCritiqueRounds({
    findings: after.findings,
    maxRounds: opts.maxCritiqueRounds ?? MAX_CRITIQUE_ROUNDS,
    source: "report-only",
  });
  return { status, proof, critique };
}

/**
 * Compare two scenario matrices cell-by-cell (matched by scenario.id).
 * Aggregate: any failed → failed; all passed → passed; else review.
 * Missing counterpart cells are skipped (counted, not failed).
 */
export function compareProofMatrices(before: ScenarioMatrix, after: ScenarioMatrix): ProofMatrixResult {
  const afterById = new Map(after.cells.map((cell) => [cell.scenario.id, cell]));
  const cells = [];
  let matched = 0;
  let skipped = 0;

  for (const beforeCell of before.cells) {
    const afterCell = afterById.get(beforeCell.scenario.id);
    if (!afterCell) {
      skipped += 1;
      cells.push({
        scenarioId: beforeCell.scenario.id,
        status: "skipped" as const,
        beforeScore: 0,
        afterScore: 0,
        scoreDelta: 0,
        focusRegressed: false,
        structureRegressed: false,
        screenshotsDiffer: false,
        error: "No matching after cell for scenario id",
      });
      continue;
    }
    matched += 1;
    const beforeReport = diagnoseCapture(beforeCell.capture);
    const afterReport = diagnoseCapture(afterCell.capture);
    const { status, proof } = compareProofReports(beforeReport, afterReport, afterCell.capture.url);
    cells.push({
      scenarioId: beforeCell.scenario.id,
      status,
      beforeScore: proof.beforeScore,
      afterScore: proof.afterScore,
      scoreDelta: proof.scoreDelta,
      focusRegressed: proof.focusRegressed,
      structureRegressed: proof.structureRegressed,
      screenshotsDiffer: proof.screenshotsDiffer,
    });
  }

  for (const afterCell of after.cells) {
    if (!before.cells.some((c) => c.scenario.id === afterCell.scenario.id)) {
      skipped += 1;
      cells.push({
        scenarioId: afterCell.scenario.id,
        status: "skipped" as const,
        beforeScore: 0,
        afterScore: 0,
        scoreDelta: 0,
        focusRegressed: false,
        structureRegressed: false,
        screenshotsDiffer: false,
        error: "No matching before cell for scenario id",
      });
    }
  }

  const active = cells.filter((c) => c.status !== "skipped");
  let status: ProofMatrixResult["status"] = "review";
  // No overlapping scenario ids means nothing was compared — treat as failed, not review.
  if (matched === 0) status = "failed";
  else if (active.some((c) => c.status === "failed")) status = "failed";
  else if (active.length > 0 && active.every((c) => c.status === "passed")) status = "passed";

  return ProofMatrixResult.parse({
    status,
    cells,
    url: after.baseUrl || before.baseUrl,
    capturedAt: after.capturedAt || before.capturedAt,
    matchedCells: matched,
    skippedCells: skipped,
  });
}

function buildProof(before: TellReport, after: TellReport, url: string) {
  const beforeScore = scoreOf(before);
  const afterScore = scoreOf(after);
  const focusBefore = before.fingerprint.focusRingCoverage;
  const focusAfter = after.fingerprint.focusRingCoverage;
  const beforeStructure = before.capture.domSummary;
  const afterStructure = after.capture.domSummary;
  const headingFloor = Math.max(1, Math.floor(beforeStructure.headingCount * 0.8));
  const buttonFloor = beforeStructure.buttonCount ? Math.max(1, Math.floor(beforeStructure.buttonCount * 0.8)) : 0;
  const bannedBefore = bannedTells(before);
  const bannedAfter = bannedTells(after);
  const newTells = [...new Set(after.findings.map((finding) => finding.detector))].filter(
    (detector) => !before.findings.some((finding) => finding.detector === detector),
  );
  return {
    beforeScore,
    afterScore,
    scoreDelta: afterScore - beforeScore,
    findingsBefore: before.score.total,
    findingsAfter: after.score.total,
    focusBefore,
    focusAfter,
    focusRegressed: focusAfter + 0.02 < focusBefore,
    screenshotsDiffer: before.capture.screenshotBase64 !== after.capture.screenshotBase64,
    structureRegressed:
      afterStructure.headingCount < headingFloor ||
      afterStructure.buttonCount < buttonFloor ||
      after.capture.styles.length < Math.max(8, before.capture.styles.length * 0.75),
    headingsBefore: beforeStructure.headingCount,
    headingsAfter: afterStructure.headingCount,
    buttonsBefore: beforeStructure.buttonCount,
    buttonsAfter: afterStructure.buttonCount,
    bannedTellsBefore: bannedBefore,
    bannedTellsAfter: bannedAfter,
    newTells,
    url,
    capturedAt: after.capture.capturedAt,
  };
}

function verdictFromProof(proof: ProofVerifyResult["proof"]): ProofVerifyResult["status"] {
  // Registry bans fail the gate on their own: a patch cannot pass while the
  // first screen still ships a banned frame tell.
  if (proof.bannedTellsAfter.length > 0) return "failed";
  if (proof.scoreDelta <= -3 && proof.screenshotsDiffer && !proof.focusRegressed && !proof.structureRegressed) {
    return "passed";
  }
  if (proof.scoreDelta <= 3 && !proof.focusRegressed && !proof.structureRegressed) {
    return "review";
  }
  return "failed";
}
