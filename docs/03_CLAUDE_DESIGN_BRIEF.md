# Design Proof — Claude Design Brief

> Use this in **Claude Design** to produce the hi-fi screens, the clickable capture → diagnose →
> art-direct → fix prototype, and the demo-facing landing/demo one-pager. It inherits every token
> from `01_DESIGN_SYSTEM.md` — treat that file as law and this file as the art direction on top of
> it. Where this brief and the design system disagree, the design system wins.

---

## 1. What Claude Design should produce

1. **Design Proof Report** (hero screen, the money shot) — four states: pre-capture (empty), capturing
   (loading), results (findings + seam), voice-active (direction applied).
2. **Finding Inspector** — DesignProofCard / DriftCard taste explanation panel.
3. **Before/After Seam** — the draggable reveal (can be embedded in #1 or standalone frame).
4. **Reconciliation / Diff** — the proposed redesign patch, including measurable contrast/token changes.
5. **Voice Director** — mic + presets + active direction tag + parsed action items.
6. **Landing / demo one-pager** — for viewers: thesis, problem, live demo, dogfood proof, tech, team.
7. A **clickable prototype** stitching 1 → 2 → 4 with a seam drag moment.

Deliverable format: hi-fi frames + a prototype flow. Keep components consistent so they map 1:1
to the React components in `apps/web`.

---

## 2. Art direction recap (do this, not the defaults)

- **Print atelier.** Warm paper-ink field (`--bg #181614`), not pure black or cool SaaS slate. A
  tri-tone type system: Instrument Serif (display), Source Sans 3 (UI), IBM Plex Mono (data).
- **Signature = the reveal seam.** A diagonal or vertical wipe dividing BEFORE (bland capture) from
  AFTER (Design Proof's proposed direction), with registration/crop marks at the corners. Put it in the hero
  demo and the landing. This is the one memorable thing — spend boldness here.
- **Accent = terracotta `#D4714A`.** Warm, editorial, human — not violet, not acid green.
- **Verdict legend:** generic=terra, drift=ochre `#C4A035`, intentional=ink `#3A6358`, uncertain=
  paper-500. Always pair hue with glyph + shape.
- **Avoid:** Inter-only typography; violet→pink gradient hero; shadow on every card; centered-everything
  layout; KPI stat-card dashboard; emoji UI chrome. If a frame could belong to any AI-built SaaS,
  redo it — and remember Design Proof would flag it.

---

## 3. Screen specs

### 3.1 Design Proof Report — RESULTS (hero)

**Layout**
```
┌─────────────────────────────────────────────────────────────────┐
│ CaptureBar:  [⊕ Design Proof]  https://…/generic-app    [Capture] ● MCP  [🎤] │
├─────────────────────────────────────────────────────────────────┤
│  SCORE LINE (mono eyebrow):  8 findings · 5 generic · 2 drift · 1 intentional │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              BEFORE  │  AFTER                                   │
│         [captured screenshot]  [proposed direction overlay]     │
│              ←—— seam handle ——→                                 │
│         registration marks at corners                           │
│                                                                 │
├──────────────────────────────┬──────────────────────────────────┤
│ FINDINGS LIST                │  INSPECTOR (docked)              │
│ ▸ SystemFontTell    GENERIC  │  DesignProofCard when selected          │
│ ▸ GradientCrutch…   GENERIC  │                                  │
│ ▸ GrayMushTell      GENERIC  │                                  │
│ ▸ FocusRing…        DRIFT    │                                  │
│ ▸ …                          │                                  │
├──────────────────────────────┴──────────────────────────────────┤
│ VoiceDirector:  [🎤]  "Warmer, more editorial…"   [Editorial][Precision]… │
└─────────────────────────────────────────────────────────────────┘
```

- The seam is the visual hero — large, immersive, draggable. Not a small thumbnail comparison.
- Findings list is a **text-forward editorial column**, not a chart grid. Group by verdict type.
- The generic-app "before" screenshot should visibly scream AI-default: Inter, violet gradient,
  shadow cards, centered copy, emoji nav.
- The "after" side shows warm paper tones, Instrument Serif headlines, restrained shadow, asymmetric
  layout, and readable foreground/background pairings. Do not show an after-state where text becomes
  less legible than before.

**Content/copy:** eyebrow `RENDERED SURFACE`; score line in mono; finding ids in mono (`SystemFontTell`);
reconciliation summary should include a contrast floor such as `15.9:1 text · 4.6:1 controls` when live capture is available.

### 3.2 Design Proof Report — EMPTY (pre-capture)

Centered but not "AI-default centered-everything" — use asymmetric editorial layout. Left-weighted:
proof-mark glyph, `No capture yet.` (Instrument Serif, display-l), sub `Point Design Proof at a URL to read
its design surface.` (body, secondary), primary `Capture`. Faint crop marks in corners as decoration.
Calm invitation — not a mood board.

### 3.3 Design Proof Report — CAPTURING (loading)

Brief paper-white **capture flash** across the canvas; then skeleton blocks approximating the report
layout. Progress mono readout: `Launching headless browser…` → `reading computed styles…` →
`detecting tells…` → `Capture complete.` For GitHub setup, show a blocking setup panel:
`Cloning` → `Installing` → `Waiting for reachable URL` → `Running` → `Capturing`. Hide the stale
previous preview while setup/capture is active. Reduced-motion: static status label, no flash.

### 3.4 Design Proof Report — VOICE ACTIVE

Same as results but:
- VoiceDirector shows live transcript or active preset chip highlighted (terra wash).
- Active direction tag: `direction: editorial-warm` in mono.
- Parsed action items appear as small mono chips (`typography`, `color`, `depth`, etc.) so the user
  sees how the spoken instruction became design work.
- After side of seam visibly updates (warmer paper, serif headlines stronger).
- A subtle "Direction updated" toast bottom-right.

### 3.5 Finding Inspector (DesignProofCard)

```
┌─────────────────────────────┐
│ SystemFontTell    [● GENERIC]  ▓▓▓▓░ │  ← mono id · VerdictBadge · confidence
├─────────────────────────────┤
│ Rationale (≤3 sentences,    │
│ critic voice)               │
├─────────────────────────────┤
│ [screenshot crop with       │
│  proof-mark pin on Inter    │
│  font sample]               │
│ font-family: Inter, system… │  ← highlighted computed value
├─────────────────────────────┤
│ [Draft fix]  [Mark intentional]│
└─────────────────────────────┘
```

Sample rationale: *"Inter appears on every text role — headings, body, buttons, nav — with no display
face. This is the default AI type stack, not a considered choice."* Selected card raises with
signal glow.

### 3.6 DriftCard (example)

Same structure. Sample: *"Six background grays within ΔE 2 — #F3F4F6, #F4F4F5, #F5F5F4, #F2F2F2,
#F6F6F6, #EFEFEF — with no semantic distinction. Pick one surface token."* Evidence shows swatches
in a row with near-duplicate bracket.

### 3.7 Before/After Seam (standalone frame)

Full-bleed. Left label `BEFORE` (eyebrow, top-left); right label `AFTER` (eyebrow, top-right).
Seam handle: 4px terra bar, proof-mark icon, 44px hit area. Registration L-marks at all four
corners in `--border-proof`. Optional: faint crop lines around the capture like a print proof.

### 3.8 Reconciliation / Diff

Side-by-side toggle, IBM Plex Mono. Additions on ink wash (`+` gutter), removals on terra wash
(`−` gutter). Header: `globals.css` or `tailwind.config.ts` path (mono) + `Copy patch` /
`Apply in Cursor`. Above or beside the diff, show a short token table: typeface, contrast floor,
accent, radius, depth, focus ring. Below diff: mini seam preview showing the fix effect. CTA naming
consistent: `Draft fix` → `Apply in Cursor` → toast `Fix ready in Cursor`.

### 3.9 Voice Director (standalone frame)

Horizontal strip, `e1`. Left: circular mic button (terra when listening, pulsing ring). Center:
transcript text or placeholder. Right: four preset chips. Below the transcript, show parsed action
items when present. Show idle, listening, unsupported, and refining states.

### 3.10 Report summary (artifact, not dashboard)

Single-column printable report. Top: score line. Then findings grouped by verdict with mono id +
one-line rationale each. Footer: `Design Proof · captured generic-app · 8 findings`. No KPI cards, no pie
charts. A report you'd paste in a PR comment.

### 3.11 Landing / demo one-pager (for viewers)

Single scroll. Sections in order:
1. **Hero thesis** — the reveal seam animating across the wordmark. Headline (Instrument Serif):
   *"Every AI-built UI has a tell."* Sub: one line on what Design Proof does. Primary CTA `Watch the
   capture`.
2. **The problem** — three quiet cards: AI makes shipping fast / everything looks the same / taste is
   the missing layer. No gradient hero, no emoji.
3. **Live demo** — embedded seam drag from generic-app before/after. End on the intentional vs
   generic verdict contrast.
4. **Dogfood proof** — "Design Proof runs on itself: 0 tells." Show Design Proof's own editorial UI (this design
   system). Credibility beat.
5. **How** — compact pipeline: capture → fingerprint → detect → reason → art-direct → reconcile;
   MCP badge "runs in Cursor."
6. **Tech + team** — stack chips (Next.js, Playwright, TypeScript, Tailwind, Gemini, MCP), team,
   repo link.

Motion budget: one orchestrated hero moment (seam wipe on load), scroll reveals subtle, hover on
cards only. Nothing that screams AI-generated.

---

## 4. Motion moments to prototype

- **Seam wipe** — drag reveals before/after; slight parallax on layers (`deliberate`, `ease-standard`).
- **Capture flash** — paper-white overlay 200ms on capture start (`fast`).
- **Proof mark pulse** — evidence pin scales 1→1.08→1 when finding selected (`slow`, `ease-out`).
- **Verdict reveal** — DesignProofCard slides up 8px + fades in on selection (`base`).
- **Voice listen** — mic button terra ring pulse (opacity only, 1.2s loop).

All respect `prefers-reduced-motion` (seam jumps, opacity-only, ≤120ms).

---

## 5. Do / don't

**Do:** warm paper-ink palette; tri-tone typography; the reveal seam as hero; registration/crop
marks; dual-encode verdicts (hue + glyph + shape); design empty, loading, and error states for
every screen; mono for URLs, computed values, diffs, and finding ids; asymmetric editorial layout.

**Don't:** Inter-only; violet gradient; shadow on every card; centered-everything; KPI dashboard;
emoji in UI chrome; pure-black background; color-only verdict encoding; generic B2B SaaS template
aesthetic.

---

## 6. Ready-to-paste prompts for Claude Design

Paste these one at a time; they assume the tokens from `01_DESIGN_SYSTEM.md` are in context.

**Prompt A — Design Proof Report (results)**
> Design a full-screen dark editorial developer tool called Design Proof. Aesthetic: "print atelier" —
> background `#181614` warm paper-ink, surfaces `#221F1C` / `#2E2A26`, accent terracotta
> `#D4714A`, intentional/pass ink `#3A6358`. Fonts: Instrument Serif (display headlines), Source
> Sans 3 (UI), IBM Plex Mono (data/URLs/finding ids). Top CaptureBar with proof-mark glyph +
> `Design Proof` wordmark, URL input in mono, `Capture` button, MCP status pill, mic toggle. Below: mono
> score line `8 findings · 5 generic · 2 drift · 1 intentional`. Center hero: a large before/after
> seam — left side shows a bland AI-generated SaaS screenshot (Inter font, violet gradient hero,
> shadow cards, centered text, emoji nav); right side shows the same layout transformed with warm
> paper tones, serif headlines, restrained shadow, asymmetric layout. Draggable seam handle with
> registration crop marks at corners. Below: two-column — left an editorial findings list grouped
> by verdict (GENERIC/DRIFT/INTENTIONAL badges with distinct glyphs); right a docked Inspector with
> a DesignProofCard for SystemFontTell showing rationale, screenshot evidence with proof-mark pin, and
> Draft fix / Mark intentional buttons. Bottom: VoiceDirector strip with mic, transcript placeholder,
> preset chips (Editorial, Precision instrument, Warm minimal, Bold contrast). No KPI stat cards.

**Prompt B — Finding Inspector (DesignProofCard)**
> Design the Inspector DesignProofCard for Design Proof (same print-atelier system). Header: finding id
> `SystemFontTell` in mono, GENERIC verdict badge (terra, eye glyph, filled circle), 5-segment
> confidence bar. Body: ≤3-sentence rationale in secondary text, critic voice. Evidence: screenshot
> crop with proof-mark pin on the Inter font rendering; below, highlighted computed value
> `font-family: Inter, system-ui, sans-serif` in mono. Footer: primary `Draft fix`, secondary
> `Mark intentional`. Selected state: subtle terracotta signal glow. Warm dark editorial aesthetic.

**Prompt C — Before/After Seam (standalone)**
> Design a full-bleed before/after comparison component for Design Proof. Left: captured screenshot of a
> generic AI-built landing page (Inter, violet gradient, shadow cards). Right: the same page
> transformed with editorial warm design (Instrument Serif headlines, terracotta accent, paper
> tones). Vertical draggable seam with 4px terracotta handle and proof-mark icon. Registration
> crop marks (L-shapes) at all four corners. BEFORE / AFTER labels in uppercase mono eyebrows.
> Print-atelier aesthetic, warm dark surround.

**Prompt D — Reconciliation / Diff**
> Design a diff/reconciliation view for Design Proof. Side-by-side unified diff in IBM Plex Mono;
> additions on ink-green wash with `+` gutter, removals on terracotta wash with `−` gutter. Header
> shows `globals.css` in mono and actions `Copy patch` and `Apply in Cursor`. Below: mini before/after
> seam preview. Print-atelier dark aesthetic, tokens as specified.

**Prompt E — Voice Director**
> Design a VoiceDirector strip for Design Proof. Horizontal bar on warm dark surface. Left: circular mic
> button with terracotta pulsing ring (listening state). Center: transcript "Warmer, more editorial,
> less shadow" or placeholder "Describe the direction…". Right: preset chips — Editorial, Precision
> instrument, Warm minimal, Bold contrast — one chip active with terracotta wash. Active direction
> tag below: `direction: editorial-warm` in mono. Print-atelier aesthetic.

**Prompt F — Landing / demo one-pager**
> Design a single-scroll landing page for Design Proof, an AI taste critic that finds what makes rendered
> UI look AI-generated and proposes a distinctive redesign. Print-atelier aesthetic: warm paper-ink
> dark bg, Instrument Serif headlines, terracotta accent, reveal seam motif. Sections: (1) hero —
> seam wipe animating across wordmark, headline "Every AI-built UI has a tell.", `Watch the capture`
> CTA; (2) three quiet problem cards (fast to ship / all looks the same / taste is missing); (3)
> embedded demo seam showing generic before → editorial after; (4) dogfood — "Design Proof runs on itself:
> 0 tells" showing Design Proof's own distinctive UI; (5) pipeline diagram capture → detect → reason →
> art-direct → reconcile with MCP badge; (6) tech chips + team + repo. No violet gradients, no KPI
> cards, no Inter-only type, one orchestrated hero motion.

---

## 7. Prototype flow (clickable)

Wire these hotspots:

1. **Empty** → click `Capture` → **Capturing** (auto-advance 2s) → **Results**
2. **Results** → click finding row → **Inspector** opens with DesignProofCard
3. **Results** → drag seam ←/→ → before/after reveal
4. **Results** → click mic or `Editorial` preset → **Voice Active** (after side updates)
5. **Inspector** → click `Draft fix` → **Diff** view
6. **Diff** → click `Apply in Cursor` → toast

Keep transitions ≤300ms; seam drag is the interaction viewers should try first.
