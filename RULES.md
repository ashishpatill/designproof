# RULES.md — DesignProof (Tell Proof) Standing Rules & Engineering Contracts

> **Authority**: Single consolidated rulebook for all coding agents (Cursor, Claude Code, Antigravity, Grok Build, OpenCode) and human contributors. Consolidates all 19 `.cursor/rules/*.mdc` rules, `BUILD.md` golden rules, `DESIGN.md` / `docs/01_DESIGN_SYSTEM.md` visual laws, and the October 2026 anti-slop & frame-tell gates.
>
> **Interactive Visual Docs (gitignored)**:
> - [Book I: Product, Architecture, MCP & Agent Hub](./docs/00-hub-architecture-and-mcp.html)
> - [Book II: Print-Atelier Design System, 21 Detectors & Proof Engine](./docs/01-detectors-taste-and-design-system.html)
> - [Book III: Craft Engine, Root-Cause Study & Staged Redesign Plan](./docs/02-craft-engine-rootcause-and-staged-plan.html)
> - [Book IV: Project Status, 48-Doc Audit, Training Sink & Deployment](./docs/03-status-audit-ops-and-training.html)

---

## 1. Mission & Non-Negotiable Golden Rules (`tell-mission`)

1. **The Product is the Verification & Craft Loop**: `Observe (Playwright capture) → Name (21 deterministic detectors + taste reflection) → Direct (voice/text art direction) → Repair (contrast-safe CSS/token patch) → Prove (disposable checkout verification) → Author (craft engine)`.
   - The **Cursor / Grok Build / coding-agent MCP plugin + CLI** is the primary product.
   - `/studio` and `/showcase` are dogfood and specimens — **not** the primary product.
   - Never frame the product as a passive KPI dashboard.
2. **Ship Bar**: Stacked images, purposeful motion, artistic composition, and unique per-brief identity. Never one-shot generic AI generation.
3. **Deterministic Core (`@tell/core`, `@tell/redesign`)**:
   - Zero LLM calls, zero external network calls inside `packages/core` and `packages/redesign` (Playwright browser capture is isolated in `packages/core/src/capture/`).
   - Detectors are pure functions: `(fingerprint: DesignFingerprint, capture: CapturePayload) => Finding[]`.
   - LLMs (Gemini 2.5 Pro / Flash, Cursor SDK) are strictly optional enhancements confined to `packages/taste`, voice refinement, and `apps/web/src/lib/cursor-redesign.ts`, and **must always have a deterministic offline fallback**.
4. **Zod at Every Boundary (`@tell/schema`)**:
   - `packages/schema` is the single source of truth for all cross-package data structures (`CapturePayload`, `DesignFingerprint`, `Finding`, `TasteVerdict`, `ArtDirection`, `RedesignProposal`, `TellReport`, `McpToolName`, `InstallInfo`).
   - Edit schemas first, run `pnpm -F @tell/schema build`, and parse inputs/outputs at every API route, MCP tool handler, CLI command, and model response boundary.
5. **Never Auto-Apply Fixes**:
   - `tell_apply` and web diff endpoints return reviewable unified diffs (`tell-overrides.css` or token patches) and instructions only. They **never** write directly to the user's working tree.
   - `tell_proof_verify` applies patches inside a **disposable git worktree** (or reverts on failure) and still requires human approval before merging.
6. **Offline Fixture Reliability**:
   - Live capture first; committed `fixtures/reports/tell-report.json` and `fixtures/reports/capture.json` must always work when offline, in CI, or without API keys.
7. **Attention & Git Hygiene**:
   - Parked secondary to **DeepHarness honesty** unless Ashish explicitly directs work here.
   - Internal thinking, agent rules (`AGENTS.md`, `RULES.md`, `CLAUDE.md`), root planning docs, and HTML documentation artifacts are **gitignored** and must **never** be committed.

---

## 2. Verification & Local Dev Server Rules (`tell-local-ci-only`, `tell-local-dev-server`, `tell-testing`)

### 2.1 Local CI Only
- **NEVER** run, poll, wait on, or gate work on GitHub Actions (`gh pr checks`, remote CI workflows).
- Gate every change locally with:
  ```bash
  pnpm test && pnpm -F @tell/schema build && pnpm -F @tell/web typecheck
  ```
- Additional targeted local verification gates:
  ```bash
  pnpm dogfood:web          # Tell's own UI must pass with 0 generic tells
  pnpm eye:shell            # App shell contrast & surface separation gate
  pnpm -F @tell/mcp test    # MCP catalog drift guard (REGISTERED_MCP_TOOLS === MCP_TOOL_NAMES)
  ```

### 2.2 Local Dev Server Port Hygiene
- Expected ports: **`3000`** (`apps/web`) and **`3001`** (`fixtures/generic-app`).
- Before starting `pnpm dev`, `pnpm -F @tell/web dev`, or `pnpm dev:fixture`:
  1. Check active listeners on `3000` / `3001`.
  2. Only terminate processes whose working directory belongs to this repository (`designproof`). Never kill unrelated processes on those ports — report the conflict instead.

### 2.3 TypeScript & Test Discipline
- Root `tsconfig.base.json` enforces `strict: true` and `noUncheckedIndexedAccess: true`. Handle undefined index lookups explicitly.
- Detector modifications require golden test coverage against `fixtures/reports/capture.json`.
- `packages/taste` tests must mock fetch/LLM calls and never hit live Gemini APIs.

---

## 3. Package-by-Package Rules

| Package / Path | Globs | Mandatory Rules |
|---|---|---|
| **`@tell/schema`** | `packages/schema/**/*` | Author Zod schemas first; export inferred TS types; freeze schema before splitting parallel subagent tasks; keep `MCP_TOOL_NAMES` synchronized with `REGISTERED_MCP_TOOLS` (11 shipped tools today; 19 planned under `BIM-203`). |
| **`@tell/core`** | `packages/core/**/*` | Pure deterministic functions; zero LLM/API calls; `diagnose.ts` may import `@tell/redesign` only for deterministic measured reconciliation facts. Contains the **21 detectors** (13 genericness tells + 8 consistency drift detectors) and `proof-verify.ts`. |
| **`@tell/taste`** | `packages/taste/**/*` | Detector `facts` are authoritative — rationale (`<= 3 sentences`, senior critic voice, no apology, no emoji) must never contradict measured facts. 2-pass reflection loop falls back to mechanical verdict at `confidence: 0.5`. Verdicts: `generic` \| `drift` \| `intentional` \| `uncertain`. |
| **`@tell/redesign`** | `packages/redesign/**/*` | Deterministic token reconciliation (`reconcile.ts`, `measures.ts`). Must preserve or improve WCAG foreground/background contrast (`>= 4.5:1` body, `>= 3.0:1` large text/UI). Only force foreground color on surfaces Tell also controls. Live `BeforeAfterSeam` CSS and emitted `buildOverridesPatch` unified diff must be byte-identical. |
| **`@tell/design-skills`** | `packages/design-skills/**/*` | Content-custom design engine (`orchestrate.ts`, `tells-registry.ts`, `taste-loop.ts`, `basics-checklist.ts`, `forensics.ts`, `training-data-sink.ts`, and `staged.ts`). Use aesthetic lean codes (`minimal-clean`, `conversion-sharp`, `system-crafted`, `refined-story`) — never external person/brand names in runtime code. |
| **`@tell/mcp` & `@tell/cli`** | `packages/mcp/**/*`, `packages/cli/**/*` | Stdio MCP server (`.cursor/mcp.json` → `pnpm -F @tell/mcp start`). Share pipeline functions with `apps/web` — never fork logic. `tell_apply` returns patch strings only. |
| **`apps/web`** | `apps/web/**/*` | Next.js 14 App Router. Must obey the **Print-Atelier** design system (`DESIGN.md` / `docs/01_DESIGN_SYSTEM.md`). Semantic Tailwind tokens only (`bg-surface`, `text-primary`, `text-accent`); raw hex belongs only in `globals.css`. |
| **`fixtures/generic-app`** | `fixtures/**/*` | Deliberately generic SaaS fixture on `:3001` that triggers planted tells/drifts (plus `/brutalist` route for `intentional` taste verdict). Clearly labeled as demo input in `CONTRIBUTIONS.md`. Updating fixture UI requires regenerating `capture.json` and `tell-report.json` together. |

---

## 4. Print-Atelier UI Rules (`DESIGN.md` & `docs/01_DESIGN_SYSTEM.md`)

> **Scope**: Applies strictly to **DesignProof's own product UI chrome** (`apps/web` — Report, Studio chrome, Showcase index chrome, Setup, Proof drawer). Generated client websites and showcase specimens use their own per-brief or named-theme palettes (`ink-paper`, `forest-ledger`, `ember-clay`, `glacier-signal`, `nocturne-brass`, `plum-press`).

1. **Color Tokens (Warm Paper & Ink — Never Cold Slate or Neon Violet)**:
   - **Dark Atelier (Default)**: `--bg-canvas: #181614`, `--bg-surface: #221F1C`, `--bg-elevated: #2C2824`, `--text-primary: #F3EDE4` (`14.2:1`), `--text-secondary: #B5ACA0` (`7.1:1`), `--text-muted: #7D756B` (`4.5:1`), `--accent-primary: #D4714A` (Terracotta), `--accent-secondary: #3A6358` (Studio Ink), `--status-drift: #C4A035` (Ochre), `--status-pass: #3D8B6E` ( Jade), `--status-danger: #C84B31` (Vermilion).
   - **Warm Paper (Light Mode)**: `--bg-canvas: #FAF7F2`, `--bg-surface: #F2ECE1`, `--bg-elevated: #FFFFFF`, `--text-primary: #181614` (`15.8:1`), `--text-secondary: #575049` (`7.4:1`), `--text-muted: #857D73` (`4.6:1`), `--accent-primary: #B85430`, `--accent-secondary: #2B5247`.
   - **App Shell Contrast Gate (`pnpm eye:shell`)**: Active navigation pill must maintain `>= 3.0:1` surface contrast against shell bar and `>= 7.0:1` text contrast inside the pill.
2. **Tri-Tone Typography (Never Inter-Only)**:
   - `--font-display`: `'Instrument Serif', Georgia, serif` (Report headlines, score numeral, thesis titles).
   - `--font-sans`: `'Source Sans 3', system-ui, sans-serif` (UI controls, findings prose, navigation).
   - `--font-mono`: `'IBM Plex Mono', monospace` (`font-variant-numeric: tabular-nums` on all scores, ratios, pixel deltas, hex codes, and diffs).
3. **Elevation, Radius & Layout**:
   - Max elevation `e2`; `< 30%` of visible cards may carry a box-shadow; prefer `1px solid var(--border-subtle)`.
   - Use `>= 2` distinct border radii (`4px` badges/tags, `8px` cards/inputs, `12px` modals/seam frame).
   - Asymmetric workbench split (`7:5` or `8:4`) — never center-stack every section.
4. **Full 9-State Interactive Matrix**:
   - Every interactive component (`Button`, `CaptureBar`, `BeforeAfterSeam`, `TellCard`, `VoiceDirector`, `DiffViewer`) must implement: `default`, `hover`, `focus-visible` (`2px solid var(--border-focus)`, `2px` offset), `active`, `disabled`, `loading`, `empty`, `error`, and `offline-fallback`.
5. **Critic Voice (`USER_STORY.md`)**:
   - Senior design partner tone: direct, specific, active voice, `<= 3 sentences` per finding rationale, zero apologies, zero hedging, **zero emoji in product UI chrome**.

---

## 5. Dated Tells Registry & Anti-Slop Bans (`tells-registry.ts`, `designproof-anti-slop`, `designproof-taste-loop`)

Every rule in `packages/design-skills/src/tells-registry.ts` carries `addedAt`, `expiresAt`, `severity` (`ban` | `warn`), and a concrete replacement procedure.

### 5.1 Hard Bans (`severity: "ban"` — Enforced in Proof & Spec Validators)
| ID / Detector | Rule & Threshold | Concrete Replacement Procedure |
|---|---|---|
| **`TitleOnFoldTell`** (`title-on-fold`, added `2026-10-24`) | First viewport (`1440×900` or `390×844`) must **not** be a title card (`<= 3` text blocks, `0` interactive controls, or a single decorative image with `0` controls). | Open directly on the working product surface, live interactive instrument, or multi-column editorial plate with real controls above the fold. |
| **`MobileFirstScreenTell`** (`mobile-first-screen`, added `2026-10-24`) | At `390×844`, the hero headline + primary interactive control must sit within `y <= 844px`, and `<main>` must have `0` horizontal overflow (`scrollWidth <= clientWidth + 2`). | Tighten mobile hero spacing (`clamp()`), stack CTAs cleanly above `844px`, and constrain wide tables/canvases inside scroll containers. |
| **`AcidAccentTell`** (`acid-accent-on-dark`) | Saturated purple/violet/cyan/neon (`hue 250°–330°`, `S > 65%`) on near-black (`L < 0.08`) or `#8B5CF6`/`#6366F1` defaults. | Replace with a named theme palette (`ink-paper`, `forest-ledger`, `ember-clay`, `glacier-signal`, `nocturne-brass`, `plum-press`) with warm/mineral accents. |
| **`EmojiChromeTell`** (`emoji-in-ui-chrome`) | Any Unicode emoji (`U+1F300–U+1FAFF`, `U+2600–U+27BF`) inside `<nav>`, `<button>`, `[role=tab]`, headings, or badge chrome. | Strip emoji; use typographic index numerals (`01`, `A.`), SVG hairlines, or semantic color dots. |
| **`BoilerplateCopyTell`** (`boilerplate-ai-copy`) | Stock AI filler phrases (*"Unlock the power of"*, *" seamlessly"*, *"Revolutionize"*, *"Next-gen"*, *"Supercharge"*, *"10x faster"*, *"Built for modern teams"*). | Rewrite with concrete nouns, measured numbers, domain artifacts, and verifiable mechanism descriptions. |

### 5.2 Warnings (`severity: "warn"` — Flagged in Diagnose & Critique Loop)
- **Baseline Visual Tells**: `SystemFontTell` (Inter/system-ui across heading+body), `GradientCrutchTell` (multi-stop violet/indigo/pink hero gradient), `ShadowEverywhereTell` (`> 50%` cards with heavy blur `> 20px`), `RadiusMonotoneTell` (`> 80%` containers sharing one radius), `CenteredEverythingTell` (`>= 4` consecutive center-aligned sections), `GrayMushTell` (`>= 5` distinct grays or body contrast `< 4.5:1`).
- **2026-10-24 Frame/Multi-Width Warnings**:
  - **`FrameGutterTell`** (`frame-gutter`): At `1440×900`, `<main>` content narrower than `62%` of viewport (`< 893px`) leaving `> 38%` empty side gutters, unless `layoutIntent === "narrow-reading"` (`readingMeasureCh <= 75` and `textRatio >= 0.7`). *Fix*: Widen container to `max-width: 1280px–1360px` or place an asymmetric rail/artifact beside the prose column.
  - **`BlankStretchTell`** (`blank-stretch`): Any full-width horizontal band `>= 220px` tall inside `<main>` (above footer) containing `0` text nodes and `0` visual media/controls. *Fix*: Collapse excessive vertical padding or populate the band with an artifact, caption, or hairline divider.
- **8 Consistency Drift Detectors**: `TokenBypass`, `NearDuplicateValues`, `FocusRingInconsistency`, `TypeScaleDrift`, `SpacingChaos`, `StateGap`, `DesignSystemDrift`, `ResponsiveViewportDrift`.

---

## 6. Website Build, Domain Research & Media Auto-Load (`tell-domain-research`, `tell-site-build-autoload`, `tell-plumbing-reference`)

Whenever building, redesigning, or preparing any website, specimen, or showcase offering:
1. **Auto-Run Domain Research First**: Execute `website-domain-research` (`load-prior-domain` → `requirement-gap-diff` → `live-reference-walkthrough` if gaps → `ia-shell-synthesis` → `category-gap-audit` → `variant-lens` → `emit-training-episode`). Never start from a blank slate when a `DomainResearchPack` exists in `packages/design-skills/src/domain-packs.ts`.
2. **Sport Briefs**: If cricket / football / hockey / tennis / matchday, also run `sport-matchday-web` + `sport-site-research` + `sport-vernacular-craft`.
3. **Execute All Routed Craft Nodes**: Run every skill node returned by `routeSkills` (including always-on `responsive-performance`).
4. **Bounded Screenshot Critique (`designproof-taste-loop`)**:
   - Capture rendered preview at **`1440×900`**, **`768×1024`**, and **`390×844`**.
   - Run deterministic detectors + visual checks; apply at most **3 fixes per round** across at most **3 rounds**; stop immediately on pass, repeat finding, oscillation, or contrast/budget regression.
5. **Media Performance (`pnpm media:site`)**:
   - Whenever photography lands under `apps/web/public/**`, run `pnpm media:site` (converts to WebP/AVIF within display budgets) and render via `SiteImg` (explicit `width`/`height`, lazy below fold, priority on single LCP hero).
6. **Anonymity & "Learn, Don't Copy" Rule**:
   - Never copy third-party code, prompts, or theme packs verbatim into this repo.
   - Never commit third-party peer names from gitignored `research/plumbing-reference.local.json` or `research/corpus.local.json` into code, comments, or commit messages.

---

## 7. Security, GitHub Setup & Deployment Rules (`tell-mcp-api`, `tell-github-setup`, `tell-deploy`)

1. **Local-Only Repo Runner (`/api/setup/*`, `repo-runner.ts`)**:
   - Clones repositories and runs `npm`/`pnpm` scripts; **must** be guarded by `setup-guard.ts` and disabled in production via `TELL_DISABLE_REPO_SETUP=1`.
2. **Capture Backend Authentication**:
   - When `TELL_CAPTURE_API_TOKEN` is set, `/api/diagnose` and `/api/proof/verify` require `Authorization: Bearer <token>` or `x-tell-capture-token`.
   - Block SSRF on cloud metadata IPs (`169.254.169.254`, `127.0.0.1` in hosted mode) while allowing `localhost` only in local dev.
3. **MCP Stays Local Stdio**:
   - There is no public hosted MCP server. Ship MCP locally via `.cursor/mcp.json` / `tell mcp install <client>`.
4. **Secrets**:
   - Never read or commit `.env` or `.env.local` in routine tasks; inspect `.env.example` and configure production secrets exclusively via Vercel / Vultr / Render dashboards.
