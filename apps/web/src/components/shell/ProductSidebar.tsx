"use client";

import Link from "next/link";
import { FolderKanban, Home, Settings, Sparkles, Maximize2, Minimize2, X } from "lucide-react";
import type { WorkspaceTab } from "./WorkspaceTabsBar";

export type ProductNavId = "home" | "showcase" | "studio";

/**
 * Single app chrome: left sidebar only.
 * Features: Diagnose (home), Showcase, Studio.
 * Templates / templates are not listed here — they live on /showcase.
 */
export function ProductSidebar({
  active,
  onHome,
  onSettings,
  sessions,
  activeSessionId,
  onSelectSession,
  onCloseSession,
  focusCanvas,
  onToggleFocus,
}: {
  active: ProductNavId;
  onHome?: () => void;
  onSettings: () => void;
  sessions?: WorkspaceTab[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onCloseSession?: (id: string) => void;
  focusCanvas?: boolean;
  onToggleFocus?: () => void;
}) {
  return (
    <nav className="dp-rail" aria-label="Design Proof app" data-testid="product-sidebar">
      <Link
        href="/"
        className="dp-rail__brand"
        aria-label="Design Proof home"
        onClick={onHome}
      >
        <span className="dp-rail__mark" aria-hidden>
          ⊕
        </span>
        <span className="dp-rail__brand-text">
          <span className="dp-rail__brand-name">Design Proof</span>
          <span className="dp-rail__brand-meta">Proof</span>
        </span>
      </Link>

      <div className="dp-rail__section" aria-label="Features">
        <Link
          href="/"
          className="dp-rail__link"
          data-active={active === "home" ? "true" : "false"}
          aria-current={active === "home" ? "page" : undefined}
          onClick={onHome}
        >
          <Home className="dp-rail__icon" aria-hidden />
          <span className="dp-rail__label">Home</span>
        </Link>
        <Link
          href="/showcase"
          className="dp-rail__link"
          data-active={active === "showcase" ? "true" : "false"}
          aria-current={active === "showcase" ? "page" : undefined}
        >
          <FolderKanban className="dp-rail__icon" aria-hidden />
          <span className="dp-rail__label">Showcase</span>
        </Link>
        <Link
          href="/studio"
          className="dp-rail__link"
          data-active={active === "studio" ? "true" : "false"}
          aria-current={active === "studio" ? "page" : undefined}
        >
          <Sparkles className="dp-rail__icon" aria-hidden />
          <span className="dp-rail__label">Studio</span>
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="dp-rail__sessions" aria-label="Open sessions">
          <p className="dp-rail__section-label">Sessions</p>
          <ul className="dp-rail__session-list">
            {sessions.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  className="dp-rail__session"
                  data-active={activeSessionId === tab.id ? "true" : "false"}
                  aria-current={activeSessionId === tab.id ? "true" : undefined}
                  title={tab.title}
                  onClick={() => onSelectSession?.(tab.id)}
                >
                  <span className="dp-rail__session-title">{tab.title}</span>
                  {!tab.pinned ? (
                    <span
                      role="button"
                      tabIndex={0}
                      className="dp-rail__session-close"
                      aria-label={`Close ${tab.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseSession?.(tab.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          onCloseSession?.(tab.id);
                        }
                      }}
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="dp-rail__spacer" />

      <div className="dp-rail__footer">
        {onToggleFocus ? (
          <button
            type="button"
            className="dp-rail__link"
            aria-label={focusCanvas ? "Show critic pane" : "Focus canvas"}
            onClick={onToggleFocus}
          >
            {focusCanvas ? (
              <Minimize2 className="dp-rail__icon" aria-hidden />
            ) : (
              <Maximize2 className="dp-rail__icon" aria-hidden />
            )}
            <span className="dp-rail__label">{focusCanvas ? "Split view" : "Focus canvas"}</span>
          </button>
        ) : null}
        <button
          type="button"
          className="dp-rail__link"
          aria-label="Settings and keys"
          onClick={onSettings}
        >
          <Settings className="dp-rail__icon" aria-hidden />
          <span className="dp-rail__label">Settings</span>
        </button>
      </div>
    </nav>
  );
}
