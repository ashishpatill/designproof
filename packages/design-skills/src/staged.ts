/**
 * Concept-first staged revamp primitives.
 *
 * Deterministic, zero-LLM building blocks for the staged design flow described in
 * docs/QUALITY-BAR.md ("Golden template: superseded") and REVAMP-AUDIT.md:
 *   - an 8-stage state machine with approve / reject / gating
 *   - an explicit named THEME registry (colour never hashed from product name)
 *   - Concept derivation per siteKind
 *   - an automatic swap test + swapped brief builder
 *   - performance budgets checked against preview HTML
 *   - a motion review (between art-direction and refinement, not a ninth stage)
 *   - an Awwwards-weighted review score
 *   - measured stage gates (imagery: real fold media; refinement: budgets + visual swap test)
 */
import {
  DesignBrief,
  SiteKind,
  TasteControls,
  ColorMood,
  ConceptSpec,
} from "./types";
import type { DesignBrief as DesignBriefType, TasteControls as TasteControlsType } from "./types";
import { imageryGate } from "./imagery";

/* ------------------------------------------------------------------ */
/* Stages                                                              */
/* ------------------------------------------------------------------ */

export const STAGED_STAGES = [
  "brief",
  "concepts",
  "moodboard",
  "art-direction",
  "imagery",
  "key-screen",
  "sections",
  "refinement",
] as const;

export type StagedStageId = (typeof STAGED_STAGES)[number];

export type StageStatus = "pending" | "in-review" | "approved" | "rejected";

export interface StageState {
  id: StagedStageId;
  status: StageStatus;
  note?: string;
}

export interface StagedRun {
  stages: StageState[];
}

function stageIndex(id: StagedStageId): number {
  return STAGED_STAGES.indexOf(id);
}

function currentInReview(run: StagedRun): StagedStageId | null {
  const found = run.stages.find((s) => s.status === "in-review");
  return found ? found.id : null;
}

export function createStagedRun(): StagedRun {
  const stages: StageState[] = STAGED_STAGES.map((id, idx) => ({
    id,
    status: idx === 0 ? "in-review" : "pending",
  }));
  return { stages };
}

export function approveStage(run: StagedRun, id: StagedStageId, note?: string): StagedRun {
  const cur = currentInReview(run);
  if (cur !== id) {
    throw new Error(`Cannot approve stage "${id}": current in-review stage is "${cur ?? "none"}".`);
  }
  const idx = stageIndex(id);
  const nextId: StagedStageId | null =
    idx + 1 < STAGED_STAGES.length ? STAGED_STAGES[idx + 1]! : null;
  const stages = run.stages.map((s) => {
    if (s.id === id) {
      return { ...s, status: "approved" as StageStatus, note };
    }
    if (nextId !== null && s.id === nextId) {
      return { ...s, status: "in-review" as StageStatus };
    }
    return { ...s };
  });
  return { stages };
}

export function rejectStage(run: StagedRun, id: StagedStageId, note?: string): StagedRun {
  const cur = currentInReview(run);
  if (cur !== id) {
    throw new Error(`Cannot reject stage "${id}": current in-review stage is "${cur ?? "none"}".`);
  }
  const idx = stageIndex(id);
  const stages = run.stages.map((s, i) => {
    if (s.id === id) {
      return { ...s, status: "in-review" as StageStatus, note };
    }
    if (i > idx) {
      return { id: s.id, status: "pending" as StageStatus };
    }
    return { ...s };
  });
  return { stages };
}

export function assertStageCanRun(run: StagedRun, id: StagedStageId): void {
  const idx = stageIndex(id);
  for (let i = 0; i < idx; i += 1) {
    const earlier = STAGED_STAGES[i]!;
    const state = run.stages.find((s) => s.id === earlier);
    if (!state || state.status !== "approved") {
      throw new Error(
        `Cannot run stage "${id}": earlier stage "${earlier}" is not approved (status: ${state?.status ?? "missing"}).`,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Stage gates                                                         */
/* ------------------------------------------------------------------ */

/**
 * Evidence a reviewer hands the gate. Visual swap results are computed by `runVisualSwapTest`
 * (swap-visual.ts) and passed in, which keeps this module free of the renderer.
 */
export interface StageGateEvidence {
  previewHtml?: string;
  visualSwap?: { passed: boolean; changedRatio: number; reasons: string[] };
}

export interface StageGateResult {
  stage: StagedStageId;
  passed: boolean;
  blocking: string[];
  warnings: string[];
}

/**
 * Measured gates that must hold before a stage can be approved. Stages without a measured gate
 * pass through to human review unchanged.
 *   - imagery: fold carries real raster media; no asset cycled across slots.
 *   - refinement: preview budgets pass and the visual swap test passes (≥ 0.5 changed).
 */
export function stageGate(id: StagedStageId, evidence: StageGateEvidence): StageGateResult {
  const blocking: string[] = [];
  const warnings: string[] = [];
  if (id === "imagery") {
    if (!evidence.previewHtml) {
      blocking.push("imagery gate needs the rendered preview HTML");
    } else {
      const report = imageryGate(evidence.previewHtml);
      for (const f of report.findings) {
        if (f.ok) continue;
        (f.severity === "ban" ? blocking : warnings).push(`${f.id}: ${f.detail}`);
      }
    }
  }
  if (id === "refinement") {
    if (!evidence.previewHtml) {
      blocking.push("refinement gate needs the rendered preview HTML");
    } else {
      const budgets = checkPreviewBudgets(evidence.previewHtml);
      for (const f of budgets.findings) if (!f.ok) blocking.push(`budget ${f.id}: ${f.detail}`);
    }
    if (!evidence.visualSwap) {
      blocking.push("refinement gate needs a visual swap test result");
    } else if (!evidence.visualSwap.passed) {
      blocking.push(
        `visual swap test failed (${evidence.visualSwap.changedRatio} changed, need ≥ 0.5): ${evidence.visualSwap.reasons.join("; ")}`,
      );
    }
  }
  return { stage: id, passed: blocking.length === 0, blocking, warnings };
}

/** Approve only when the stage's measured gate holds. Throws with the blocking reasons. */
export function approveGatedStage(
  run: StagedRun,
  id: StagedStageId,
  evidence: StageGateEvidence,
  note?: string,
): StagedRun {
  const gate = stageGate(id, evidence);
  if (!gate.passed) {
    throw new Error(`Cannot approve stage "${id}": ${gate.blocking.join(" | ")}`);
  }
  return approveStage(run, id, note);
}

/* ------------------------------------------------------------------ */
/* Themes                                                              */
/* ------------------------------------------------------------------ */

export type ColorMoodValue = TasteControlsType["colorMood"];

export interface Theme {
  id: string;
  label: string;
  colorMood: ColorMoodValue;
  brandAccent: string;
  paper: string;
  ink: string;
  description: string;
}

export const THEMES: Theme[] = [
  {
    id: "ink-paper",
    label: "Ink Paper",
    colorMood: "neutral-professional",
    brandAccent: "#1f2a37",
    paper: "#f4f1ea",
    ink: "#161616",
    description: "Achromatic ink on warm paper stock — the default editorial baseline.",
  },
  {
    id: "forest-ledger",
    label: "Forest Ledger",
    colorMood: "soft-brand-accent",
    brandAccent: "#2f5d4a",
    paper: "#f2f0e8",
    ink: "#1c2420",
    description: "Deep forest accent over a ledger-green paper tint.",
  },
  {
    id: "ember-clay",
    label: "Ember Clay",
    colorMood: "soft-brand-accent",
    brandAccent: "#a04a2f",
    paper: "#f6efe6",
    ink: "#2a1f1a",
    description: "Warm clay accent on sun-baked paper.",
  },
  {
    id: "glacier-signal",
    label: "Glacier Signal",
    colorMood: "light-airy",
    brandAccent: "#2b6cb0",
    paper: "#f7fafc",
    ink: "#1a202c",
    description: "Clear cyan-blue accent on bright, airy paper.",
  },
  {
    id: "nocturne-brass",
    label: "Nocturne Brass",
    colorMood: "dark-premium",
    brandAccent: "#b7862f",
    paper: "#1b1d24",
    ink: "#e8e2d6",
    description: "Brass accent on a dark premium canvas.",
  },
  {
    id: "plum-press",
    label: "Plum Press",
    colorMood: "soft-brand-accent",
    brandAccent: "#4a1f3d",
    paper: "#f3eef2",
    ink: "#1f1520",
    description: "Deep plum accent — a press-ink tone, not a violet gradient.",
  },
];

export function getTheme(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

export function listThemes(): Theme[] {
  return [...THEMES];
}

export function applyTheme(taste: TasteControlsType, theme: Theme): TasteControlsType {
  return TasteControls.parse({ ...taste, colorMood: theme.colorMood });
}

export function applyThemeToBrief(brief: DesignBriefType, theme: Theme): DesignBriefType {
  const parsed = DesignBrief.parse(brief);
  const taste = { ...(parsed.taste ?? {}), colorMood: theme.colorMood };
  return DesignBrief.parse({
    ...parsed,
    brandAccent: theme.brandAccent,
    taste,
  });
}

/* ------------------------------------------------------------------ */
/* Concept derivation                                                  */
/* ------------------------------------------------------------------ */

interface ConceptRow {
  metaphor: string;
  rejects: string[];
  visibleTests: string[];
  phrase: string;
}

const CONCEPT_TABLE: Record<string, ConceptRow> = {
  "saas-marketing": {
    metaphor: "a single pipeline board with one moving part",
    rejects: ["violet gradient hero", "shadow on every card", "system-font stack"],
    visibleTests: [
      "primary action visible above the fold",
      "proof section names a real feature",
      "pricing repeats the primary action",
    ],
    phrase: "turns the first capability into one decision path",
  },
  "dashboard-webapp": {
    metaphor: "an operator console with a priority rail",
    rejects: ["violet gradient hero", "card grid dashboard", "system-font stack"],
    visibleTests: [
      "app shell exposes a working table",
      "priority rail filters the view",
      "sidebar navigation targets real views",
    ],
    phrase: "organises work around a live queue",
  },
  "research-dossier": {
    metaphor: "a folio masthead with a chapter rail",
    rejects: ["violet gradient hero", "metric theatre", "system-font stack"],
    visibleTests: [
      "folio masthead shows volume and issue",
      "chapter rail navigates the dossier",
      "footnote register closes the page",
    ],
    phrase: "reads like a capital briefing",
  },
  "editorial-foundry": {
    metaphor: "a hard-seam type ladder",
    rejects: ["violet gradient hero", "soft card grid", "system-font stack"],
    visibleTests: [
      "hard seam splits claim from type ladder",
      "marginalia groups cuts by priority",
      "colophon closes the page",
    ],
    phrase: "treats type as the primary material",
  },
  "art-directed-studio": {
    metaphor: "a crop-marked work board",
    rejects: ["violet gradient hero", "pricing table", "system-font stack"],
    visibleTests: [
      "stacked claim above the work board",
      "feature alternating sections",
      "no pricing theatre",
    ],
    phrase: "lets the work own the fold",
  },
  "corporate-story": {
    metaphor: "a principle spine with a posture grid",
    rejects: ["violet gradient hero", "metric band spam", "system-font stack"],
    visibleTests: [
      "principle spine anchors the fold",
      "posture grid catalogs capabilities",
      "measure rule separates sections",
    ],
    phrase: "argues from stated principles",
  },
  "docs-educational": {
    metaphor: "a scrub instrument with a mechanism plate",
    rejects: ["violet gradient hero", "stackfold skeleton", "system-font stack"],
    visibleTests: [
      "mechanism fold owns the fold",
      "scrub instrument drives the range",
      "stage list is clickable",
    ],
    phrase: "teaches through an interactive mechanism",
  },
};

export function deriveConcept(brief: DesignBriefType): ConceptSpec {
  const kind = brief.siteKind;
  const row = CONCEPT_TABLE[kind];
  let metaphor: string;
  let rejects: string[];
  let visibleTests: string[];
  let phrase: string;
  if (row) {
    metaphor = row.metaphor;
    rejects = [...row.rejects];
    visibleTests = [...row.visibleTests];
    phrase = row.phrase;
  } else {
    const featureName = brief.features[0]?.name ?? "the core capability";
    metaphor = `a ledger of ${featureName}`;
    rejects = ["violet gradient hero", "drop shadow on every card", "default system font stack"];
    visibleTests = [
      `${featureName} named in the hero`,
      "proof section cites a real feature",
      "primary action repeats across sections",
    ];
    phrase = `builds the page around ${featureName}`;
  }
  const oneLiner = `${brief.productName} ${phrase} — ${metaphor}.`;
  return ConceptSpec.parse({
    oneLiner,
    metaphor,
    rejects,
    visibleTests,
    siteKind: kind,
  });
}

/* ------------------------------------------------------------------ */
/* Swap test                                                           */
/* ------------------------------------------------------------------ */

export interface SwapTestInput {
  concept: ConceptSpec;
  heroTitle: string;
  bodyCopy: string[];
}

export interface SwapTestResult {
  passed: boolean;
  changedRatio: number;
  reasons: string[];
}

export function swapTest(original: SwapTestInput, swapped: SwapTestInput): SwapTestResult {
  const pairs: { label: string; a: string; b: string }[] = [];
  pairs.push({
    label: "concept.oneLiner",
    a: original.concept.oneLiner,
    b: swapped.concept.oneLiner,
  });
  pairs.push({
    label: "concept.metaphor",
    a: original.concept.metaphor,
    b: swapped.concept.metaphor,
  });
  pairs.push({ label: "heroTitle", a: original.heroTitle, b: swapped.heroTitle });
  const max = Math.max(original.bodyCopy.length, swapped.bodyCopy.length);
  for (let i = 0; i < max; i += 1) {
    pairs.push({
      label: `bodyCopy[${i}]`,
      a: original.bodyCopy[i] ?? "",
      b: swapped.bodyCopy[i] ?? "",
    });
  }
  const total = pairs.length === 0 ? 1 : pairs.length;
  let changed = 0;
  const reasons: string[] = [];
  for (const p of pairs) {
    if (p.a !== p.b) {
      changed += 1;
    } else {
      reasons.push(`${p.label} unchanged`);
    }
  }
  const changedRatio = changed / total;
  const passed = changedRatio >= 0.5;
  return { passed, changedRatio, reasons: passed ? [] : reasons };
}

export function buildSwappedBrief(brief: DesignBriefType): DesignBriefType {
  const parsed = DesignBrief.parse(brief);
  return DesignBrief.parse({
    ...parsed,
    productName: "Stranger Brand",
    tagline: "Unrelated placeholder tagline",
    features: parsed.features.map((f, i) => ({
      ...f,
      name: `Swapped feature ${i + 1}`,
      description: `Swapped description ${i + 1}`,
    })),
  });
}

/* ------------------------------------------------------------------ */
/* Performance budgets                                                 */
/* ------------------------------------------------------------------ */

export const PERFORMANCE_BUDGETS = {
  lcpMs: 2500,
  cls: 0.1,
  inpMs: 200,
  initialScriptKb: 170,
  initialTransferKb: 2048,
  techTier: "enhanced",
} as const;

export interface BudgetFinding {
  id: string;
  ok: boolean;
  detail: string;
}

export interface BudgetReport {
  passed: boolean;
  findings: BudgetFinding[];
}

export function checkPreviewBudgets(previewHtml: string): BudgetReport {
  const bytes = new TextEncoder().encode(previewHtml).length;
  const scriptCount = (previewHtml.match(/<script\b/gi) ?? []).length;
  const insecure = /(src|href)=["']http:\/\/(?!www\.w3\.org)/i.test(previewHtml);
  const viewport =
    /<meta[^>]*name=["']viewport["']/i.test(previewHtml) ||
    /name=["']viewport["'][^>]*content/i.test(previewHtml);
  const findings: BudgetFinding[] = [
    {
      id: "transfer-bytes",
      ok: bytes <= PERFORMANCE_BUDGETS.initialTransferKb * 1024,
      detail: `HTML is ${bytes} bytes (budget ${PERFORMANCE_BUDGETS.initialTransferKb}KB).`,
    },
    {
      id: "script-tags",
      ok: scriptCount <= 3,
      detail: `${scriptCount} <script> tags (budget 3).`,
    },
    {
      id: "no-insecure-assets",
      ok: !insecure,
      detail: insecure ? "contains an http:// asset" : "no http:// assets found.",
    },
    {
      id: "viewport-meta",
      ok: viewport,
      detail: viewport ? "viewport meta present." : "missing viewport meta.",
    },
  ];
  return { passed: findings.every((f) => f.ok), findings };
}

/* ------------------------------------------------------------------ */
/* Motion review                                                       */
/* ------------------------------------------------------------------ */

const KEY_INTERACTIONS: Record<string, string> = {
  "saas-marketing": "workflow stage swap",
  "dashboard-webapp": "priority rail filter",
  "research-dossier": "chapter rail navigation",
  "editorial-foundry": "hard-seam fold reveal",
  "art-directed-studio": "work board crop reveal",
  "corporate-story": "principle spine expand",
  "docs-educational": "scrub instrument drag",
};

export interface MotionReview {
  stage: "motion-review";
  after: "art-direction";
  before: "refinement";
  idea: string;
  tokens: { durationMs: [number, number]; easing: string; staggerMs: number };
  keyInteraction: string;
  checks: string[];
}

export function motionReviewFor(concept: ConceptSpec, _taste: TasteControlsType): MotionReview {
  const kind = concept.siteKind;
  const keyInteraction = KEY_INTERACTIONS[kind] ?? "primary action reveal";
  return {
    stage: "motion-review",
    after: "art-direction",
    before: "refinement",
    idea: `Motion follows ${concept.metaphor}: one restrained entrance, then stillness.`,
    tokens: {
      durationMs: [120, 260],
      easing: "cubic-bezier(0.22,1,0.36,1)",
      staggerMs: 60,
    },
    keyInteraction,
    checks: [
      "transform/opacity only",
      "reduced-motion replacement",
      "@supports fallback",
      "no long frames",
      "INP<=200ms",
      "lazy heavy bundles",
      "durations from tokens",
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Weighted review                                                     */
/* ------------------------------------------------------------------ */

export interface WeightedReviewInput {
  design: number;
  usability: number;
  creativity: number;
  content: number;
}

export interface WeightedReviewResult {
  score: number;
  band: "below-bar" | "approaching" | "at-bar" | "above-bar";
  weights: { design: 0.4; usability: 0.3; creativity: 0.2; content: 0.1 };
}

export function weightedReview(input: WeightedReviewInput): WeightedReviewResult {
  const raw =
    input.design * 0.4 +
    input.usability * 0.3 +
    input.creativity * 0.2 +
    input.content * 0.1;
  const score = Math.round(raw * 10) / 10;
  let band: WeightedReviewResult["band"] = "below-bar";
  if (score >= 85) band = "above-bar";
  else if (score >= 70) band = "at-bar";
  else if (score >= 55) band = "approaching";
  else band = "below-bar";
  return {
    score,
    band,
    weights: { design: 0.4, usability: 0.3, creativity: 0.2, content: 0.1 },
  };
}


