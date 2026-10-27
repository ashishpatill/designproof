/**
 * Motion specimen contracts — DesignProof-native, peer-gallery specs.
 *
 * A motion specimen is a seekable timeline of labeled beats. The seek
 * registry name and the reduced-motion policy are declared in data so
 * gallery pages can be composed and tested without reading component
 * internals. Motion maps to transform/opacity only; reduced motion
 * resolves to a static composition, never a blank frame.
 */

export type MotionBeat = {
  /** Stable kebab-case id — mirrored into data-beat and CSS. */
  id: string;
  /** Human label for chips, readouts, and accessible text. */
  label: string;
  /** Beat start in normalized time, 0..1 inclusive. */
  t0: number;
  /** Beat end in normalized time (exclusive at the boundary into the next beat). */
  t1: number;
};

export type MotionSpecimenSpec = {
  version: 1;
  /** Site kind this motion was composed against. */
  siteKind: string;
  /** Concept the band stylizes (e.g. "crease"). */
  conceptId: string;
  /** Ordered beats covering the loop. */
  beats: MotionBeat[];
  /** Global seek handle the transport registers: window[seekRegistry] = (t) => void. */
  seekRegistry: string;
  /** Reduced-motion policy name — "static-stack" restacks the band as a still no-motes sheet. */
  reducedMotion: string;
  /** Full loop length at t=1, in ms. */
  durationMs: number;
};

/** Clamp a raw seek value into the transport range. */
export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/** Beat whose window contains t; the last beat owns the t=1 boundary. */
export function beatAt(
  spec: Pick<MotionSpecimenSpec, "beats">,
  t: number,
): MotionBeat | undefined {
  const v = clamp01(t);
  for (const b of spec.beats) {
    if (v >= b.t0 && v < b.t1) return b;
  }
  return spec.beats[spec.beats.length - 1];
}
