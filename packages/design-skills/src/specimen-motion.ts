import {
  SpecimenMotion,
  type ConceptSpec,
  type DesignBrief,
  type MotionPackId,
} from "./types";

const DESIGNPROOF_BRAND_CONTRACT = {
  display: "Instrument Serif",
  body: "Source Sans 3",
  mono: "IBM Plex Mono",
  accent: "#D4714A",
  surface: "#181614",
} as const;

function labelsFor(packs: readonly MotionPackId[]) {
  if (!packs.length) return [];
  const labels = [
    { id: "hero-enter", atMs: 0, durationMs: 260, note: "Brief claim enters its first-screen composition." },
  ];
  if (packs.includes("tell-physics-fold")) {
    labels.push({ id: "page-shape-settle", atMs: 320, durationMs: 560, note: "The metaphor-owned fold settles into its reading order." });
  }
  labels.push({ id: "proof-stack", atMs: 960, durationMs: 420, note: "Proof matter takes its declared place." });
  if (packs.includes("tell-audio-caption")) {
    labels.push({ id: "chapter-close", atMs: 1_520, durationMs: 360, note: "The closing beat holds for caption and frame review." });
  }
  return labels;
}

export type SpecimenMotionInput = {
  brief: Pick<DesignBrief, "siteKind" | "productName">;
  concept: Pick<ConceptSpec, "metaphor">;
  packs: readonly MotionPackId[];
};

/** Build the canonical specimen.motion.json document for a generated specimen. */
export function createSpecimenMotionJson(input: SpecimenMotionInput) {
  const labels = labelsFor(input.packs);
  const durationMs = labels.length
    ? Math.max(...labels.map((label) => label.atMs + label.durationMs))
    : 0;
  return SpecimenMotion.parse({
    version: 1,
    siteKind: input.brief.siteKind,
    metaphor: input.concept.metaphor,
    packs: [...input.packs],
    durationMs,
    labels,
    seek: {
      global: "window.__dpSeek",
      signature: "(timeSeconds: number) => void",
      units: "seconds",
      autoplay: false,
      clamp: true,
    },
    reducedMotion: {
      replacement: "Show the completed page-shape composition with all content available immediately.",
      still: `${input.brief.productName} settled frame — no travel, no delayed reveal.`,
    },
    brandContract: DESIGNPROOF_BRAND_CONTRACT,
  });
}

export function parseSpecimenMotionJson(input: unknown) {
  return SpecimenMotion.parse(input);
}

export function specimenMotionJsonText(input: SpecimenMotionInput): string {
  return JSON.stringify(createSpecimenMotionJson(input), null, 2);
}
