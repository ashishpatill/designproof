---
name: responsive-performance
description: >-
  Auto-apply on every website / specimen / agency build — WebP display-sized media,
  lazy below-fold images, width/height CLS reservation, mobile-first stack, light
  assets. Invoked by routeSkills (always) and tell-site-build-autoload rule; do not
  wait for the user to ask.
---

# responsive-performance

> **Plan link (proposed, not shipped):** The plan proposes budgets checked at every stage: LCP (Largest Contentful Paint) ≤ 2.5 s, CLS (Cumulative Layout Shift) ≤ 0.1, INP (Interaction to Next Paint) ≤ 200 ms, initial script ≤ 170 KB compressed, initial transfer ≤ 2.0 MiB, AVIF/WebP in `<picture>`, and a declared tech tier (static / enhanced / immersive). The budget numbers are adapted from sources and not yet measured on our templates. See the [DesignProof redesign plan](https://linear.app/bimlabz/document/designproof-redesign-plan-concept-first-step-by-step-design-7f1f65ec2bc3); waiting on Ashish's decision in [BIM-203](https://linear.app/bimlabz/issue/BIM-203/decide-designproof-redesign-plan-concept-first-step-by-step-and-the).

> Motion budget: animate only `transform` and `opacity`, and keep no long animation frame over 50 ms. See the proposed motion checks in `docs/15_MOTION_ANIMATION_PLAN.md`.

> **Also proposed (plan section 3):**
> - **3D and charts:** three.js, WebGPU (the browser's newer way to use the graphics chip) and d3.js only when they are the concept itself, and never in the first load. Show a sized still image first, then load the code with a dynamic `import()` when the section comes into view or the visitor taps. Skip it when the device asks to save data or its graphics chip can't handle it. Charts with fixed numbers are made as static SVG when the site is built.
> - **Video:** WebM with an MP4 fallback and a poster frame. AV1 (a newer video format) doesn't play on Safari without hardware support for it.
> - **Third-party scripts:** pinned copies we host ourselves, not loaded from an outside CDN (content delivery network). Today `render.ts` (around line 3140) loads HTMX from unpkg, and that would fail this check.
> - **WebMCP** (a proposed way for web pages to offer tools to AI agents): off in generated sites. See plan section 4.
> - **shadcn/ui:** only for product screens such as dashboards and forms, not marketing pages.
> - **Fallbacks:** anchor positioning (a CSS way to place one element relative to another) needs a fallback for Firefox.

**Always-on for every site build.** Parent: `premium-content-custom-web`. Engine always
routes this node via `routeSkills`. Agents must execute it — not only list it.

Full playbook: `agent-skills/web-design/premium-content-custom-web/responsive-performance/SKILL.md`

## Non-negotiables (auto-apply)

1. **WebP at display size** — after adding photography under `apps/web/public/**`, run
   `pnpm media:site` (or `pnpm media:webp`). Hero ≤1600w @q82; editorial ≤1200w; other ≤1000w.
   Prefer pruning superseded jpg/png (`--prune`).
2. **Use `SiteImg`** (`apps/web/src/components/site-media/SiteImg.tsx`) for specimen media —
   rewrites `.jpg/.png` → `.webp`, sets `width`/`height`, `loading`, `fetchPriority`, `decoding`.
3. **LCP** — one priority/eager hero image max; everything else lazy + async decode.
4. **CLS** — always reserve intrinsic width/height; never un-sized `<img>`.
5. **Mobile-first** — stack grids under ~800px; no autoplay video heroes.
6. **No heavy formats on the hot path** — no multi-MB JPEG heroes in commits.

## Verify

```bash
pnpm media:site -- --prune
# HTML should reference .webp; public/** should not keep hot-path multi-MB jpg after prune
```
