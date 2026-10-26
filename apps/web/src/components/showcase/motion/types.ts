/** DesignProof specimen.motion.json shape — seek-safe timeline bound to brief beats. */

export type MotionBeat = {
  id: string;
  label: string;
  /** Inclusive start in 0..1 of the specimen clock. */
  t0: number;
  /** Exclusive end in 0..1 of the specimen clock. */
  t1: number;
};

export type SpecimenMotion = {
  version: 1;
  siteKind: string;
  conceptId: string;
  beats: MotionBeat[];
  seekRegistry: "__dpSeek";
  reducedMotion: "static-stack";
  durationMs: number;
  proofVerifyId?: string;
};

declare global {
  interface Window {
    /** DesignProof seek clock: t clamped to 0..1. */
    __dpSeek?: (t: number) => void;
  }
}

export {};
