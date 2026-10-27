import type { MotionSpecimenSpec } from "./types";

/**
 * Crease specimen motion — a stylized matchday loop composed for the
 * DesignProof motion gallery. Beats map 1:1 to band sections and are read
 * by the band CSS off --dp-t (normalized loop time).
 * Pack chips reference their movement kits by name only: tell-motion-timeline
 * drives the seek spine, tell-physics-fold shapes the settling sheet.
 */
export const creaseMotionSpecimen: MotionSpecimenSpec = {
  version: 1,
  siteKind: "sport-matchday",
  conceptId: "crease",
  beats: [
    { id: "hero-enter", label: "Hero enter", t0: 0, t1: 0.28 },
    { id: "score-spine", label: "Score spine", t0: 0.28, t1: 0.55 },
    { id: "fold-settle", label: "Fold settle", t0: 0.55, t1: 0.82 },
    { id: "cta-pulse", label: "CTA pulse", t0: 0.82, t1: 1 },
  ],
  seekRegistry: "__dpSeek",
  reducedMotion: "static-stack",
  durationMs: 8000,
};

/** Pack chips named on the band (names only, nothing else is applied). */
export const CREASE_MOTION_PACK_CHIPS = ["tell-motion-timeline", "tell-physics-fold"] as const;

/** Normalized time the band paints when no transport is driving it. */
export const CREASE_MOTION_STILL_T = 0.8;
