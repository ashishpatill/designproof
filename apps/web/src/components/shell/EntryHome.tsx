"use client";

import Link from "next/link";
import { ArrowRight, FileCode2, FolderKanban, Github, ImageIcon, Loader2, PenLine } from "lucide-react";
import { DesignControls } from "@/components/design-controls";
import { COMPOSER_STARTER_CHIPS } from "@/lib/composer-starters";
import type { DesignControlsValue } from "@/lib/design-controls-catalog";
import type { ComposerMode, RecentSession } from "@/lib/recent-sessions";
import { svgSessionThumb } from "@/lib/session-thumb";

// Never show third-party product brands as templates/chips under the composer
// (see composer-brand-denylist.ts). Starters must be Design Proof templates only.

const MODES: { id: ComposerMode; label: string; hint: string; icon: typeof PenLine }[] = [
  { id: "design", label: "Design brief", hint: "Start from taste alone", icon: PenLine },
  { id: "url", label: "Live URL", hint: "Capture a rendered page", icon: ImageIcon },
  { id: "github", label: "GitHub", hint: "Clone, run, capture", icon: Github },
  { id: "offline", label: "Offline fixture", hint: "Committed demo report", icon: FileCode2 },
];

/** The four beats the product is built around. */
const LOOP: { label: string; detail: string }[] = [
  { label: "Capture", detail: "Playwright reads the rendered page — not your repo." },
  { label: "Diagnose", detail: "Deterministic detectors name genericness tells and drift." },
  { label: "Direct", detail: "Say the change in plain English; it maps to tokens you can measure." },
  { label: "Prove", detail: "Draft a patch, apply it in a disposable checkout, recapture the route." },
];

export function EntryHome({
  mode,
  onModeChange,
  value,
  onChange,
  onSubmit,
  submitting,
  recent,
  onOpenRecent,
  showAllRecent,
  onToggleShowAll,
  designControls,
  onDesignControlsChange,
}: {
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  recent: RecentSession[];
  onOpenRecent: (session: RecentSession) => void;
  showAllRecent: boolean;
  onToggleShowAll: () => void;
  designControls: DesignControlsValue;
  onDesignControlsChange: (next: DesignControlsValue) => void;
}) {
  const placeholder =
    mode === "design"
      ? "Describe what you want to design — warmer editorial booking site, less shadow…"
      : mode === "github"
        ? "github.com/owner/repo — Design Proof clones it, finds the run command, and captures it"
        : mode === "offline"
          ? "The committed fixture report loads with no URL and no network"
          : "https://your-app.com  ·  or  localhost:3001";

  const submitLabel =
    mode === "design"
      ? "Start brief"
      : mode === "github"
        ? "Set up & run"
        : mode === "offline"
          ? "Open fixture"
          : "Capture";

  const visible = showAllRecent ? recent : recent.slice(0, 8);

  return (
    <div className="dp-home">
      <div className="dp-home__grid">
        <div className="dp-home__primary">
          <div className="dp-home__hero">
            <p className="dp-eyebrow">Rendered-UI design review</p>
            <h1 className="dp-home__title">What do you want to design?</h1>
            <p className="dp-home__sub">
              Point Design Proof at a running page, or describe the taste you want. Either way you get named
              tells, a measurable direction, and a patch you can prove before it ships.
            </p>
          </div>

          <form
            className="dp-composer"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className="dp-composer__modes" role="tablist" aria-label="Composer mode">
              {MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === m.id}
                    className="dp-composer__mode"
                    data-active={mode === m.id ? "true" : "false"}
                    title={m.hint}
                    onClick={() => onModeChange(m.id)}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {m.label}
                  </button>
                );
              })}
            </div>

            <textarea
              className="dp-composer__input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={4}
              aria-label={mode === "design" ? "Design brief" : "Capture target"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />

            {mode === "design" ? (
              <DesignControls
                layout="compact"
                value={designControls}
                onChange={onDesignControlsChange}
              />
            ) : null}

            <div className="dp-composer__footer">
              <p className="dp-composer__hint">
                {mode === "offline"
                  ? "No URL needed — submit to open the committed fixture session."
                  : mode === "github"
                    ? "Clones into a disposable checkout. Your repository is never modified."
                    : "⌘/Ctrl + Enter to run"}
              </p>
              <button type="submit" className="dp-composer__submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {submitting ? "Working…" : submitLabel}
                {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
              </button>
            </div>
          </form>

          {COMPOSER_STARTER_CHIPS.length > 0 && mode === "design" ? (
            <div className="dp-starters" role="group" aria-label="Starter templates">
              {COMPOSER_STARTER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className="dp-starter"
                  onClick={() => onChange(chip.brief ?? chip.label)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="dp-home__aside">
          <ol className="dp-loop" aria-label="How Design Proof works">
            {LOOP.map((step, index) => (
              <li key={step.label} className="dp-loop__step">
                <span className="dp-loop__num" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="dp-loop__label">{step.label}</span>
                <p className="dp-loop__detail">{step.detail}</p>
              </li>
            ))}
          </ol>
          <p className="dp-home__aside-note">
            Capture, detection and reconciliation are deterministic. Nothing is written to your files — you
            approve every patch.
          </p>
        </aside>
      </div>

      <section className="dp-recent" aria-label="Recent sessions">
        <div className="dp-recent__head">
          <h2 className="dp-recent__title">Recent sessions</h2>
          {recent.length > 8 ? (
            <button type="button" className="dp-ghost-btn" onClick={onToggleShowAll}>
              {showAllRecent ? "Show fewer" : `View all ${recent.length}`}
            </button>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <div className="dp-empty">
            <div>
              <p>
                Nothing here yet. Your captures, briefs and template runs collect on this shelf — local to
                this browser.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button type="button" className="dp-btn dp-btn--quiet" onClick={() => onModeChange("url")}>
                  <ImageIcon className="h-4 w-4" aria-hidden /> Capture a live URL
                </button>
                <button type="button" className="dp-btn dp-btn--quiet" onClick={() => onModeChange("offline")}>
                  <FileCode2 className="h-4 w-4" aria-hidden /> Open the offline fixture
                </button>
                <Link className="dp-btn dp-btn--quiet" href="/showcase">
                  <FolderKanban className="h-4 w-4" aria-hidden /> Browse templates
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="dp-recent__grid">
            {visible.map((session) => {
              const thumb =
                session.thumbDataUrl ||
                svgSessionThumb({
                  title: session.title,
                  findingCount: session.findingCount,
                  live: session.live,
                  accent: session.mode === "offline" ? "#8A7A68" : "#D4714A",
                });
              return (
                <button
                  key={session.id}
                  type="button"
                  className="dp-recent__card"
                  onClick={() => onOpenRecent(session)}
                >
                  <span className="dp-recent__thumb" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt="" className="dp-recent__thumb-img" />
                  </span>
                  <span className="dp-recent__foot">
                    <span className="dp-recent__name">{session.title}</span>
                    <span className="dp-recent__meta">
                      {session.mode}
                      {typeof session.findingCount === "number" ? ` · ${session.findingCount}` : ""}
                      {session.live === true ? " · live" : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
