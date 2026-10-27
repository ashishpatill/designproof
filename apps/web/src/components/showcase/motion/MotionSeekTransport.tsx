"use client";

import type { MotionBeat } from "./types";

type MotionSeekTransportProps = {
  playing: boolean;
  progress: number;
  beats: MotionBeat[];
  activeBeatIndex: number;
  reducedMotion: boolean;
  onTogglePlay: () => void;
  onSeek: (t: number) => void;
};

/**
 * Seek transport for DesignProof motion specimens.
 * Scrub maps 0..1 into window.__dpSeek via the parent band.
 */
export function MotionSeekTransport({
  playing,
  progress,
  beats,
  activeBeatIndex,
  reducedMotion,
  onTogglePlay,
  onSeek,
}: MotionSeekTransportProps) {
  const active = beats[activeBeatIndex];

  return (
    <div className="mg-transport" data-testid="motion-seek-transport">
      <button
        type="button"
        className="mg-transport__play"
        data-testid="motion-seek-play"
        aria-label={playing ? "Pause Crease motion loop" : "Play Crease motion loop"}
        aria-pressed={playing}
        disabled={reducedMotion}
        onClick={onTogglePlay}
      >
        {reducedMotion ? "Still" : playing ? "Pause" : "Play"}
      </button>

      <label className="mg-transport__scrub-wrap">
        <span className="sr-only">Seek Crease motion</span>
        <input
          type="range"
          className="mg-transport__scrub"
          data-testid="motion-seek-scrub"
          min={0}
          max={1000}
          step={1}
          value={Math.round(progress * 1000)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={active ? `${active.label}, ${Math.round(progress * 100)} percent` : undefined}
          disabled={reducedMotion}
          onChange={(e) => onSeek(Number(e.target.value) / 1000)}
        />
      </label>

      <ol className="mg-transport__beats" aria-label="Motion beats">
        {beats.map((b, i) => (
          <li key={b.id}>
            <button
              type="button"
              className="mg-transport__beat"
              data-active={i === activeBeatIndex ? "true" : "false"}
              aria-current={i === activeBeatIndex ? "true" : undefined}
              disabled={reducedMotion}
              onClick={() => onSeek(b.t0)}
            >
              <span className="mg-transport__beat-id">{b.id}</span>
              <span className="mg-transport__beat-label">{b.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
