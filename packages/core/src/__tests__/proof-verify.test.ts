import { describe, expect, it } from "vitest";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { CapturePayload, DesignFingerprint, Finding, ScenarioMatrix } from "@tell/schema";
import { buildProofCritique, compareProofMatrices, compareProofReports } from "../proof-verify";
import { buildScenario } from "../capture/scenario-matrix";
import { MAX_CRITIQUE_ROUNDS } from "@tell/taste";

function axis(key: "contrast" | "typescale" | "spacing" | "depth" | "accent" | "identity", before: number, after: number) {
  return {
    key,
    label: key,
    weight: 0.15,
    before,
    after,
    beforeText: String(before),
    afterText: String(after),
    rationale: "test",
  };
}

function stubReport(
  screenshot: string,
  generic: number,
  focus: number,
  headings: number,
  buttons: number,
  styles: number,
) {
  const capture = CapturePayload.parse({
    url: "http://localhost:3000",
    capturedAt: new Date().toISOString(),
    viewport: { width: 1440, height: 1100 },
    screenshotBase64: screenshot,
    styles: Array.from({ length: styles }, (_, i) => ({
      selector: `p.${i}`,
      tellId: `t${i}`,
      tag: "p",
      role: "body",
      rect: { x: 0, y: 0, w: 100, h: 20 },
      fontFamily: "serif",
      fontSize: "16px",
      fontWeight: "400",
      color: "rgb(0,0,0)",
      backgroundColor: "rgb(255,255,255)",
      borderRadius: "0px",
      boxShadow: "none",
      padding: "8px",
      textAlign: "left",
      lineHeight: "1.5",
      backgroundImage: "none",
    })),
    probes: [],
    domSummary: { headingCount: headings, buttonCount: buttons, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
  });
  const fingerprint = DesignFingerprint.parse({
    url: capture.url,
    generatedAt: capture.capturedAt,
    fontFamilies: [{ family: "serif", count: 1, roles: ["body"] }],
    colors: [],
    shadows: [],
    radii: [],
    spacingValues: [],
    typeScale: [],
    centeredBlockRatio: 0.2,
    emojiInUiCount: 0,
    gradientDetected: false,
    nearDuplicateGrays: [],
    focusRingCoverage: focus,
    stateCoverage: { hover: 1, focus, disabled: 1 },
  });
  return {
    capture,
    fingerprint,
    findings: [],
    verdicts: [],
    score: { total: generic, generic, drift: 0, intentional: 0, uncertain: 0 },
    measures: {
      score: generic * 12,
      band: "template" as const,
      tellScore: 0,
      scoredAgainst: "baseline" as const,
      axes: [
        axis("contrast", 0.8, 0.8),
        axis("typescale", 0.8, 0.8),
        axis("spacing", 0.8, 0.8),
        axis("depth", 0.8, 0.8),
        axis("accent", 0.8, 0.8),
        axis("identity", 0.8, 0.8),
      ],
    },
  };
}

describe("compareProofReports", () => {
  it("passes when genericness drops with a visible screenshot change", () => {
    const before = stubReport("before", 8, 0.8, 5, 4, 20);
    const after = {
      ...before,
      capture: { ...before.capture, screenshotBase64: "after", capturedAt: new Date().toISOString() },
      score: { total: 4, generic: 4, drift: 0, intentional: 0, uncertain: 0 },
      measures: before.measures ? { ...before.measures, score: 48 } : undefined,
    };
    const { status, proof } = compareProofReports(before, after, "http://localhost:3000");
    expect(status).toBe("passed");
    expect(proof.scoreDelta).toBeLessThan(0);
    expect(proof.screenshotsDiffer).toBe(true);
  });

  it("fails when focus coverage regresses", () => {
    const before = stubReport("before", 8, 0.8, 5, 4, 20);
    const after = stubReport("after", 4, 0.5, 5, 4, 20);
    const { status } = compareProofReports(before, after, "http://localhost:3000");
    expect(status).toBe("failed");
  });

  it("fails on a banned frame tell even when the score improves", () => {
    const before = stubReport("before", 8, 0.8, 5, 4, 20);
    const after = {
      ...stubReport("after", 4, 0.8, 5, 4, 20),
      findings: [
        Finding.parse({
          id: "tell-title-on-fold",
          family: "tell",
          detector: "TitleOnFoldTell",
          verdictHint: "generic",
          severity: "high",
          facts: { position: "below-fold" },
          evidence: [{ kind: "computed", label: "Primary title vs fold", value: "1180px vs 1100px" }],
          fixHint: "Fit the title and one action above the fold line.",
        }),
      ],
    };
    const { status, proof } = compareProofReports(before, after, "http://localhost:3000");
    expect(proof.scoreDelta).toBeLessThan(0);
    expect(proof.bannedTellsAfter).toEqual(["tell-title-on-fold"]);
    expect(status).toBe("failed");
  });

  it("attaches a bounded critique with the round cap visible", () => {
    const before = stubReport("before", 8, 0.8, 5, 4, 20);
    const after = {
      ...stubReport("after", 4, 0.8, 5, 4, 20),
      findings: [
        Finding.parse({
          id: "tell-blank-stretch",
          family: "tell",
          detector: "BlankStretchTell",
          verdictHint: "generic",
          severity: "medium",
          facts: { largestGapPx: 820 },
          evidence: [{ kind: "computed", label: "Dead vertical bands", value: "820px gap after y=640" }],
          fixHint: "Fill the dead band or remove the spacing.",
        }),
      ],
    };
    const { critique } = compareProofReports(before, after, "http://localhost:3000");
    expect(critique.maxRounds).toBe(MAX_CRITIQUE_ROUNDS);
    expect(critique.roundsUsed).toBe(0);
    expect(critique.source).toBe("report-only");
    expect(critique.rounds[0]!.findings).toEqual(["tell-blank-stretch"]);
    expect(critique.rounds[0]!.notes[0]).toMatch(/No screenshot path was persisted/);
  });
});

describe("buildProofCritique", () => {
  it("writes before/after PNGs and cites their paths in the round notes", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "tell-critique-test-"));
    try {
      const before = stubReport("before", 8, 0.8, 5, 4, 20);
      const after = {
        ...stubReport("after", 4, 0.8, 5, 4, 20),
        findings: [
          Finding.parse({
            id: "tell-title-on-fold",
            family: "tell",
            detector: "TitleOnFoldTell",
            verdictHint: "generic",
            severity: "high",
            facts: { position: "below-fold" },
            evidence: [{ kind: "computed", label: "Primary title vs fold", value: "1180px vs 1100px" }],
            fixHint: "Fit the title and one action above the fold line.",
          }),
        ],
      };
      const critique = await buildProofCritique({ before, after, screenshotDir: dir, status: "review" });
      expect(critique.source).toBe("screenshots");
      expect(critique.screenshots.map((shot) => shot.phase)).toEqual(["before", "after"]);
      for (const shot of critique.screenshots) {
        expect(existsSync(shot.path)).toBe(true);
        expect(shot.path.startsWith(dir)).toBe(true);
      }
      expect(critique.rounds[0]!.notes[0]).toContain(path.join(dir, "after-primary.png"));
      expect(readFileSync(critique.screenshots[1]!.path).length).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("says the gate failed without inventing screenshots", async () => {
    const report = stubReport("before", 8, 0.8, 5, 4, 20);
    const critique = await buildProofCritique({ before: report, after: report, status: "failed" });
    expect(critique.source).toBe("report-only");
    expect(critique.screenshots).toEqual([]);
    expect(critique.nextAction.startsWith("Gate failed.")).toBe(true);
  });
});

describe("compareProofMatrices", () => {
  it("fails when no scenario ids overlap", () => {
    const before = ScenarioMatrix.parse({
      baseUrl: "http://localhost:3001",
      capturedAt: "2026-07-19T00:00:00.000Z",
      cells: [{
        scenario: buildScenario({ route: "/", viewport: "desktop" }),
        capture: stubReport("before", 8, 0.8, 5, 4, 20).capture,
      }],
    });
    const after = ScenarioMatrix.parse({
      baseUrl: "http://localhost:3001",
      capturedAt: "2026-07-19T00:00:01.000Z",
      cells: [{
        scenario: buildScenario({ route: "/pricing", viewport: "mobile" }),
        capture: stubReport("after", 4, 0.8, 3, 2, 12).capture,
      }],
    });
    const result = compareProofMatrices(before, after);
    expect(result.matchedCells).toBe(0);
    expect(result.status).toBe("failed");
    expect(result.cells.every((c) => c.status === "skipped")).toBe(true);
  });

  it("aggregates cell verdicts and skips unmatched scenarios", () => {
    const beforeCell = {
      scenario: buildScenario({ route: "/", viewport: "desktop" }),
      capture: stubReport("before", 8, 0.8, 5, 4, 20).capture,
    };
    const afterSameFindings = {
      scenario: beforeCell.scenario,
      // Screenshot change with identical styles → review (diagnose recomputes score from capture)
      capture: {
        ...stubReport("after", 4, 0.8, 5, 4, 20).capture,
        screenshotBase64: "after",
      },
    };
    const afterOnly = {
      scenario: buildScenario({ route: "/pricing", viewport: "mobile" }),
      capture: stubReport("pricing", 4, 0.8, 3, 2, 12).capture,
    };
    const before = ScenarioMatrix.parse({
      baseUrl: "http://localhost:3001",
      capturedAt: "2026-07-19T00:00:00.000Z",
      cells: [beforeCell],
    });
    const after = ScenarioMatrix.parse({
      baseUrl: "http://localhost:3001",
      capturedAt: "2026-07-19T00:00:01.000Z",
      cells: [afterSameFindings, afterOnly],
    });
    const result = compareProofMatrices(before, after);
    expect(result.matchedCells).toBe(1);
    expect(result.skippedCells).toBe(1);
    expect(result.cells.some((c) => c.status === "review")).toBe(true);
    expect(result.cells.some((c) => c.status === "skipped")).toBe(true);
    expect(result.status).toBe("review");
  });
});
