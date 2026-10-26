"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { activeBeatIndex, clampSeek, creaseMotionSpecimen } from "./creaseMotionSpecimen";
import { MotionSeekTransport } from "./MotionSeekTransport";

/**
 * Crease-first seekable motion band.
 * Registers window.__dpSeek(t) with t in 0..1; rAF play loop maps clock → seek.
 */
export function CreaseMotionBand() {
  const specimen = creaseMotionSpecimen;
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const progressRef = useRef(0);
  const playingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const applySeek = useCallback((t: number) => {
    const next = clampSeek(t);
    progressRef.current = next;
    setProgress(next);
    const el = rootRef.current;
    if (el) el.style.setProperty("--mg-t", String(next));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const reduce = mq.matches;
      setReducedMotion(reduce);
      if (reduce) {
        playingRef.current = false;
        setPlaying(false);
        applySeek(0);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [applySeek]);

  useEffect(() => {
    window.__dpSeek = (t: number) => {
      applySeek(t);
    };
    applySeek(0);
    return () => {
      if (window.__dpSeek) delete window.__dpSeek;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [applySeek]);

  useEffect(() => {
    if (!playing || reducedMotion) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
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
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [playing, reducedMotion, applySeek, specimen.durationMs]);

  const onTogglePlay = () => {
    if (reducedMotion) return;
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
  };

  const onSeek = (t: number) => {
    applySeek(t);
    window.__dpSeek?.(t);
  };

  const beatIdx = activeBeatIndex(specimen, progress);
  const beat = specimen.beats[beatIdx];

  return (
    <section
      ref={rootRef}
      className="mg-band"
      data-testid="crease-motion-band"
      data-reduced={reducedMotion ? "true" : "false"}
      data-beat={beat?.id}
      style={{ ["--mg-t" as keyof CSSProperties]: progress } as CSSProperties}
      aria-label="Crease seekable motion specimen"
    >
      <header className="mg-band__mast">
        <p className="mg-band__kicker">Crease · sport-matchday</p>
        <h2 className="mg-band__title">Pavilion evening loop</h2>
        <p className="mg-band__lede">
          Seek-safe Crease fold — hero enter, score spine, fold settle, CTA pulse. Bound to{" "}
          <code>window.__dpSeek</code> and <code>specimen.motion.json</code>.
        </p>
        <ul className="mg-band__packs" aria-label="DesignProof motion packs">
          <li>tell-motion-timeline</li>
          <li>tell-physics-fold</li>
        </ul>
      </header>

      <div className="mg-stage" aria-hidden={false}>
        <div className="mg-stage__pitch">
          <div className="mg-layer mg-layer--hero">
            <p className="mg-hero-mark">Crease</p>
            <p className="mg-hero-sub">Matchday companion · glance-live score spine</p>
          </div>
          <div className="mg-layer mg-layer--score">
            <div className="mg-score">
              <span className="mg-score__team">IND</span>
              <span className="mg-score__runs">247–4</span>
              <span className="mg-score__overs">38.2</span>
            </div>
            <div className="mg-score mg-score--away">
              <span className="mg-score__team">AUS</span>
              <span className="mg-score__runs">yet to bat</span>
            </div>
          </div>
          <div className="mg-layer mg-layer--fold">
            <div className="mg-fold-card">
              <p className="mg-fold-card__label">Partnership</p>
              <p className="mg-fold-card__value">86 · 11.4 overs</p>
            </div>
            <div className="mg-fold-card">
              <p className="mg-fold-card__label">Required</p>
              <p className="mg-fold-card__value">Hold the crease</p>
            </div>
          </div>
          <div className="mg-layer mg-layer--cta">
            <span className="mg-cta">Open full Crease</span>
          </div>
        </div>
      </div>

      <MotionSeekTransport
        playing={playing}
        progress={progress}
        beats={specimen.beats}
        activeBeatIndex={beatIdx}
        reducedMotion={reducedMotion}
        onTogglePlay={onTogglePlay}
        onSeek={onSeek}
      />

      {reducedMotion ? (
        <p className="mg-band__reduced" role="status">
          Reduced motion — static Crease stack (hero, score spine, fold cards). Seek disabled.
        </p>
      ) : null}
    </section>
  );
}
