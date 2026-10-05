"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DesignFromFeaturesResponse,
  templateToStudioPreset,
  type AestheticLean,
  type ColorMood,
  type Density,
  type DesignSpec,
  type MotionLevel,
  type RoundingDepth,
  type SiteKind,
  type TypeWeight,
} from "@designproof/design-skills";
import { DesignControls } from "@/components/design-controls";
import { ProductShell } from "@/components/shell";
import {
  DEFAULT_DESIGN_CONTROLS,
  accentHex,
  designControlsToBriefFields,
  parseDesignControls,
  type DesignControlsValue,
} from "@/lib/design-controls-catalog";

type DesignResponse = DesignFromFeaturesResponse & { error?: string };
type GenerateMode = "create" | "redesign";
type ViewportWidth = "390" | "768" | "1280";

/** Default brief only — template gallery lives on Showcase, not Studio. */
const DEFAULT_BRIEF = templateToStudioPreset("saas");

function controlsFromStudioPreset(): DesignControlsValue {
  return {
    ...DEFAULT_DESIGN_CONTROLS,
    siteKind: DEFAULT_BRIEF.siteKind,
    businessGoal: DEFAULT_BRIEF.businessGoal,
    aestheticLean: DEFAULT_BRIEF.aestheticLean,
    motion: DEFAULT_BRIEF.motion,
    density: DEFAULT_BRIEF.density,
    colorMood: DEFAULT_BRIEF.colorMood,
    typographyWeight: DEFAULT_BRIEF.typographyWeight,
    roundingDepth: DEFAULT_BRIEF.roundingDepth,
  };
}

function parseFeatures(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/\s+[—–-]\s+/).map((s) => s.trim());
      const name = parts[0] || `Feature ${index + 1}`;
      const description = parts.slice(1).join(" — ");
      return {
        id: `feat-${index}`,
        name,
        description,
        priority: index < 2 ? ("p0" as const) : ("p1" as const),
      };
    });
}

export default function StudioPage() {
  const [productName, setProductName] = useState(DEFAULT_BRIEF.productName);
  const [tagline, setTagline] = useState(DEFAULT_BRIEF.tagline);
  const [audience, setAudience] = useState(DEFAULT_BRIEF.audience);
  const [lockSiteKind, setLockSiteKind] = useState(true);
  const [featuresText, setFeaturesText] = useState(DEFAULT_BRIEF.featuresText);
  const [controls, setControls] = useState<DesignControlsValue>(controlsFromStudioPreset);
  const [magic, setMagic] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DesignResponse | null>(null);
  const [generation, setGeneration] = useState(0);
  const [viewport, setViewport] = useState<ViewportWidth>("1280");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const lastSpecRef = useRef<DesignSpec | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const briefBootstrapped = useRef(false);

  useEffect(() => {
    if (briefBootstrapped.current || typeof window === "undefined") return;
    briefBootstrapped.current = true;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("brief")?.trim();
    if (fromQuery) {
      setMagic(fromQuery);
      setTagline(fromQuery.slice(0, 120));
    }
    setControls(parseDesignControls(params, controlsFromStudioPreset()));
  }, []);

  const brief = useMemo(() => {
    const fields = designControlsToBriefFields(controls);
    return {
      productName,
      tagline,
      audience,
      businessGoal: fields.businessGoal,
      siteKind: fields.siteKind,
      lockSiteKind,
      brandAccent: fields.brandAccent,
      craftNodes: fields.craftNodes,
      features: parseFeatures(featuresText),
      taste: fields.taste,
    };
  }, [productName, tagline, audience, lockSiteKind, featuresText, controls]);

  const generateWith = useCallback(async (nextBrief: typeof brief, mode: GenerateMode = "create") => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const redesignFrom = mode === "redesign" ? lastSpecRef.current ?? undefined : undefined;
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: nextBrief, redesignFrom }),
        signal: controller.signal,
      });
      const raw = await res.json();
      if (requestId !== requestIdRef.current) return;
      if (!res.ok) throw new Error((raw as DesignResponse).error || "Design failed");
      const data = DesignFromFeaturesResponse.parse(raw);
      lastSpecRef.current = data.spec;
      setResult(data);
      setGeneration((g) => g + 1);
    } catch (e) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Design failed");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    await generateWith(brief, lastSpecRef.current ? "redesign" : "create");
  }, [brief, generateWith]);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) void generateWith(brief, "create");
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(start, { timeout: 500 });
    } else {
      timeoutId = setTimeout(start, 50);
    }
    return () => {
      cancelled = true;
      if (idleId != null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyHtml() {
    if (!result?.previewHtml) return;
    try {
      await navigator.clipboard.writeText(result.previewHtml);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  function applyMagic() {
    const text = magic.toLowerCase();
    let next: DesignControlsValue = { ...controls };

    if (/minimal|clean|quiet|sparse/.test(text)) {
      next = { ...next, aestheticLean: "minimal-clean", density: "sparse", motion: "none" };
    }
    if (/conversion|cta|saas|sharp/.test(text)) {
      next = { ...next, aestheticLean: "conversion-sharp", motion: "subtle-micro" };
      if (/\b(fintech|treasury|payments?|banking|wire|payroll)\b/.test(text)) next.siteKind = "fintech-marketing";
      if (/saas/.test(text)) next.siteKind = "saas-marketing";
    }
    if (/system|token|crafted/.test(text)) next = { ...next, aestheticLean: "system-crafted" };
    if (/studio|portfolio|art.?direct|selected work|atelier/.test(text)) {
      next = { ...next, siteKind: "art-directed-studio", aestheticLean: "refined-story", density: "sparse" };
    }
    if (/consumer|everyday|lifestyle|shopper|retail|dtc/.test(text)) {
      next = { ...next, siteKind: "consumer-craft", aestheticLean: "conversion-sharp", density: "balanced" };
    }
    if (/foundry|typeface|template|optical|glyph|typography/.test(text)) {
      next = { ...next, siteKind: "editorial-foundry", aestheticLean: "refined-story", density: "sparse" };
    }
    if (/dossier|briefing|folio|capital brief|research desk|imprint|memo/.test(text)) {
      next = { ...next, siteKind: "research-dossier", aestheticLean: "refined-story", density: "sparse" };
    }
    if (/observatory|telemetry|signal desk|channel lattice|on.?call|sre desk|incident/.test(text)) {
      next = { ...next, siteKind: "signal-observatory", aestheticLean: "refined-story", density: "balanced" };
    }
    if (/archive|alphabetical|stamp roll|registry|alpha.?rail|index ledger|entry folio/.test(text)) {
      next = { ...next, siteKind: "archive-index", aestheticLean: "refined-story", density: "sparse" };
    }
    if (/care pathway|clinic|rounds|roundspool|health pathway/.test(text)) {
      next = {
        ...next,
        siteKind: "care-pathway",
        aestheticLean: "refined-story",
        density: "sparse",
        businessGoal: "trust",
      };
    }
    if (/agent.?harness|turn tape|tool permit|steer pin|tiller|coding agent|harness engineer|local session/.test(text)) {
      next = {
        ...next,
        siteKind: "agent-harness",
        aestheticLean: "system-crafted",
        density: "information-rich",
        businessGoal: "trust",
      };
    }
    if (/story|editorial|refined|corporate/.test(text)) {
      next = { ...next, aestheticLean: "refined-story", density: "sparse" };
      if (/corporate/.test(text)) next.siteKind = "corporate-story";
    }
    if (/dashboard|workspace|console/.test(text)) {
      next = {
        ...next,
        siteKind: "dashboard-webapp",
        aestheticLean: "minimal-clean",
        motion: "none",
        density: "information-rich",
      };
    }
    if (/docs|educational|textbook|chapter/.test(text)) {
      next = { ...next, siteKind: "docs-educational", aestheticLean: "refined-story", density: "sparse" };
    }
    if (/dark/.test(text)) next = { ...next, colorMood: "dark-premium" };
    if (/no motion|without animation|static/.test(text)) next = { ...next, motion: "none" };
    if (/scroll reveal/.test(text)) next = { ...next, motion: "light-scroll-reveals" };
    if (/scroll narrative|pinned chapter|story scroll/.test(text)) next = { ...next, motion: "scroll-narrative" };
    if (/immersive|webgl|shader hero/.test(text)) next = { ...next, motion: "immersive" };

    setControls(next);
    setLockSiteKind(true);

    const fields = designControlsToBriefFields(next);
    void generateWith({
      ...brief,
      siteKind: fields.siteKind,
      lockSiteKind: true,
      businessGoal: fields.businessGoal,
      brandAccent: fields.brandAccent,
      craftNodes: fields.craftNodes,
      taste: fields.taste,
    });
  }

  const featureCount = parseFeatures(featuresText).length;

  return (
    <ProductShell active="studio">
      <div className="dp-studio" data-testid="studio-page">
        <header className="dp-studio__head">
          <div>
            <p className="dp-eyebrow">Design Proof Studio</p>
            <h1 className="dp-studio__title">Premium content-custom design</h1>
          </div>
          <p className="dp-studio__lede">
            Set the product story and the taste. Templates live in the gallery — Studio builds from your brief
            and keeps the preview in view while you tune.
          </p>
        </header>

        <div className="dp-studio__grid">
          <aside className="dp-studio__controls" data-testid="studio-controls">
            <section className="dp-panel">
              <div className="dp-panel__head">
                <p className="dp-panel__title">Product</p>
              </div>
              <div className="dp-panel__body space-y-3">
                <label className="dp-form-field text-sm">
                  <span className="dp-form-field__label">Product name</span>
                  <input
                    className="w-full rounded border border-border bg-bg px-3 py-2 text-text outline-none focus-visible:border-accent"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    data-testid="input-product"
                  />
                </label>
                <label className="dp-form-field text-sm">
                  <span className="dp-form-field__label">Tagline</span>
                  <input
                    className="w-full rounded border border-border bg-bg px-3 py-2 text-text outline-none focus-visible:border-accent"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    data-testid="input-tagline"
                  />
                </label>
                <label className="dp-form-field text-sm">
                  <span className="dp-form-field__label">Audience</span>
                  <input
                    className="w-full rounded border border-border bg-bg px-3 py-2 text-text outline-none focus-visible:border-accent"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    data-testid="input-audience"
                  />
                </label>
              </div>
            </section>

            <section className="dp-panel">
              <div className="dp-panel__head">
                <p className="dp-panel__title">What it does</p>
                <span className="font-mono text-meta text-muted">
                  {featureCount} feature{featureCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="dp-panel__body space-y-3">
                <label className="flex items-center gap-2 text-sm text-secondary">
                  <input
                    type="checkbox"
                    checked={lockSiteKind}
                    onChange={(e) => setLockSiteKind(e.target.checked)}
                    data-testid="input-lock-sitekind"
                  />
                  Lock site kind (disable auto-detect)
                </label>
                <label className="dp-form-field text-sm">
                  <span className="dp-form-field__label">One per line — Name — description</span>
                  <textarea
                    className="min-h-[140px] w-full rounded border border-border bg-bg px-3 py-2 font-mono text-xs text-text outline-none focus-visible:border-accent"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    data-testid="input-features"
                  />
                </label>
              </div>
            </section>

            <section className="dp-panel">
              <div className="dp-panel__head">
                <p className="dp-panel__title">Taste controls</p>
                <span className="font-mono text-meta text-muted">
                  accent {accentHex(controls.accentToken)} · {controls.fidelity}
                </span>
              </div>
              <div className="dp-panel__body space-y-3">
                <DesignControls layout="sidebar" value={controls} onChange={setControls} />
                {/* Hidden native selects keep existing e2e/testids stable */}
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.siteKind}
                  onChange={(e) => setControls((c) => ({ ...c, siteKind: e.target.value as SiteKind }))}
                  data-testid="input-sitekind"
                >
                  {SURFACE_OPTIONS_FULL_VALUES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.businessGoal}
                  onChange={(e) =>
                    setControls((c) => ({
                      ...c,
                      businessGoal: e.target.value as DesignControlsValue["businessGoal"],
                    }))
                  }
                  data-testid="input-goal"
                >
                  {["demos", "leads", "trust", "sales", "activation"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.density}
                  data-testid="taste-density"
                  onChange={(e) => setControls((c) => ({ ...c, density: e.target.value as Density }))}
                >
                  {["sparse", "balanced", "information-rich"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.motion}
                  data-testid="taste-motion"
                  onChange={(e) => setControls((c) => ({ ...c, motion: e.target.value as MotionLevel }))}
                >
                  {["none", "subtle-micro", "light-scroll-reveals", "scroll-narrative", "immersive"].map(
                    (o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ),
                  )}
                </select>
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.aestheticLean}
                  data-testid="taste-lean"
                  onChange={(e) =>
                    setControls((c) => ({ ...c, aestheticLean: e.target.value as AestheticLean }))
                  }
                >
                  {["minimal-clean", "conversion-sharp", "system-crafted", "refined-story"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.colorMood}
                  data-testid="taste-color"
                  onChange={(e) => setControls((c) => ({ ...c, colorMood: e.target.value as ColorMood }))}
                >
                  {["neutral-professional", "soft-brand-accent", "dark-premium", "light-airy"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.typographyWeight}
                  data-testid="taste-type"
                  onChange={(e) =>
                    setControls((c) => ({ ...c, typographyWeight: e.target.value as TypeWeight }))
                  }
                >
                  {["light-elegant", "medium-modern", "bold-confident"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <select
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  value={controls.roundingDepth}
                  data-testid="taste-rounding"
                  onChange={(e) =>
                    setControls((c) => ({ ...c, roundingDepth: e.target.value as RoundingDepth }))
                  }
                >
                  {["sharp", "soft", "soft-elevation"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="dp-panel">
              <div className="dp-panel__head">
                <p className="dp-panel__title">Magic edit</p>
              </div>
              <div className="dp-panel__body space-y-3">
                <label className="dp-form-field text-sm">
                  <span className="dp-form-field__label">Plain English</span>
                  <textarea
                    className="min-h-[72px] w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus-visible:border-accent"
                    placeholder="e.g. redesign as dashboard, minimal-clean, no motion"
                    value={magic}
                    onChange={(e) => setMagic(e.target.value)}
                    data-testid="input-magic"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="dp-btn dp-btn--primary"
                    onClick={() => void generate()}
                    disabled={loading}
                    data-testid="btn-generate"
                  >
                    {loading ? "Generating…" : generation === 0 ? "Generate from scratch" : "Redesign from features"}
                  </button>
                  <button
                    type="button"
                    className="dp-btn dp-btn--quiet"
                    onClick={applyMagic}
                    disabled={loading}
                    data-testid="btn-magic"
                  >
                    Apply magic edit
                  </button>
                  <button
                    type="button"
                    className="dp-btn dp-btn--quiet"
                    onClick={() => void copyHtml()}
                    disabled={!result?.previewHtml || loading}
                    data-testid="btn-copy-html"
                  >
                    {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy HTML"}
                  </button>
                </div>
                {error ? (
                  <p className="text-sm text-drift" data-testid="studio-error">
                    {error}
                  </p>
                ) : null}
              </div>
            </section>

            {result?.spec ? (
              <details className="dp-panel">
                <summary className="dp-panel__head cursor-pointer list-none">
                  <span className="dp-panel__title">Engine detail</span>
                  <span className="font-mono text-meta text-muted">generation {generation}</span>
                </summary>
                <div className="dp-panel__body space-y-2 text-xs text-secondary" data-testid="studio-meta">
                  <p data-testid="meta-summary">
                    <strong className="text-text">Summary:</strong> {result.spec.summary}
                  </p>
                  <p data-testid="meta-sitekind">
                    <strong className="text-text">Site kind:</strong> {result.spec.brief.siteKind}
                  </p>
                  <p data-testid="meta-skills">
                    <strong className="text-text">Routed skills:</strong> {result.spec.routedSkills.join(", ")}
                  </p>
                  <p data-testid="meta-sections">
                    <strong className="text-text">Sections:</strong>{" "}
                    {result.spec.sections.map((s) => s.kind).join(", ")}
                  </p>
                  <p data-testid="meta-direction">
                    <strong className="text-text">Design Proof direction:</strong> {result.spec.dpDirectionId}
                  </p>
                  <p data-testid="meta-generation">
                    <strong className="text-text">Generation:</strong> {generation}
                  </p>
                  <ul className="list-disc pl-4" data-testid="meta-hints">
                    {result.spec.customizationHints.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ) : null}
          </aside>

          <section className="dp-studio__preview" data-testid="studio-canvas">
            <div className="dp-studio__preview-bar" data-testid="viewport-bar">
              <p className="dp-panel__title">Preview</p>
              <div className="dp-segmented">
                {(
                  [
                    ["390", "Mobile"],
                    ["768", "Tablet"],
                    ["1280", "Desktop"],
                  ] as const
                ).map(([w, label]) => (
                  <button
                    key={w}
                    type="button"
                    data-active={viewport === w ? "true" : "false"}
                    aria-pressed={viewport === w}
                    onClick={() => setViewport(w)}
                    data-testid={`viewport-${label.toLowerCase()}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`dp-studio__frame-wrap${result?.previewHtml && !(loading && !result) ? "" : " dp-studio__frame-wrap--center"}`}
              data-testid="preview-frame-wrap"
            >
              {loading && !result ? (
                <div className="dp-skeleton" aria-busy="true" aria-label="Generating preview" />
              ) : result?.previewHtml ? (
                <iframe
                  title="Design preview"
                  className="dp-studio__frame"
                  style={{ maxWidth: `${viewport}px` }}
                  srcDoc={result.previewHtml}
                  data-testid="preview-frame"
                />
              ) : (
                <p className="text-sm text-secondary">Set a brief, then generate to see the design here.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </ProductShell>
  );
}

const SURFACE_OPTIONS_FULL_VALUES: SiteKind[] = [
  "saas-marketing",
  "dashboard-webapp",
  "corporate-story",
  "docs-educational",
  "fintech-marketing",
  "art-directed-studio",
  "consumer-craft",
  "editorial-foundry",
  "research-dossier",
  "signal-observatory",
  "archive-index",
  "commerce-loom",
  "field-guide",
  "press-atelier",
  "lantern-path",
  "care-pathway",
  "agent-harness",
];
