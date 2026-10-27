"use client";

import type { RefObject } from "react";
import type { MotionBeat } from "./types";

type MotionSeekTransportProps = {
  playing: boolean;
  beats: MotionBeat[];
  activeBeatIndex: number;
  reducedMotion: boolean;
  /** Per-frame scrub value writes land here — the 60fps loop never touches React render. */
  scrubRef: RefObject<HTMLInputElement | null>;
  /** Per-frame live percentage readout (aria-hidden; native slider state carries value to AT). */
  readoutRef: RefObject<HTMLSpanElement | null>;
  onTogglePlay: () => void;
  onScrub: (t: number) => void;
};

/**
 * Seek transport for DesignProof motion specimens — presentational only.
 * The parent band owns the rAF loop, window.__dpSeek registration, and
 * reduced-motion sync; this renders the spurs: play/pause, scrub, beat chips.
 */
export function MotionSeekTransport({
  playing,
  beats,
  activeBeatIndex,
  reducedMotion,
  scrubRef,
  readoutRef,
  onTogglePlay,
  onScrub,
}: MotionSeekTransportProps) {
  const active = beats[activeBeatIndex] ?? beats[0];
  const safeIndex = active ? beats.indexOf(active) : 0;

  return (
    <div className="mg-transport" data-testid="motion-seek-transport" data-reduced={reducedMotion ? "true" : "false"}>
      <div className="mg-transport__spur">
        <button
          type="button"
          className="mg-transport__play"
          data-testid="motion-seek-play"
          aria-label={playing ? "Pause Crease motion loop" : "Play Crease motion loop"}
          aria-pressed={playing}
          disabled={reducedMotion}
          onClick={onTogglePlay}
        >
          <span className="mg-transport__glyph" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="mg-transport__play-word">
            {reducedMotion ? "Still" : playing ? "Pause" : "Play"}
          </span>
        </button>

        <label className="mg-transport__scrub-wrap">
          <span className="mg-sr-only">Seek Crease motion — 0 to 100 percent of the loop</span>
          <input
            ref={scrubRef}
            type="range"
            className="mg-transport__scrub"
            data-testid="motion-seek-scrub"
            min={0}
            max={1000}
            step={1}
            defaultValue={800}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={active ? active.label : undefined}
            disabled={reducedMotion}
            onChange={(e) => onScrub(Number(e.target.value) / 1000)}
          />
          <span className="mg-transport__readout mono" aria-hidden="true">
            <span ref={readoutRef}>80%</span>
          </span>
        </label>
      </div>

      <ol className="mg-transport__beats" aria-label="Motion beats">
        {beats.map((b, i) => (
          <li key={b.id}>
            <button
              type="button"
              className="mg-transport__beat"
              data-testid={`motion-beat-${b.id}`}
              data-active={i === safeIndex ? "true" : "false"}
              aria-current={i === safeIndex ? "true" : undefined}
              disabled={reducedMotion}
              onClick={() => onScrub(b.t0)}
            >
              <span className="mg-transport__beat-id mono">{b.id}</span>
              <span className="mg-transport__beat-label">{b.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
