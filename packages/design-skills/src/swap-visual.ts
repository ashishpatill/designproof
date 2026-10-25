/**
 * Visual swap test — roadmap step 1 (Book III §5).
 *
 * The text swap test in `staged.ts` asks whether the copy changes when the brief changes. This
 * one asks the harder question: when another brand's content goes in, does the *design* change?
 * If the same skeleton, the same fold composition, the same drawings and the same type pairing
 * come back, the page was never designed for its brief — it was a template with a name swapped.
 *
 * Colour is recorded but never scored. Briefs that differed only by a product-name colour hash
 * were exactly the training rows BIM-187 flags as failing the bar; colour alone cannot pass.
 *
 * Deterministic and browser-free so it can run in unit tests and at the refinement review gate.
 * `scripts/design-research/swap.ts` runs the pixel version against real screenshots.
 */
import { measureImageryHtml } from "./imagery";
import { designFromFeatures } from "./orchestrate";
import { buildSwappedBrief } from "./staged";
import { DesignBrief, type DesignSpec } from "./types";

export interface VisualSignature {
  layoutSequence: string[];
  heroLayout: string;
  figureKinds: string[];
  mediaSrcs: string[];
  typePairing: string;
  /** Recorded for the report only — never scored. */
  palette: string;
}

export function visualSignature(spec: DesignSpec, previewHtml: string): VisualSignature {
  const figureKinds = [...previewHtml.matchAll(/<svg\b[^>]*\bdata-figure="([^"]+)"/g)].map((m) => m[1] ?? "");
  const mediaSrcs = [...previewHtml.matchAll(/<(?:img|video)\b[^>]*\bclass="ds-fig ds-media-img"[^>]*?\bsrc="([^"]+)"/g)].map(
    (m) => m[1] ?? "",
  );
  return {
    layoutSequence: spec.sections.map((s) => s.layout),
    heroLayout: spec.sections.find((s) => s.kind === "hero")?.layout ?? "none",
    figureKinds,
    mediaSrcs,
    typePairing: spec.tokens.fontRequests.join("|"),
    palette: [spec.tokens.color.paper, spec.tokens.color.accent, spec.tokens.color.ink].join(" "),
  };
}

/** 0 = identical sequences, 1 = nothing in common position-for-position. */
function sequenceDistance(a: string[], b: string[]): number {
  const n = Math.max(a.length, b.length);
  if (n === 0) return 0;
  let differ = 0;
  for (let i = 0; i < n; i += 1) if (a[i] !== b[i]) differ += 1;
  return differ / n;
}

/** Multiset Jaccard distance. Both empty → 0 (no evidence of change). */
function bagDistance(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0;
  const count = (xs: string[]): Map<string, number> => {
    const m = new Map<string, number>();
    for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1);
    return m;
  };
  const ca = count(a);
  const cb = count(b);
  let inter = 0;
  let union = 0;
  for (const k of new Set([...ca.keys(), ...cb.keys()])) {
    const x = ca.get(k) ?? 0;
    const y = cb.get(k) ?? 0;
    inter += Math.min(x, y);
    union += Math.max(x, y);
  }
  return union === 0 ? 0 : 1 - inter / union;
}

export interface VisualSwapDimension {
  id: "layout-sequence" | "hero-composition" | "figures" | "imagery" | "type-pairing";
  changed: number;
  detail: string;
}

export interface VisualSwapResult {
  passed: boolean;
  changedRatio: number;
  threshold: number;
  dimensions: VisualSwapDimension[];
  reasons: string[];
  paletteOnly: boolean;
}

export const VISUAL_SWAP_THRESHOLD = 0.5;

export function visualSwapTest(original: VisualSignature, swapped: VisualSignature): VisualSwapResult {
  const dimensions: VisualSwapDimension[] = [
    {
      id: "layout-sequence",
      changed: sequenceDistance(original.layoutSequence, swapped.layoutSequence),
      detail: `${original.layoutSequence.length} vs ${swapped.layoutSequence.length} sections`,
    },
    {
      id: "hero-composition",
      changed: original.heroLayout === swapped.heroLayout ? 0 : 1,
      detail: `${original.heroLayout} → ${swapped.heroLayout}`,
    },
    {
      id: "figures",
      changed: bagDistance(original.figureKinds, swapped.figureKinds),
      detail: `${original.figureKinds.length} vs ${swapped.figureKinds.length} drawn figures`,
    },
    {
      id: "imagery",
      changed: bagDistance(original.mediaSrcs, swapped.mediaSrcs),
      detail: `${original.mediaSrcs.length} vs ${swapped.mediaSrcs.length} raster media`,
    },
    {
      id: "type-pairing",
      changed: original.typePairing === swapped.typePairing ? 0 : 1,
      detail: original.typePairing === swapped.typePairing ? "same families" : "different families",
    },
  ];
  const changedRatio = Math.round((dimensions.reduce((a, d) => a + d.changed, 0) / dimensions.length) * 1000) / 1000;
  const passed = changedRatio >= VISUAL_SWAP_THRESHOLD;
  const paletteOnly = changedRatio === 0 && original.palette !== swapped.palette;
  const reasons = passed
    ? []
    : [
        ...dimensions.filter((d) => d.changed < 0.5).map((d) => `${d.id} survived the swap (${d.detail})`),
        ...(paletteOnly ? ["only the colour changed — a palette swap is not a redesign"] : []),
      ];
  return { passed, changedRatio, threshold: VISUAL_SWAP_THRESHOLD, dimensions, reasons, paletteOnly };
}

export interface BriefSwapReport extends VisualSwapResult {
  original: VisualSignature;
  swapped: VisualSignature;
  imagery: { original: number; swapped: number };
}

/**
 * Render the brief, render a stranger brand in the same slot (no shared assets — a stranger does
 * not own the original's photographs), and compare what the reader would see.
 */
export function runVisualSwapTest(briefInput: DesignBrief, opts: { swappedBrief?: DesignBrief } = {}): BriefSwapReport {
  const brief = DesignBrief.parse(briefInput);
  const swappedBrief = opts.swappedBrief
    ? DesignBrief.parse(opts.swappedBrief)
    : DesignBrief.parse({ ...buildSwappedBrief(brief), assets: undefined, brandAccent: undefined });
  const a = designFromFeatures(brief);
  const b = designFromFeatures(swappedBrief);
  const original = visualSignature(a.spec, a.previewHtml);
  const swapped = visualSignature(b.spec, b.previewHtml);
  return {
    ...visualSwapTest(original, swapped),
    original,
    swapped,
    imagery: {
      original: measureImageryHtml(a.previewHtml).rasterCount,
      swapped: measureImageryHtml(b.previewHtml).rasterCount,
    },
  };
}
