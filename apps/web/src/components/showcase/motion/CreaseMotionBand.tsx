"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CREASE_MOTION_PACK_CHIPS, CREASE_MOTION_STILL_T, creaseMotionSpecimen } from "./creaseMotionSpecimen";
import { beatAt, clamp01 } from "./types";
import { MotionSeekTransport } from "./MotionSeekTransport";

/**
 * Crease-first seekable motion band — the client conductor for the specimen.
 * Registers window.__dpSeek(t) with t clamped 0..1; the rAF play loop maps
 * clock to seek; pause cancels the frame loop. Per-frame work is imperative
 * (--mg-t on the band root plus scrub/readout text) so transform/opacity motion
 * never waits on a React render. Reduced motion restacks the band as a static
 * sheet instead of blanking it.
 */
export function CreaseMotionBand() {
  const specimen = creaseMotionSpecimen;
  const stillBeat = beatAt(specimen, CREASE_MOTION_STILL_T);

  const [beatIdx, setBeatIdx] = useState(() =>
    Math.max(0, specimen.beats.findIndex((b) => b.id === stillBeat?.id)),
  );
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  const progressRef = useRef(CREASE_MOTION_STILL_T);
  const playingRef = useRef(false);
  const reducedRef = useRef(false);
  const beatIdRef = useRef(stillBeat?.id ?? "");
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const rootRef = useRef<HTMLElement | null>(null);
  const scrubRef = useRef<HTMLInputElement | null>(null);
  const readoutRef = useRef<HTMLSpanElement | null>(null);

  /** One imperative frame paint: CSS time var, scrub position, readout text. */
  const applyFrame = useCallback((t: number) => {
    progressRef.current = t;
    if (rootRef.current) rootRef.current.style.setProperty("--mg-t", t.toFixed(4));
    if (scrubRef.current) scrubRef.current.value = String(Math.round(t * 1000));
    if (readoutRef.current) readoutRef.current.textContent = `${Math.round(t * 100)}%`;
  }, []);

  /** Seek to a clamped time, syncing the active-beat state only at boundaries. */
  const applySeek = useCallback(
    (raw: number) => {
      const t = clamp01(raw);
      applyFrame(t);
      const next = beatAt(specimen, t);
      if (next && next.id !== beatIdRef.current) {
        beatIdRef.current = next.id;
        const idx = specimen.beats.findIndex((b) => b.id === next.id);
        if (idx >= 0) setBeatIdx(idx);
      }
    },
    [applyFrame, specimen],
  );

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = null;
  }, []);

  // Reset + forget the seek registry handle on unmount.
  useEffect(() => {
    window.__dpSeek = (raw: number) => {
      if (reducedRef.current) return;
      applySeek(raw);
    };
    applySeek(CREASE_MOTION_STILL_T);
    return () => {
      delete window.__dpSeek;
      stopLoop();
    };
  }, [applySeek, stopLoop]);

  // Reduced motion: truth lives with the media query; playback stops, static stack takes over.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedRef.current = mq.matches;
      setReduced(mq.matches);
      if (mq.matches) {
        playingRef.current = false;
        setPlaying(false);
        applySeek(CREASE_MOTION_STILL_T);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [applySeek]);

  // Play loop: rAF maps wall clock into seek(t); pause simply stops the loop.
  useEffect(() => {
    if (!playing || reduced) {
      stopLoop();
      return;
    }
    const tick = (ts: number) => {
      if (!playingRef.current) return;
      const last = lastTsRef.current ?? ts;
      lastTsRef.current = ts;
      const dt = Math.min(64, ts - last);
      const next = progressRef.current + dt / specimen.durationMs;
      applySeek(next >= 1 ? next - 1 : next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return stopLoop;
  }, [playing, reduced, applySeek, specimen.durationMs, stopLoop]);

  const onTogglePlay = useCallback(() => {
    if (reducedRef.current) return;
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
  }, []);

  const onScrub = useCallback(
    (t: number) => {
      if (reducedRef.current) return;
      applySeek(t);
    },
    [applySeek],
  );

  const beat = specimen.beats[beatIdx] ?? specimen.beats[0];

  return (
    <section
      ref={rootRef}
      className="mg-band"
      data-testid="crease-motion-band"
      data-beat={beat?.id}
      data-playing={playing && !reduced ? "true" : "false"}
      data-reduced={reduced ? "true" : "false"}
      style={{ ["--mg-t" as keyof CSSProperties]: CREASE_MOTION_STILL_T } as CSSProperties}
      aria-label="Crease seekable motion specimen"
    >
      <div className="mg-band__grain" aria-hidden="true" />
      <div className="mg-band__rule" aria-hidden="true">
        <span className="mg-band__rule-progress" />
        {specimen.beats.map((b) => (
          <span key={b.id} className="mg-band__notch" style={{ left: `${b.t0 * 100}%` }} />
        ))}
      </div>

      <header className="mg-band__mast">
        <p className="mg-band__kicker mono">Motion specimen · {specimen.siteKind} · {specimen.conceptId}</p>
        <h2 className="mg-band__title">Pavilion evening loop</h2>
        <p className="mg-band__lede">
          Stylized Crease matchday — hero enter, score spine, fold settle, CTA pulse. Scrub the
          spine, land on a beat, or let the {specimen.durationMs / 1000}s loop play.
        </p>
        <ul className="mg-band__packs" aria-label="DesignProof motion packs">
          {CREASE_MOTION_PACK_CHIPS.map((chip) => (
            <li key={chip} className="mono">{chip}</li>
          ))}
        </ul>
      </header>

      <div className="mg-stage">
        <div className="mg-skyline" aria-hidden="true">
          <span /><span /><span /><span /><span /><i className="mg-skyline__flood" />
        </div>

        <div className="mg-stage__pitch" aria-hidden="true">
          <i className="mg-stage__crease mg-stage__crease--far" />
          <i className="mg-stage__crease mg-stage__crease--near" />
          <span className="mg-stage__stumps">
            <i /><i /><i />
          </span>
          <i className="mg-stage__bails" />
        </div>

        <div className="mg-layer mg-layer--hero">
          <p className="mg-hero-mark">Haverstone v Caldebrook</p>
          <p className="mg-hero-sub">Pavilion evening · glance-live matchday</p>
        </div>

        <aside className="mg-layer mg-layer--spine" aria-label="Score spine">
          <p className="mg-spine__label mono">Score spine</p>
          <p className="mg-spine__score">
            <span className="mg-spine__team mono">HAV</span>
            <span className="mg-spine__runs">214/6</span>
            <span className="mg-spine__overs mono">38.2 ov</span>
          </p>
          <ul className="mg-spine__balls" aria-label="Recent balls">
            {["1", "4", "·", "2", "1", "wd"].map((ball, i) => (
              <li key={`${ball}-${i}`} className="mono">{ball}</li>
            ))}
          </ul>
          <p className="mg-spine__away">CAL — yet to bat</p>
        </aside>

        <div className="mg-layer mg-layer--fold">
          <div className="mg-fold-card">
            <p className="mg-fold-card__label mono">Glance fold</p>
            <p className="mg-fold-card__row"><span>Partnership</span><strong>86 · 11.4 ov</strong></p>
            <p className="mg-fold-card__row"><span>Required</span><strong>Hold the crease</strong></p>
            <span className="mg-fold-card__stamp mono" aria-hidden="true">Set</span>
          </div>
        </div>

        <div className="mg-layer mg-layer--cta">
          <span className="mg-cta">Open full Crease</span>
        </div>
      </div>

      <MotionSeekTransport
        playing={playing}
        beats={specimen.beats}
        activeBeatIndex={beatIdx}
        reducedMotion={reduced}
        scrubRef={scrubRef}
        readoutRef={readoutRef}
        onTogglePlay={onTogglePlay}
        onScrub={onScrub}
      />

      {reduced ? (
        <p className="mg-band__reduced-note mono" role="status">
          Reduced motion — static Crease stack (hero, score spine, fold card, CTA). Seek disabled.
        </p>
      ) : null}
    </section>
  );
}
