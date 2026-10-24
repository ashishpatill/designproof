import { CritiqueRound, Finding, ProofCritique, type CritiqueScreenshot } from "@tell/schema";

/**
 * Bounded screenshot critique loop (scaffolding).
 *
 * The loop never reads source files and never calls a model. It turns the tells
 * found in a proof capture into at most `maxRounds` look → name → fix rounds of
 * at most `MAX_FIXES_PER_ROUND` fixes each, and every note cites a screenshot
 * path. Frame tells are fixed before cosmetic ones because they decide what the
 * reader sees first.
 *
 * This is deliberately not an MCP tool: `tell_proof_verify` attaches the plan to
 * its result so the eleven-tool catalog stays intact.
 */

/** Hard cap on critique rounds. Grows by review, never by loop. */
export const MAX_CRITIQUE_ROUNDS = 3;

/** Fixes attempted per round — more than this and the round stops being a look. */
export const MAX_FIXES_PER_ROUND = 3;

/** Detectors that own the frame and the first screen — fixed before cosmetic tells. */
const FRAME_FIRST: ReadonlySet<string> = new Set([
  "TitleOnFoldTell",
  "FrameGutterTell",
  "BlankStretchTell",
  "MobileFirstScreenTell",
]);

const SEVERITY_WEIGHT: Record<Finding["severity"], number> = { high: 0, medium: 1, low: 2 };

export type CritiqueLoopInput = {
  findings: Finding[];
  screenshots?: CritiqueScreenshot[];
  maxRounds?: number;
  source?: ProofCritique["source"];
};

function rankFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const frameDelta = Number(FRAME_FIRST.has(b.detector)) - Number(FRAME_FIRST.has(a.detector));
    if (frameDelta !== 0) return frameDelta;
    const severityDelta = SEVERITY_WEIGHT[a.severity] - SEVERITY_WEIGHT[b.severity];
    if (severityDelta !== 0) return severityDelta;
    return a.id.localeCompare(b.id);
  });
}

function screenshotNote(screenshots: CritiqueScreenshot[]): string {
  const cited = screenshots.filter((shot) => shot.path);
  if (cited.length === 0) {
    return "No screenshot path was persisted for this run — pass screenshotDir to cite before/after PNGs instead of reading source.";
  }
  return `Look at ${cited.map((shot) => shot.path).join(", ")} (screenshots, not source).`;
}

function nextActionFor(rounds: CritiqueRound[], maxRounds: number): string {
  const open = rounds.find((round) => round.status === "open");
  if (open) {
    return `Round ${open.index} of ${maxRounds}: fix ${open.findings.join(", ")}, recapture the same URL, then look again.`;
  }
  const planned = rounds.find((round) => round.status === "remaining");
  if (planned) {
    return `Rounds are capped at ${maxRounds}. Close round ${planned.index - 1} before starting round ${planned.index}.`;
  }
  if (rounds.length === 0) {
    return "No new tells in the after capture. Review the cited screenshots for composition, then stop — the loop is closed.";
  }
  return `Critique closed after ${rounds.length} of ${maxRounds} rounds. A human reviews the diff; do not loop again on the same capture.`;
}

/**
 * Build the bounded critique plan for one capture. Deterministic: same findings
 * and screenshots produce the same rounds.
 */
export function planCritiqueRounds(input: CritiqueLoopInput): ProofCritique {
  const maxRounds = Math.max(1, Math.trunc(input.maxRounds ?? MAX_CRITIQUE_ROUNDS));
  const screenshots = input.screenshots ?? [];
  const ordered = rankFindings(input.findings);
  const rounds: CritiqueRound[] = [];

  for (let i = 0; i < ordered.length && rounds.length < maxRounds; i += MAX_FIXES_PER_ROUND) {
    const chunk = ordered.slice(i, i + MAX_FIXES_PER_ROUND);
    rounds.push(
      CritiqueRound.parse({
        index: rounds.length + 1,
        focus: chunk.map((finding) => finding.detector),
        findings: chunk.map((finding) => finding.id),
        status: rounds.length === 0 ? "open" : "remaining",
        notes: [
          screenshotNote(screenshots),
          ...chunk.map(
            (finding) =>
              `${finding.id}: ${finding.fixHint ?? "Fix the top tell, then re-measure the rendered page."}`,
          ),
        ],
      }),
    );
  }

  const dropped = Math.max(0, ordered.length - maxRounds * MAX_FIXES_PER_ROUND);
  const nextAction = dropped > 0
    ? `${nextActionFor(rounds, maxRounds)} ${dropped} further finding(s) wait for the next capture — the loop does not extend past ${maxRounds} rounds.`
    : nextActionFor(rounds, maxRounds);

  return ProofCritique.parse({
    maxRounds,
    roundsUsed: 0,
    rounds,
    screenshots,
    source: screenshots.some((shot) => shot.path) ? "screenshots" : input.source ?? "report-only",
    nextAction,
  });
}

/**
 * Close one round after a fix + recapture. `remaining` keeps the round open so the
 * same fixes are looked at again; `fixed` advances to the next planned round.
 * Out-of-range indices throw so a caller cannot quietly run an unbounded loop.
 */
export function closeCritiqueRound(
  critique: ProofCritique,
  index: number,
  outcome: "fixed" | "remaining",
  notes: string[] = [],
): ProofCritique {
  if (!Number.isInteger(index) || index < 1 || index > critique.maxRounds) {
    throw new RangeError(`Critique round ${index} is outside 1..${critique.maxRounds}.`);
  }
  const rounds = critique.rounds.map((round) => {
    if (round.index === index) {
      return { ...round, status: outcome === "fixed" ? ("fixed" as const) : ("open" as const), notes: [...round.notes, ...notes] };
    }
    if (outcome === "fixed" && round.index === index + 1 && round.status === "remaining") {
      return { ...round, status: "open" as const };
    }
    return round;
  });
  const roundsUsed = rounds.filter((round) => round.status === "fixed").length;
  return ProofCritique.parse({
    ...critique,
    roundsUsed,
    rounds,
    nextAction: nextActionFor(rounds, critique.maxRounds),
  });
}
