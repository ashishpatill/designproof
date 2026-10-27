import type { SpecimenMotion } from "./types";

/** Crease-first motion specimen — sport-matchday golden depth bar. */
export const creaseMotionSpecimen: SpecimenMotion = {
  version: 1,
  siteKind: "sport-matchday",
  conceptId: "crease",
  seekRegistry: "__dpSeek",
  reducedMotion: "static-stack",
  durationMs: 8000,
  beats: [
    { id: "hero-enter", label: "Hero enter", t0: 0, t1: 0.22 },
    { id: "score-spine", label: "Score spine", t0: 0.22, t1: 0.48 },
    { id: "fold-settle", label: "Fold settle", t0: 0.48, t1: 0.74 },
    { id: "cta-pulse", label: "CTA pulse", t0: 0.74, t1: 1 },
  ],
};

export function clampSeek(t: number): number {
  if (Number.isNaN(t)) return 0;
  return Math.min(1, Math.max(0, t));
}

export function activeBeatIndex(specimen: SpecimenMotion, t: number): number {
  const x = clampSeek(t);
  const i = specimen.beats.findIndex((b) => x >= b.t0 && x < b.t1);
  if (i >= 0) return i;
  return specimen.beats.length - 1;
}
