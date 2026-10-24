import { describe, expect, it } from "vitest";
import { Finding, type CritiqueScreenshot } from "@tell/schema";
import {
  MAX_CRITIQUE_ROUNDS,
  MAX_FIXES_PER_ROUND,
  closeCritiqueRound,
  planCritiqueRounds,
} from "../src/critique-loop";

function finding(input: {
  id: string;
  detector: Finding["detector"];
  severity?: Finding["severity"];
  fixHint?: string;
}): Finding {
  return Finding.parse({
    id: input.id,
    family: "tell",
    detector: input.detector,
    verdictHint: "generic",
    severity: input.severity ?? "medium",
    facts: {},
    evidence: [{ kind: "computed", label: "test", value: "test" }],
    fixHint: input.fixHint ?? `Fix ${input.id} from the subject, then re-measure.`,
  });
}

const screenshots: CritiqueScreenshot[] = [
  { label: "before/primary", viewport: "primary", phase: "before", path: "/tmp/tell/before-primary.png" },
  { label: "after/mobile", viewport: "mobile", phase: "after", path: "/tmp/tell/after-mobile.png" },
];

describe("planCritiqueRounds", () => {
  it("names the cap and cites screenshot paths, not source files", () => {
    const critique = planCritiqueRounds({
      findings: [finding({ id: "tell-mobile-first-screen", detector: "MobileFirstScreenTell", severity: "high" })],
      screenshots,
    });
    expect(critique.maxRounds).toBe(MAX_CRITIQUE_ROUNDS);
    expect(critique.roundsUsed).toBe(0);
    expect(critique.source).toBe("screenshots");
    expect(critique.rounds).toHaveLength(1);
    expect(critique.rounds[0]!.status).toBe("open");
    expect(critique.rounds[0]!.notes.join(" ")).toContain("/tmp/tell/after-mobile.png");
    expect(critique.rounds[0]!.notes.join(" ")).not.toContain(".ts");
    expect(critique.nextAction).toContain(`of ${MAX_CRITIQUE_ROUNDS}`);
  });

  it("fixes frame tells before cosmetic tells and high before medium", () => {
    const critique = planCritiqueRounds({
      findings: [
        finding({ id: "tell-gray-mush", detector: "GrayMushTell", severity: "medium" }),
        finding({ id: "tell-frame-gutter", detector: "FrameGutterTell", severity: "medium" }),
        finding({ id: "tell-system-font", detector: "SystemFontTell", severity: "high" }),
        finding({ id: "tell-title-on-fold", detector: "TitleOnFoldTell", severity: "high" }),
      ],
      screenshots,
    });
    expect(critique.rounds[0]!.findings.slice(0, 2)).toEqual(["tell-title-on-fold", "tell-frame-gutter"]);
  });

  it("caps rounds and reports findings that wait for the next capture", () => {
    const findings = Array.from({ length: 10 }, (_, i) =>
      finding({ id: `tell-${i}`, detector: "GrayMushTell" }),
    );
    const critique = planCritiqueRounds({ findings, screenshots, maxRounds: 2 });
    expect(critique.maxRounds).toBe(2);
    expect(critique.rounds).toHaveLength(2);
    expect(critique.rounds.every((round) => round.findings.length <= MAX_FIXES_PER_ROUND)).toBe(true);
    expect(critique.nextAction).toContain("does not extend past 2 rounds");
  });

  it("closes cleanly when there is nothing to fix", () => {
    const critique = planCritiqueRounds({ findings: [], screenshots: [] });
    expect(critique.rounds).toEqual([]);
    expect(critique.source).toBe("report-only");
    expect(critique.nextAction).toContain("loop is closed");
  });
});

describe("closeCritiqueRound", () => {
  const plan = planCritiqueRounds({
    findings: Array.from({ length: 5 }, (_, i) =>
      finding({ id: `tell-${i}`, detector: "GrayMushTell", severity: i === 0 ? "high" : "medium" }),
    ),
    screenshots,
    maxRounds: 2,
  });

  it("advances one round at a time and counts completed rounds", () => {
    expect(plan.rounds[1]!.status).toBe("remaining");
    const after = closeCritiqueRound(plan, 1, "fixed", ["Moved the title above the fold."]);
    expect(after.roundsUsed).toBe(1);
    expect(after.rounds[0]!.status).toBe("fixed");
    expect(after.rounds[1]!.status).toBe("open");
    expect(after.rounds[0]!.notes).toContain("Moved the title above the fold.");
  });

  it("keeps the round open when the fix did not land", () => {
    const after = closeCritiqueRound(plan, 1, "remaining", ["Still cropped at 390."]);
    expect(after.roundsUsed).toBe(0);
    expect(after.rounds[0]!.status).toBe("open");
  });

  it("refuses to run past the visible cap", () => {
    expect(() => closeCritiqueRound(plan, 3, "fixed")).toThrow(RangeError);
    expect(() => closeCritiqueRound(plan, 0, "fixed")).toThrow(RangeError);
  });
});
